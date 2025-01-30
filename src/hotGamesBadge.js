async function fetchHotGameIds() {
  const query = `
  query RecentWinConnection {
    recentWinConnection(
      brandId: "ab",
      first: 20,
      orderBy: {
        direction: DESCENDING,
        field: convertedAmount
      }
    ) {
      edges {
        node {
          gameId
          amount
        }
      }
    }
  }
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    const winsMap = new Map();

    // Store only the first occurrence of each gameId
    data.data.recentWinConnection.edges.forEach((edge) => {
      const { gameId, amount } = edge.node;
      if (!winsMap.has(gameId)) {
        winsMap.set(gameId, amount);
      }
    });

    // Convert the map to an array of objects
    const wins = Array.from(winsMap, ([gameId, amount]) => ({
      gameId,
      amount,
    }));

    generateRecentWinsCSS(wins);
  } catch (error) {
    console.error("Error fetching recent wins:", error);
  }
}

function generateRecentWinsCSS(wins) {
  if (!wins.length) return;

  // Group all winning games in a single shared selector
  let selectorList = wins
    .map((win) => `x-casino-game-thumb[data-id="${win.gameId}"]::after`)
    .join(",\n");

  // General styling applied to all win badges
  let sharedCss = `
  ${selectorList} {
    position: absolute;
    color: #ffffff;
    font-size: 17px;
    text-shadow: rgb(0, 0, 0, 0.2) 0px 2px 6px, rgb(0, 0, 0, 0.2) 0px -2px 6px,
      rgb(0, 0, 0, 0.2) 2px 0px 6px, rgb(0, 0, 0, 0.2) -2px 0px 6px;
    box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.8),
      inset 0px 0px 10px rgba(0, 0, 0, 0.2);
    background-image: radial-gradient(#fa2a97, #a9065e) !important;
    background-size: cover;
    background-position: center;
    top: 0;
    left: 0;
    right: auto !important;
    border-bottom-right-radius: 5px;
    border-top-left-radius: 5px;
    padding: 7px;
    z-index: 100000;
    border-width: 2px;
    border-style: solid;
    border-image: radial-gradient(rgb(204, 172, 0), gold, rgb(255, 154, 0, 0.6)) 1;
    outline: solid 5px rgb(31 5 28);
    border-top: none;
    border-left: none;
    font-family: "Noto Sans Ambassadori" !important;
    pointer-events: none !important;
  }
  @media (max-width: 900px) {
    ${selectorList} {
      font-size: 10px;
      padding: 3px 7px;
      outline: solid 4px rgb(31 5 28);
    }
  }
  `;

  // Generate only the dynamic content updates per game
  let contentCss = wins
    .map(
      (win) => `
    x-casino-game-thumb[data-id="${win.gameId}"]::after {
      content: 'BIG WIN: ${win.amount} ₾';
    }
  `
    )
    .join("\n");

  // Append CSS to the document
  const styleElement = document.createElement("style");
  styleElement.textContent = sharedCss + contentCss;
  document.head.appendChild(styleElement);
}

// Run the script after 3 seconds when the site loads
setTimeout(() => {
  fetchHotGameIds();
}, 3200);
