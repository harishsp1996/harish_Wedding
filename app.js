// Global variables
let currentSection = 0;
let autoScrollTimer;
let galleryAutoTimer;
let currentGalleryImage = 0;
let isAutoScrolling = true;
let isMusicPlaying = false;
let touchStartX = 0;
let touchStartY = 0;
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    createParticles();
    setupEventListeners();
    startAutoScroll();
    startGalleryAutoPlay();
});

// Initialize app
function initializeApp() {
    // Ensure we have the correct number of sections
    console.log(`Found ${sections.length} sections and ${navDots.length} navigation dots`);
    
    // Show first section
    showSection(0);
    
    // Set initial volume
    if (backgroundMusic) {
        backgroundMusic.volume = 0.5;
    }
    
    // Update progress bar
    updateProgressBar();
    
    // Add cascade animations to hero text
    addCascadeAnimations();
    
    // Setup intersection observer for animations
    setupIntersectionObserver();
    
    // Optimize performance based on device
    optimizePerformance();
}

// Create particle system
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    // Create fewer particles on mobile for performance
    const particleCount = window.innerWidth < 768 ? 30 : 60;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random horizontal position
    particle.style.left = Math.random() * 100 + '%';
    
    // Random animation duration (slower for smoother effect)
    particle.style.animationDuration = (Math.random() * 4 + 8) + 's';
    
    // Random delay
    particle.style.animationDelay = Math.random() * 8 + 's';
    
    // Random size
    const size = Math.random() * 3 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Wedding color palette
    const colors = ['#DAA520', '#F4A460', '#B22222', '#8B0000'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    container.appendChild(particle);
    
    // Remove particle after animation and recreate
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
            createParticle(container);
        }
    }, 12000 + Math.random() * 4000);
}

