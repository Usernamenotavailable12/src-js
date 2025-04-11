function maskUsername(username, currentUserId, userId) {
  if (!username || username.length <= 2) return username;
  if (userId && userId === currentUserId) return username;
  return username[0] + '*****' + username[username.length - 1];
}

class FullLeaderboardTable {
  leaderboardsInfo = [];
  parrentElement = null;
  leaderboardButtonsBox = null;
  leaderboardBody = null;
  leaderboardTable = null;
  leaderboardsData = new Map();
  userData = new Map();
  leaderboardTableWebSocket = null;
  outComponent = null;
  loading = true;
  spinner = null;
  currentUserInfo = {
      id: null,
      nickname: null
  }
  locale = 'en';

constructor(leaderboardsInfo, parrentElement) {
      this.leaderboardsInfo = leaderboardsInfo?.ldArray;
      this.outComponent = leaderboardsInfo.outComponent;
      this.parrentElement = parrentElement;
      this.currentUserInfo.id = extractAuthDataFromCookie()?.userId;
      this.locale = document.documentElement.getAttribute('lang') || 'en';
      this.getAllData();


      const loaderHTML = `
              <mat-spinner class="mat-loader" style="display: inline-block;">
                  <div class=" loader">   
                  </mat-spinner> 
                  `;

      const leaderboardHTML = `
      <style>
      mat-spinner {
          background-size: contain !important;
          background-repeat: no-repeat !important;
          background-image: url("https://images.takeshape.io/5da2b4d5-59f6-412a-82c3-f6a272b532be/dev/aaeef128-13e0-4317-a4e9-815bb063ebbd/spinner-logo-2-bat.png") !important;
      }
          #leaderboardLoader{
  position: relative;
  min-height: 200px;
}
      .mat-loader {
          display: none;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
      }
         .loader {
          width: 90px;
          aspect-ratio: 1;
          border-radius: 50%;
          border: 8px solid #bf307c;
          animation:
              l20-1 1.2s infinite linear alternate,
              l20-2 2.4s infinite linear;
          }

          @keyframes l20-1 {
          0%    {clip-path: polygon(50% 50%, 0 0, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%);}
          12.5% {clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 0%, 100% 0%, 100% 0%);}
          25%   {clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 100%);}
          50%   {clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%);}
          62.5% {clip-path: polygon(50% 50%, 100% 0, 100% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%);}
          75%   {clip-path: polygon(50% 50%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 50% 100%, 0% 100%);}
          100%  {clip-path: polygon(50% 50%, 50% 100%, 50% 100%, 50% 100%, 50% 100%, 50% 100%, 0% 100%);}
          }

          @keyframes l20-2 { 
          0%    {transform: scaleY(1) rotate(0deg);}
          49.99% {transform: scaleY(1) rotate(135deg);}
          50%   {transform: scaleY(-1) rotate(0deg);}
          100%  {transform: scaleY(-1) rotate(-135deg);}
          }

          .leaderboard-table-row {
              opacity: 1;
              transition: opacity 0.3s ease;
          }


      </style>
                  <div class="leaderboard-table-main" style="display:none;">
                      <div class="leaderboard-header">
                          <div class="leaderboard-buttons-box">
                          </div>
                      </div>
                      <div class="leaderboard-body"></div>
              `;

      this.parrentElement.innerHTML = leaderboardHTML;
      this.parrentElement.innerHTML += loaderHTML;
      this.parrentElement.innerHTML += `</div>`;
      this.leaderboardTable = this.parrentElement.querySelector('.leaderboard-table-main');
      this.leaderboardButtonsBox = this.parrentElement.querySelector('.leaderboard-buttons-box');
      this.leaderboardHeader = this.parrentElement.querySelector('.leaderboard-header');
      this.leaderboardBody = this.parrentElement.querySelector('.leaderboard-body');

      const leftButton = document.createElement('button');
      leftButton.innerHTML = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
   viewBox="0 0 330 330" xml:space="preserve" style="transform: scaleX(-1);">
<path id="XMLID_222_" d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001
  c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213
  C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606
  C255,161.018,253.42,157.202,250.606,154.389z"/>
</svg>`;
      leftButton.classList.add('leaderboard-header-left-scroll-button');
      leftButton.classList.add('leaderboard-header-scroll-button');
      leftButton.addEventListener('click', () => this.scrollButtonsLeft());
      
      const rightButton = document.createElement('button');
      rightButton.innerHTML = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
 viewBox="0 0 330 330" xml:space="preserve">
<path id="XMLID_222_" d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001
c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213
C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606
C255,161.018,253.42,157.202,250.606,154.389z"/>
</svg>`;
      rightButton.classList.add('leaderboard-header-right-scroll-button');
      rightButton.classList.add('leaderboard-header-scroll-button');
      rightButton.addEventListener('click', () => this.scrollButtonsRight());

      this.leaderboardHeader.appendChild(leftButton);
      this.leaderboardHeader.appendChild(this.leaderboardButtonsBox);
      this.leaderboardHeader.appendChild(rightButton);

      this.drawLeaderboardHeader();
  }
  destroy() {
      this.leaderboardTableWebSocket.close();
      this.parrentElement.removeChild(this.parrentElement.querySelector(".leaderboard-table-main"));
      this.leaderboardTableWebSocket = null;
  }

