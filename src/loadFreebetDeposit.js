const loadFreebetDeposit = () => {
  const userData = extractAuthDataFromCookie();
  if(!userData || !userData.userId || !userData.accessToken || !userData.accessToken === ""){
      return; 
  }

  const segmentidCase = new Map([
      ["6B9BuiiAzR4rXhZUaYO5", { deposit1: 3000, offer1: 1500, deposit2: 5000, offer2: 5000 }],
      ["c31gbVk67mNoHgrXXYG6", { deposit1: 2000, offer1: 1000, deposit2: 3500, offer2: 3500 }],
      ["dsuHck7Rvi3PQnA7Ch5y", { deposit1: 1000, offer1: 500, deposit2: 1500, offer2: 1500 }],
      ["IJVrYKjpCrRswNUiu2cJ", { deposit1: 500, offer1: 250, deposit2: 800, offer2: 800 }],
      ["bbNMwkC8FoEvphnfqtEF", { deposit1: 300, offer1: 150, deposit2: 500, offer2: 500 }],
      ["36mPcHLWixuaA8jsJtuB", { deposit1: 200, offer1: 100, deposit2: 350, offer2: 350 }],
      ["TQCBW2CqKQGEhK9P4m52", { deposit1: 200, offer1: 100, deposit2: 350, offer2: 350 }],
  ]);

  const segmentpercenttextthing = new Map([
      ["pGfPyckgI3UGsT73JkhJ", { text: "50%"}],
      ["MLYSBUD0inqrr4jmbb4T", { text: "100%"}],
  ]);

  const aallprogressid = "njF17udGh0oTc04xyHeP";

  fetchGraphQL(
      `query UserSegments($userId: ID!) {
      userSegments(userId: $userId) {
          segmentId
      }
      }`,
      { userId: userData.userId }
  )
  .then(response => {
      replaceDepositAndOffer(response?.data?.userSegments)
      return response?.data?.userSegments;
  })
  .catch(error => {
      console.error('Error:', error);
  });

  const replaceDepositAndOffer = (response) => {
      if (!response || typeof response[Symbol.iterator] !== 'function') {
          console.error("Invalid response: must be iterable");
          return;
      }
  
      for (const value of response) {
          const segmentId = value?.segmentId;
  
          if (!segmentId) {
              console.warn("Missing segmentId in response entry:", value);
              continue;
          }
          
          if (segmentpercenttextthing.has(segmentId)) {
              const data = segmentpercenttextthing.get(segmentId);
              const tourElement = document.getElementById("start-aaaaa-tour-bba");
              const sectttElement = document.getElementById("end-aaaae-tour-bba");
              let variableblocktext = document.getElementById("chousen-percentage")

              if(data.text != null || data.text) {
                  variableblocktext.textContent = data.text;
              }
              
              if (tourElement) {
                  tourElement.style.display = "none";
              } else {
                  console.warn("Tour element not found: start-aaaaa-tour-bba");
              }
  
              if (sectttElement) {
                  sectttElement.style.display = "block";
              } else {
                  console.warn("Tour element not found: start-aaaaa-tour-bba");
              }
  
          }

          if (aallprogressid == segmentId) {
                  let elmfirst = document.getElementById("deposit-frebeet-num2-cond");
                  let elmsec = document.getElementById("deposit-frebeet-num3-cond")
                  let iconfirst = document.getElementById("deposit-frebeet-num2-arrow-galochka")
                  let iconSec = document.getElementById("deposit-frebeet-num3-arrow-galochka")
                  let firstButton = document.getElementById("buttonnslots")
                  let secButton = document.getElementById("buttonnsports")
                  elmfirst.classList.remove("inactive-cond-aaa-tripple");
                  elmfirst.classList.add("active-cond-aaa-tripple");
                  elmsec.classList.remove("inactive-cond-aaa-tripple");
                  elmsec.classList.add("active-cond-aaa-tripple");
                  iconfirst.classList.remove("icon-picture-some-lock");
                  iconfirst.classList.add("icon-picture-some-galochka");
                  iconSec.classList.remove("icon-picture-some-lock");
                  iconSec.classList.add("icon-picture-some-galochka");
                  firstButton.style.display = "none";
                  secButton.style.display = "block";

                  const tourElement = document.getElementById("start-aaaaa-tour-bba");
                  const sectttElement = document.getElementById("end-aaaae-tour-bba");

                  
                  if (tourElement) {
                      tourElement.style.display = "none";
                  } else {
                      console.warn("Tour element not found: start-aaaaa-tour-bba");
                  }
      
                  if (sectttElement) {
                      sectttElement.style.display = "block";
                  } else {
                      console.warn("Tour element not found: start-aaaaa-tour-bba");
                  }
      
          }
  
          if (segmentidCase.has(segmentId)) {
              const data = segmentidCase.get(segmentId);
              
              const updateElement = (id, content) => {
                  const element = document.getElementById(id);
                  if (element) {
                      element.textContent = `${content}₾`;
                  } else {
                      console.warn(`Element not found: ${id}`);
                  }
              };
  
              updateElement("da-dep-50", data.deposit1);
              updateElement("da-dep-offer-50", data.offer1);
              updateElement("da-dep-100", data.deposit2);
              updateElement("da-dep-offer-100", data.offer2);
              break;
          }
      }
  };
}
