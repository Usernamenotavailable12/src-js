async function fetchNewGameIds() {
  const url = "https://www.ambassadoribet.com/_internal/gql?operationName=LobbyGames&variables=%7B%22brandId%22:%22ab%22,%22countryCode%22:%22GE%22,%22device%22:%22DESKTOP%22,%22gameFilters%22:%7B%22orderBy%22:%5B%7B%22field%22:%22releasedAt%22,%22direction%22:%22DESCENDING%22%7D%5D,%22source%22:%5B%22LATEST_RELEASES%22%5D,%22type%22:%5B%22SLOT%22%5D%7D,%22jurisdiction%22:%22GE%22,%22limit%22:15%7D&extensions=%7B%22persistedQuery%22:%7B%22version%22:1,%22sha256Hash%22:%227edfbe74a98f32ce675eed18f27c8c42ecce4071fa59421382e744b500fda0b3%22%7D%7D";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
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