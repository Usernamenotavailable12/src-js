async function fetchNewGameIds() {
    const fetchNewGameIdsUrl = "https://www.ambassadoribet.com/_internal/gql";
    
    const requestBadgeBody = {
        operationName: "LobbyGames",
        variables: {
            brandId: "ab",
            countryCode: "GE",
            device: "DESKTOP",
            gameFilters: {
                orderBy: [
                    {
                        field: "releasedAt",
                        direction: "DESCENDING"
                    }
                ],
                source: ["LATEST_RELEASES"],
                type: ["SLOT"]
            },
            jurisdiction: "GE",
            limit: 20
        },
        query: `query LobbyGames($brandId: ID!, $countryCode: CountryCode!, $device: Device!, $gameFilters: LobbyGameFiltersInput!, $jurisdiction: Jurisdiction!, $limit: Int!) {
            lobbyGames(brandId: $brandId, countryCode: $countryCode, device: $device, gameFilters: $gameFilters, jurisdiction: $jurisdiction, limit: $limit) {
                gameId
            }
        }`
    };

    try {
        const response = await fetch(fetchNewGameIdsUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBadgeBody)
        });
        
        const data = await response.json();
        
        if (!data || !data.data || !data.data.lobbyGames) {
            console.error("Invalid response structure:", data);
            return;
        }

        const gameIds = data.data.lobbyGames.map(game => game.gameId);

        // Generate CSS dynamically
        generateCSS(gameIds);
    } catch (error) {
        console.error("Error fetching game IDs:", error);
    }
}

function generateCSS(gameIds) {
    if (!gameIds.length) return;

    let cssContent = `x-casino-game-thumb {\n`;
    gameIds.forEach(id => {
        cssContent += `  &[data-id="${id}"],\n`;
    });

    // Remove last comma and close the CSS rule
    cssContent = cssContent.trim().replace(/,$/, "") + ` {\n`;
    cssContent += `    &:after {
    content: 'NEW';
    position: absolute;
    color: white;
    font-size: 130%;
    font-weight: bold;
    background: linear-gradient(45deg,#3d0202 0%,#870808 10%,#3d0202 40%,#870808 40%,#3d0202 70%,#870808 0%);
    top: 0;
    right: 0;
    border-bottom-left-radius: 10px 10px;
    padding: 5px;
    z-index: 100000;
    border-bottom: solid 4px #1f051c;
    border-left: solid 4px #1f051c;
    font-family: 'Noto Serif Georgian' !important;
    pointer-events: none !important;
    animation: colorChangeBadge 2s infinite alternate !important;
    background-size: 200% 200%;
  }\n  }\n}`;

    // Append CSS to the document
    const styleElement = document.createElement("style");
    styleElement.textContent = cssContent;
    document.head.appendChild(styleElement);
}

setTimeout(() => {
    fetchNewGameIds();
}, 3000);