  async getAllData() {
      try {
          let DateNow = Date.now();

          if (this.currentUserInfo.id) {
              this.getUserNickname(this.currentUserInfo.id);
          }

          for (const leaderboardInfo of this.leaderboardsInfo) {
              const lbPromise = this.getTournamentData(leaderboardInfo.id, leaderboardInfo.count, DateNow);
              const uPromise = this.currentUserInfo.id
                  ? this.getUserData(leaderboardInfo.id, this.currentUserInfo.id, DateNow)
                  : Promise.resolve(null);

              const [lbInfo, uInfo] = await Promise.all([lbPromise, uPromise]);

              this.drawTableHeaderButton(leaderboardInfo.id, lbInfo);
              this.drawLeaderboardBody(lbInfo, uInfo, leaderboardInfo.id);
          }

          if (this.leaderboardsInfo.length <= 1) {
              this.leaderboardHeader.style.display = "none";
          }

      } catch (error) {
          console.error("Error in getAllData:", error);
      } finally {
          this.setLoading(false);
          this.updateLeaderboards();
          this.createWebSocket();
          this.makeElementDraggable(document.getElementsByClassName("leaderboard-buttons-box")[0], {
              speedMultiplier: 1.0,
              enableTouch: true,
              dragCursor: 'grabbing'
          });


          const ele = document.getElementsByClassName("leaderboard-buttons-box")[0];

          const hasVerticalScroll = (element) => {
              return element.scrollWidth > element.clientWidth;
          };

          if (!hasVerticalScroll(ele)) {
              Array.from(document.getElementsByClassName("leaderboard-header-scroll-button")).forEach((btn) => {
                  btn.style.display = "none";
              });
          }

      }
  }

  scrollButtonsRight() {
      if (!this.leaderboardButtonsBox) return;
      
      const buttons = Array.from(this.leaderboardButtonsBox.children);
      if (buttons.length === 0) return;
      const value = getComputedStyle(this.leaderboardButtonsBox).getPropertyValue('--gap-between-buttons');
      const firstButton = buttons[0];
      const buttonWidth = firstButton.offsetWidth;
      
      const currentScrollLeft = this.leaderboardButtonsBox.scrollLeft + 30;
      
      // this.leaderboardButtonsBox.scrollTo({
      //     left: currentScrollLeft + buttonWidth,
      // });

      this.smoothScrollTo(this.leaderboardButtonsBox, currentScrollLeft + buttonWidth,);
  }
  
  scrollButtonsLeft() {
      if (!this.leaderboardButtonsBox) return;
      
      const buttons = Array.from(this.leaderboardButtonsBox.children);
      if (buttons.length === 0) return;
      const value = getComputedStyle(this.leaderboardButtonsBox).getPropertyValue('--gap-between-buttons');
      const firstButton = buttons[0];
      const buttonWidth = firstButton.offsetWidth;
      
      const currentScrollLeft = this.leaderboardButtonsBox.scrollLeft - 30;
      
      // this.leaderboardButtonsBox.scrollTo({
      //     left: Math.max(0, currentScrollLeft - buttonWidth),
      // });

      
      this.smoothScrollTo(this.leaderboardButtonsBox,  Math.max(0, currentScrollLeft - buttonWidth));
  }

  smoothScrollTo(element, target, duration = 500) {
      const start = element.scrollLeft;
      const distance = target - start;
      let startTime = null;
  
      function animation(currentTime) {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          const ease = progress * (2 - progress); // Простая функция easing
  
          element.scrollLeft = start + distance * ease;
  
          if (timeElapsed < duration) {
              requestAnimationFrame(animation);
          }
      }
  
      requestAnimationFrame(animation);
  }
  

  async getTournamentData(leaderboardId, actionsCount, DateNow) {
      try {
          const query = `
              query TournamentConnection($tournamentId: ID, $status: [TournamentStatus!], $first: Int, $orderBy: [UserTournamentOrderByInput!]) {
                  tournamentConnection(tournamentId: $tournamentId, status: $status) {
                      edges {
                          node {
                              actions {
                                  action {
                                      ... on GiveBonusAction {
                                          bonus {
                                              reward {
                                                  ... on FreespinsBonusReward {
                                                      amount
                                                      type
                                                  }
                                              }
                                          }
                                      }
                                      ... on GiveAndActivateBonusAction {
                                          bonus {
                                              reward {
                                                  ... on FixedBonusReward {
                                                      type
                                                      amounts {
                                                          value
                                                      }
                                                  }
                                              }
                                          }
                                      }
                                      ... on GiveBoxAction {
                                          box {
                                              type
                                              description
                                          }
                                      }
                                      ... on CreateTicketAction {
                                          title
                                      }
                                  }
                              }
                              endsAt
                              startsAt
                              userTournamentConnection(first: $first, orderBy: $orderBy) {
                                  edges {
                                      node {
                                          position
                                          points
                                          user {
                                              userId
                                              displayName
                                          }
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
          `;

          const variables = {
              tournamentId: leaderboardId,
              status: ["ACTIVE", "FINISHED", "PREPARING"],
              orderBy: [{ field: "points", direction: "DESCENDING" }],
              first: actionsCount,
              _nonce: DateNow
          };

          const data = await this.executeGraphQLQuery(query, variables);
          const tournamentNode = data?.data?.tournamentConnection?.edges?.[0]?.node;

          if (!tournamentNode) {
              console.warn("Tournament data is missing for leaderboardId:", leaderboardId);
              return null;
          }

          const result = {
              usersData: tournamentNode.userTournamentConnection.edges,
              rewardsData: tournamentNode.actions,
              endsAt: tournamentNode.endsAt,
              startsAt: tournamentNode.startsAt
          };

          this.leaderboardsData.set(leaderboardId, result);
          return result;

      } catch (error) {
          console.error("Error fetching tournament data:", error);
          return null;
      }
  }

