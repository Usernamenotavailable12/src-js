function logCurrentPath(path) {
    setTimeout(() => {
        const waitForElement = () => {
            if (document.getElementById('tournamentData')) {
                try {
                    if (path.includes('leaderboard')) {
                        const leaderboard = new FullLeaderboardTable();
                    }
                } catch (e) {
                    console.error("Ошибка в logCurrentPath:", e);
                    setTimeout(() => logCurrentPath(path), 1000); // Retry after 1 second
                }
            } else {
                setTimeout(waitForElement, 100); // Check again after 100ms
            }
        };
        waitForElement();
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
