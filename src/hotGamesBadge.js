async function fetchHotGameIds() {
  const query = `
  query RecentWinConnection {
    recentWinConnection(
      brandId: "ab",
      first: 10,
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

    const wins = data.data.recentWinConnection.edges.map((edge) => ({
      gameId: edge.node.gameId,
      amount: edge.node.amount,
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
    font-size: 130%;
    text-shadow: rgb(0,0,0) 2px 2px;
    box-shadow: inset 0px 0px 10px black, inset 0px 0px 20px rgba(0,0,0,0.5);
    background-image: url('https://images.takeshape.io/5da2b4d5-59f6-412a-82c3-f6a272b532be/dev/fcd40f3a-7c06-4d55-ad2b-9eb40ee310d5/Asset%201.svg') !important;
    background-size: 600% 600%; /* Adjusted so only X-axis moves */
    background-color: #680053;
    bottom: 0;
    left: 0;
    border-top-right-radius: 10px;
    border-bottom-left-radius: 7px;
    padding: 7px;
    z-index: 100000;
    border-top: solid 4px #1f051c;
    border-right: solid 4px #1f051c;
    font-family: 'Lilita One' !important;
    pointer-events: none !important;
    animation: moveBackgroundX 40s ease-in-out infinite; /* Apply animation */

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
      content: '${win.amount} ₾';
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
}, 3000);
