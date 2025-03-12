function maskUsername(username, currentUserId, userId) {
    if (!username || username.length <= 2) return username;
    if (userId && userId === currentUserId) return username;
    return username[0] + '*****' + username[username.length - 1];
}

class FullLeaderboardTable {
    leaderboardsDivs = [];
    fullLeaderboardTableHead = document.createElement('div');
    fullLeaderboardTableBody = document.createElement('div');
    parent = document.getElementById('leaderboardLoader');
    locale = document.documentElement.getAttribute('lang') || 'en';

    constructor() {
        this.init();
    }

    init() {
        // Setup elements once
        this.setupElements();
        this.FullDrawTournaments();
    }

    setupElements() {
        if (!this.parent) return;

        this.fullLeaderboardTableHead.id = 'leaderboard-table-header';
        this.fullLeaderboardTableBody.classList.add('leaderboard-table-body');

        // Append elements in a single batch using document fragment
        const fragment = document.createDocumentFragment();
        fragment.appendChild(this.fullLeaderboardTableHead);
        fragment.appendChild(this.fullLeaderboardTableBody);
        this.parent.appendChild(fragment);
    }

    destroy() {
        this.leaderboardsDivs.forEach(div => div.item.destroy());
        this.fullLeaderboardTableHead.remove();
        this.fullLeaderboardTableBody.remove();
        return null;
    }

    async FullDrawTournaments() {
        const tournamentData = document.getElementById('tournamentData')?.textContent;
        if (!tournamentData) return;

        const tournamentItems = this.parseTournamentData(tournamentData);
        await this.createLeaderboardTables(tournamentItems);
        this.drawLeaderboardTableHeader();
    }

    parseTournamentData(data) {
        const segments = data.split(',');
        const items = [];

        for (let i = 0; i < segments.length; i += 2) {
            if (i + 1 < segments.length) {
                items.push({
                    id: segments[i].trim(),
                    count: parseInt(segments[i + 1].trim(), 10) || 0
                });
            }
        }

        return items;
    }

    async createLeaderboardTables(items) {
        for (const item of items) {
            const div = await FullLeaderboardTable.LeaderboardTableDrawer.create(
                this.fullLeaderboardTableBody,
                item.id,
                item.count
            );

            if (div) {
                this.leaderboardsDivs.push({
                    id: item.id,
                    item: div,
                    startsAt: div.data.startsAt,
                    endsAt: div.data.endsAt
                });
            }
        }
    }

    formatTournamentDates(startDateStr, endDateStr) {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);

        // Calculate day difference
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const diffDays = Math.ceil((endDay - startDay) / (1000 * 60 * 60 * 24));

        // Get date text
        const dateText = diffDays <= 1 ?
            start.getDate().toString() :
            `${start.getDate()} - ${end.getDate()}`;

