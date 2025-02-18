// Global arrays to hold active wheels and track spun boxes
let fortuneWheels = [];
let spunBoxes = []; // Track boxes that have already been spun
let selectedFortuneWheel = null;

async function fetchWheelData() {
  const query = `
    query GetUserBoxes($userId: ID, $brandId: ID!) {
      userBoxConnection(userId: $userId, brandId: $brandId, status: ACTIVE) {
        edges {
          node {
            box {
              id
              type
              rewards {
                action {
                  ... on GiveAndActivateBonusAction {
                    bonusId
                    bonus {
                      description
                      contentId
                    }
                  }
                  ... on GiveBonusAction {
                    bonusId
                    bonus {
                      description
                      contentId
                    }
                  }
                  ... on GiveBoxAction {
                    boxId
                    box {
                      description
                      contentId
                    }
                  }
                }
                probability
              }
            }
            status
            userBoxId
          }
        }
      }
    }
  `;

  const authData = extractAuthDataFromCookie();
  const result = await fetchGraphQL(query, {
    userId: authData.userId,
    brandId: BRAND_ID,
  });

  // Filter out any boxes that have already been spun
  fortuneWheels = result.data.userBoxConnection.edges
    .map((edge) => edge.node)
    .filter(
      (box) =>
        box.status === "ACTIVE" &&
        box.box.type === "WHEEL_OF_FORTUNE" &&
        !spunBoxes.includes(box.userBoxId)
    );

  if (fortuneWheels.length === 0) {
    const messageElement = document.createElement("div");
    messageElement.id = "noActiveWheelsMessage";
    messageElement.textContent = "";
    messageElement.style.position = "fixed";
    messageElement.style.top = "50%";
    messageElement.style.left = "50%";
    messageElement.style.transform = "translate(-50%, -50%)";
    messageElement.style.padding = "10px 20px";
    messageElement.style.backgroundColor = "#f8d7da";
    messageElement.style.color = "#721c24";
    messageElement.style.border = "1px solid #f5c6cb";
    messageElement.style.borderRadius = "5px";
    document.body.appendChild(messageElement);

    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 3000);
    return;
  }

  displayFortuneWheels();
}

function displayFortuneWheels() {
  const fortuneListTop = document.getElementById("fortuneListTop");
  fortuneListTop.innerHTML = `<span class="choose-wheel-text"></span>`;
  const fortuneList = document.getElementById("fortuneList");
  fortuneList.innerHTML = "";

  fortuneWheels.forEach((wheel, index) => {
    const button = document.createElement("button");
    button.textContent = `${index + 1}`;
    button.style.margin = "5px";
    button.onclick = () => {
      selectFortuneWheel(wheel, index);
      resetRotation();
    };
    button.id = `wheel-btn-${index}`;
    fortuneList.appendChild(button);
  });
}

function resetRotation() {
  const wheelElement = document.getElementById("wheel");
  if (wheelElement) {
    wheelElement.style.transform = "rotate(0deg)";
    wheelElement.style.transition = "none";
  }
}

function selectFortuneWheel(wheel, index) {
  selectedFortuneWheel = wheel;
  selectedFortuneWheel.index = index;
  renderFortuneWheel(selectedFortuneWheel.box.rewards);
  document.getElementById("spinWheelButton").disabled = false;
}

function renderFortuneWheel(rewards) {
  const wheelElement = document.getElementById("wheel");
  wheelElement.innerHTML = "";
  const totalSegments = rewards.length;

  rewards.forEach((reward, index) => {
    const segment = document.createElement("div");
    segment.className = "segment";

    // Calculate rotation values
    const baseRotation = -(360 / totalSegments) * index;
    const randomRotation = baseRotation + 160;
    const randomRotationTwo = baseRotation + 52;

    // Set CSS variables for rotations
    segment.style.setProperty("--rot-var", `rotate(${baseRotation}deg)`);
    segment.style.setProperty("--rot-var-random", `rotate(${randomRotation}deg)`);
    segment.style.setProperty("--rot-var-random-two", `rotate(${randomRotationTwo}deg)`);

    // Determine which background image to use (bonus or box)
    const backgroundImageVar = reward.action[0].bonus?.contentId
      ? `var(--${reward.action[0].bonus.contentId})`
      : `var(--${reward.action[0].box.contentId})`;

    // Apply the chosen background image
    segment.style.setProperty('--background-image-var', backgroundImageVar);

    // Styling and content
    segment.style.transform = `rotate(${(360 / totalSegments) * index}deg)`;
    segment.dataset.index = index;
    segment.innerHTML = `<span class="wheel-reward-holder"><br></span>`;

    const rewardHolder = segment.querySelector('.wheel-reward-holder');

    if (rewardHolder) {
      // Apply the correct background image dynamically
      rewardHolder.style.setProperty('background-image', `${backgroundImageVar}, radial-gradient(rgba(255, 255, 255, .2), rgba(0, 0, 0, 0))`);
    } else {
      console.warn("wheel-reward-holder not found inside segment.");
    }

    wheelElement.appendChild(segment);
  });
}

