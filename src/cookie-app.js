document.addEventListener("DOMContentLoaded", (event) => {
  if (!getCookiePopup("cookieConsent")) {
    createCookieConsentBanner();
  }
});

function createCookieConsentBanner() {
  // Create the outer container div
  const ambCookieContainer = document.createElement("div");
  ambCookieContainer.className = "amb-cookie-container";

  // Create the banner div
  const cookieConsent = document.createElement("div");
  cookieConsent.className = "cookieConsent";

  // Create the container div
  const container = document.createElement("div");
  container.className = "cookieConsentContainer";

  // Create the message paragraph
  const message = document.createElement("p");
  message.innerHTML =
    'საიტი იყენებს Cookie ფაილებს. დახურვის ღილაკზე დაჭერით თქვენ ეთანხმებით Cookie ფაილების გამოყენების წესებს და პირობებს. <a href="https://www.ambassadoribet.com/cookie-policy" target="_blank">Cookie პოლიტიკა.</a>';

  // Create the accept button
  const button = document.createElement("button");
  button.className = "acceptCookies";
  button.textContent = "დახურვა";
  button.addEventListener("click", () => {
    setCookie("cookieConsent", "true", 365);
    ambCookieContainer.style.display = "none";
  });

  // Append elements to the container
  container.appendChild(message);
  container.appendChild(button);

  // Append container to the banner
  cookieConsent.appendChild(container);

  // Append banner to the outer container
  ambCookieContainer.appendChild(cookieConsent);

  // Append outer container to the body
  document.body.appendChild(ambCookieContainer);

  // Add CSS styles
  addCookieConsentStyles();
}

function addCookieConsentStyles() {
  const styles = `
        .amb-cookie-container {
            position: fixed;
            bottom: 10px;
            width: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .cookieConsent {
            background-color: rgb(0,0,0,.9);
            color: #fff;
            text-align: center;
            padding: 20px;
            font-family: 'Noto Sans Ambassadori';
            overflow: hidden;
            border-radius: 5px;
        }
        .cookieConsentContainer {
            max-width: 960px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }
  
        .cookieConsentContainer p {
            margin: 0;
            font-size: 10px;
        }
  
        .cookieConsentContainer a {
            color: #cf167d !important;
            text-decoration: none;
        }
  
        .cookieConsentContainer .acceptCookies {
            background-color: #cf167d;
            border: none;
            color: white;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 10px;
            font-family: 'Noto Sans Ambassadori';
            border-radius: 5px;
        }
        @media (max-width: 1200px) {
            .cookieConsent > div {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
        }
        @media (max-width: 768px) {
            .amb-cookie-container {
            position: fixed;
            bottom: 0px;
        }
    `;
  const styleSheet = document.createElement("style");
  styleSheet.id = "style-cookie";
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookiePopup(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}
