let amountProgressMR = 0;
let cachedProgressData = null;

function getProgressData() {
  if (!cachedProgressData) {
      const dataElement = document.getElementById('progressBarData');
      if (!dataElement) {
          console.error("progressBarData element not found");
          return null;
      }
      try {
          cachedProgressData = JSON.parse(dataElement.textContent);
      } catch (e) {
          console.error("Error parsing progressBarData:", e);
          return null;
      }
  }
  return cachedProgressData;
}

async function buildAllProgressBars(progressData) {
    const progressBar = document.getElementById(progressData.progressBarParrent);
    if (!progressBar) return;
    const isUserLoginned = extractAuthDataFromCookie()?.userId == undefined ? false : true;
    let points = null;
    if (isUserLoginned) {
      points = await showProgressBarMrch();
    }
    const breackpoints = progressData.breakpoints;
    let currPercent = 0;
    let lang = await document.documentElement.lang;
  
    const getCurrPercent = (points) => {
      breackpoints.forEach(element => {
        if (points > element.to) {
        currPercent += 100;
        document.getElementsByClassName(`present-${element.to}`)[0]?.classList?.add("progress-achieved");
        }
        else if (points <= element.from) { currPercent += 0; }
        else {
          currPercent += (points - element.from) * 100 / (element.to - element.from);
        }
      });
      currPercent = currPercent / breackpoints.length;
    }
  
    await getCurrPercent(points);
  
    const progressBarsParrent = document.createElement("div");
    progressBarsParrent.classList.add("progress-bars-parrent");
  
    let loginText = {
      ka: "შესვლა",
      en: "Login",
      ru: "Вход",
      tr: "Giriş"
    }
  
    let registerText = {
      ka: "რეგისტრაცია",
      en: "Register",
      ru: "Регистрация",
      tr: "Kayıt"
    }
  
  
    if (!isUserLoginned){
      progressBarsParrent.innerHTML = `
        <div class="progress-bar-logout-container">
          <div class="logoutText">${progressData.logoutText[lang]}</div>
          <div class="buttonsContainer"> 
            <button class="loginButton" onClick="TMA.execute('LOGIN_CONNECTED')">${loginText[lang]}</button>
            <button class="registerButton" onClick="TMA.execute('REGISTER')">${registerText[lang]}</button>
          </div>
        </div>
      `
    } else if(currPercent === 100) {
      progressBarsParrent.innerHTML = progressData.complateComponent[lang];
    } else{
      progressBarsParrent.innerHTML = `
    <div ${currPercent > 0 ? `style="--progress-value: ${currPercent}"` : ''} class="progress-bar-container ${currPercent > 0 ? 'bet_made' : ''}">
          <div class="progress-bar-up-text-container progres-text-container">
              <div class="pgogress-bar-up-title-content progres-text">${progressData.upTitleContent[lang]}</div>
              <div class="progress-bar-free-start"> </div>
                <div class="progress-bar-up-text-inner-container">
                ${breackpoints.map((element, index) => {
                  let brcPercent = (100 / breackpoints.length )* (index + 1);
                  return `
                    <div class="progress-prize-text-container progress-prize-${brcPercent}" style="right: ${100 - brcPercent}%;">
                        <div class="progress-prize-text text">${element.topContent}</div>
                    </div>
                    `
                  }).join("")
                }
                </div>
            </div>
  
          <div class="active-progress-bar-container">
              <div class="active-progress-bar" style="width: calc(${currPercent}% - 10px)"> </div>
              <div class="progress-bar-curr-points-container">
                  <div class="progress-bar-free-start"> </div>
                  <div class="progress-bar-inner-container">
                      <div class="progress-bar-curr-points" style="right: ${100 - currPercent}%;">${points} ₾</div>
                  </div>
                  <div class="progress-bar-free-end"> </div>
              </div>
  
          </div>
  
          <div class="progress-bar-bottom-text-container progres-text-container">
              <div class="pgogress-bar-bottom-title-content progres-text">${progressData.bottomTitleContent[lang]}</div>
              <div class="progress-bar-free-start"> </div>
                <div class="progress-bar-bottom-text-inner-container">
                ${breackpoints.map((element, index) => {
                  let brcPercent = (100 / breackpoints.length )* (index + 1);
                  return `
                    <div class="progress-prize-text-container progress-prize-${brcPercent}" style="right: ${100 - brcPercent}%;">
                        <div class="progress-prize-text text">${element.bottomContent}</div>
                    </div>
                    `
                  }).join("")
                }
                </div>
                
          </div>
  
      </div>
    `
    }
  
    progressBar.innerHTML = "";
    progressBar.appendChild(progressBarsParrent);
  }