        // Month mapping for localization
        const monthNames = {
            'ka': ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
                'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი']
        };

        let monthText;
        if (start.getMonth() !== end.getMonth() || start.getFullYear() !== end.getFullYear()) {
            const startMonth = monthNames[this.locale]?.[start.getMonth()] ||
                start.toLocaleString(this.locale, { month: 'long' });
            const endMonth = monthNames[this.locale]?.[end.getMonth()] ||
                end.toLocaleString(this.locale, { month: 'long' });
            monthText = `${startMonth} - ${endMonth}`;
        } else {
            monthText = monthNames[this.locale]?.[start.getMonth()] ||
                start.toLocaleString(this.locale, { month: 'long' });
        }

        return { dateText, monthText };
    }

    drawLeaderboardTableHeader() {
        const nowDate = Date.now();
        const fragment = document.createDocumentFragment();

        this.leaderboardsDivs.forEach(div => {
            const button = this.createHeaderButton(div, nowDate);
            fragment.appendChild(button);
        });

        this.fullLeaderboardTableHead.appendChild(fragment);
    }

    createHeaderButton(div, nowDate) {
        const button = document.createElement('button');
        button.id = `leaderboard-table-header-button-${div.id}`;
        button.className = "leaderboard-table-header-button";

        // Create date elements
        const { dateText, monthText } = this.formatTournamentDates(div.startsAt, div.endsAt);
        const dateCopy = document.createElement("span");
        const monthCopy = document.createElement("span");

        dateCopy.textContent = dateText;
        monthCopy.textContent = " " + monthText;
        dateCopy.className = "leaderboard-table-header-button-date";
        monthCopy.className = "leaderboard-table-header-button-month";

        button.appendChild(dateCopy);
        button.appendChild(monthCopy);

        // Set click handler
        button.onclick = () => this.handleHeaderButtonClick(button, div.id);

        // Check if this tournament is current
        const startsAtTimestamp = new Date(div.startsAt).getTime();
        const endsAtTimestamp = new Date(div.endsAt).getTime();

        if (nowDate > startsAtTimestamp && nowDate < endsAtTimestamp) {
            this.activateTable(div.id);
            button.className = "leaderboard-table-header-button-active";
        }

        return button;
    }

    handleHeaderButtonClick(clickedButton, tableId) {
        // Deactivate all buttons
        const activeButtons = document.getElementsByClassName("leaderboard-table-header-button-active");
        Array.from(activeButtons).forEach(el => {
            el.className = "leaderboard-table-header-button";
        });

        // Hide all tables
        const allTables = document.getElementsByClassName("leaderboard-table-element");
        Array.from(allTables).forEach(table => {
            this.hideTable(table);
        });

        // Activate clicked button and show corresponding table
        clickedButton.className = "leaderboard-table-header-button-active";
        this.activateTable(tableId);
    }

    hideTable(table) {
        table.style.position = "absolute";
        table.style.visibility = "hidden";
        table.style.opacity = 0;
        table.style.transition = "opacity 0.5s ease, visibility 0s linear 0.5s";
    }

    activateTable(tableId) {
        const tableToShow = document.getElementById(`leaderboard-table-element-${tableId}`);
        if (tableToShow) {
            tableToShow.style.position = "absolute";
            tableToShow.style.visibility = "visible";
            tableToShow.style.opacity = 1;
            tableToShow.style.transition = "opacity 0.5s ease, visibility 0s linear 0s";
        }
    }

    static LeaderboardTableDrawer = class LeaderboardTableDrawer {
        leaderboardTableParentElement;
        currentUserId;
        chickenDinner = { isWinner: false, index: null };
        data;
        locale = 'ka';
        actionsCount;
        endsAt;
        startsAt;
        leaderboardId;
        leaderboardTableWebSocket;
        currUserInfo = {
            position: null,
            points: null,
            user: {
                nickname: null
            }
        };

        destroy() {

            this.leaderboardTableParentElement.remove();
            this.data = null;
            this.destroyWebSocket();
            return null;
        }

        constructor(King, leaderboardId, actionsCount) {
            this.leaderboardId = leaderboardId;
            this.leaderboardTableParentElement = document.createElement('div');
            King.appendChild(this.leaderboardTableParentElement);
            this.leaderboardTableParentElement.classList.add('leaderboard-table-element');

            this.leaderboardTableParentElement.style.position = "absolute";
            this.leaderboardTableParentElement.style.visibility = "hiden";
            this.leaderboardTableParentElement.style.opacity = 0;
            this.leaderboardTableParentElement.style.transition = "opacity 0.5s ease, visibility 0s linear 0s";

            this.leaderboardTableParentElement.id = `leaderboard-table-element-${leaderboardId}`;
            this.currentUserId = extractAuthDataFromCookie()?.userId,
                this.actionsCount = actionsCount;
            this.locale = document.documentElement.getAttribute('lang') || 'en';
            this.createWebSocket();
        }

        static async create(King, leaderboardId, actionsCount) {
            if (!document.getElementById(`leaderboard-table-element-${leaderboardId}`)) {
                const instance = new LeaderboardTableDrawer(King, leaderboardId, actionsCount);
                await instance.initialize(leaderboardId, actionsCount);
                return instance;
            } else {
                return null;
            }
        }

        destroyWebSocket() {
            this.leaderboardTableWebSocket.close();
        }

        createWebSocket() {
            // Create a singleton connection if possible
            const socket = new WebSocket('wss://www.ambassadoribet.com/_internal/ws/default/default/');
            this.leaderboardTableWebSocket = socket;

            const messageHandlers = {
                connection_ack: () => this.sendSubscription(),
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

        sendSubscription() {
            this.leaderboardTableWebSocket.send(JSON.stringify({
                id: '1',
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
                    variables: { tournamentId: this.leaderboardId },
                }
            }));
        }

        handleSubscriptionData(data) {
            const userTournament = data.payload?.data?.userTournamentUpdatedEx?.userTournament;
            if (userTournament) {
                this.updateTableData(userTournament);
            }
        }

        // Optimized update table data method
        updateTableData(data) {
            // Check if the update is relevant
            const shouldUpdateTable = data.points >= this.getLowestPoints();

            if (shouldUpdateTable) {
                this.updateTableBody(data);
            }

            if (data.userId === this.currentUserId) {
                this.updateCurrentUserData(data);
            }
        }

        getLowestPoints() {
            const lastIndex = this.actionsCount - 1;
            return this.data?.userTournamentConnection.edges[lastIndex]?.node.points || 0;
        }

        updateCurrentUserData(data, shouldUpdate) {
            const div = this.leaderboardTableParentElement.getElementsByClassName("leaderboard-row-user")[0];

            if (!div) return;

            const pointsElement = div.getElementsByClassName("table-points-user")[0];
            const positionElement = div.getElementsByClassName("table-position-user")[0];

            this.animateCounter(pointsElement, this.currUserInfo.points, data.points);
            this.animateCounter(positionElement, this.currUserInfo.position, data.position);

            this.currUserInfo.points = data.points;
            this.currUserInfo.position = data.position;
        }

        // Improved animation counter
        animateCounter(element, start, end, duration = 500) {
            if (!element || start === end) return;

            // Use requestAnimationFrame for smooth animation
            let startTime = null;
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);

                const value = Math.floor(start + (end - start) * progress);
                element.textContent = value;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = end;
                }
            };

            requestAnimationFrame(animate);
        }

        recurseGetPosition() {

        }

        // More efficient DOM updates with table rows
        updateTableBody(data) {
            // Find user in current data
            const userIndex = this.findUserIndex(data.userId);

            if (userIndex !== -1) {
                this.updateExistingUser(data, userIndex);
            } else if (data.points > this.getLowestPoints()) {
                this.addNewUser(data);
            }
        }

        findUserIndex(userId) {
            return this.data.userTournamentConnection.edges.findIndex(
                item => item.node.user.userId === userId
            );
        }

        updateTableBody(data) {
            // Find the user in our current data
            let userIndex = -1;
            this.data.userTournamentConnection.edges.forEach((item, index) => {
                if (item.node.user.userId === data.userId) {
                    userIndex = index;
                }
            });

            // If user found, update their points
            if (userIndex !== -1) {
                // Store old points for animation
                const oldPoints = this.data.userTournamentConnection.edges[userIndex].node.points;

                // Update points in data structure
                this.data.userTournamentConnection.edges[userIndex].node.points = data.points;

                // Animate the points change in the current position
                const pointsElement = this.leaderboardTableParentElement.querySelector(`#table-points-${userIndex + 1}`);
                if (pointsElement) {
                    this.animateCounter(pointsElement, oldPoints, data.points);
                }

                // Check if we need to reposition this user
                let newPosition = userIndex;
                // Find the new position for this user based on points
                while (newPosition > 0 &&
                    this.data.userTournamentConnection.edges[newPosition - 1].node.points < data.points) {
                    newPosition--;
                }

                // If position changed, rearrange the leaderboard
                if (newPosition !== userIndex) {
                    // Save the user data that needs to move up
                    const movingUser = this.data.userTournamentConnection.edges[userIndex];

                    // Apply fade-out to all affected rows
                    for (let i = newPosition; i <= userIndex; i++) {
                        const rowElement = this.leaderboardTableParentElement.querySelector(`#leaderboard-row-${i + 1}`);
                        if (rowElement) {
                            rowElement.classList.add('fade-out');
                        }
                    }

                    // Shift all entries between new position and old position
                    for (let i = userIndex; i > newPosition; i--) {
                        // Move data one position down
                        this.data.userTournamentConnection.edges[i] = this.data.userTournamentConnection.edges[i - 1];
                    }

                    // Place the moving user at their new position
                    this.data.userTournamentConnection.edges[newPosition] = movingUser;

                    // Update UI with animation
                    setTimeout(() => {
                        for (let i = newPosition; i <= userIndex; i++) {
                            const userItem = this.data.userTournamentConnection.edges[i].node;
                            const userElement = this.leaderboardTableParentElement.querySelector(`#table-user-name-${i + 1}`);
                            const pointsElement = this.leaderboardTableParentElement.querySelector(`#table-points-${i + 1}`);
                            const rowElement = this.leaderboardTableParentElement.querySelector(`#leaderboard-row-${i + 1}`);

                            if (userElement && pointsElement && rowElement) {
                                userElement.textContent = maskUsername(
                                    userItem.user.displayName,
                                    this.currentUserId,
                                    userItem.user.userId
                                );
                                pointsElement.textContent = userItem.points;

                                // If this is the current user's row, mark it
                                if (userItem.user.userId === this.currentUserId) {
                                    rowElement.classList.add('winner-winner-chicken-dinner');
                                } else {
                                    rowElement.classList.remove('winner-winner-chicken-dinner');
                                }

                                rowElement.classList.remove('fade-out');
                                rowElement.classList.add('fade-in');

                                // Force a repaint to ensure animation runs
                                void rowElement.offsetWidth;
                            }
                        }
                    }, 1000);
                }
            } else {
                // New user entering the leaderboard
                // Check if they should be added (score high enough)
                const lowestPoints = this.data.userTournamentConnection.edges[this.actionsCount - 1].node.points;
                if (data.points > lowestPoints) {
                    // Find insertion position
                    let insertPosition = this.data.userTournamentConnection.edges.findIndex(
                        item => item.node.points < data.points
                    );

                    if (insertPosition === -1) {
                        insertPosition = this.actionsCount - 1;
                    }

                    // Fade out all rows that will change
                    for (let i = insertPosition; i < this.actionsCount; i++) {
                        const rowElement = this.leaderboardTableParentElement.querySelector(`#leaderboard-row-${i + 1}`);
                        if (rowElement) {
                            rowElement.classList.add('fade-out');
                        }
                    }

                    // Update data structure
                    // Remove the last entry
                    this.data.userTournamentConnection.edges.pop();

                    // Insert the new entry at the right position
                    this.data.userTournamentConnection.edges.splice(insertPosition, 0, {
                        node: {
                            points: data.points,
                            user: {
                                userId: data.userId,
                                displayName: data.user.nickname
                            }
                        }
                    });

                    // Update UI with animation
                    setTimeout(() => {
                        for (let i = insertPosition; i < this.actionsCount; i++) {
                            const userItem = this.data.userTournamentConnection.edges[i].node;
                            const userElement = this.leaderboardTableParentElement.querySelector(`#table-user-name-${i + 1}`);
                            const pointsElement = this.leaderboardTableParentElement.querySelector(`#table-points-${i + 1}`);
                            const rowElement = this.leaderboardTableParentElement.querySelector(`#leaderboard-row-${i + 1}`);

                            if (userElement && pointsElement) {
                                userElement.textContent = maskUsername(
                                    userItem.user.displayName,
                                    this.currentUserId,
                                    userItem.user.userId
                                );
                                pointsElement.textContent = userItem.points;

                                // If this is the current user's row, mark it
                                if (userItem.user.userId === this.currentUserId) {
                                    rowElement.classList.add('winner-winner-chicken-dinner');
                                } else {
                                    rowElement.classList.remove('winner-winner-chicken-dinner');
                                }

                                rowElement.classList.remove('fade-out');
                                rowElement.classList.add('fade-in');
                            }
                        }
                    }, 1000);
                }
            }
        }


        async initialize(leaderboardId, actionsCount) {
            this.drawLeaderboardTableHeader(this.leaderboardTableParentElement);
            await this.getData(leaderboardId, actionsCount);
        }

        async getUserInfo(tournamentId, userId) {
            try {
                const [userTournamentData, userNickname] = await Promise.all([
                    this.fetchUserTournamentData(tournamentId, userId),
                    this.fetchUserNickname(userId)
                ]);

                if (userTournamentData) {
                    this.currUserInfo = {
                        ...this.currUserInfo,
                        points: userTournamentData.points,
                        position: userTournamentData.position
                    };
                }

                if (userNickname) {
                    if (!this.currUserInfo.user) this.currUserInfo.user = {};
                    this.currUserInfo.user.nickname = userNickname;
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        }

        async fetchUserTournamentData(tournamentId, userId) {
            const query = `query UserTournamentConnection($userId: ID, $tournamentId: ID) {
                userTournamentConnection(userId: $userId, tournamentId: $tournamentId) {
                    edges {
                        node {
                            points
                            position
                        }
                    }
                }
            }`;

            const variables = {
                tournamentId,
                userId,
                _nonce: Date.now()
            };

            const data = await this.executeGraphQLQuery(query, variables);
            return data?.data?.userTournamentConnection?.edges[0]?.node;
        }

        async fetchUserNickname(userId) {
            const query = `query User($userId: ID!) {
                user(userId: $userId) {
                    nickname
                }
            }`;

            const variables = { userId };
            const data = await this.executeGraphQLQuery(query, variables);
            return data?.data?.user?.nickname;
        }

        async executeGraphQLQuery(query, variables) {
            const response = await fetch(`https://www.ambassadoribet.com/_internal/gql/?_${Date.now()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, variables })
            });

            return await response.json();
        }

        async getData(leaderboardId, actionsCount) {
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

            let DateNow = Date.now();

            const variables = {
                tournamentId: leaderboardId,
                status: ["ACTIVE", "FINISHED", "PREPARING"],
                orderBy: [{ field: "points", direction: "DESCENDING" }],
                first: actionsCount,
                _nonce: DateNow
            };

            try {
                const response = await fetch(`https://www.ambassadoribet.com/_internal/gql/?_${DateNow}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ query, variables })
                });

                const data = await response.json();

                if (!data?.data?.tournamentConnection) {
                    console.error("Invalid tournament data:", data);
                    return;
                }

                this.data = data.data.tournamentConnection?.edges[0]?.node;
                this.drawLeaderboardTableRows(this.data);
                this.drawUserInfo(this.leaderboardTableParentElement);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
        }

        drawLeaderboardTableHeader(parentElement) {
            let headerHTML = `
                <div class="leaderboard-row-header" id="leaderboard-row-header">
                    <div class="table-position-header">
                        ${this.getPossitionText()}
                    </div>
                    <div class="table-user-name-header">
                        ${this.getHeaderUserNameText()}
                    </div>
                    <div class="table-points-header">
                        ${this.getPointsText()}
                    </div>
                    <div class="table-prize-header">
                        ${this.getPrizeText()}
                    </div>
                </div>
            `;

            parentElement.innerHTML += headerHTML;
        }

        drawLeaderboardTableRow(parentElement, data, index) {
            let rowHTML = `
                <div class="leaderboard-row" id="leaderboard-row-${index}">
                    <div class="table-position" id="table-position-${index}">
                        ${index}
                    </div>
                    <div class="table-user-name" id="table-user-name-${index}">
                        ${maskUsername(data.userName, this.currentUserId, data.userId)}
                    </div>
                    <div class="table-points" id="table-points-${index}">
                        ${data.points}
                    </div>
            `;

            if (data.userId === this.currentUserId) {
                this.chickenDinner = { isWinner: true, index: index };
                rowHTML = rowHTML.replace('<div class="leaderboard-row"', '<div class="leaderboard-row winner-winner-chicken-dinner"');
            }

            rowHTML += this.drawPrizeElementHTML(data.prize, index);

            rowHTML += `</div>`;

            parentElement.innerHTML += rowHTML;
        }

        drawPrizeElementHTML(data, index) {
            return `
                <div class="table-prize ${this.getTablePrizeClassnames(data).join(' ')}" id="table-prize-${index}">
                    ${this.getTablePrizeText(data)}
                </div>
            `;
        }


        drawLeaderboardTableRows(data) {
            const entries = data.userTournamentConnection.edges || [];
            const leaderboardsRows = document.createElement('div');
            this.leaderboardTableParentElement.appendChild(leaderboardsRows);
            leaderboardsRows.classList.add('leaderboard-rows');
            leaderboardsRows.id = `leaderboard-rows`;
            for (let i = 0; i < Math.min(this.actionsCount, entries.length); i++) {
                this.drawLeaderboardTableRow(leaderboardsRows, {
                    userId: entries[i].node.user.userId,
                    userName: entries[i].node.user.displayName,
                    position: entries[i].node.position,
                    points: entries[i].node.points,
                    prize: data.actions?.[i]?.action
                }, i + 1);
            }
        }

        async drawUserInfo(parentElement) {
            if (this.currentUserId && this.currentUserId !== 'null' && this.currentUserId !== "") {
                await this.getUserInfo(this.leaderboardId, this.currentUserId);

                let userInfoHTML = `
                    <div class="leaderboard-row-user-container">
                        <div class="leaderboard-row-user" id="leaderboard-row-user">
                            <div class="table-position-user">
                                ${this.currUserInfo?.position || "-"}
                            </div>
                            <div class="table-user-name-user">
                                ${this.currUserInfo?.user?.nickname || ""}
                            </div>
                            <div class="table-points-user">
                                ${this.currUserInfo?.points || 0}
                            </div>
                            <div class="table-prize-user">
                                -
                            </div>
                        </div>
                    </div>
                `;

                if (this.chickenDinner.isWinner) {
                    userInfoHTML = userInfoHTML.replace('<div class="leaderboard-row-user"', '<div class="leaderboard-row-user switch_spot_in"');
                } else {
                    userInfoHTML = userInfoHTML.replace('<div class="leaderboard-row-user"', '<div class="leaderboard-row-user switch_spot_out"');
                }


                parentElement.innerHTML += userInfoHTML;
            }
        }



        getTablePrizeClassnames(data) {
            return [
                'table-prize',
                data?.bonus?.reward?.type === 'FREE_SPINS' && 'table-prize-free-spins',
                data?.bonus?.reward?.type === 'FIXED' && 'table-prize-fixed',
                data?.title && 'table-prize-title',
                data?.box?.type === 'LOOT_BOX' && 'table-prize-loot-box',
                data?.box?.type === 'MYSTERY_BOX' && 'table-prize-mystery-box',
                data?.box?.type === 'WHEEL_OF_FORTUNE' && 'table-prize-wheel-of-fortune'
            ].filter(Boolean);
        }

        getTablePrizeText(data) {
            if (data === null) return '';
            if (data?.bonus?.reward?.type === 'FREE_SPINS') {
                return data?.bonus?.reward?.amount;
            }
            if (data?.bonus?.reward?.type === 'FIXED') {
                return data?.bonus?.reward?.amounts[0]?.value;
            }
            if (data?.title) {
                return ``;
            }
            if (data?.box?.type === 'LOOT_BOX') {
                return data?.box?.description;
            }
            if (data?.box?.type === 'MYSTERY_BOX') {
                return data?.box?.description;
            }
            if (data?.box?.type === 'WHEEL_OF_FORTUNE') {
                return data?.box?.description;
            }
            return '';
        }




        getPossitionText() {
            switch (this.locale) {
                case 'en':
                    return 'Position';
                case 'ru':
                    return 'Позиция';
                case 'ka':
                    return 'პოზიცია';
                case 'tr':
                    return 'Konum';
            }
        }

        getPointsText() {
            switch (this.locale) {
                case 'en':
                    return 'Points';
                case 'ru':
                    return 'Очки';
                case 'ka':
                    return 'ქულები';
                case 'tr':
                    return 'Puanlar';
            }
        }

        getPrizeText() {
            switch (this.locale) {
                case 'en':
                    return 'Prize';
                case 'ru':
                    return 'Приз';
                case 'ka':
                    return 'პრიზი';
                case 'tr':
                    return 'Ödül';
            }
        }

        getHeaderUserNameText() {
            switch (this.locale) {
                case 'en':
                    return 'Users';
                case 'ru':
                    return 'Пользователи';
                case 'ka':
                    return 'მომხმარებლები';
                case 'tr':
                    return 'Kullanıcılar';
            }
        }


    }

}

