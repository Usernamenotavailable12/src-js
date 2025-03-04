function logCurrentPath(path) {
  setTimeout(() => {
    if (path.includes("leaderboard")) {
      let attempts = 0;
      const maxAttempts = 10;
      const waitForElement = () => {
        if (document.getElementById("tournamentData")) {
          try {
              const leaderboard = new FullLeaderboardTable();
          } catch (e) {
            console.error("Ошибка в logCurrentPath:", e);
            setTimeout(() => logCurrentPath(path), 1000); // Retry after 1 second
          }
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(waitForElement, 300); // Check again after 100ms
          } else {
            console.error(
              "logCurrentPath: Maximum attempts reached waiting for tournamentData."
            );
          }
        }
      };
      waitForElement();
    }
  }, 400);
}
(function (history) {
  const pushState = history.pushState;
  const replaceState = history.replaceState;
  function waitForPageLoad(callback) {
    if (document.readyState === "complete") {
      callback();
    } else {
      window.addEventListener("load", callback, { once: true });
    }
  }
  history.pushState = function (...args) {
    const result = pushState.apply(this, args);
    waitForPageLoad(() => logCurrentPath(window.location.pathname));
    return result;
  };
  history.replaceState = function (...args) {
    const result = replaceState.apply(this, args);
    waitForPageLoad(() => logCurrentPath(window.location.pathname));
    return result;
  };
  waitForPageLoad(() => logCurrentPath(window.location.pathname));
})(window.history);
