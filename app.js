// Global variables
let currentSection = 0;
let autoScrollTimer;
let galleryAutoTimer;
let currentGalleryImage = 0;
let isAutoScrolling = true;
let isMusicPlaying = false;
let isScrolling = false;

// DOM elements
const sections = document.querySelectorAll('.section');
const navDots = document.querySelectorAll('.nav-dot');
const musicToggle = document.getElementById('musicToggle');
const volumeSlider = document.getElementById('volumeSlider');
const backgroundMusic = document.getElementById('backgroundMusic');
const progressFill = document.querySelector('.progress-fill');
const playButton = document.getElementById('playButton');
const videoOverlay = document.getElementById('videoOverlay');
const weddingVideo = document.getElementById('weddingVideo');
const galleryImages = document.querySelectorAll('.gallery-image');
const galleryDots = document.querySelectorAll('.gallery-dot');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const venueMap = document.getElementById('venueMap');
const mapContainer = document.getElementById('mapContainer');
const venueLocation = document.getElementById('venueLocation');
const autoScrollToggle = document.getElementById('autoScrollToggle');

// Define constants for auto-scroll and map
const AUTO_SCROLL_DELAY = 12000; // 12 seconds per section for a very slow, smooth pace
const MAP_COORDINATES = { lat: 12.9716, lng: 77.5946 }; // Example: Bangalore, India coordinates
const MAP_ZOOM = 15; // Initial map zoom level
let map; // Google Maps instance

// Initialize the application on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    createParticles();
    createFloatingDecorations(); // New function for floating decor
    setupEventListeners();
    startAutoScroll();
    startGalleryAutoPlay();
    initMap(); // Initialize the Google Map
});

// Initialize the app functions
function initializeApp() {
    console.log(`Found ${sections.length} sections and ${navDots.length} navigation dots`);
    showSection(0);
    if (backgroundMusic) {
        backgroundMusic.volume = 0.5;
    }
    updateProgressBar();
    addCascadeAnimations();
    setupIntersectionObserver();
    optimizePerformance();
}

// Create and manage a particle system for visual flair
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    // Use fewer particles on mobile for performance
    const particleCount = window.innerWidth < 768 ? 20 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Choose a random wedding-themed icon
    const icons = ['&#x2764;&#xfe0f;', '&#x1F48D;', '&#x1F496;', '&#x1F389;']; // Heart, Ring, Sparkling Heart, Confetti
    particle.innerHTML = icons[Math.floor(Math.random() * icons.length)];
    
    // Random horizontal position
    particle.style.left = Math.random() * 100 + '%';
    // Random animation duration (slower for smoother effect)
    particle.style.animationDuration = (Math.random() * 5 + 10) + 's';
    // Random delay
    particle.style.animationDelay = Math.random() * 10 + 's';
    // Random size
    const size = Math.random() * 20 + 10;
    particle.style.fontSize = size + 'px';
    
    container.appendChild(particle);
    
    // Remove particle after animation and recreate
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
            createParticle(container);
        }
    }, 15000 + Math.random() * 5000);
}

// Create and manage floating decorative elements
function createFloatingDecorations() {
    const decorationsContainer = document.querySelector('.floating-decorations');
    if (!decorationsContainer) return;
    
    const decorationCount = window.innerWidth < 768 ? 5 : 10;
    
    for (let i = 0; i < decorationCount; i++) {
        createDecoration(decorationsContainer, i);
    }
}

function createDecoration(container, index) {
    const decoration = document.createElement('div');
    decoration.classList.add('decoration');
    
    // Choose a specific decorative icon
    const icons = ['&#x1F48D;', '&#x1F491;']; // Ring and Couple with Heart
    const icon = icons[index % icons.length];
    
    decoration.innerHTML = icon;
    
    // Randomize initial position
    decoration.style.left = Math.random() * 100 + '%';
    decoration.style.top = Math.random() * 100 + '%';
    decoration.style.animationDuration = (Math.random() * 8 + 15) + 's';
    decoration.style.animationDelay = Math.random() * 10 + 's';
    
    container.appendChild(decoration);
}

