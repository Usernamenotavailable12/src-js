class FullLeaderboardTable {
    leaderboardsDivs = [];
    fullLEaderboardTableHead = document.createElement('div');
    fullLEaderboardTableBody = document.createElement('div');
    parent = document.getElementById('leaderboardLoader');
    locale = 'ka';

    constructor() {
        this.FullDrawTournaments();
        this.parent?.appendChild(this.fullLEaderboardTableHead);
        this.fullLEaderboardTableHead.classList.add('leaderboard-table-header');
        this.parent?.appendChild(this.fullLEaderboardTableBody);
        this.fullLEaderboardTableBody.classList.add('leaderboard-table-body');
        this.locale = document.documentElement.getAttribute('lang') || 'en';
    }

    async FullDrawTournaments() {
        const tournamentData = document.getElementById('tournamentData')?.textContent;
        const tournamentItems = [];
        const segments = tournamentData.split(',');

        for (let i = 0; i < segments.length; i += 2) {
            if (i + 1 < segments.length) {
                tournamentItems.push({
                    id: segments[i].trim(),
                    count: parseInt(segments[i + 1].trim(), 10) || 0
                });
            }
        }

        for (const item of tournamentItems) {
            const div = await FullLeaderboardTable.LeaderboardTableDrawer.create(
                this.fullLEaderboardTableBody,
                item.id,
                item.count
            );

            if (div) {
                this.leaderboardsDivs.push({
                    id: item.id,
                    startsAt: div.data.startsAt,
                    endsAt: div.data.endsAt
                });
            }
        }

        this.drawLeaderboardTableHeader();
    }


    formatTournamentDates(startDateStr, endDateStr, locale = 'ka') {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);

        // Get just the date part for proper day calculation
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const diffTime = endDay - startDay;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let dateText;
        let monthText;

        if (diffDays <= 1) {
            // Single day tournament
            dateText = start.getDate().toString();
        } else {
            // Multi-day tournament
            dateText = `${start.getDate()} - ${end.getDate()}`;
        }

        // Manually defined month names for locales that might not be supported
        const monthNames = {
            'ka': ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
                'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი']
        };

        // Handle month display using our custom mapping
        if (start.getMonth() !== end.getMonth() || start.getFullYear() !== end.getFullYear()) {
            // Different months
            let startMonth, endMonth;

            if (monthNames[locale]) {
                startMonth = monthNames[locale][start.getMonth()];
                endMonth = monthNames[locale][end.getMonth()];
            } else {
                startMonth = start.toLocaleString(locale, { month: 'long' });
                endMonth = end.toLocaleString(locale, { month: 'long' });
            }

            monthText = `${startMonth} - ${endMonth}`;
        } else {
            // Same month
            if (monthNames[locale]) {
                monthText = monthNames[locale][start.getMonth()];
            } else {
                monthText = start.toLocaleString(locale, { month: 'long' });
            }
        }

        return {
            dateText: dateText,
            monthText: monthText
        };
    }

    drawLeaderboardTableHeader() {
        const nowDate = Date.now();
        this.leaderboardsDivs.forEach((div) => {
            const startsAtTimestamp = new Date(div.startsAt).getTime();
            const endsAtTimestamp = new Date(div.endsAt).getTime();
            const button = document.createElement('button');
            this.fullLEaderboardTableHead.appendChild(button);
            const { dateText, monthText } = this.formatTournamentDates(div.startsAt, div.endsAt, this.locale);
            const dateCopy = document.createElement("copy");
            const monthCopy = document.createElement("copy");
            dateCopy.textContent = dateText;
            monthCopy.textContent = monthText;
            dateCopy.className = "leaderboard-table-header-button-date";
            monthCopy.className = "leaderboard-table-header-button-month";
            button.appendChild(dateCopy);
            button.appendChild(monthCopy);
            button.onclick = () => {
                const activeButtons = document.getElementsByClassName("leaderboard-table-header-button-active");
                Array.from(activeButtons).forEach(el => {
                    el.className = "leaderboard-table-header-button";
                });

                const allTables = document.getElementsByClassName("leaderboard-table-element");
                Array.from(allTables).forEach(table => {
                    table.style.display = "none";
                });

                button.className = "leaderboard-table-header-button-active";

                const tableId = `leaderboard-table-element-${div.id}`;
                const tableToShow = document.getElementById(tableId);
                if (tableToShow) {
                    tableToShow.style.display = "block";
                }
            }
            button.className = "leaderboard-table-header-button";;
            button.id = `leaderboard-table-header-button-${div.id}`;



            if (nowDate > startsAtTimestamp && nowDate < endsAtTimestamp) {
                document.getElementById(`leaderboard-table-element-${div.id}`).style.display = 'block';
                button.className = "leaderboard-table-header-button-active";
            }
        });
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
        currUserInfo;

        // Regular constructor without async
        constructor(King, leaderboardId, actionsCount) {
            this.leaderboardId = leaderboardId,
            this.leaderboardTableParentElement = document.createElement('div');
            King.appendChild(this.leaderboardTableParentElement);
            this.leaderboardTableParentElement.classList.add('leaderboard-table-element');
            this.leaderboardTableParentElement.style.display = 'none';
            this.leaderboardTableParentElement.id = `leaderboard-table-element-${leaderboardId}`;
            this.currentUserId = extractAuthDataFromCookie()?.userId,
                this.actionsCount = actionsCount;
            this.locale = document.documentElement.getAttribute('lang') || 'en';
        }

        // Static factory method to handle async creation
        static async create(King, leaderboardId, actionsCount) {
            if (!document.getElementById(`leaderboard-table-element-${leaderboardId}`)) {
                const instance = new LeaderboardTableDrawer(King, leaderboardId, actionsCount);
                await instance.initialize(leaderboardId, actionsCount);
                return instance;
            } else {
                return null;
            }
        }

        // Separate async initialization method
        async initialize(leaderboardId, actionsCount) {
            this.drawLeaderboardTableHeader(this.leaderboardTableParentElement);
            await this.getData(leaderboardId, actionsCount);
        }


        async getUserInfo(tournamentId, userId) {
            const query = `query UserTournamentConnection($userId: ID, $tournamentId: ID) {
                userTournamentConnection(userId: $userId, tournamentId: $tournamentId) {
                    edges {
                    node {
                        points
                        position
                        user {
                        nickname
                        }
                    }
                    }
                }
                }
            `;
    
            const variables = {
                tournamentId: tournamentId,
                userId: userId
            };
    
            try {
                const response = await fetch("https://www.ambassadoribet.com/_internal/gql/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ query, variables })
                });
    
                const data = await response.json();
                if (!data?.data?.userTournamentConnection?.edges[0]?.node) {
                    console.error("Invalid tournament data:", data);
                    return;
                }
    
                this.currUserInfo = data?.data?.userTournamentConnection?.edges[0]?.node;
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
        }
    
        async drawUserInfo(parentElement) {
            if (this.currentUserId && this.currentUserId !== 'null' && this.currentUserId !== "") {
            await this.getUserInfo(this.leaderboardId, this.currentUserId);
            if (!this.chickenDinner.isWinner) {
                const row = document.createElement('div');
                row.classList.add('leaderboard-row-user');
                row.id = `leaderboard-row-user`;
                const positionElement = document.createElement('div');
                positionElement.textContent = this.currUserInfo?.position;
                positionElement.classList.add('table-position-user');
                row.appendChild(positionElement);
    
                const userNameElement = document.createElement('div');
                userNameElement.textContent = this.currUserInfo?.user?.nickname;
                userNameElement.classList.add('table-user-name-user');
                row.appendChild(userNameElement);
    
                const pointsElement = document.createElement('div');
                pointsElement.textContent = this.currUserInfo?.points;
                pointsElement.classList.add('table-points-user');
                row.appendChild(pointsElement);
    
                const prizeElement = document.createElement('div');
                prizeElement.textContent = "-";
                prizeElement.classList.add('table-prize-user');
                row.appendChild(prizeElement);
    
                parentElement.appendChild(row);
            }
                            
        }
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

            const variables = {
                tournamentId: leaderboardId,
                status: ["ACTIVE", "FINISHED", "PREPARING"],
                orderBy: [{ field: "points", direction: "DESCENDING" }],
                first: actionsCount
            };

            try {
                const response = await fetch("https://www.ambassadoribet.com/_internal/gql/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
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

        drawLeaderboardTableRow(parentElement, data, index) {
            const row = document.createElement('div');
            row.classList.add('leaderboard-row');
            if (data.userId === this.currentUserId)
                this.chickenDinner = { isWinner: true, index: index };
            row.classList.add('winner-winner-chicken-dinner');
            row.id = `leaderboard-row-${index}`;

            const positionElement = document.createElement('div');
            positionElement.textContent = data.position;
            positionElement.classList.add('table-position');
            positionElement.id = `table-position-${index}`;
            row.appendChild(positionElement);

            const userNameElement = document.createElement('div');
            userNameElement.textContent = maskUsername(data.userName, this.currentUserId, data.userId);
            userNameElement.classList.add('table-user-name');
            userNameElement.id = `table-user-name-${index}`;
            row.appendChild(userNameElement);

            const pointsElement = document.createElement('div');
            pointsElement.textContent = data.points;
            pointsElement.classList.add('table-points');
            pointsElement.id = `table-points-${index}`;
            row.appendChild(pointsElement);

            this.drawPrizeElement(data.prize, row, index);

            parentElement.appendChild(row);
        }

        drawPrizeElement(data, row, index) {
            const prizeElement = document.createElement('div');
            prizeElement.textContent = this.getTablePrizeText(data);
            prizeElement.classList.add(...this.getTablePrizeClassnames(data));
            prizeElement.id = `table-prize-${index}`;
            row.appendChild(prizeElement);
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

        drawLeaderboardTableRows(data) {
            const entries = data.userTournamentConnection.edges || [];
            for (let i = 0; i < Math.min(this.actionsCount, entries.length); i++) {
                this.drawLeaderboardTableRow(this.leaderboardTableParentElement, {
                    userId: entries[i].node.user.userId,
                    userName: entries[i].node.user.displayName,
                    position: entries[i].node.position,
                    points: entries[i].node.points,
                    prize: data.actions?.[i]?.action
                }, i + 1);
            }
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

        drawLeaderboardTableHeader(parentElement) {
            const row = document.createElement('div');
            row.classList.add('leaderboard-row-header');
            row.id = `leaderboard-row-header`;

            const positionElement = document.createElement('div');
            positionElement.textContent = this.getPossitionText();
            positionElement.classList.add('table-position-header');
            row.appendChild(positionElement);

            const userNameElement = document.createElement('div');
            userNameElement.textContent = '';
            userNameElement.classList.add('table-user-name-header');
            row.appendChild(userNameElement);

            const pointsElement = document.createElement('div');
            pointsElement.textContent = this.getPointsText();
            pointsElement.classList.add('table-points');
            row.appendChild(pointsElement);

            const prizeElement = document.createElement('div');
            prizeElement.textContent = this.getPrizeText();
            prizeElement.classList.add('table-prize');
            row.appendChild(prizeElement);

            parentElement.appendChild(row);
        }

    }

}
