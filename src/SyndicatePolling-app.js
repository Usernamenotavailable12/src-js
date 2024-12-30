async function fetchSyndicateData() {
  const query = `
    query SyndicateConnection($orderBy: [SyndicateOrderByInput!] = [{ field: totalOutcomeAmount, direction: DESCENDING }]) {
      syndicateConnection(
        brandId: "ab",
        syndicateIds: [
          "d75347df2054c066af7cbdeecd82bc464b8882f3",
          "577c95750b9919ed15ab3c18b8f7ae1d5ffad0a7",
          "ef2338dd47ed9640e722deec1af0b52b1060b4f7",
          "8ec6c02d360aa065d942a0a880587e10560e8ad5",
          "f7dbca362cf45bb4d57fd35561d428f12a482346",
          "564dfd815b8860d125c7ace5d57667a1db264c7a",
          "5e6b16ee187cab1d552afbc725aa15cecdf22cbe",
          "28e50df0f03b7ff643249d592029251c51f9c323",
          "726d7d5d29120e15bd3b404b2f6b2f2f64ccfeac",
          "f934657c35b7629b26c9fbd79be1842aa5d017a9",
          "e1e4be1349a5a95d75b8279516ccabbc31847c5e"
        ],
        orderBy: $orderBy
      ) {
        edges {
          node {
            name
            imageRef
            stats {
              maxWinAmount
              totalOutcomeAmount
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://www.ambassadoribet.com/_internal/gql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const container = document.getElementById("syndicate-container-box");

    if (container) {
      if (data?.data?.syndicateConnection?.edges) {
        sessionStorage.setItem("syndicateData", JSON.stringify(data.data.syndicateConnection.edges));
      } else {
        console.error("Unexpected API response:", data);
        container.innerHTML = "<p>Error fetching data</p>";
      }
    }
  } catch (error) {
    const container = document.getElementById("syndicate-container-box");
    if (container) {
      container.innerHTML = "<p>Network error. Please try again later.</p>";
    }
    console.error("Fetch error:", error);
  }
}

function displayData(data) {
  const container = document.getElementById("syndicate-container-box");

  if (container) {
    container.innerHTML = data
      .sort((a, b) => {
        const totalA = a.node?.stats?.totalOutcomeAmount || 0;
        const totalB = b.node?.stats?.totalOutcomeAmount || 0;
        return totalB - totalA; 
      })
      .slice(0, 7) 
      .map((item) => {
        if (!item.node) {
          return "<div>Data not available</div>";
        }

        const { name, imageRef, stats } = item.node;

        return `
          <div style="--syndicate-background-image: url('${imageRef}');" class="syndicate-box">
            <div
              class="syndicate-header-box"
              style="--syndicate-background-image: url('${imageRef}');">
            </div>
            <h3 class="syndicateIdentityName">${name || "No Name"}</h3>
            <p class="totalOutcomeAmount">
              ${stats?.totalOutcomeAmount != null ? stats.totalOutcomeAmount.toLocaleString() : "N/A"} ₾
            </p>
            <p class="maxWinAmount">
              ${stats?.maxWinAmount != null ? stats.maxWinAmount.toLocaleString() : "N/A"} ₾
            </p>
            <p style="display: none" class="maxResultAmount">
              ${stats?.maxResultAmount != null ? stats.maxResultAmount.toLocaleString() : "N/A"} ₾
            </p>
          </div>
        `;
      })
      .join(""); 
  }
}


function startSyndicatePolling() {
  fetchSyndicateData();

  setInterval(fetchSyndicateData, 360000); // Fetch data every 6 minutes

  setInterval(() => {
    const syndicateData = sessionStorage.getItem("syndicateData");
    if (syndicateData) {
      displayData(JSON.parse(syndicateData));
    }
  }, 1000); 
}

window.startSyndicatePolling = startSyndicatePolling;

setTimeout(() => {
  startSyndicatePolling();
}, 3000); 