async function fetchHighCache() {
  const apiUrl = 'https://ambassadoribetge-api-prod-bgsp.egt-ong.com/api/jackpot/stats';
  try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API Response:", data); // Debugging

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
                      const currentValue = `"${currentValueObj.value}"`; // Ensure value is in quotes
                      console.log("CSS Variable Set:", currentValue);

                      // Apply CSS variable directly to specified elements
                      const selectors = [
                          'x-casino-game-thumb[data-id="princess-cash"]',
                          'x-casino-game-thumb[data-id="leprechance-treasury"]',
                          'x-casino-game-thumb[data-id="dragons-realm"]',
                          'x-casino-game-thumb[data-id="mummy-secret"]'
                      ];

                      selectors.forEach(selector => {
                          document.querySelectorAll(selector).forEach(element => {
                              element.style.setProperty('--high-cash-current-value', currentValue);
                          });
                      });

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
setTimeout(() => {
  fetchHighCache();
}, 3500);
// Call the function on page load
