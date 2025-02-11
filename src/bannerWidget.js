(function() {
  // Look for the slider container (just like AltenarSportsbook looks for its container)
  const sliderContainer = document.getElementById('banner-slider');
  if (!sliderContainer) {
    console.error('Slider container (#banner-slider) not found.');
    return;
  }
  
  // Get the inner wrapper for slides
  const slidesWrapper = sliderContainer.querySelector('.slides-wrapper');
  // URL for your JSON configuration file (with banners, autoSlideInterval, etc.)
  const configUrl = 'https://usernamenotavailable12.github.io/manifest/banners.json';
  
  let bannersData;
  let currentSlideIndex = 0;
  let slideInterval;
  let autoSlideTime = 5000; // Default auto-slide time (milliseconds)

  // NOTE: The function switchCurnetUrl(navurl) is assumed to be globally available.
  // It is called when a banner is clicked.

  // Fetch the banner configuration JSON file with a no-cache query parameter
  function fetchBannerConfig() {
    fetch(configUrl + '?_=' + new Date().getTime(), { cache: "no-cache" })
      .then(response => response.json())
      .then(data => {
        bannersData = data;
        if (data.autoSlideInterval) {
          autoSlideTime = data.autoSlideInterval;
        }
        // Save the current slide index so we can try to restore it after rebuilding the slider
        const previousIndex = currentSlideIndex;
        buildSlider(data.banners);
        // Restore previous slide index if possible; otherwise default to 0
        currentSlideIndex = (previousIndex < slidesWrapper.children.length) ? previousIndex : 0;
        showSlide(currentSlideIndex);
        startAutoSlide();
      })
      .catch(error => console.error('Error loading banner config:', error));
  }

  // Build the slider DOM based on the provided banners array
  function buildSlider(banners) {
    if (!banners || banners.length === 0) {
      console.warn('No banners provided in the configuration.');
      return;
    }
    // Clear any existing slides (in case of a config reload)
    slidesWrapper.innerHTML = '';

    banners.forEach((banner) => {
      // Create a container for each slide
      const slide = document.createElement('div');
      slide.className = 'slide';

      // If a link is provided, add an inline onclick handler (calls the assumed global switchCurnetUrl)
      if (banner.link) {
        slide.setAttribute("onclick", "switchCurnetUrl(\"" + banner.link + "\")");
      }

      // Build a <picture> element for responsive images
      const picture = document.createElement('picture');

      // Add a mobile image if provided
      if (banner.mobile_image) {
        const sourceMobile = document.createElement('source');
        sourceMobile.media = "(max-width: 767px)";
        sourceMobile.srcset = banner.mobile_image;
        picture.appendChild(sourceMobile);
      }
      // Add a desktop image (the default)
      if (banner.desktop_image) {
        const img = document.createElement('img');
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

  // Show a specific slide by adjusting the transform on the slides wrapper
  function showSlide(index) {
    const slidesCount = slidesWrapper.children.length;
    if (slidesCount === 0) return;

    // Wrap-around logic if the index is out of bounds
    if (index >= slidesCount) {
      currentSlideIndex = 0;
    } else if (index < 0) {
      currentSlideIndex = slidesCount - 1;
    } else {
      currentSlideIndex = index;
    }
    slidesWrapper.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  }

  // Start (or restart) the auto-slide interval
  function startAutoSlide() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
      showSlide(currentSlideIndex + 1);
    }, autoSlideTime);
  }

  // Pause auto-slide when the mouse enters the slider container,
  // and resume when the mouse leaves
  sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
  sliderContainer.addEventListener('mouseleave', () => startAutoSlide());

  // Set up left/right arrow button click events (if the elements exist)
  const prevArrow = document.querySelector('.arrow.prev');
  const nextArrow = document.querySelector('.arrow.next');

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

  // Initial fetch of the banner configuration
  fetchBannerConfig();
  // Re-fetch the banner configuration every 10 seconds (similar to a periodic update)
  setInterval(fetchBannerConfig, 10000);
})();
