// Function to fetch session information from the API
async function fetchSessionInfo(userId, accessToken) {
  const sessionQuery = `
        query SessionConnection($userId: ID) {
            sessionConnection(userId: $userId, last: 15) {
                edges {
                    node {
                        ip
                        os
                        browser
                        createdAt
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
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: sessionQuery,
        variables: { userId },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data?.data?.sessionConnection?.edges || [];
  } catch (error) {
    console.error("Error fetching session information:", error);
    return [];
  }
}

// Function to render session information in the UI
function renderSessionInfo(sessions) {
  const sessionList = document.getElementById("session-list");
  if (!sessionList) return;

  sessionList.innerHTML = "";

  if (sessions.length === 0) {
    sessionList.innerHTML = "<li>No session data found.</li>";
    return;
  }

  sessions.forEach((session) => {
    const { ip, os, browser, createdAt } = session.node;
    const sessionItem = document.createElement("li");
    sessionItem.innerHTML = `
            <p><span class="label">IP:</span> ${ip}</p>
            <p><span class="label">OS:</span> ${os}</p>
            <p><span class="label">Browser:</span> ${browser}</p>
            <p><span class="label">Time:</span> ${formatDate(createdAt)}</p>
        `;
    sessionList.appendChild(sessionItem);
  });
}

// Main function to load session data
async function loadSessionData() {
  const authData = extractAuthDataFromCookie();

  if (!authData || !authData.userId || !authData.accessToken) {
    console.error("Failed to retrieve user ID or access token from cookie.");
    return;
  }

  const { userId, accessToken } = authData;
  const sessions = await fetchSessionInfo(userId, accessToken);
  renderSessionInfo(sessions);
}
