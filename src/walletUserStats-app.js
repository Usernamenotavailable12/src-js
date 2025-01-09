function calculateTimeInterval() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0); // Start of the day at midnight

  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(24, 0, 0, 0); // End of the day at midnight the next day

  return {
    from: startOfDay.toISOString(),
    to: endOfDay.toISOString(),
  };
}

async function showBetProgress() {
  const timeInterval = calculateTimeInterval();
  const authData = extractAuthDataFromCookie();

  if (!authData) {
    alert("Authorization data is missing.");
    return;
  }

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

    const totalBet = result.data?.gameSessionStats?.[0]?.totalBet || 0;
    displayProgressBars(totalBet);
  } catch (error) {
    alert("Failed to fetch progress data.");
  }
}

function displayProgressBars(totalBet) {
  const progressBarContainer = document.getElementById("progressBarContainer");
  const progressStage1 = document.getElementById("progressStage1");
  const progressStage2 = document.getElementById("progressStage2");
  const progressStage3 = document.getElementById("progressStage3");
  const progressInfo = document.getElementById("progressInfo");

  if (
    !progressBarContainer ||
    !progressStage1 ||
    !progressStage2 ||
    !progressStage3 ||
    !progressInfo
  ) {
    return;
  }

  progressBarContainer.style.display = "flex";
  progressInfo.style.display = "block";
  progressInfo.textContent = `${totalBet}₾`;

  const stage1Percentage = Math.min((totalBet / 6000) * 100, 100);
  const stage2Percentage =
    totalBet > 6000 ? Math.min(((totalBet - 6000) / 9000) * 100, 100) : 0;
  const stage3Percentage =
    totalBet > 15000 ? Math.min(((totalBet - 15000) / 15000) * 100, 100) : 0;

  progressStage1.style.width = `${stage1Percentage}%`;
  progressStage1.textContent = `${stage1Percentage.toFixed(2)}%`;

  progressStage2.style.width = `${stage2Percentage}%`;
  progressStage2.textContent = `${stage2Percentage.toFixed(2)}%`;

  progressStage3.style.width = `${stage3Percentage}%`;
  progressStage3.textContent = `${stage3Percentage.toFixed(2)}%`;
}
