// Gallery Auto Slideshow
const slideshow = document.querySelector('.slideshow');

// Add images dynamically (upload your images into assets/photos/)
const images = [
  "assets/photos/photo1.jpg",
  "assets/photos/photo2.jpg",
  "assets/photos/photo3.jpg",
  "assets/photos/photo4.jpg"
];

images.forEach(src => {
  const img = document.createElement('img');
  img.src = src;
  slideshow.appendChild(img);
});

let index = 0;
const slides = document.querySelectorAll('.slideshow img');
slides[0].classList.add('active');

setInterval(() => {
  slides[index].classList.remove('active');
  index = (index + 1) % slides.length;
  slides[index].classList.add('active');
}, 4000);
