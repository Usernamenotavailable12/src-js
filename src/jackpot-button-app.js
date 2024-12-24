let currentIndex = 0; // Start with the first iframe
let slideInterval;

function showNextSlide() {
  const iframesJp = [
    document.getElementById("iframePNG"),
    document.getElementById("iframe2Amusnet"),
    document.getElementById("iframe3New"),
    document.getElementById("iframe1Digital"),
  ];

  // Hide all iframes first
  iframesJp.forEach((iframe) => {
    if (iframe && iframe.style) {
      // Check if the iframe exists and has a style property
      iframe.style.display = "none";
    }
  });

  // Show the next iframe
  currentIndex = (currentIndex + 1) % iframesJp.length;
  if (iframesJp[currentIndex] && iframesJp[currentIndex].style) {
    iframesJp[currentIndex].style.display = "block";
  }

  resetInterval();
}

function resetInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(showNextSlide, 16000);
}

window.showNextSlide = showNextSlide;

// Initial setup to ensure only the first iframe is visible
document.addEventListener("DOMContentLoaded", () => {
  const iframesJp = [
    document.getElementById("iframePNG"),
    document.getElementById("iframe2Amusnet"),
    document.getElementById("iframe3New"),
    document.getElementById("iframe1Digital"),
  ];

  iframesJp.forEach((iframe, index) => {
    if (iframe && iframe.style) {
      // Check if the iframe exists and has a style property
      iframe.style.display = index === 0 ? "block" : "none";
    }
  });

  resetInterval();
});
