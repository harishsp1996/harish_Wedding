// DOM elements
const musicToggle = document.getElementById("musicToggle");
const volumeSlider = document.getElementById("volumeSlider");
const backgroundMusic = document.getElementById("backgroundMusic");
const weddingVideo = document.getElementById("weddingVideo");
const galleryImages = document.querySelectorAll(".gallery-image");

let isMusicPlaying = false;
let currentGalleryImage = 0;

// Music controls
if (musicToggle) {
  musicToggle.addEventListener("click", toggleMusic);
}
if (volumeSlider) {
  volumeSlider.addEventListener("input", (e) => {
    backgroundMusic.volume = e.target.value;
  });
}

function toggleMusic() {
  if (!backgroundMusic) return;

  if (isMusicPlaying) {
    backgroundMusic.pause();
    if (weddingVideo) weddingVideo.muted = false;
  } else {
    backgroundMusic.play();
    if (weddingVideo) weddingVideo.muted = true;
  }

  isMusicPlaying = !isMusicPlaying;
}

// Simple gallery controls (auto rotate every 5s)
setInterval(() => {
  galleryImages[currentGalleryImage].classList.remove("active");
  currentGalleryImage = (currentGalleryImage + 1) % galleryImages.length;
  galleryImages[currentGalleryImage].classList.add("active");
}, 5000);
