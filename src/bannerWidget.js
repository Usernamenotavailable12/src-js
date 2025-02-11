window["bannerSlider"] = (function() {
  // Internal variables
  var sliderContainer, slidesWrapper;
  var configUrl = 'https://usernamenotavailable12.github.io/manifest/banners.json';
  var bannersData = null;
  var currentSlideIndex = 0;
  var slideInterval;
  var autoSlideTime = 5000; // Default interval

  // Fetch the banner configuration JSON (with no cache)
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

  // Build the slider DOM from the banners array
  function buildSlider(banners) {
    if (!banners || banners.length === 0) {
      console.warn('No banners provided in the configuration.');
      return;
    }
    // Clear out any existing slides (useful on config reload)
    slidesWrapper.innerHTML = '';

    banners.forEach(function(banner) {
      var slide = document.createElement('div');
      slide.className = 'slide';
      // If a link is provided, attach an inline click handler
      if (banner.link) {
        slide.setAttribute("onclick", "switchCurnetUrl(\"" + banner.link + "\")");
      }
      // Build a responsive picture element
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

  // Show the slide at a given index by updating the wrapper’s transform
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

  // Start or restart the auto-slide interval
  function startAutoSlide() {
    clearInterval(slideInterval);
    slideInterval = setInterval(function() {
      showSlide(currentSlideIndex + 1);
    }, autoSlideTime);
  }

  // Pause auto-sliding (for example, when the mouse is over the slider)
  function pauseAutoSlide() {
    clearInterval(slideInterval);
  }

  // Initialize the slider: find container, set up event listeners, load config
  function init() {
    sliderContainer = document.getElementById('banner-slider');
    if (!sliderContainer) {
      console.error('Slider container (#banner-slider) not found.');
      return;
    }
    slidesWrapper = sliderContainer.querySelector('.slides-wrapper');
    if (!slidesWrapper) {
      console.error('Slides wrapper not found inside #banner-slider.');
      return;
    }
    // Attach event listeners for pausing/resuming auto-slide
    sliderContainer.addEventListener('mouseenter', pauseAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
    // Attach click events for navigation arrows if they exist
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
    // Initial load and periodic update every 10 seconds
    fetchBannerConfig();
    setInterval(fetchBannerConfig, 10000);
  }

  // Optional cleanup method if you need to destroy the slider instance
  function destroy() {
    clearInterval(slideInterval);
    if (sliderContainer) {
      sliderContainer.removeEventListener('mouseenter', pauseAutoSlide);
      sliderContainer.removeEventListener('mouseleave', startAutoSlide);
    }
    // Additional cleanup as required...
  }

  // Public API
  return {
    init: init,
    showSlide: showSlide,
    destroy: destroy
  };
})();

// Auto-initialize the slider when the DOM is ready (like CommonNinja does)
if (document.readyState === "complete" || document.readyState === "interactive") {
  window.bannerSlider.init();
} else {
  document.addEventListener("DOMContentLoaded", function() {
    window.bannerSlider.init();
  });
}
