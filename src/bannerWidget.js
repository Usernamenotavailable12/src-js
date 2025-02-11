window.bannerSlider = (function() {
  // Internal variables
  var sliderContainer, slidesWrapper;
  var configUrl = 'https://usernamenotavailable12.github.io/manifest/banners.json';
  var bannersData = null;
  var currentSlideIndex = 0;
  var slideInterval;
  var configIntervalId;
  var autoSlideTime = 5000; // Default auto-slide interval (in ms)

  // Fetch the banner configuration JSON (with no-cache)
  function fetchBannerConfig() {
    fetch(configUrl + '?_=' + new Date().getTime(), { cache: "no-cache" })
      .then(function(response) { return response.json(); })
      .then(function(data) {
        bannersData = data;
        if (data.autoSlideInterval) {
          autoSlideTime = data.autoSlideInterval;
        }
        // Preserve the current slide index if possible
        var previousIndex = currentSlideIndex;
        buildSlider(data.banners);
        currentSlideIndex = (previousIndex < slidesWrapper.children.length)
          ? previousIndex
          : 0;
        showSlide(currentSlideIndex);
        startAutoSlide();
      })
      .catch(function(error) {
        console.error('Error loading banner config:', error);
      });
  }

  // Build the slider DOM based on the banners array
  function buildSlider(banners) {
    if (!banners || banners.length === 0) {
      console.warn('No banners provided in the configuration.');
      return;
    }
    // Clear any existing slides (useful on config refresh)
    slidesWrapper.innerHTML = '';

    banners.forEach(function(banner) {
      var slide = document.createElement('div');
      slide.className = 'slide';

      // If a link is provided, attach an inline click handler.
      // This calls a global function switchCurnetUrl(navUrl) on your site.
      if (banner.link) {
        slide.setAttribute("onclick", "switchCurnetUrl(\"" + banner.link + "\")");
      }

      // Build a responsive <picture> element
      var picture = document.createElement('picture');

      if (banner.mobile_image) {
        var sourceMobile = document.createElement('source');
        sourceMobile.media = "(max-width: 767px)";
        sourceMobile.srcset = banner.mobile_image;
        picture.appendChild(sourceMobile);
      }
      if (banner.desktop_image) {
        var img = document.createElement('img');
        img.src = banner.desktop_image;
        img.alt = banner.alt || 'Banner';
        picture.appendChild(img);
      } else {
        console.warn('No desktop image provided for banner:', banner);
      }

      slide.appendChild(picture);
      slidesWrapper.appendChild(slide);
    });
  }

  // Show a slide at a given index by updating the transform on slidesWrapper
  function showSlide(index) {
    var slidesCount = slidesWrapper.children.length;
    if (slidesCount === 0) return;

    if (index >= slidesCount) {
      currentSlideIndex = 0;
    } else if (index < 0) {
      currentSlideIndex = slidesCount - 1;
    } else {
      currentSlideIndex = index;
    }
    slidesWrapper.style.transform = 'translateX(-' + (currentSlideIndex * 100) + '%)';
  }

  // Start (or restart) the auto-slide interval
  function startAutoSlide() {
    clearInterval(slideInterval);
    slideInterval = setInterval(function() {
      showSlide(currentSlideIndex + 1);
    }, autoSlideTime);
  }

  // Pause auto-slide (e.g., when the mouse enters the slider)
  function pauseAutoSlide() {
    clearInterval(slideInterval);
  }

  // The init function waits until the slider container and inner wrapper exist,
  // and marks the container as initialized (via a data attribute) to prevent double initialization.
  function init() {
    var container = document.getElementById('banner-slider');
    if (!container) {
      // Container not found yet; try again shortly.
      setTimeout(init, 100);
      return;
    }
    // If the container is already initialized, do nothing.
    if (container.getAttribute('data-banner-slider-initialized') === 'true') {
      return;
    }
    container.setAttribute('data-banner-slider-initialized', 'true');

    sliderContainer = container;
    slidesWrapper = sliderContainer.querySelector('.slides-wrapper');
    if (!slidesWrapper) {
      setTimeout(init, 100);
      return;
    }

    // Attach event listeners for pause/resume and navigation arrows.
    sliderContainer.addEventListener('mouseenter', pauseAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);

    var prevArrow = document.querySelector('.arrow.prev');
    var nextArrow = document.querySelector('.arrow.next');
    if (prevArrow) {
      prevArrow.addEventListener('click', function(event) {
        event.stopPropagation();
        showSlide(currentSlideIndex - 1);
      });
    }
    if (nextArrow) {
      nextArrow.addEventListener('click', function(event) {
        event.stopPropagation();
        showSlide(currentSlideIndex + 1);
      });
    }

    // Load configuration and set up periodic update every 10 seconds.
    fetchBannerConfig();
    configIntervalId = setInterval(fetchBannerConfig, 10000);
  }

  // The destroy function cleans up event listeners, intervals, and removes the initialization flag.
  function destroy() {
    if (sliderContainer) {
      sliderContainer.removeEventListener('mouseenter', pauseAutoSlide);
      sliderContainer.removeEventListener('mouseleave', startAutoSlide);
      sliderContainer.removeAttribute('data-banner-slider-initialized');
    }
    clearInterval(slideInterval);
    clearInterval(configIntervalId);
  }

  // Public API
  return {
    init: init,
    destroy: destroy,
    showSlide: showSlide
  };
})();

// ---
// Mutation Observer to detect when the slider container is removed or added back.
var sliderObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    // If a node with id "banner-slider" is removed, call destroy.
    mutation.removedNodes.forEach(function(node) {
      if (node.nodeType === 1 && node.id === 'banner-slider') {
        window.bannerSlider.destroy();
      }
    });
    // If a node with id "banner-slider" is added, call init.
    mutation.addedNodes.forEach(function(node) {
      if (node.nodeType === 1 && node.id === 'banner-slider') {
        window.bannerSlider.init();
      }
    });
  });
});
sliderObserver.observe(document.body, { childList: true, subtree: true });

// ---
// "pageshow" event listener for back/forward navigation.
window.addEventListener("pageshow", function() {
  var container = document.getElementById('banner-slider');
  if (container) {
    // If the container exists but isn't initialized or its content is empty, reinitialize.
    var slides = container.querySelector('.slides-wrapper');
    if (!container.getAttribute('data-banner-slider-initialized') ||
        !slides ||
        slides.innerHTML.trim() === "") {
      window.bannerSlider.destroy();
      window.bannerSlider.init();
    }
  }
});

// ---
// Polling: Every 500ms check if the slider container exists but is not initialized.
// This handles direct page loads or Angular route changes that might not trigger MutationObserver.
setInterval(function() {
  var container = document.getElementById('banner-slider');
  if (container) {
    var slides = container.querySelector('.slides-wrapper');
    if (!container.getAttribute('data-banner-slider-initialized') ||
        !slides ||
        slides.innerHTML.trim() === "") {
      window.bannerSlider.init();
    }
  }
}, 500);
