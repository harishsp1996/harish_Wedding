let slideIndex = 0;
const slides = document.getElementsByClassName("slide");

function showSlides() {
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  slideIndex++;
  if (slideIndex > slides.length) { slideIndex = 1; }

  slides[slideIndex - 1].style.display = "block";
  slides[slideIndex - 1].style.opacity = 0;
  let opacity = 0;
  const fadeIn = setInterval(() => {
    if (opacity >= 1) clearInterval(fadeIn);
    slides[slideIndex - 1].style.opacity = opacity;
    opacity += 0.05;
  }, 50);

  setTimeout(showSlides, 4000); // Change every 4s
}

showSlides();