  async getUserData(leaderboardId, userId, DateNow) {
      try {
          const query = `
              query UserTournamentConnection($userId: ID, $tournamentId: ID) {
                  userTournamentConnection(userId: $userId, tournamentId: $tournamentId) {
                      edges {
                          node {
                              points
                              position
                          }
                      }
                  }
              }
          `;

          const variables = {
              tournamentId: leaderboardId,
              userId,
              _nonce: DateNow
          };

          const data = await this.executeGraphQLQuery(query, variables);
          const userNode = data?.data?.userTournamentConnection?.edges?.[0]?.node;

          if (!userNode) {
              console.warn("User data is missing for userId:", userId, "in leaderboard:", leaderboardId);
              return null;
          }

          const result = {
              points: userNode.points,
              position: userNode.position,
              isWinner: null
          };

          this.userData.set(leaderboardId, result);
          return result;

      } catch (error) {
          console.error("Error fetching user data:", error);
          return null;
      }
  }

  async getUserNickname(userId) {
      const query = `query User($userId: ID!) {
          user(userId: $userId) {
              nickname
          }
      }`;

      const variables = { userId };

      try {
          const data = await this.executeGraphQLQuery(query, variables);
          this.currentUserInfo.nickname = data?.data?.user?.nickname;
      } catch (error) {
          console.error("Error fetching user nickname:", error);
      }
  }

  async createWebSocket() {
      const socket = new WebSocket('wss://www.ambassadoribet.com/_internal/ws/default/default/');
      this.leaderboardTableWebSocket = socket;

      const messageHandlers = {
          connection_ack: () => this.sendSubscriptions(),
          data: (data) => this.handleSubscriptionData(data)
      };

      socket.addEventListener('open', () => {
          socket.send(JSON.stringify({
              type: 'connection_init',
              payload: {}
          }));
      });
      socket.addEventListener('message', (event) => {
          const data = JSON.parse(event.data);
          const handler = messageHandlers[data.type];
          if (handler) handler(data);
      });

      socket.addEventListener('error', (error) => {
          console.error('WebSocket error:', error);
      });
  }

  async sendSubscriptions() {
      const subscriptions = this.leaderboardsInfo.map((leaderboard) => ({
          tournamentId: leaderboard.id
      }));

      subscriptions.forEach(sub => {
          this.leaderboardTableWebSocket.send(JSON.stringify({
              id: sub.tournamentId,
              type: 'start',
              payload: {
                  query: `
                  subscription TournamentUpdatedEx($tournamentId: ID) {
                      userTournamentUpdatedEx(tournamentId: $tournamentId) {
                          userTournament {
                              points
                              position
                              userId
                              user {
                              nickname
                              }
                          }
                      }
                  }`,
                  variables: { tournamentId: sub.tournamentId },
              }
          }));
      });
  }


  async handleSubscriptionData(data) {
      const userTournament = data.payload?.data?.userTournamentUpdatedEx?.userTournament;
      if (userTournament) {
          await this.updateTableData(userTournament, data.id);
      }
  }

  updateTableData(userTournament, leaderboardId) {
      const shouldUpdateTable = userTournament.points >= this.getLowestPoints(leaderboardId);

      if (shouldUpdateTable) {
          this.updateTableBody(userTournament, leaderboardId);
      }
      if (userTournament.userId === this.currentUserInfo.id) {
          this.updateCurrentUserData(userTournament, leaderboardId);
      }
  }

  updateRow(rowElement, userItem, currentUserId) {
      const nicknameElement = rowElement.querySelector('.leaderboard-row-nickname');
      const pointsElement = rowElement.querySelector('.leaderboard-row-points');
      const positionElement = rowElement.querySelector('.leaderboard-row-position');

      if (nicknameElement && pointsElement && positionElement) {
          positionElement.textContent = userItem.position;
          nicknameElement.textContent = maskUsername(userItem.user.displayName, userItem.user.userId, currentUserId);
          pointsElement.textContent = this.getPointsText(userItem.points);
          rowElement.classList.toggle('champion', userItem.user.userId === currentUserId);
      }
  }

  getMaxCount(leaderboardId) {
      for (const leaderboardInfo of this.leaderboardsInfo) {
          if (leaderboardInfo.id === leaderboardId) {
              return leaderboardInfo.count;
          }
      }
      return Infinity;
  }