// Set up all event listeners for user interaction
function setupEventListeners() {
    // Navigation dots
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            goToSection(index);
            pauseAutoScroll();
        });
    });
    
    // Music controls
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            if (backgroundMusic) {
                backgroundMusic.volume = e.target.value;
            }
        });
    }

    // Video controls
    if (playButton && videoOverlay && weddingVideo) {
        playButton.addEventListener('click', playVideo);
        videoOverlay.addEventListener('click', playVideo);
        weddingVideo.addEventListener('ended', () => {
            videoOverlay.classList.remove('hidden');
        });
        weddingVideo.addEventListener('pause', () => {
            videoOverlay.classList.remove('hidden');
        });
    }

    // Gallery controls
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            showPreviousImage();
            pauseGalleryAutoPlay();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            showNextImage();
            pauseGalleryAutoPlay();
        });
    }
    galleryDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showGalleryImage(index);
            pauseGalleryAutoPlay();
        });
    });

    // Touch and scroll event listeners for graceful auto-scroll pausing
    window.addEventListener('wheel', pauseAutoScrollAndHandleScroll);
    window.addEventListener('touchmove', pauseAutoScrollAndHandleScroll);
    
    // Auto-scroll toggle button
    if (autoScrollToggle) {
        autoScrollToggle.addEventListener('click', toggleAutoScroll);
    }

    // Initialize map link if it exists
    if (venueLocation) {
        venueLocation.addEventListener('click', (e) => {
            e.preventDefault();
            const url = `https://www.google.com/maps/dir/?api=1&destination=${MAP_COORDINATES.lat},${MAP_COORDINATES.lng}`;
            window.open(url, '_blank');
        });
    }
}

// Handle scroll events and pause auto-scroll
let scrollTimeout;
function pauseAutoScrollAndHandleScroll() {
    pauseAutoScroll();
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        // Only restart if the user has stopped scrolling and auto-scroll is enabled
        if (isAutoScrolling) {
            startAutoScroll();
        }
    }, 5000); // Wait 5 seconds after last scroll to resume
}

// Smoothly scrolls to a specified section by index
function goToSection(index) {
    if (index < 0 || index >= sections.length) {
        return;
    }
    currentSection = index;
    showSection(currentSection);
    // Smooth scroll to the section
    sections[currentSection].scrollIntoView({ behavior: 'smooth' });
    updateProgressBar();
    updateActiveNavDot();
}

// Shows the specified section and hides others
function showSection(index) {
    sections.forEach((section, i) => {
        section.classList.toggle('active', i === index);
    });
    // Dispatch a custom event for section change
    document.dispatchEvent(new CustomEvent('sectionChange', { detail: { sectionIndex: index } }));
}

// Starts the automatic page scrolling
function startAutoScroll() {
    if (isAutoScrolling) {
        autoScrollTimer = setInterval(() => {
            currentSection = (currentSection + 1) % sections.length;
            goToSection(currentSection);
        }, AUTO_SCROLL_DELAY);
    }
}

// Pauses the automatic page scrolling
function pauseAutoScroll() {
    if (autoScrollTimer) {
        clearInterval(autoScrollTimer);
        autoScrollTimer = null;
        isAutoScrolling = false;
        if (autoScrollToggle) {
            autoScrollToggle.querySelector('.toggle-icon').textContent = '▶️';
            showNotification('Auto-scroll paused');
        }
    }
}

// Toggles the auto-scroll on and off
function toggleAutoScroll() {
    if (isAutoScrolling) {
        pauseAutoScroll();
    } else {
        isAutoScrolling = true;
        startAutoScroll();
        if (autoScrollToggle) {
            autoScrollToggle.querySelector('.toggle-icon').textContent = '⏸️';
            showNotification('Auto-scroll resumed');
        }
    }
}

// Toggles background music on and off
function toggleMusic() {
    if (!backgroundMusic) return;

    if (isMusicPlaying) {
        backgroundMusic.pause();
        musicToggle.classList.remove('playing');
        showNotification('Music paused');
    } else {
        backgroundMusic.play().catch(error => {
            console.error('Playback failed:', error);
            showNotification('Music playback blocked by browser. Please interact with the page to enable.');
        });
        musicToggle.classList.add('playing');
        showNotification('Music playing');
    }
    isMusicPlaying = !isMusicPlaying;
}

// Updates the navigation dots to reflect the current section
function updateActiveNavDot() {
    navDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSection);
    });
}

