const API_URL = "https://www.ambassadoribet.com/_internal/gql";
const BRAND_ID = "ab";

async function fetchGraphQL(query, variables = {}) {
  const authData = extractAuthDataFromCookie();
  if (!authData || !authData.accessToken) {
    throw new Error("Unable to retrieve authorization data.");
  }
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authData.accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json();
  return result;
}

function extractAuthDataFromCookie() {
  const auth = getCookie("auth");
  if (!auth) {
    console.error("Auth cookie not found.");
    return null;
  }
  try {
    const decodedAuth = decodeURIComponent(auth);
    const authData = JSON.parse(decodedAuth);
    return {
      userId: authData.userId,
      accessToken: authData.accessToken,
    };
  } catch (error) {
    console.error("Error parsing auth cookie:", error);
    return null;
  }
}

function getCookie(name) {
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((row) => row.trim().startsWith(name + "="));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}