// Setup event listeners
function setupEventListeners() {
    // Navigation dots - Fixed to properly handle clicks
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Navigation dot ${index} clicked`);
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
        
        // Pause video when leaving section
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
    
    // Gallery dots
    galleryDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showGalleryImage(index);
            pauseGalleryAutoPlay();
        });
    });
    
    // Touch events for gallery
    const galleryMain = document.querySelector('.gallery-main');
    if (galleryMain) {
        galleryMain.addEventListener('touchstart', handleTouchStart, { passive: false });
        galleryMain.addEventListener('touchmove', handleTouchMove, { passive: false });
        galleryMain.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    
    // Touch events for section navigation
    document.addEventListener('touchstart', handleSectionTouchStart, { passive: true });
    document.addEventListener('touchmove', handleSectionTouchMove, { passive: false });
    document.addEventListener('touchend', handleSectionTouchEnd, { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                goToPreviousSection();
                pauseAutoScroll();
                break;
            case 'ArrowDown':
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                goToNextSection();
                pauseAutoScroll();
                break;
            case 'Home':
                e.preventDefault();
                goToSection(0);
                pauseAutoScroll();
                break;
            case 'End':
                e.preventDefault();
                goToSection(sections.length - 1);
                pauseAutoScroll();
                break;
        }
    });
    
    // Mouse wheel navigation with throttling
    let wheelTimeout;
    document.addEventListener('wheel', (e) => {
        if (isScrolling) return;
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            if (Math.abs(e.deltaY) > 30) {
                e.preventDefault();
                isScrolling = true;
                
                if (e.deltaY > 0) {
                    goToNextSection();
                } else {
                    goToPreviousSection();
                }
                pauseAutoScroll();
                
                setTimeout(() => {
                    isScrolling = false;
                }, 800);
            }
        }, 50);
    }, { passive: false });
    
    // Window resize
    window.addEventListener('resize', debounce(() => {
        updateProgressBar();
        optimizePerformance();
    }, 300));
    
    // Error handling for images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', handleImageError);
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
    });
    
    // Error handling for audio
    if (backgroundMusic) {
        backgroundMusic.addEventListener('error', handleAudioError);
        backgroundMusic.addEventListener('canplaythrough', () => {
            musicToggle.style.opacity = '1';
        });
    }
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle online/offline events
    window.addEventListener('online', () => {
        showNotification('Connection restored', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNotification('Connection lost. Some features may not work.', 'warning');
    });
}

// Section navigation functions with smooth transitions - Fixed
function showSection(index) {
    console.log(`Attempting to show section ${index}, current: ${currentSection}`);
    
    if (index < 0 || index >= sections.length || index === currentSection) {
        console.log(`Invalid section index ${index} or already showing`);
        return;
    }
    
    // Hide all sections immediately
    sections.forEach((section, i) => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Show target section
    if (sections[index]) {
        sections[index].style.display = 'flex';
        // Use setTimeout to ensure display change is applied before adding active class
        setTimeout(() => {
            sections[index].classList.add('active');
        }, 10);
        
        currentSection = index;
        console.log(`Successfully showing section ${index}`);
        
        // Update UI elements
        updateNavDots();
        updateProgressBar();
        
        // Add special effects for hero section
        if (index === 0) {
            setTimeout(() => {
                addCascadeAnimations();
            }, 100);
        }
        
        // Pause video when leaving video section
        if (weddingVideo && currentSection !== 3) {
            weddingVideo.pause();
        }
        
        // Trigger section-specific animations
        triggerSectionAnimations(index);
    }
}

function goToSection(index) {
    console.log(`goToSection called with index: ${index}`);
    if (index >= 0 && index < sections.length) {
        showSection(index);
    }
}

function goToNextSection() {
    const nextIndex = (currentSection + 1) % sections.length;
    console.log(`Going to next section: ${nextIndex}`);
    goToSection(nextIndex);
}

function goToPreviousSection() {
    const prevIndex = currentSection === 0 ? sections.length - 1 : currentSection - 1;
    console.log(`Going to previous section: ${prevIndex}`);
    goToSection(prevIndex);
}

function updateNavDots() {
    navDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSection);
        dot.setAttribute('aria-pressed', index === currentSection);
    });
    console.log(`Updated nav dots, current section: ${currentSection}`);
}

function updateProgressBar() {
    if (progressFill) {
        const progress = ((currentSection + 1) / sections.length) * 100;
        progressFill.style.width = progress + '%';
    }
}

// Auto-scroll functionality
function startAutoScroll() {
    if (autoScrollTimer) {
        clearInterval(autoScrollTimer);
    }
    
    autoScrollTimer = setInterval(() => {
        if (isAutoScrolling && !document.hidden) {
            goToNextSection();
        }
    }, 10000); // 10 seconds per section
}

function pauseAutoScroll() {
    isAutoScrolling = false;
    
    // Resume after 20 seconds
    setTimeout(() => {
        isAutoScrolling = true;
    }, 20000);
}

function toggleAutoScroll() {
    isAutoScrolling = !isAutoScrolling;
    showNotification(
        isAutoScrolling ? 'Auto-scroll enabled' : 'Auto-scroll disabled',
        'info'
    );
}

// Music functions
function toggleMusic() {
    if (!backgroundMusic) return;
    
    if (isMusicPlaying) {
        backgroundMusic.pause();
        musicToggle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
        `;
        musicToggle.style.animation = 'none';
    } else {
        const playPromise = backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicToggle.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                `;
                musicToggle.style.animation = 'pulse 3s infinite';
            }).catch(error => {
                console.log('Audio play failed:', error);
                showNotification('Click to enable audio', 'info');
            });
        }
    }
    
    isMusicPlaying = !isMusicPlaying;
}

// Video functions
function playVideo() {
    if (weddingVideo && videoOverlay) {
        videoOverlay.classList.add('hidden');
        const playPromise = weddingVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Video play failed:', error);
                videoOverlay.classList.remove('hidden');
                showNotification('Unable to play video', 'error');
            });
        }
    }
}

// Gallery functions with smooth transitions
function showGalleryImage(index) {
    if (index < 0 || index >= galleryImages.length) return;
    
    // Hide all images
    galleryImages.forEach((img, i) => {
        img.classList.remove('active');
    });
    
    // Show target image
    setTimeout(() => {
        galleryImages[index].classList.add('active');
        currentGalleryImage = index;
        updateGalleryDots();
    }, 50);
}

function showNextImage() {
    const nextIndex = (currentGalleryImage + 1) % galleryImages.length;
    showGalleryImage(nextIndex);
}

function showPreviousImage() {
    const prevIndex = currentGalleryImage === 0 ? galleryImages.length - 1 : currentGalleryImage - 1;
    showGalleryImage(prevIndex);
}

function updateGalleryDots() {
    galleryDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentGalleryImage);
        dot.setAttribute('aria-pressed', index === currentGalleryImage);
    });
}

function startGalleryAutoPlay() {
    if (galleryAutoTimer) {
        clearInterval(galleryAutoTimer);
    }
    
    galleryAutoTimer = setInterval(() => {
        if (!document.hidden) {
            showNextImage();
        }
    }, 5000);
}

function pauseGalleryAutoPlay() {
    if (galleryAutoTimer) {
        clearInterval(galleryAutoTimer);
    }
    
    // Resume after 15 seconds
    setTimeout(() => {
        startGalleryAutoPlay();
    }, 15000);
}

// Touch handling for section navigation
let sectionTouchStartX = 0;
let sectionTouchStartY = 0;

function handleSectionTouchStart(e) {
    const firstTouch = e.touches[0];
    sectionTouchStartX = firstTouch.clientX;
    sectionTouchStartY = firstTouch.clientY;
}

function handleSectionTouchMove(e) {
    // Prevent default only for vertical swipes to avoid interfering with horizontal swipes in gallery
    const touch = e.touches[0];
    const diffX = Math.abs(sectionTouchStartX - touch.clientX);
    const diffY = Math.abs(sectionTouchStartY - touch.clientY);
    
    if (diffY > diffX && diffY > 30) {
        e.preventDefault();
    }
}

function handleSectionTouchEnd(e) {
    if (!sectionTouchStartX || !sectionTouchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = sectionTouchStartX - touchEndX;
    const diffY = sectionTouchStartY - touchEndY;
    
    // Detect vertical swipe
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
        if (diffY > 0) {
            // Swiped up - next section
            goToNextSection();
        } else {
            // Swiped down - previous section
            goToPreviousSection();
        }
        pauseAutoScroll();
    }
    
    // Reset values
    sectionTouchStartX = 0;
    sectionTouchStartY = 0;
}

// Touch handling for gallery
function handleTouchStart(e) {
    const firstTouch = e.touches[0];
    touchStartX = firstTouch.clientX;
    touchStartY = firstTouch.clientY;
}

function handleTouchMove(e) {
    // Prevent default for horizontal swipes in gallery
    const touch = e.touches[0];
    const diffX = Math.abs(touchStartX - touch.clientX);
    const diffY = Math.abs(touchStartY - touch.clientY);
    
    if (diffX > diffY) {
        e.preventDefault();
    }
}

function handleTouchEnd(e) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Detect horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
            // Swiped left - next image
            showNextImage();
        } else {
            // Swiped right - previous image
            showPreviousImage();
        }
        pauseGalleryAutoPlay();
    }
    
    // Reset values
    touchStartX = 0;
    touchStartY = 0;
}

// Animation functions
function addCascadeAnimations() {
    const cascadeElements = document.querySelectorAll('[class*="cascade-"]');
    cascadeElements.forEach((element, index) => {
        element.style.animationDelay = (index * 0.4 + 0.5) + 's';
    });
}

function triggerSectionAnimations(sectionIndex) {
    const section = sections[sectionIndex];
    const animatedElements = section.querySelectorAll('.blessing-card, .timeline-item, .venue-card, .gratitude-card');
    
    animatedElements.forEach((element, index) => {
        element.style.animationDelay = (index * 0.2) + 's';
        element.classList.add('animate-in');
    });
}

// Intersection Observer for section animations
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                entry.target.style.animation = 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            }
        });
    }, observerOptions);
    
    // Observe all cards and timeline items
    document.querySelectorAll('.blessing-card, .timeline-item, .venue-card, .gratitude-card').forEach(element => {
        observer.observe(element);
    });
}

// Performance optimization
function optimizePerformance() {
    // Reduce particle count on mobile and low-end devices
    if (window.innerWidth < 768 || navigator.hardwareConcurrency < 4) {
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            if (index > 20) {
                particle.remove();
            }
        });
    }
    
    // Disable complex animations on low-end devices
    if (navigator.hardwareConcurrency < 4) {
        document.body.classList.add('reduce-motion');
    }
    
    // Lazy load images
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.opacity = '0';
                    img.addEventListener('load', () => {
                        img.style.transition = 'opacity 0.3s ease';
                        img.style.opacity = '1';
                    });
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Handle page visibility changes
function handleVisibilityChange() {
    if (document.hidden) {
        // Pause animations and music when tab is not visible
        if (backgroundMusic && isMusicPlaying) {
            backgroundMusic.pause();
        }
        isAutoScrolling = false;
        
        // Pause video
        if (weddingVideo) {
            weddingVideo.pause();
        }
    } else {
        // Resume when tab becomes visible
        if (backgroundMusic && isMusicPlaying) {
            backgroundMusic.play().catch(console.log);
        }
        isAutoScrolling = true;
    }
}

// Error handling functions
function handleImageError(e) {
    const img = e.target;
    img.style.display = 'none';
    
    // Create elegant placeholder
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #FFF8DC, #FFFACD);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #8B0000;
        font-size: 1.2rem;
        position: absolute;
        top: 0;
        left: 0;
        border: 2px dashed #DAA520;
        border-radius: 10px;
    `;
    placeholder.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📸</div>
            <div>Image Loading...</div>
        </div>
    `;
    
    img.parentNode.style.position = 'relative';
    img.parentNode.appendChild(placeholder);
}

function handleAudioError(e) {
    console.log('Audio loading failed:', e);
    if (musicToggle) {
        musicToggle.style.opacity = '0.5';
        musicToggle.style.cursor = 'not-allowed';
        musicToggle.title = 'Audio not available';
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        info: { bg: '#8B0000', border: '#B22222' },
        success: { bg: '#2E7D32', border: '#4CAF50' },
        warning: { bg: '#F57C00', border: '#FF9800' },
        error: { bg: '#D32F2F', border: '#F44336' }
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${colors[type].bg};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        border: 2px solid ${colors[type].border};
        z-index: 1000;
        font-size: 1rem;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: fadeInUp 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize when page loads
window.addEventListener('load', () => {
    setupIntersectionObserver();
    optimizePerformance();
    
    // Preload critical resources
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            preloadResources();
        });
    } else {
        setTimeout(preloadResources, 1000);
    }
});

function preloadResources() {
    // Preload next section images
    const nextSectionImages = sections[1]?.querySelectorAll('img');
    nextSectionImages?.forEach(img => {
        if (img.dataset.src) {
            const preloadImg = new Image();
            preloadImg.src = img.dataset.src;
        }
    });
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
        transition-duration: 0.01ms !important;
    }
`;
document.head.appendChild(style);
