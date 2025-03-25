let amountProgressMR = 0;

function calculateTimeInterval() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(24, 0, 0, 0);
  return {
    from: startOfDay.toISOString(),
    to: endOfDay.toISOString(),
  };
}

function buildAllProgressBars(progressBarInfo, data) {
  progressBarInfo.forEach((info) => {
    const parent = document.getElementById(info.parentId);
    if (parent) {
      buildProgressBar(info, parent, data);
    } else {
      console.warn(`Parent with id ${info.parentId} not found.`);
    }
  });
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

async function showProgressBarMrch() {
  const timeInterval = calculateTimeInterval();
  const authData = extractAuthDataFromCookie();
  if (!authData) return 0;

  const query = `
            query GameSessionStats($userId: ID!, $createdAtFrom: DateTime, $createdAtTo: DateTime) {
                gameSessionStats(userId: $userId, createdAtFrom: $createdAtFrom, createdAtTo: $createdAtTo) {
                    totalBet
                }
            }
        `;
  try {
    const result = await fetchGraphQL(query, {
      userId: authData.userId,
      createdAtFrom: timeInterval.from,
      createdAtTo: timeInterval.to,
    });
    return result.data?.gameSessionStats?.[0]?.totalBet || 0;
  } catch (error) {
    console.error("Error fetching progress data:", error);
    return 0;
  }
}

    async function madeProgressBar() {
      const progressBarInfo = JSON.parse(
        document.getElementById("progressBarData").textContent
      );
      const amountProgressMR = await showProgressBarMrch();
      buildAllProgressBars(progressBarInfo, amountProgressMR);
      document.getElementById("amodisplay").textContent = `${amountProgressMR} ₾`;
  
      const thresholds = [2500, 5000, 15000, 25000];
      thresholds.forEach((threshold) => {
        const markers = document.querySelectorAll(`.present-${threshold}`);
        if (amountProgressMR >= threshold) {
          markers.forEach((marker) => {
            marker.classList.add("progress-achieved");
          });
        }
      });
    }

