  function triggerWidget() {
    if (!window.altenarWSDK) {
      console.error("Altenar WSDK is not loaded.");
      return;
    }

    // Initialize Altenar WSDK
    window.altenarWSDK.init({
      integration: 'ambassadoribet',
      culture: 'ka-GE',
      oddformat: 0
    });

    // Enable Memory Router
    window.altenarWSDK.addSportsBook({
      props: {
        routerType: 'memory',
        onRouteChange: (data) => {
          const url = new URL(window.location.href);
          url.search = new URLSearchParams(data).toString();
          window.history.pushState(null, '', url);
        },
      },
      container: document.getElementById('root'),
    });

    // Add the WEventSearch widget
    window.altenarWSDK.addWidget({
      widget: 'WEventSearch',
      props: {
        clearOnSelect: true,
        onEventSelect: (event) => {
          console.log("Event Selected:", event);
          navigateToEvent(event);
        },
        onChampionshipSelect: (championship) => {
          console.log("Championship Selected:", championship);
          navigateToChampionship(championship);
        },
        showBookedLiveIndicator: true,
        showFavouriteEventsIndicator: false,
        showLiveIndicator: true,
      },
      container: document.getElementById('search-widget')
    });
  }

  function getCurrentSportsbookUrl() {
    const currentUrl = window.location.href;
    const match = currentUrl.match(/(https:\/\/www\.ambassadoribet\.com\/[^\/]+\/sportsbook)/);
    return match ? match[1] : currentUrl;
  }

  function navigateToEvent(event) {
    if (!window.altenarWSDK) {
      console.error("Altenar WSDK is not initialized.");
      return;
    }

    // Navigate within the sportsbook section
    window.altenarWSDK.set({
      page: 'event',
      eventId: event.id,
      sportId: event.sportId,
      categoryIds: [event.catId],
      championshipIds: [event.champId]
    });

    // Append event to current sportsbook URL
    const newUrl = `${getCurrentSportsbookUrl()}/event/${event.id}`;
    window.history.pushState(null, '', newUrl);

    // Close the modal after selecting an event
    document.querySelector('[data-modal-sport-search]').close();
  }

  function navigateToChampionship(championship) {
    if (!championship || !championship.championshipIds) {
      console.error("Invalid championship data:", championship);
      return;
    }

    // Navigate within the sportsbook section
    window.altenarWSDK.set({
      page: 'championship',
      championshipIds: championship.championshipIds,
      sportTypeId: championship.sportTypeId,
      categories: championship.categories
    });

    // Append championship to current sportsbook URL
    const newUrl = `${getCurrentSportsbookUrl()}/championship/${championship.championshipIds}`;
    window.history.pushState(null, '', newUrl);

    // Close the modal after selecting a championship
    document.querySelector('[data-modal-sport-search]').close();
  }

  // Handle back navigation
  window.addEventListener('popstate', () => {
    window.altenarWSDK.set({
      // Restore previously received parameters if needed
    });
  });
