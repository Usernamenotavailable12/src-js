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


function leaderboardInitialize() {
  const maxAttempts = 10;
  const retryInterval = 1000;
  let attempts = 0;

  const initializeLeaderboard = async () => {
    const tournamentDataElement = document.getElementById("tournamentData");
    if (!tournamentDataElement || tournamentDataElement.textContent === "") {
      attempts++;
      setTimeout(initializeLeaderboard, retryInterval);
    }
    const tournamentData = tournamentDataElement?.textContent || {};
    const tournamentsList = JSON.parse(tournamentData);

    if (tournamentData) {
      try {
        if (tournamentsList.length > 0) {
          leaderboardTable = new FullLeaderboardTable(
            tournamentsList,
            document.getElementById("leaderboardLoader")
          );
        } else {
          console.warn("No valid tournament data found");
        }
      } catch (error) {
        console.error("Failed to initialize leaderboard:", error);
      }
    } else {
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(initializeLeaderboard, retryInterval);
      } else {
        console.error(
          "Maximum attempts reached waiting for tournament data element."
        );
      }
    }
  };

  initializeLeaderboard();
}

function wheelInitialize() {
  let counter = 0;
  let timeoutTime = 200;
  let maxTryes = 5;
  const drawWheel = (data) => {
    try {
      selectFortuneWheel(data[0], 1);
    } catch (e) {
      if (counter < maxTryes) {
        counter++;
        setTimeout(() => {
          drawWheel();
        }, timeoutTime);
      }
    }
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
