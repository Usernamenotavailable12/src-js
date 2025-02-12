async function fetchHighCash() {
  const apiUrl = 'https://ambassadoribetge-api-prod-bgsp.egt-ong.com/api/jackpot/stats';
  try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      // Check if instanceStats exists
      if (data.jackpotInstancesStats && data.jackpotInstancesStats.instanceStats) {
          const instances = data.jackpotInstancesStats.instanceStats;

          // Find the "High Cash" instance
          const highCashInstance = instances.find(instance => instance.instanceName === "High Cash");
          if (highCashInstance) {
              const level1Stats = highCashInstance.levelStats.find(level => level.levelId === 1);
              if (level1Stats) {
                  const currentValueObj = level1Stats.currentValue.find(val => val.key === 'GEL');
                  if (currentValueObj) {
                    let currentValue = Math.round(currentValueObj.value / 100);
                    currentValue = `"${new Intl.NumberFormat('en-US').format(currentValue)}₾"`; // Add commas

                      // Inject dynamic CSS into the document
                      const style = document.createElement("style");
                      style.innerHTML = `
                          x-casino-game-thumb[data-id="princess-cash"],
                          x-casino-game-thumb[data-id="leprechance-treasury"],
                          x-casino-game-thumb[data-id="dragons-realm"],
                          x-casino-game-thumb[data-id="mummy-secret"] {
                              &::before {
                                  content: ${currentValue};
                                      position: absolute;
                                      bottom: 10px;
                                      right: 10px;
                                      font-size: var(--font-size-body);
                                      background: var(--background-background) var(--highcash) no-repeat 5px
                                        center;
                                      padding: 5px 5px 5px 25px;
                                      border-radius: 7px;
                                      z-index: 2;
                                      pointer-events: none;
                              }
                          }
                      `;

                      // Remove old styles if they exist
                      const existingStyle = document.getElementById("high-cash-style");
                      if (existingStyle) {
                          existingStyle.remove();
                      }

                      // Add new styles
                      style.id = "high-cash-style";
                      document.head.appendChild(style);
                  } else {
                      console.warn("currentValue for GEL not found.");
                  }
              } else {
                  console.warn("Level 1 stats not found.");
              }
          } else {
              console.warn("High Cash instance not found.");
          }
      } else {
          console.warn("instanceStats not found in response.");
      }
  } catch (error) {
      console.error('Error fetching jackpot stats:', error);
  }
}

// Call the function immediately and every 3.5 seconds
setTimeout(() => {
  fetchHighCash();
}, 3600);
