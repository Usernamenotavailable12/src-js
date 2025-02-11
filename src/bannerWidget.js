window["bannerSlider"] = (function() {
  // Internal variables
  var sliderContainer, slidesWrapper;
  var configUrl = 'https://usernamenotavailable12.github.io/manifest/banners.json';
  var bannersData = null;
  var currentSlideIndex = 0;
  var slideInterval;
  var autoSlideTime = 5000; // Default auto-slide interval in milliseconds

  // Fetch the banner configuration JSON (with no cache)
  function fetchBannerConfig() {
    fetch(configUrl + '?_=' + new Date().getTime(), { cache: "no-cache" })
      .then(function(response) { return response.json(); })
      .then(function(data) {
        bannersData = data;
        if (data.autoSlideInterval) {
          autoSlideTime = data.autoSlideInterval;
        }
        // Preserve current slide index if possible
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
    // Clear any existing slides (useful if config is refreshed)
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

  // Pause auto-slide (e.g. when mouse enters the slider)
  function pauseAutoSlide() {
    clearInterval(slideInterval);
  }

  // The init function waits until the slider container and inner wrapper exist.
  function init() {
    sliderContainer = document.getElementById('banner-slider');
    if (!sliderContainer) {
      // Container not found yet; try again in 100ms.
      setTimeout(init, 100);
      return;
    }
    slidesWrapper = sliderContainer.querySelector('.slides-wrapper');
    if (!slidesWrapper) {
      // The wrapper isn’t present yet; try again in 100ms.
      setTimeout(init, 100);
      return;
    }

    // Set up event listeners for pause/resume and arrow navigation.
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

    // Load configuration and periodically update every 10 seconds.
    fetchBannerConfig();
    setInterval(fetchBannerConfig, 10000);
  }

  // Optional cleanup method if needed
  function destroy() {
    clearInterval(slideInterval);
    if (sliderContainer) {
      sliderContainer.removeEventListener('mouseenter', pauseAutoSlide);
      sliderContainer.removeEventListener('mouseleave', startAutoSlide);
    }
    // Add any additional cleanup here...
  }

  // Public API
  return {
    init: init,
    showSlide: showSlide,
    destroy: destroy
  };
})();

// Immediately call init(). This will poll until the container is available.
window.bannerSlider.init();
