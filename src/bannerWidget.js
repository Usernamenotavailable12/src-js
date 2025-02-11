    (function() {
      const sliderContainer = document.getElementById('banner-slider');
      const slidesWrapper = sliderContainer.querySelector('.slides-wrapper');
      const configUrl = 'https://usernamenotavailable12.github.io/manifest/banners.json'; // Path to your JSON configuration file
      let bannersData;
      let currentSlideIndex = 0;
      let slideInterval;
      let autoSlideTime = 5000; // Default auto-slide time (in milliseconds)

      // NOTE: The function switchCurnetUrl(navurl) is assumed to be globally available on your site.
      // It will be called when a banner is clicked.

      // Fetch the banner configuration JSON file with no-cache
      function fetchBannerConfig() {
        // Append a timestamp query parameter to avoid caching
        fetch(configUrl + '?_=' + new Date().getTime(), { cache: "no-cache" })
          .then(response => response.json())
          .then(data => {
            bannersData = data;
            if (data.autoSlideInterval) {
              autoSlideTime = data.autoSlideInterval;
            }
            // Save the current slide index so we can attempt to restore it
            const previousIndex = currentSlideIndex;
            buildSlider(data.banners);
            // Restore the slide index if possible; otherwise, default to 0
            if (previousIndex < slidesWrapper.children.length) {
              currentSlideIndex = previousIndex;
            } else {
              currentSlideIndex = 0;
            }
            showSlide(currentSlideIndex);
            startAutoSlide();
          })
          .catch(error => console.error('Error loading banner config:', error));
      }

      // Build the slider using the banners array from JSON
      function buildSlider(banners) {
        if (!banners || banners.length === 0) {
          console.warn('No banners provided in the configuration.');
          return;
        }
        // Clear any existing slides
        slidesWrapper.innerHTML = '';

        banners.forEach((banner) => {
          // Create the slide container
          const slide = document.createElement('div');
          slide.className = 'slide';

          // Add an inline onclick attribute if a link is provided.
          // This calls the global switchCurnetUrl() function on your site.
          if (banner.link) {
            slide.setAttribute("onclick", "switchCurnetUrl(\"" + banner.link + "\")");
          }

          // Create a <picture> element for responsive images
          const picture = document.createElement('picture');

          // Add mobile image if provided
          if (banner.mobile_image) {
            const sourceMobile = document.createElement('source');
            sourceMobile.media = "(max-width: 767px)";
            sourceMobile.srcset = banner.mobile_image;
            picture.appendChild(sourceMobile);
          }
          // Add desktop image (default)
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

      // Show a specific slide by updating the transform property
      function showSlide(index) {
        const slidesCount = slidesWrapper.children.length;
        if (slidesCount === 0) return;

        // Wrap-around logic for the slide index
        if (index >= slidesCount) {
          currentSlideIndex = 0;
        } else if (index < 0) {
          currentSlideIndex = slidesCount - 1;
        } else {
          currentSlideIndex = index;
        }
        // Slide the wrapper horizontally
        slidesWrapper.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
      }

      // Start the auto-sliding functionality
      function startAutoSlide() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
          showSlide(currentSlideIndex + 1);
        }, autoSlideTime);
      }

      // Pause auto-slide on mouse enter and resume on mouse leave
      sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
      sliderContainer.addEventListener('mouseleave', () => startAutoSlide());

      // Left/right arrow button events
      document.querySelector('.arrow.prev').addEventListener('click', function(event) {
        event.stopPropagation();
        showSlide(currentSlideIndex - 1);
      });
      document.querySelector('.arrow.next').addEventListener('click', function(event) {
        event.stopPropagation();
        showSlide(currentSlideIndex + 1);
      });

      // Initial fetch of banner configuration
      fetchBannerConfig();
      // Periodically re-fetch the banner configuration every 10 seconds
      setInterval(fetchBannerConfig, 10000);
    })();
