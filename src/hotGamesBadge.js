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
    const wins = Array.from(winsMap, ([gameId, amount]) => ({ gameId, amount }));

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
    font-size: 140%;
    text-shadow: rgb(0,0,0) 2px 2px;
    box-shadow: inset 0px 0px 10px black, inset 0px 0px 10px rgba(0,0,0,0.1);
    background-image: radial-gradient(#2700af,#11004f) !important;
    bottom: 0;
    left: 0;
    border-top-right-radius: 5px;
    border-bottom-left-radius: 5px;
    padding: 7px;
    z-index: 100000;
    border-width: 3px;
    border-style: solid;
    border-image: linear-gradient(45deg, #ffba2c, #ffea00, #ffba2c, #ffea00, rgb(255,186,45)) 1;
    outline: solid 4px rgb(31 5 28);
    border-bottom: none;
    border-left: none;
    font-family: 'Lilita One' !important;
    pointer-events: none !important;

    @media (max-width: 768px) {
        font-size: 100%;
        padding: 3px 7px;
    }
  }
  `;

  // Generate only the dynamic content updates per game
  let contentCss = wins
    .map(
      (win) => `
    x-casino-game-thumb[data-id="${win.gameId}"]::after {
      content: 'Hot Win: ${win.amount} ₾';
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