  updateTableBody(userTournament, leaderboardId) {
      const leaderboardData = this.leaderboardsData.get(leaderboardId);
      if (!leaderboardData || !leaderboardData.usersData) return;

      const tableBody = document.getElementById(`leaderboard-table-row-body-${leaderboardId}`);
      if (!tableBody) return;

      const maxCount = this.getMaxCount(leaderboardId);
      const currentCount = Math.min(tableBody.children.length, maxCount);

      let userIndex = leaderboardData.usersData.findIndex(
          item => item.node.user.userId === userTournament.userId
      );

      const previousPositions = this.getCurrentPositions(tableBody);
      const oldPoints = userIndex !== -1 ? leaderboardData.usersData[userIndex].node.points : null;

      if (userIndex !== -1) {
          leaderboardData.usersData[userIndex].node.points = userTournament.points;
      } else if (leaderboardData.usersData.length < maxCount ||
          userTournament.points > (leaderboardData.usersData[leaderboardData.usersData.length - 1]?.node.points || 0)) {
          leaderboardData.usersData.push({
              node: {
                  points: userTournament.points,
                  position: 0,
                  user: { userId: userTournament.userId, displayName: userTournament.user?.nickname || 'Player' }
              }
          });
      }

      leaderboardData.usersData.sort((a, b) => b.node.points - a.node.points);
      leaderboardData.usersData.forEach((item, idx) => item.node.position = idx + 1);
      leaderboardData.usersData = leaderboardData.usersData.slice(0, maxCount);

      const positionChanges = this.detectPositionChanges(previousPositions, leaderboardData.usersData);

      if (positionChanges.length > 0) {
          this.handlePositionChanges(tableBody, leaderboardData.usersData, positionChanges);
      } else if (oldPoints !== null && oldPoints !== userTournament.points) {
          this.handlePointsUpdate(tableBody, leaderboardData.usersData, userTournament.userId, oldPoints, userTournament.points);
      }
  }

  getCurrentPositions(tableBody) {
      const positions = {};
      tableBody.querySelectorAll('.leaderboard-table-row').forEach(row => {
          const userId = row.getAttribute('data-user-id');
          const positionEl = row.querySelector('.leaderboard-row-position');
          if (userId && positionEl) {
              positions[userId] = parseInt(positionEl.textContent);
          }
      });
      return positions;
  }

  detectPositionChanges(previousPositions, usersData) {
      const changes = [];
      usersData.forEach(item => {
          const userId = item.node.user.userId;
          const oldPos = previousPositions[userId];
          if (oldPos && oldPos !== item.node.position) {
              changes.push({ userId, oldPos: oldPos, newPos: item.node.position });
          }
      });
      return changes;
  }

  handlePointsUpdate(tableBody, usersData, userId, oldPoints, newPoints) {
      const rowElement = tableBody.querySelector(`[data-user-id="${userId}"]`);
      if (!rowElement) return;
  
      const pointsElement = rowElement.querySelector('.leaderboard-row-points');
      if (pointsElement) {
          const startValue = parseFloat(this.getPointsText(oldPoints).replace(/[^0-9.-]+/g, ''));
          const endValue = parseFloat(this.getPointsText(newPoints).replace(/[^0-9.-]+/g, ''));
          
          if (!isNaN(startValue) && !isNaN(endValue)) {
              this.animateCounter(pointsElement, startValue, endValue, 1000);
          } else {
              console.error('Invalid points values:', { oldPoints, newPoints, startValue, endValue });
              pointsElement.textContent = this.getPointsText(newPoints);
          }
      }
  
      const userIndex = usersData.findIndex(item => item.node.user.userId === userId);
      if (userIndex !== -1) {
          this.updateRow(rowElement, usersData[userIndex].node, this.currentUserInfo?.id);
      }
  }

  handlePositionChanges(tableBody, usersData, positionChanges) {
      positionChanges.forEach(change => {
          const row = tableBody.querySelector(`[data-user-id="${change.userId}"]`);
          if (row) row.classList.add('fade');
      });

      setTimeout(() => {
          usersData.forEach((item, index) => {
              let rowElement = tableBody.querySelector(`#leaderboard-table-row-body-${index + 1}`);
              if (rowElement) {
                  rowElement.setAttribute('data-user-id', item.node.user.userId);
                  this.updateRow(rowElement, item.node, this.currentUserInfo?.id);
              }
          });

          positionChanges.forEach(change => {
              const row = tableBody.querySelector(`[data-user-id="${change.userId}"]`);
              if (row) {
                  row.classList.remove('fade');
                  row.classList.add('fade-restore');
              }
          });

          setTimeout(() => {
              positionChanges.forEach(change => {
                  const row = tableBody.querySelector(`[data-user-id="${change.userId}"]`);
                  if (row) row.classList.remove('fade-restore');
              });
          }, 1000);
      }, 1000);
  }

