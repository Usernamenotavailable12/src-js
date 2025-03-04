function logCurrentPath(path) {
switch (true) {
        case path.includes('leaderboard'):
            const leaderboard = new FullLeaderboardTable;
            break;
    }
}

window.onpopstate = () => logCurrentPath(window.location.pathname);

(function(history) {
    const pushState = history.pushState;
    const replaceState = history.replaceState;

    history.pushState = function(...args) {
        const result = pushState.apply(this, args);
        logCurrentPath(window.location.pathname);
        return result;
    };

    history.replaceState = function(...args) {
        const result = replaceState.apply(this, args);
        logCurrentPath(window.location.pathname);
        return result;
    };
})(window.history);

logCurrentPath(window.location.pathname);