async function openFortuneBox(userBoxId) {
  const mutation = `
    mutation OpenUserBox($input: OpenUserBoxInput!) {
      openUserBox(input: $input) {
        userBox {
          reward {
            action {
              ... on GiveBonusAction {
                bonusId
              }
              ... on GiveAndActivateBonusAction {
                bonusId
              }
              ... on GiveBoxAction {
                boxId
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    input: {
      userBoxId: userBoxId,
    },
  };

  const response = await fetchGraphQL(mutation, variables);

  if (!response || !response.data || !response.data.openUserBox) {
    throw new Error("Failed to open user box or invalid response structure.");
  }

  // Extract actions from the response
  const rewardActions = response.data.openUserBox.userBox.reward.action;

  // Return an array of IDs (could be a bonusId or boxId)
  const actionIds = rewardActions.map((action) => {
    return action.bonusId || action.boxId;
  });

  return actionIds;
}

async function startWheelSpin() {
  if (!selectedFortuneWheel) {
    alert("No wheel selected. Please select a fortune wheel first.");
    return;
  }

  const spinButton = document.getElementById("spinWheelButton");
  spinButton.disabled = true;

  const wheelElement = document.getElementById("wheel");

  try {
    // Play spin start sound
    playSound("spinStartSound");

    // GET THE ARRAY OF AWARDED IDs (BONUS OR BOX)
    const awardedActionIds = await openFortuneBox(selectedFortuneWheel.userBoxId);

    // FIND WHICH SEGMENT WON (matching bonusId or boxId)
    const winningRewardIndex = selectedFortuneWheel.box.rewards.findIndex((reward) => {
      const action = reward.action[0];
      // If it's a bonus, action.bonusId is valid; if it's a box, action.boxId is valid
      const possibleId = action.bonusId || action.boxId;
      return awardedActionIds.includes(possibleId);
    });

    if (winningRewardIndex === -1) {
      console.error("No matching reward found for the awarded actions:", awardedActionIds);
      spinButton.disabled = false;
      return;
    }

    const totalSegments = selectedFortuneWheel.box.rewards.length;
    // Basic spin math
    const finalRotation = 360 * 5 - (360 / totalSegments) * winningRewardIndex;

    // Reset the wheel animation before starting a new spin
    wheelElement.style.transition = "none";
    wheelElement.style.transform = "rotate(0deg)";
    void wheelElement.offsetWidth; // force reflow

    // Random overshoot
    function getRandomOvershoot() {
      return Math.floor(Math.random() * (200 - (-200) + 1)) - 200;
    }
    const overshoot = getRandomOvershoot();
    const incorrectRotation = finalRotation + overshoot;

    // Spin times
    const spinTime = 4; // main spin duration in seconds
    const minCorrectionTime = 0.8;
    const maxCorrectionTime = 4;
    const correctionTime =
      minCorrectionTime + (Math.abs(overshoot) / 200) * (maxCorrectionTime - minCorrectionTime);

    // 1) Spin to an "incorrect" position
    wheelElement.style.transition = `transform ${spinTime}s cubic-bezier(0.42, 0, 0.58, 1)`;
    wheelElement.style.transform = `rotate(${incorrectRotation}deg)`;

    // 2) Then correct to the final position
    setTimeout(() => {
      wheelElement.style.transition = `transform ${correctionTime}s ease-out`;
      wheelElement.style.transform = `rotate(${finalRotation}deg)`;
    }, spinTime * 1000);

    // After total animation time, highlight the winning segment and update local state
    const totalAnimationTime = (spinTime + correctionTime) * 1000;
    setTimeout(() => {
      // Add a highlight to the winning segment
      const winningSegment = wheelElement.querySelectorAll(".segment")[winningRewardIndex];
      if (winningSegment) {
        winningSegment.classList.add("winning-segment");
      }

      // Remove the button for this wheel (so you can't spin again)
      const wheelButton = document.getElementById(`wheel-btn-${selectedFortuneWheel.index}`);
      if (wheelButton) {
        wheelButton.remove();
      }

      // Mark this box as spun locally so it doesn’t show up on the next fetch
      spunBoxes.push(selectedFortuneWheel.userBoxId);
      // Remove the spun box from the available list
      fortuneWheels = fortuneWheels.filter(box => box.userBoxId !== selectedFortuneWheel.userBoxId);

      // Play spin result sound
      playSound("spinResultSound");

      // Optionally, disable the "Check Active" button for a short period
      const fetchDataButton = document.getElementById("fetchDataButton");
      fetchDataButton.disabled = true;
      setTimeout(() => {
        fetchDataButton.disabled = false;
      }, 3000); // 3-second forced delay

      // Clear the current selection and keep the spin button disabled
      selectedFortuneWheel = null;
      document.getElementById("spinWheelButton").disabled = true;
    }, totalAnimationTime);
  } catch (error) {
    alert("Error opening the box. Please try again.");
    console.error(error);
    spinButton.disabled = false;
  }
  addTemporarySpinningClass();
}

// Helper function to play a sound by element ID
function playSound(soundId) {
  const sound = document.getElementById(soundId);
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(err => console.warn("Sound playback error:", err));
  }
}

function addTemporarySpinningClass() {
  const wheelElement = document.getElementById("wheel");
  if (wheelElement) {
    setTimeout(() => {
      wheelElement.classList.add("spining");
      setTimeout(() => {
        wheelElement.classList.remove("spining");
      }, 3000); 
    }, 500); 
  }
}