  updateCurrentUserData(userTournament, leaderboardId) {
      const userRow = document.getElementById(`leaderboard-table-user-info-${leaderboardId}`);
      if (!userRow) return;
  
      const pointsElement = userRow.querySelector('.leaderboard-row-points');
      const positionElement = userRow.querySelector('.leaderboard-row-position');
      const rewardElement = userRow.querySelector('.leaderboard-row-reward');
  
      this.animateCounter(pointsElement, parseInt(this.getPointsText(pointsElement.textContent)), this.getPointsText(userTournament.points));
      this.animateCounter(positionElement, parseInt(positionElement.textContent), userTournament.position);
  
      const leaderboardData = this.leaderboardsData.get(leaderboardId);
      let isInTop = false;
  
      if (leaderboardData && leaderboardData.rewardsData) {
          const maxRewardPositions = leaderboardData.rewardsData.length;
          
          if (userTournament.position <= maxRewardPositions) {
              const rewardIndex = userTournament.position - 1;
              const rewardAction = leaderboardData.rewardsData[rewardIndex];
              
              rewardElement.textContent = this.getTablePrizeText(rewardAction) || '-';
              rewardElement.className = `leaderboard-row-reward ${this.getTablePrizeClassnames(rewardAction)}`;
              
              if (userRow.classList.contains('hide-user-info')) {
                  userRow.classList.remove('hide-user-info');
              }
              isInTop = true;
          } else {
              if (!userRow.classList.contains('hide-user-info')) {
                  userRow.classList.add('hide-user-info');
              }
              rewardElement.textContent = '-';
              rewardElement.className = 'leaderboard-row-reward';
              isInTop = false;
          }
      } else {

          if (!userRow.classList.contains('hide-user-info')) {
              userRow.classList.add('hide-user-info');
          }
          rewardElement.textContent = '-';
          rewardElement.className = 'leaderboard-row-reward';
          isInTop = false;
      }
  
      this.userData.set(leaderboardId, {
          points: userTournament.points,
          position: userTournament.position,
          isWinner: isInTop
      });
  }

  getLowestPoints(leaderboardId) {
      const lastIndex = this.leaderboardsData.get(leaderboardId)?.usersData?.length - 1;
      return this.leaderboardsData.get(leaderboardId).usersData[lastIndex]?.node.points || 0;
  }

  animateCounter(element, start, end, duration = 500) {
      if (!(element instanceof Element)) {
          console.error('Error: First argument must be a DOM element');
          return;
      }
  
      const parsedStart = Number(start);
      const parsedEnd = Number(end);
      const parsedDuration = Number(duration);
  
      if (isNaN(parsedStart) || isNaN(parsedEnd) || parsedDuration <= 0) {
          console.error('Error: Invalid parameters:', { start, end, duration });
          element.textContent = this.getPointsText(end);
          return;
      }
  
      const range = parsedEnd - parsedStart;
      const stepTime = 16;
      const steps = Math.floor(parsedDuration / stepTime);
      const stepValue = range / steps;
      let currentValue = parsedStart;
      let stepCount = 0;
  
      const interval = setInterval(() => {
          stepCount++;
          currentValue = parsedStart + (stepValue * stepCount);
          const displayValue = Math.round(currentValue);
          element.textContent = this.getPointsText(displayValue);
  
          if (stepCount >= steps) {
              clearInterval(interval);
              element.textContent = this.getPointsText(parsedEnd);
          }
      }, stepTime);
  }


