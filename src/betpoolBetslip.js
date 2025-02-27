  function closeBetpoolBetslipModal() {
    document.getElementById("bp-popup-content").innerHTML = "";
    document.querySelector("[data-modal-betpool]").close();
  }

  // Function to render the UI using cached data for a given category
  function showData(dataCache, category) {
    var p = document.getElementById("bp-popup-content");
    p.innerHTML = "";

    // Create toggle container with four category buttons: ALL, OPEN, WON, LOST
    var t = document.createElement("div");
    t.className = "bp-toggle-container";
    ["ALL", "OPEN", "WON", "LOST"].forEach(function (st) {
      var btn = document.createElement("button");
      btn.classList.add("bp-all");
      btn.innerText = st;
      if (st === category) {
        btn.classList.add("bp-active");
      }
      btn.addEventListener("click", function () {
        // Update active state
        t.querySelectorAll("button").forEach(function (b) {
          b.classList.remove("bp-active");
        });
        btn.classList.add("bp-active");
        // Render UI for selected category from cached data
        showData(dataCache, st);
      });
      t.appendChild(btn);
    });
    p.appendChild(t);

    // Create main containers for user list and bet details
    var c = document.createElement("div");
    c.id = "bp-main-container";
    p.appendChild(c);
    var l = document.createElement("div");
    l.id = "bp-user-list-container";
    c.appendChild(l);
    var dCont = document.createElement("div");
    dCont.id = "bp-detail-container";
    c.appendChild(dCont);

    // Group bets by user nickname from the cached data for this category
    var g = {};
    var d = dataCache[category]; // d is an array of responses for this category
    d.forEach(function (item) {
      if (
        item.data &&
        item.data.betslipConnection &&
        item.data.betslipConnection.edges
      ) {
        var edges = item.data.betslipConnection.edges;
        edges.forEach(function (edge) {
          var bet = edge.node,
            nick = bet.user.nickname;
          g[nick] = g[nick] || [];
          g[nick].push(bet);
        });
      }
    });

    // Function to load bets for a given user
    function loadCategory() {
      l.innerHTML = "";
      dCont.innerHTML = "";
      var ul = document.createElement("ul");
      ul.className = "bp-user-list";
      for (var user in g) {
        (function (u) {
          var li = document.createElement("li");
          li.innerText = u;
          li.addEventListener("click", function () {
            dCont.innerHTML = "";
            var bets = g[u];
            if (bets && bets.length) {
              bets.forEach(function (bet) {
                var card = document.createElement("betslipCard");
                card.classList.add(bet.status.toLowerCase());
                card.style.border = "1px solid #ccc";
                card.style.borderRadius = "5px";
                card.style.padding = "10px";
                card.style.marginBottom = "10px";
                // Build event texts for each event in the bet:
                var eventTexts = [];
                if (bet.events && bet.events.length) {
                  bet.events.forEach(function (event) {
                    var texts = "";
                    if (event.eventName) {
                      texts +=
                        '<div class="marketEventWrapper"> <span class="bp-event-name">' +
                        event.eventName +
                        "</span>";
                    }
                    if (event.markets && event.markets.length) {
                      var marketNames = [];
                      event.markets.forEach(function (market) {
                        if (market.name) {
                          marketNames.push(
                            '<div class="bp-market-inner-wrapper"> <span class="bp-market-name">' +
                            market.name + '</span> <span class="bp-market-outcomes">' + market.outcomes[0].name +
                            "</span> </div> </div>"
                          );
                        }
                      });
                      if (marketNames.length) {
                        texts += marketNames.join(", ");
                      }
                    }
                    if (texts) {
                      eventTexts.push(texts);
                    }
                  });
                }
                var date = new Date(bet.createdAt);
                var formattedDate = date.toLocaleString();
                var marketDisplay =
                  eventTexts.length ? eventTexts.join("<br>") : "N/A";
                var odds = parseFloat(bet.odds),
                  stake = parseFloat(bet.stake),
                  amount = odds * stake;
                var html =
                  '<div class="betslipCard" style="display:flex; flex-direction:column; gap:5px;">';
                html += '<div class="market">' + marketDisplay + "</div>";
                html +=
                  '<div class="odds"><strong>კოეფიციენტი:</strong> ' +
                  bet.odds +
                  "</div>";
                html +=
                  '<div class="stake"><strong>ფსონი:</strong> ' +
                  bet.stake +
                  "</div>";
                html +=
                  '<div class="bet"><strong>მოგება:</strong> ' +
                  amount.toFixed(2) + "₾" +
                  "</div>";
                html +=
                  '<div class="date"><strong>თარიღი:</strong> ' +
                  formattedDate +
                  "</div>";
                html += "</div>";
                card.innerHTML = html;
                dCont.appendChild(card);
              });
            } else {
              var msg = document.createElement("p");
              msg.className = "bp-no-images";
              msg.innerText = "No Betslip Found";
              dCont.appendChild(msg);
            }
          });
          ul.appendChild(li);
        })(user);
      }
      l.appendChild(ul);
    }
    loadCategory();
  }

  // When the modal is opened, fetch data from all endpoints (OPEN, WON, LOST) and cache them.
  function openBetpoolBetslipModal() {
    var statuses = ["OPEN", "WON", "LOST"];
    var promises = statuses.map(function (st) {
      var u = "https://api.samsara.ge/betslip?status=" + st;
      u += (u.indexOf("?") === -1
        ? "?cachebuster=" + new Date().getTime()
        : "&cachebuster=" + new Date().getTime());
      return fetch(u)
        .then(function (r) { return r.json(); })
        .then(function (data) { return { status: st, data: data }; });
    });

    Promise.all(promises)
      .then(function (results) {
        // Cache each status’ data
        var dataCache = {};
        statuses.forEach(function (st) {
          var result = results.find(function (res) { return res.status === st; });
          dataCache[st] = result ? result.data : [];
        });
        // Create "ALL" category by merging OPEN, WON, and LOST data arrays
        dataCache["ALL"] = [];
        statuses.forEach(function (st) {
          dataCache["ALL"] = dataCache["ALL"].concat(dataCache[st]);
        });
        // Initially display "ALL" bets grouped by user
        showData(dataCache, "ALL");
      })
      .catch(function (err) {
        console.error("Error fetching data:", err);
      });

    document.querySelector("[data-modal-betpool]").showModal();
  }
