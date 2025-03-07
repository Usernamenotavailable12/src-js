var leaderboartTable;


function leaderboardInitialize() {
  let attempts = 0;
  const maxAttempts = 10;
  const waitForElement = () => {
    if (document.getElementById("tournamentData")) {
      try {
        leaderboartTable = new FullLeaderboardTable();
      } catch (e) {
        console.error("logCurrentPath:", e);
        setTimeout(() => logCurrentPath(path), 1000);
      }
    } else {
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(waitForElement, 300);
      } else {
        console.error(
          "logCurrentPath: Maximum attempts reached waiting for tournamentData."
        );
      }
    }
  };
}

function wheelInitialize() {
  setTimeout(() => {
    fetchWheelData()
      .then((data) => {
        if (data?.length > 0) {
          selectFortuneWheel(data[0], 1)
        }
      });
  }, 500);
}
 
async function logCurrentPath(path, previousPath) {

  // DESTROY
  if (previousPath && previousPath.includes("leaderboard") && path != previousPath) {
    await leaderboartTable.destroy();
  }


  // INIT
  setTimeout(() => {
  
  if (path.includes("leaderboard")) {
    leaderboardInitialize();
  }
  else if (path.includes("wheel")) {
    wheelInitialize();
  }

  }, 400);
}



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
