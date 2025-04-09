var leaderboardTable;

async function tryMadeProgressBar() {
  const maxTries = 10;
  let tries = 0;
  const timeInterval = 500;

  while (tries < maxTries) {
    try {
      // Check if the progress bar element exists
      if (!document.getElementById("progressBarData")) {
        throw new Error("Progress bar not found");
      }
      madeProgressBar(); // Call your function when the element is found
      break; // Exit the loop on success
    } catch (e) {
      tries++;
      // Wait for the specified time interval before trying again
      await new Promise(resolve => setTimeout(resolve, timeInterval));
    }
  }
}

async function tryLoadFreebetDeposit() {
  const maxTries = 10;
  let tries = 0;
  const timeInterval = 500;

  while (tries < maxTries) {
    try {
      // Check if the progress bar element exists
      if (!document.getElementById("start-aaaaa-tour-bba")) {
        throw new Error("Progress bar not found");
      }
      loadFreebetDeposit();; // Call your function when the element is found
      break; // Exit the loop on success
    } catch (e) {
      tries++;
      // Wait for the specified time interval before trying again
      await new Promise(resolve => setTimeout(resolve, timeInterval));
    }
  }
}


function leaderboardInitialize() {
  const maxAttempts = 10;  
  const retryInterval = 1000; 
  let attempts = 0; 

  const initializeLeaderboard = () => {
      const tournamentDataElement = document.getElementById("tournamentData");
      
      if (!tournamentDataElement || !tournamentDataElement.textContent) {
          attempts++;
          if (attempts < maxAttempts) {
              return setTimeout(initializeLeaderboard, retryInterval);
          } else {
              console.error("Maximum attempts reached waiting for tournament data element.");
              return;
          }
      }

      let tournamentsList;
      try {
          tournamentsList = JSON.parse(tournamentDataElement.textContent);
      } catch (error) {
          console.error("Failed to parse tournament data:", error);
          return;
      }

      if (tournamentsList != null) {
          try {
              leaderboardTable = new FullLeaderboardTable(
                  tournamentsList,
                  document.getElementById("leaderboardLoader")
              );
          } catch (error) {
              attempts++;
              console.error("Failed to initialize leaderboard:", error);
              if (attempts < maxAttempts) {
                  return setTimeout(initializeLeaderboard, retryInterval);
              } else {
                  console.error("Maximum attempts reached waiting for tournament data element.");
                  return;
              }
          }
      } else {
          console.warn("No valid tournament data found");
      }
  };

  initializeLeaderboard();
}

function wheelInitialize() {
  let counter = 0;
  let timeoutTime = 500;
  let maxTryes = 10;
  const drawWheel = (data) => { 
    const wheelElement = document.getElementById("wheel");
    const listTopElement = document.getElementById("fortuneListTop");
    const listElement = document.getElementById("fortuneList");
    if (!wheelElement || !listTopElement || !listElement) {
      if (counter < maxTryes) {
        counter++;
        setTimeout(() => drawWheel(data), timeoutTime);
      }
      return;
    }
    selectFortuneWheel(data[0], 1); 
  };
  fetchWheelData().then((data) => {
    if (data?.length > 0) {
      drawWheel(data);
    }
  });
}

async function logCurrentPath(path, previousPath) {
  // DESTROY
  if (
    previousPath &&
    previousPath.includes("leaderboard") &&
    path !== previousPath
  ) {
    await leaderboardTable?.destroy();
  }

  // INIT
  if (path.includes("leaderboard")) {
    leaderboardInitialize();
  } if (path.includes("wheel")) {
    wheelInitialize();
  } if (path.includes("welcomebonus")) {
    wheelInitialize();
  } if (path.includes("box")) {
    tryMadeProgressBar();
  } if (path.includes("betprogressbar")) {
    tryMadeProgressBar();
  }
  if (path.includes("freebet-deposit-offer")) {
    tryLoadFreebetDeposit();
}
}

addEventListener("load", (event) => {
  (function (history) {
    const pushState = history.pushState;
    const replaceState = history.replaceState;
    let previousPath = window.location.pathname;

    function waitForPageLoad(callback) {
      if (document.readyState === "complete") {
        callback();
      } else {
        window.addEventListener("load", callback, { once: true });
      }
    }

    history.pushState = function (...args) {
      const currentPreviousPath = previousPath;
      const result = pushState.apply(this, args);
      const currentPath = window.location.pathname;
      previousPath = currentPath;
      waitForPageLoad(() => logCurrentPath(currentPath, currentPreviousPath));
      return result;
    };

    history.replaceState = function (...args) {
      const currentPreviousPath = previousPath;
      const result = replaceState.apply(this, args);
      const currentPath = window.location.pathname;
      previousPath = currentPath;
      waitForPageLoad(() => logCurrentPath(currentPath, currentPreviousPath));
      return result;
    };

    waitForPageLoad(() => {
      const currentPath = window.location.pathname;
      logCurrentPath(currentPath, null);
      previousPath = currentPath;
    });
  })(window.history);
});

window.addEventListener("message", (message) => {
  if (typeof message.data === "string" && message.data.includes("/auth/redirect/signin_iq")) {
    setTimeout(() => {
      logCurrentPath(window.location.pathname, window.location.href);
    }, 1000);
  }
});
