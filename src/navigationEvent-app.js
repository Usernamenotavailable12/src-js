function logCurrentPath(path) {
    const trycounter = 0;
    setTimeout(() => {
        try {
            if (path.includes('leaderboard')) {
                const leaderboard = new FullLeaderboardTable();
            }
        } catch (e) {
            console.error("error в logCurrentPath:", e);
            trycounter++;
            if (trycounter < 10) {
                setTimeout(() => logCurrentPath(path), 1000);
            }
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
