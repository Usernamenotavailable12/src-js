var leaderboardTable;

function leaderboardInitialize() {
  const maxAttempts = 10;
  const retryInterval = 300;
  let attempts = 0;
  
  const parseTournamentData = (data) => {
      if (!data) return [];
      
      const segments = data.split(',');
      const tournamentsList = [];
      
      for (let i = 0; i < segments.length; i += 2) {
          if (i + 1 < segments.length) {
              const id = segments[i].trim();
              const count = parseInt(segments[i + 1].trim(), 10) || 0;
              
              if (id) {
                  tournamentsList.push({ id, count });
              }
          }
      }
      
      return tournamentsList;
  };

  const initializeLeaderboard = async () => {
      const tournamentDataElement = document.getElementById('tournamentData');
      const tournamentData = tournamentDataElement?.textContent;
      
      if (tournamentData) {
          try {
              const tournamentsList = parseTournamentData(tournamentData);
              
              if (tournamentsList.length > 0) {
                  leaderboardTable = new FullLeaderboardTable(tournamentsList, document.getElementById('leaderboardLoader'));
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
  setTimeout(() => {
    fetchWheelData().then((data) => {
      if (data?.length > 0) {
        selectFortuneWheel(data[0], 1);
      }
    });
  }, 1000);
}

async function logCurrentPath(path, previousPath) {
  // DESTROY
  if (previousPath && previousPath.includes("leaderboard") && path !== previousPath) {
    await leaderboardTable?.destroy();
  }

  // INIT
  setTimeout(() => {
    if (path.includes("leaderboard")) {
      leaderboardInitialize();
    } else if (path.includes("wheel")) {
      wheelInitialize();
    }
     else if (path.includes("welcomebonus")) {
      wheelInitialize();
    }
  }, 400);
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