// Updates the progress bar at the bottom of the page
function updateProgressBar() {
    if (progressFill) {
        const progress = (currentSection / (sections.length - 1)) * 100;
        progressFill.style.width = `${progress}%`;
    }
}

// Plays the wedding video
function playVideo() {
    if (weddingVideo) {
        videoOverlay.classList.add('hidden');
        weddingVideo.play();
        pauseAutoScroll();
    }
}

// Gallery functions
function showGalleryImage(index) {
    if (index < 0 || index >= galleryImages.length) {
        return;
    }
    currentGalleryImage = index;
    galleryImages.forEach((img, i) => {
        img.classList.toggle('active', i === currentGalleryImage);
    });
    galleryDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentGalleryImage);
    });
}

function showNextImage() {
    currentGalleryImage = (currentGalleryImage + 1) % galleryImages.length;
    showGalleryImage(currentGalleryImage);
}

function showPreviousImage() {
    currentGalleryImage = (currentGalleryImage - 1 + galleryImages.length) % galleryImages.length;
    showGalleryImage(currentGalleryImage);
}

// Gallery autoplay
function startGalleryAutoPlay() {
    galleryAutoTimer = setInterval(() => {
        showNextImage();
    }, 5000);
}

function pauseGalleryAutoPlay() {
    if (galleryAutoTimer) {
        clearInterval(galleryAutoTimer);
    }
}

// Intersection Observer for on-scroll animations
function setupIntersectionObserver() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
            } else {
                entry.target.classList.remove('animate-visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Cascade animations for hero text
function addCascadeAnimations() {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    const welcomeHeading = heroContent.querySelector('.welcome-heading');
    const groomName = heroContent.querySelector('.groom-name');
    const heartDivider = heroContent.querySelector('.heart-divider');
    const brideName = heroContent.querySelector('.bride-name');
    const dateText = heroContent.querySelector('.date-text');

    setTimeout(() => {
        if (welcomeHeading) welcomeHeading.classList.add('animate-in');
    }, 500);
    setTimeout(() => {
        if (groomName) groomName.classList.add('animate-in');
    }, 800);
    setTimeout(() => {
        if (heartDivider) heartDivider.classList.add('animate-in');
    }, 1100);
    setTimeout(() => {
        if (brideName) brideName.classList.add('animate-in');
    }, 1400);
    setTimeout(() => {
        if (dateText) dateText.classList.add('animate-in');
    }, 1700);
}

// Function to show temporary notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        notification.addEventListener('animationend', () => {
            notification.remove();
        });
    }, 2000);
}

// Google Maps initialization
async function initMap() {
    // Check if map container exists
    if (!mapContainer) return;

    // Load the Google Maps API script
    const googleMapsScript = document.createElement('script');
    // Using a placeholder API key. In a real application, you would use a real key.
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMapCallback`;
    googleMapsScript.async = true;
    document.head.appendChild(googleMapsScript);
}

// Callback function to be called by the Google Maps API script
window.initMapCallback = function() {
    const mapOptions = {
        center: MAP_COORDINATES,
        zoom: MAP_ZOOM,
        disableDefaultUI: true, // Hides all default UI controls
        mapId: "VENUE_MAP_STYLE" // Optional: custom map style ID
    };

    map = new google.maps.Map(mapContainer, mapOptions);

    // Add a custom marker
    new google.maps.Marker({
        position: MAP_COORDINATES,
        map: map,
        title: "Wedding Venue",
    });
    
    console.log('Google Map initialized successfully.');
};

// Optimizations for different devices
function optimizePerformance() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduce-motion');
    }
}

// Cleanup function
window.addEventListener('beforeunload', () => {
    if (autoScrollTimer) clearInterval(autoScrollTimer);
    if (galleryAutoTimer) clearInterval(galleryAutoTimer);
    if (backgroundMusic) backgroundMusic.pause();
    if (weddingVideo) weddingVideo.pause();
});

// Debug functions (for development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugWedding = {
        goToSection,
        toggleAutoScroll,
        showGalleryImage,
        currentSection: () => currentSection,
        currentGalleryImage: () => currentGalleryImage,
        isAutoScrolling: () => isAutoScrolling,
        showNotification,
        sections: sections.length
    };
    
    console.log('🎉 Wedding Website Debug Mode Enabled');
    console.log('Available commands: window.debugWedding');
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
    
    .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
    }
`;
document.head.appendChild(style);