function calculatePercent(start, end, value) {
  const range = end - start;
  if (range === 0) return 0;
  const percent = ((value - start) / range) * 100;
  return percent > 100 ? 100 : percent < 0 ? 0 : percent;
}

function buildProgressBar(progressElem, parent, data) {
  const progress =
    Math.round(
      calculatePercent(progressElem.range.start, progressElem.range.end, data) *
        10
    ) / 10;

  const progressItemsHTML = progressElem.progress
    .map((element) => {
      const cleanText = element.text.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      const className =
        progress > element.percent
          ? `open-present-${cleanText} progress-achieved`
          : `present-${cleanText}`;
      return `<div class="current_progress ${className}" style="position: absolute; left: ${element.percent}%; transform: translateX(-50%);">${element.text}</div>`;
    })
    .join("");

  let activeProgressClass = "";
  let activeProgressStyle = `position: absolute; left: 0;`;

  if (progress === 0) {
    activeProgressClass = "hidden";
  } else if (progress > 0 && progress < 2) {
    activeProgressClass = "min-width";
  } else if (progress > 90) {
    activeProgressClass = "full-radius";
    activeProgressStyle += `width: ${progress}%;`;
  } else {
    activeProgressStyle += `width: ${progress}%;`;
  }
  const progressHTML = `
            <div style="display: flex; width: 100%; justify-content: center;">
                <div class="progressbarInfo" style="position: relative;">${progressElem.range.start}₾ - ${progressElem.range.end}₾</div>
            </div>
            <div style="--progress: ${progress}%"  class="progressbar progress-${progressElem.range.end}" style="position: relative; width: 100%;">
                <progress value="${progress}" max="100"></progress>
                ${progressItemsHTML}
            </div>
        `;

  parent.innerHTML = progressHTML;

  const progressBar = parent.querySelector(".progressbar");

  const beforeContent = progressElem.range.start;
  const afterContent = progressElem.range.end;

  const styleId = `progressbar-style-${Date.now()}`;
  const styleElement = document.createElement("style");
  styleElement.id = styleId;
  document.head.appendChild(styleElement);

  styleElement.textContent = `
            .progress-${progressElem.range.end}::before {
                content: "${beforeContent}";
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                font-size: 10px;
                z-index: 4;
                left: 10px;
                color: #000;
            }
            .progress-${progressElem.range.end}::after {
                content: "${afterContent}";
                position: absolute;
                top: 50%;
                z-index: 4;
                transform: translateY(-50%);
                font-size: 10px;
                right: 10px;
                color: #000;
            }
        `;
}

function getDateBasedValue() {
  const progressData = getProgressData();
  if (!progressData || !progressData.dateValues) {
      return "0";
  }

  const dateValues = progressData.dateValues;

  const tbilisiDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tbilisi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
  }).format(new Date());

  return dateValues[tbilisiDate] || "0";
}


async function showProgressBarMrch() {
  const todayValue = getDateBasedValue();
  const authData = extractAuthDataFromCookie();
  if (!authData) return 0;

  const query = `
          query UserTournamentConnection($userId: ID, $tournamentId: ID) {
            userTournamentConnection(userId: $userId, tournamentId: $tournamentId) {
              edges {
                node {
                  points
                }
              }
            }
          }
        `;
  try {
    const result = await fetchGraphQL(query, {
      userId: authData.userId,
      tournamentId: todayValue,
    });
    return result.data?.userTournamentConnection?.edges[0]?.node?.points || 0;
  } catch (error) {
    console.error("Error fetching progress data:", error);
    return 0;
  }
}



function madeProgressBar() {
  const progressData = getProgressData();
  if (progressData) {
      buildAllProgressBars(progressData);
  }
}