  async executeGraphQLQuery(query, variables) {
      let responseData;
      while (true) {
          const response = await fetch(`https://www.ambassadoribet.com/_internal/gql/?_${Date.now()}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query, variables })
          });

          responseData = await response.json();

          if (!responseData.errors || responseData.errors.length === 0) {
              break;
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return responseData;
  }

  drawTableHeaderButton(leaderboardId, data) {
      const dateRange = this.displayDateRange(data?.startsAt, data?.endsAt);
      const leaderboardInfo = this.leaderboardsInfo.find(item => item.id === leaderboardId);
      const button = document.createElement('button');
      button.classList.add('leaderboard-header-button');
      button.id = `leaderboard-button-${leaderboardId}`;
      if(leaderboardInfo?.buttonText){
          button.innerHTML = leaderboardInfo?.buttonText;
      }else{
          button.textContent = dateRange;
      }

      const startDate = new Date(data?.startsAt).getTime();

      const buttons = Array.from(this.leaderboardButtonsBox.children);

      let insertBeforeElement = null;
      for (const btn of buttons) {
          const btnId = btn.id.replace('leaderboard-button-', '');
          const btnData = this.leaderboardsData.get(btnId);
          if (!btnData) continue;

          const btnStartDate = new Date(btnData?.startsAt).getTime();
          if (startDate < btnStartDate) {
              insertBeforeElement = btn;
              break;
          }
      }

      if (insertBeforeElement) {
          this.leaderboardButtonsBox.insertBefore(button, insertBeforeElement);
      } else {
          this.leaderboardButtonsBox.appendChild(button);
      }

      button.addEventListener('click', () => this.toggleLeaderboardTable(leaderboardId));
  }

  displayDateRange(startsAt, endsAt) {
      const options = { day: 'numeric' };
      const start = new Date(startsAt);
      const end = new Date(endsAt);

      const monthNames = {
          'ka': ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'],
          'tr': ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
          'en': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          'ru': ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
      };

      const locale = this.locale;

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return 'Incorrect date';
      }

      const startMonthIndex = start.getMonth();
      const endMonthIndex = end.getMonth();

      if (start.toDateString() === end.toDateString()) {
          return `${start.getDate()} ${monthNames[locale][startMonthIndex]}`;
      } else {
          const startDate = start.getDate();
          const endDate = end.getDate();

          if (startMonthIndex === endMonthIndex) {
              return `${startDate} – ${endDate} ${monthNames[locale][startMonthIndex]}`;
          } else {
              return `${startDate} ${monthNames[locale][startMonthIndex]} – ${endDate} ${monthNames[locale][endMonthIndex]}`;
          }
      }
  }

  async drawLeaderboardHeader() {
      let rowHTML = `
                  <div class="leaderboard-table-row" id="leaderboard-table-header-row">
                      <div class="leaderboard-row-position">
                          ${this.translationMap.position[this.locale]}
                      </div>
                      <div class="leaderboard-row-nickname">
                          ${this.translationMap.users[this.locale]}
                      </div>
                      <div class="leaderboard-row-points">
                          ${this.translationMap.points[this.locale]}
                      </div>
                      <div class="leaderboard-row-reward ">
                          ${this.translationMap.prize[this.locale]}
                      </div>
                  </div>
              `;

      this.leaderboardBody.innerHTML = rowHTML;
  }

  drawLeaderboardBody(leaderboardInfo, userInfo, leaderboardId) {
      let bodyHTML = this.leaderboardBody?.innerHTML && '';
      bodyHTML += `<div class="leaderboard-table" id="leaderboard-table-${leaderboardId}">`;

      bodyHTML += this.drawLeaderboardData(leaderboardInfo, leaderboardId);
      if (this.currentUserInfo.id !== null && this.currentUserInfo.id !== "" && this.currentUserInfo.id !== undefined) {
          bodyHTML += this.drawLeaderboardUserInfo(userInfo, leaderboardId);
      }
      bodyHTML += `</div>`;
      this.leaderboardBody.innerHTML += bodyHTML;
  }

  getPointsText(points) {
      if (points === null || points === undefined) return '-';
      if (points === 0) return '0';
      
      let numStr = typeof points === 'string' ? points : points.toString();
      
      let parts = numStr.split('.');
      let integerPart = parts[0];
      
      let formattedInteger = '';
      for (let i = integerPart.length - 1, count = 0; i >= 0; i--) {
          formattedInteger = integerPart[i] + formattedInteger;
          count++;
          if (count % 3 === 0 && i > 0) {
              formattedInteger = ' ' + formattedInteger;
          }
      }
      
      return formattedInteger;
  }

  drawLeaderboardData(data, leaderboardId) {
      let rowHtML = `<div class="leaderboard-table-row-body" id="leaderboard-table-row-body-${leaderboardId}">`;
      for (let i = 0; i < Math.max(data.rewardsData.length, data.usersData.length); i++) {
          const userId = data.usersData[i]?.node.user.userId || '';
          rowHtML += `
          <div class="leaderboard-table-row ${this.isCurrentUser(userId, leaderboardId)}" 
               id="leaderboard-table-row-body-${i + 1}" 
               data-user-id="${userId}">
              <div class="leaderboard-row-position">
                  ${data.usersData[i]?.node.position || '-'}
              </div>
              <div class="leaderboard-row-nickname">
                  ${maskUsername(data.usersData[i]?.node.user.displayName || '-', userId, this.currentUserInfo.id)}
              </div>
              <div class="leaderboard-row-points">
                  ${data.usersData[i]?.node.points ? this.getPointsText(data.usersData[i]?.node.points) : '-'}
              </div>
              <div class="leaderboard-row-reward ${this.getTablePrizeClassnames(data.rewardsData[i]?.action)}">
                  ${this.getTablePrizeText(data.rewardsData[i]?.action)}
              </div>
          </div>
      `;
      }
      rowHtML += `</div>`;

      return rowHtML;
  }

  drawLeaderboardUserInfo(data, leaderboardId) {
      let userRowHTML = `
              <div class="user-info-container">
                  <div class="leaderboard-table-user-info ${this.userData.get(leaderboardId)?.isWinner ? "hide-user-info" : ""}" id="leaderboard-table-user-info-${leaderboardId}">
                      <div class="leaderboard-row-position">
                          ${data?.position || '-'}
                      </div>
                      <div class="leaderboard-row-nickname">
                          ${this?.currentUserInfo?.nickname}
                      </div>
                      <div class="leaderboard-row-points">
                          ${this.getPointsText(data?.points) || '-'}
                      </div>
                      <div class="leaderboard-row-reward ${this.getTablePrizeClassnames(this.leaderboardsData.get(leaderboardId).rewardsData[data?.position - 1]?.action)}">
                          ${this.getTablePrizeText(this.leaderboardsData.get(leaderboardId).rewardsData[data?.position - 1]?.action) || '-'}
                      </div>
                  </div>
              </div>
              `;

      return userRowHTML;
  }

  REWARD_TYPES = {
      FREE_SPINS: 'FREE_SPINS',
      FIXED: 'FIXED'
  };

  BOX_TYPES = {
      LOOT_BOX: 'LOOT_BOX',
      MYSTERY_BOX: 'MYSTERY_BOX',
      WHEEL_OF_FORTUNE: 'WHEEL_OF_FORTUNE'
  };

  toggleLeaderboardTable(leaderboardId) {
      const table = document.getElementById(`leaderboard-table-${leaderboardId}`);
      const button = document.getElementById(`leaderboard-button-${leaderboardId}`);
      const parentBox = this.leaderboardButtonsBox;
  
      if (!table || !button || !parentBox) {
          console.error('Missing elements:', { table, button, parentBox });
          return;
      }
  
      if(document.getElementById("inactiveComponentlBABBAOO")){
          document.getElementById("inactiveComponentlBABBAOO").remove();
          document.getElementById("leaderboard-table-header-row").style.display = "";
      }
  
      Array.from(this.leaderboardBody.children).forEach((child) => {
          child.classList.remove('active');
      });
  
      Array.from(parentBox.children).forEach((child) => {
          child.classList.remove('active');
      });
  
      button.classList.add('active');
      table.classList.add('active');
  
      button.classList.add('active');
      table.classList.add('active');
  
      parentBox.style.overflowX = 'auto';
      
      const buttonRect = button.getBoundingClientRect();
      const parentRect = parentBox.getBoundingClientRect();
      const newScrollLeft = button.offsetLeft - (parentRect.width - buttonRect.width) / 2;
  
      // parentBox.scrollTo({
      //     left: newScrollLeft,
      // });

      this.smoothScrollTo(parentBox, newScrollLeft);
  }

  getTablePrizeClassnames(data) {
      if (!data) return 'table-prize';

      const classMap = {
          [`${data?.bonus?.reward?.type === this.REWARD_TYPES.FREE_SPINS}`]: 'table-prize-free-spins',
          [`${data?.bonus?.reward?.type === this.REWARD_TYPES.FIXED}`]: 'table-prize-fixed',
          [`${Boolean(data?.title)}`]: data?.title ? data?.title.trim().replace(/ /g, "_") : "",
          [`${data?.box?.type === this.BOX_TYPES.LOOT_BOX}`]: 'table-prize-loot-box',
          [`${data?.box?.type === this.BOX_TYPES.MYSTERY_BOX}`]: 'table-prize-mystery-box',
          [`${data?.box?.type === this.BOX_TYPES.WHEEL_OF_FORTUNE}`]: 'table-prize-wheel-of-fortune'
      };

      const classes = ['table-prize'];

      Object.entries(classMap).forEach(([condition, className]) => {
          if (condition === 'true') classes.push(className);
      });

      return classes.join(' ');
  }

  getTablePrizeText(data) {
      if (!data) return '';

      const prizeTextMap = {
          [`freespins-${Boolean(data?.bonus?.reward?.type === this.REWARD_TYPES.FREE_SPINS)}`]:
              () => data?.bonus?.reward?.amount + ` <img class="free-spins-icon" src="https://images.takeshape.io/5da2b4d5-59f6-412a-82c3-f6a272b532be/dev/bb35ec84-1583-40a4-9c84-2f0c3948e82b/slot-machine_1f3b0.png" loading="lazy">`,
              

          [`fixed-${Boolean(data?.bonus?.reward?.type === this.REWARD_TYPES.FIXED)}`]:
              () => data?.bonus?.reward?.amounts?.[0]?.value + " ₾",

          [`title-${Boolean(data?.title)}`]:
              () => ``,

          [`lootbox-${Boolean(data?.box?.type === this.BOX_TYPES.LOOT_BOX)}`]:
              () => "",

          [`mysterybox-${Boolean(data?.box?.type === this.BOX_TYPES.MYSTERY_BOX)}`]:
              () => "",

          [`wheeloffortune-${Boolean(data?.box?.type === this.BOX_TYPES.WHEEL_OF_FORTUNE)}`]:
              () => ""
      };

      for (const [key, textFn] of Object.entries(prizeTextMap)) {
          if (key.endsWith('-true')) {
              return textFn() || '';
          }
      }

      return '';
  }

  translationMap = {
    // position: {
    //     en: 'Position',
    //     ru: 'Позиция',
    //     ka: 'პოზიცია',
    //     tr: 'Konum'
    // },
    position: {
        en: '#',
        ru: '#',
        ka: '#',
        tr: '#'
    },
    points: {
        en: 'Points',
        ru: 'Очки',
        ka: 'ქულები',
        tr: 'Puanlar'
    },
    prize: {
        en: 'Prize',
        ru: 'Приз',
        ka: 'პრიზი',
        tr: 'Ödül'
    },
    users: {
        en: 'Users',
        ru: 'Польз.',
        ka: 'მომხ.',
        tr: 'Kullanıcılar'
    }
};

  setLoading(loading) {
      this.loading = loading;
      if (!loading) {
          this.leaderboardTable.style.display = 'block';
          this.parrentElement.getElementsByClassName('mat-loader')[0].style.display = 'none';
      }
  }

  isCurrentUser(userId, leaderboardId) {
      if (this.currentUserInfo.id === null || this.currentUserInfo.id === "" || this.currentUserInfo.id === undefined) {
          return "";
      } else if (userId === null || userId === "" || userId === undefined) {
          return "";
      }
      if (this.currentUserInfo.id === userId) {
          this.userData.get(leaderboardId).isWinner = true;
          return "champion";
      }
      return "";
  }


  updateLeaderboards() {
      const currentDate = new Date();
      let activeFound = false;
      let latestEndDate = null;
      let latestIndex = -1;
      let activeButton = null;

      this.leaderboardsData.forEach((data, index) => {
          const startEt = new Date(data.startsAt);
          const endEt = new Date(data.endsAt);
      
          if (currentDate >= startEt && currentDate <= endEt) {
              if (!activeFound) {
                  document.getElementById(`leaderboard-table-${index}`).classList?.add('active');
                  const buttonElement = document.getElementById(`leaderboard-button-${index}`);
                  buttonElement.classList?.add('active');
                  activeFound = true;
                  activeButton = buttonElement;
              }
          } else {
              document.getElementById(`leaderboard-table-${index}`).classList.add('inactive');
              if (!latestEndDate || endEt > latestEndDate) {
                  latestEndDate = endEt;
                  latestIndex = index;
              }
          }
      });

      if (!activeFound && latestEndDate < currentDate) {
          document.getElementById(`leaderboard-table-${latestIndex}`).classList.add('active');
          const buttonElement = document.getElementById(`leaderboard-button-${latestIndex}`);
          buttonElement.classList.add('active');
          activeButton = buttonElement;
      }

      if (activeButton && this.leaderboardButtonsBox) {
          const buttonLeft = activeButton.offsetLeft;
          const buttonWidth = activeButton.offsetWidth;
          const containerWidth = this.leaderboardButtonsBox.offsetWidth;
          
          const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
          
          // this.leaderboardButtonsBox.scrollTo({
          //     left: scrollPosition,
          // });

          
          this.smoothScrollTo(this.leaderboardButtonsBox, scrollPosition);

      } else if (!activeButton) {
          const inactive = document.createElement('div');
          inactive.id = "inactiveComponentlBABBAOO";
          inactive.innerHTML = this.outComponent[this.locale];
          document.getElementById("leaderboard-table-header-row").style.display = "none";
          this.leaderboardBody.appendChild(inactive);
      }
  }


  makeElementDraggable(element, options = {}) {
      if (!element || !(element instanceof HTMLElement)) {
          console.error('Invalid element provided to makeElementDraggable');
          return;
      }
  
      const settings = {
          speedMultiplier: options.speedMultiplier || 1.5,
          enableTouch: options.enableTouch !== false,
          dragCursor: options.dragCursor || 'grabbing'
      };
  
      let isDown = false;
      let startX, startY, scrollLeft, scrollTop;
      let dragRect;
      const originalCursor = getComputedStyle(element).cursor || 'auto';
      
      if (originalCursor === 'auto' && !element.style.cursor) {
          element.style.cursor = 'grab';
      }
      
      const addEvent = (type, handler) => {
          element.addEventListener(type, handler, { passive: false });
      };
      
      addEvent('mousedown', (e) => {
          isDown = true;
          element.style.cursor = settings.dragCursor;
          
          dragRect = element.getBoundingClientRect();
          startX = e.clientX - dragRect.left;
          startY = e.clientY - dragRect.top;
          scrollLeft = element.scrollLeft;
          scrollTop = element.scrollTop;
          
          e.preventDefault();
      });
      
      const stopDragging = () => {
          if (!isDown) return;
          isDown = false;
          element.style.cursor = originalCursor || 'grab';
      };
      
      addEvent('mouseleave', stopDragging);
      addEvent('mouseup', stopDragging);
      
      addEvent('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          
          const x = e.clientX - dragRect.left;
          const y = e.clientY - dragRect.top;
          const walkX = (x - startX) * settings.speedMultiplier;
          const walkY = (y - startY) * settings.speedMultiplier;
          
          element.scrollLeft = scrollLeft - walkX;
          element.scrollTop = scrollTop - walkY;
      });
      
      if (settings.enableTouch) {
          addEvent('touchstart', (e) => {
              if (e.touches.length === 1) {
                  isDown = true;
                  dragRect = element.getBoundingClientRect();
                  startX = e.touches[0].clientX - dragRect.left;
                  startY = e.touches[0].clientY - dragRect.top;
                  scrollLeft = element.scrollLeft;
                  scrollTop = element.scrollTop;
              }
          });
          
          addEvent('touchend', stopDragging);
          addEvent('touchcancel', stopDragging);
          
          addEvent('touchmove', (e) => {
              if (!isDown || e.touches.length !== 1) return;
              e.preventDefault();
              
              const x = e.touches[0].clientX - dragRect.left;
              const y = e.touches[0].clientY - dragRect.top;
              const walkX = (x - startX) * settings.speedMultiplier;
              const walkY = (y - startY) * settings.speedMultiplier;
              
              element.scrollLeft = scrollLeft - walkX;
              element.scrollTop = scrollTop - walkY;
          });
      }
      
      return {
          destroy: () => {
              const events = ['mousedown', 'mouseleave', 'mouseup', 'mousemove'];
              if (settings.enableTouch) {
                  events.push('touchstart', 'touchend', 'touchcancel', 'touchmove');
              }
              events.forEach(type => {
                  element.removeEventListener(type, null, { passive: false });
              });
              element.style.cursor = originalCursor;
          }
      };
  }
  
  
}
