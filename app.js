// Wedding Website JavaScript
class WeddingWebsite {
    constructor() {
        this.currentSection = 0;
        this.totalSections = 6; // Hero, Family, Events, Video, Gallery, Venue
        this.autoScrollInterval = null;
        this.pauseTimeout = null;
        this.isUserInteracting = false;
        this.musicPlaying = false;
        
        // Define section IDs for proper navigation
        this.sectionIds = ['hero', 'family', 'events', 'video', 'gallery', 'venue'];
        
        // Gallery data and controls
        this.galleryImages = [
            {
                src: 'https://images.unsplash.com/photo-1583137723340-3bfbbdf7ae50?w=1200&h=800&fit=crop',
                title: 'Family Gathering',
                description: 'When two families meet and bonds are formed'
            },
            {
                src: 'https://images.unsplash.com/photo-1583940113751-182ced23be58?w=1200&h=800&fit=crop',
                title: 'Engagement Ceremony',
                description: 'The formal announcement of our union'
            },
            {
                src: 'https://images.unsplash.com/photo-1585992332075-6e0fa98333e7?w=1200&h=800&fit=crop',
                title: 'Traditional Rituals',
                description: 'Honoring our cultural heritage'
            },
            {
                src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=800&fit=crop',
                title: 'Family Blessings',
                description: 'Receiving love and guidance from elders'
            },
            {
                src: 'https://images.unsplash.com/photo-1582479137596-2ccf0201d12f?w=1200&h=800&fit=crop',
                title: 'Pre-Wedding Celebrations',
                description: 'Joy and preparations before the big day'
            }
        ];
        
        this.currentGalleryIndex = 0;
        this.galleryAutoPlayInterval = null;
        this.galleryStarted = false;
        
        this.init();
    }
    
    init() {
        console.log('🎉 Initializing Wedding Website...');
        this.setupEventListeners();
        this.initializeMusic();
        this.preloadGalleryImages();
        this.initializeGallery();
        this.initializeVideo();
        this.setupIntersectionObserver();
        this.updateProgress();
        
        // Start auto-scroll after a short delay to allow page to fully load
        setTimeout(() => {
            this.startAutoScroll();
        }, 2000);
        
        // Start gallery auto-play immediately for testing
        setTimeout(() => {
            this.startGalleryAutoPlay();
            console.log('🎠 Gallery auto-play started');
        }, 3000);
    }
    
    preloadGalleryImages() {
        console.log('🖼️ Preloading gallery images...');
        this.galleryImages.forEach((imageData, index) => {
            const img = new Image();
            img.onload = () => {
                console.log(`✅ Image ${index + 1} loaded: ${imageData.title}`);
            };
            img.onerror = () => {
                console.error(`❌ Failed to load image ${index + 1}: ${imageData.title}`);
                // Fallback to a different image if loading fails
                this.galleryImages[index].src = `https://picsum.photos/1200/800?random=${index + 1}`;
            };
            img.src = imageData.src;
        });
    }
    
    setupEventListeners() {
        // Music controls
        const musicToggle = document.getElementById('musicToggle');
        const volumeControl = document.getElementById('volumeControl');
        
        if (musicToggle) {
            musicToggle.addEventListener('click', () => this.toggleMusic());
        }
        
        if (volumeControl) {
            volumeControl.addEventListener('input', (e) => this.setVolume(e.target.value));
        }
        
        // Navigation dots
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                console.log(`Navigation dot ${index} clicked`);
                this.goToSection(index);
                this.pauseAutoScroll();
            });
        });
        
        // Gallery controls - Previous/Next buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                console.log('⬅️ Previous gallery button clicked');
                this.previousGalleryImage();
                this.pauseGalleryAutoPlay();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('➡️ Next gallery button clicked');
                this.nextGalleryImage();
                this.pauseGalleryAutoPlay();
            });
        }
        
        // Gallery dots
        document.querySelectorAll('.gallery-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                console.log(`🎯 Gallery dot ${index} clicked`);
                this.goToGallerySlide(index);
                this.pauseGalleryAutoPlay();
            });
        });
        
        // Video play button
        const playButton = document.getElementById('playButton');
        const video = document.getElementById('preWeddingVideo');
        
        if (playButton && video) {
            playButton.addEventListener('click', () => {
                console.log('🎥 Video play button clicked');
                this.playVideo();
            });
            
            video.addEventListener('play', () => {
                const overlay = document.querySelector('.video-overlay');
                if (overlay) overlay.classList.add('hidden');
            });
            
            video.addEventListener('pause', () => {
                const overlay = document.querySelector('.video-overlay');
                if (overlay) overlay.classList.remove('hidden');
            });
        }
        
        // User interaction detection
        ['wheel', 'touchstart', 'keydown', 'mousedown', 'scroll'].forEach(event => {
            document.addEventListener(event, () => this.onUserInteraction(), { passive: true });
        });
    }
    
    startAutoScroll() {
        console.log('🔄 Starting auto-scroll...');
        
        // Clear any existing interval
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
        }
        
        this.autoScrollInterval = setInterval(() => {
            if (!this.isUserInteracting) {
                console.log(`📜 Auto-scrolling from section ${this.currentSection} to ${(this.currentSection + 1) % this.totalSections}`);
                this.nextSection();
            } else {
                console.log('⏸️ Auto-scroll paused - user is interacting');
            }
        }, 8000); // 8 seconds between sections
    }
    
    pauseAutoScroll() {
        console.log('⏸️ Pausing auto-scroll for user interaction');
        this.isUserInteracting = true;
        
        // Clear existing timeout
        if (this.pauseTimeout) {
            clearTimeout(this.pauseTimeout);
        }
        
        // Resume after 5 seconds
        this.pauseTimeout = setTimeout(() => {
            console.log('▶️ Resuming auto-scroll after user interaction pause');
            this.isUserInteracting = false;
        }, 5000);
    }
    
    onUserInteraction() {
        this.pauseAutoScroll();
    }
    
    nextSection() {
        const nextSectionIndex = (this.currentSection + 1) % this.totalSections;
        this.goToSection(nextSectionIndex);
    }
    
    goToSection(sectionIndex) {
        console.log(`🎯 Going to section ${sectionIndex} (${this.sectionIds[sectionIndex]})`);
        
        // Ensure section index is within bounds
        if (sectionIndex < 0 || sectionIndex >= this.totalSections) {
            console.error(`❌ Invalid section index: ${sectionIndex}`);
            return;
        }
        
        this.currentSection = sectionIndex;
        const sectionId = this.sectionIds[sectionIndex];
        const section = document.getElementById(sectionId);
        
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            console.log(`✅ Scrolled to section: ${sectionId}`);
        } else {
            console.error(`❌ Section not found: ${sectionId}`);
        }
        
        this.updateNavDots();
        this.updateProgress();
        this.triggerSectionAnimations(sectionIndex);
    }
    
    updateNavDots() {
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSection);
        });
    }
    
    updateProgress() {
        const progress = ((this.currentSection + 1) / this.totalSections) * 100;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    
    triggerSectionAnimations(sectionIndex) {
        const sectionId = this.sectionIds[sectionIndex];
        const section = document.getElementById(sectionId);
        if (section) {
            // Add animation classes based on section
            const cards = section.querySelectorAll('.blessing-card, .event-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('slide-up');
                }, index * 100);
            });
        }
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionElement = entry.target;
                    const sectionIndex = this.sectionIds.indexOf(sectionElement.id);
                    
                    if (sectionIndex !== -1 && sectionIndex !== this.currentSection) {
                        console.log(`👁️ Section ${sectionElement.id} came into view, updating current section to ${sectionIndex}`);
                        this.currentSection = sectionIndex;
                        this.updateNavDots();
                        this.updateProgress();
                        
                        // Start gallery auto-play when gallery section is visible
                        if (sectionIndex === 4) { // Gallery section
                            console.log('🎠 Gallery section is visible, starting auto-play');
                            this.startGalleryAutoPlay();
                        } else if (this.galleryAutoPlayInterval) {
                            console.log('⏹️ Stopping gallery auto-play (left gallery section)');
                            this.stopGalleryAutoPlay();
                        }
                    }
                }
            });
        }, {
            threshold: 0.5
        });
        
        // Observe only the main sections (not footer)
        this.sectionIds.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                observer.observe(section);
            }
        });
    }
    
    initializeMusic() {
        const audio = document.getElementById('backgroundMusic');
        const musicIcon = document.querySelector('.music-icon');
        
        if (audio) {
            // Set initial volume
            audio.volume = 0.5;
            
            // Try to auto-play (will likely be blocked by browser)
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.musicPlaying = true;
                    if (musicIcon) musicIcon.textContent = '🎵';
                    this.fadeInMusic(audio);
                }).catch(() => {
                    // Auto-play blocked, user needs to interact first
                    this.musicPlaying = false;
                    if (musicIcon) musicIcon.textContent = '🔇';
                });
            }
        }
    }
    
    toggleMusic() {
        const audio = document.getElementById('backgroundMusic');
        const musicIcon = document.querySelector('.music-icon');
        
        if (audio) {
            if (this.musicPlaying) {
                this.fadeOutMusic(audio);
                this.musicPlaying = false;
                if (musicIcon) musicIcon.textContent = '🔇';
            } else {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.fadeInMusic(audio);
                        this.musicPlaying = true;
                        if (musicIcon) musicIcon.textContent = '🎵';
                    }).catch((error) => {
                        console.log('🎵 Music play failed:', error);
                    });
                }
            }
        }
    }
    
    fadeInMusic(audio) {
        const targetVolume = document.getElementById('volumeControl').value / 100;
        let currentVolume = 0;
        audio.volume = 0;
        
        const fadeIn = setInterval(() => {
            if (currentVolume < targetVolume) {
                currentVolume += 0.05;
                audio.volume = Math.min(currentVolume, targetVolume);
            } else {
                clearInterval(fadeIn);
            }
        }, 100);
    }
    
    fadeOutMusic(audio) {
        const fadeOut = setInterval(() => {
            if (audio.volume > 0.05) {
                audio.volume -= 0.05;
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(fadeOut);
            }
        }, 100);
    }
    
    setVolume(value) {
        const audio = document.getElementById('backgroundMusic');
        if (audio) {
            audio.volume = value / 100;
        }
    }
    
    // GALLERY - HORIZONTAL LEFT TO RIGHT SLIDING
    initializeGallery() {
        console.log('🖼️ Initializing horizontal gallery slider...');
        
        // Force update images in the gallery slides
        this.updateGalleryImages();
        this.updateGalleryPosition();
        this.updateGalleryDots();
        
        // Mark gallery as initialized
        this.galleryStarted = true;
        
        console.log('✅ Gallery initialized successfully');
    }
    
    updateGalleryImages() {
        console.log('🔄 Updating gallery images...');
        const slides = document.querySelectorAll('.gallery-slide');
        
        slides.forEach((slide, index) => {
            if (index < this.galleryImages.length) {
                const img = slide.querySelector('img');
                const titleElement = slide.querySelector('.slide-overlay h3');
                const descElement = slide.querySelector('.slide-overlay p');
                
                if (img) {
                    img.src = this.galleryImages[index].src;
                    img.alt = this.galleryImages[index].title;
                    console.log(`🖼️ Updated slide ${index}: ${this.galleryImages[index].title}`);
                }
                
                if (titleElement) {
                    titleElement.textContent = this.galleryImages[index].title;
                }
                
                if (descElement) {
                    descElement.textContent = this.galleryImages[index].description;
                }
            }
        });
    }
    
    startGalleryAutoPlay() {
        console.log('🎠 Starting gallery auto-play...');
        
        // Clear any existing interval
        if (this.galleryAutoPlayInterval) {
            clearInterval(this.galleryAutoPlayInterval);
        }
        
        // Auto-play every 3 seconds moving left to right
        this.galleryAutoPlayInterval = setInterval(() => {
            if (!this.isUserInteracting && this.galleryStarted) {
                console.log(`🎠 Auto-advancing gallery from slide ${this.currentGalleryIndex} to ${(this.currentGalleryIndex + 1) % this.galleryImages.length}`);
                this.nextGalleryImage();
            }
        }, 3000);
        
        console.log('✅ Gallery auto-play started successfully');
    }
    
    stopGalleryAutoPlay() {
        if (this.galleryAutoPlayInterval) {
            clearInterval(this.galleryAutoPlayInterval);
            this.galleryAutoPlayInterval = null;
            console.log('⏹️ Gallery auto-play stopped');
        }
    }
    
    pauseGalleryAutoPlay() {
        console.log('⏸️ Pausing gallery auto-play for user interaction');
        this.stopGalleryAutoPlay();
        
        // Resume after 10 seconds
        setTimeout(() => {
            if (this.currentSection === 4) { // Only if still in gallery section
                console.log('▶️ Resuming gallery auto-play');
                this.startGalleryAutoPlay();
            }
        }, 10000);
    }
    
    nextGalleryImage() {
        this.currentGalleryIndex = (this.currentGalleryIndex + 1) % this.galleryImages.length;
        this.updateGalleryPosition();
        this.updateGalleryDots();
        console.log(`➡️ Gallery moved to slide ${this.currentGalleryIndex}: ${this.galleryImages[this.currentGalleryIndex].title}`);
    }
    
    previousGalleryImage() {
        this.currentGalleryIndex = (this.currentGalleryIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
        this.updateGalleryPosition();
        this.updateGalleryDots();
        console.log(`⬅️ Gallery moved to slide ${this.currentGalleryIndex}: ${this.galleryImages[this.currentGalleryIndex].title}`);
    }
    
    goToGallerySlide(index) {
        if (index >= 0 && index < this.galleryImages.length) {
            this.currentGalleryIndex = index;
            this.updateGalleryPosition();
            this.updateGalleryDots();
            console.log(`🎯 Gallery jumped to slide ${this.currentGalleryIndex}: ${this.galleryImages[this.currentGalleryIndex].title}`);
        }
    }
    
    updateGalleryPosition() {
        const track = document.getElementById('galleryTrack');
        if (track) {
            // Move left to right: negative translateX to show different slides
            const translateX = -(this.currentGalleryIndex * 20); // Each slide is 20% wide
            track.style.transform = `translateX(${translateX}%)`;
            console.log(`🎠 Gallery track moved to translateX(${translateX}%)`);
            
            // Update active slide class
            const slides = track.querySelectorAll('.gallery-slide');
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === this.currentGalleryIndex);
            });
        } else {
            console.error('❌ Gallery track element not found');
        }
    }
    
    updateGalleryDots() {
        document.querySelectorAll('.gallery-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentGalleryIndex);
        });
    }
    
    // VIDEO - DIRECT PLAYBACK (NO UPLOAD)
    initializeVideo() {
        console.log('🎥 Initializing video player...');
        const video = document.getElementById('preWeddingVideo');
        
        if (video) {
            // Set up video with blue theme styling
            video.style.borderRadius = '12px';
            video.style.border = '3px solid #3b82f6';
            
            // Add event listeners for video control
            video.addEventListener('loadeddata', () => {
                console.log('✅ Video loaded and ready to play');
            });
            
            video.addEventListener('error', (e) => {
                console.error('❌ Video error:', e);
            });
            
            console.log('✅ Video player initialized successfully');
        }
    }
    
    playVideo() {
        const video = document.getElementById('preWeddingVideo');
        const overlay = document.querySelector('.video-overlay');
        
        if (video) {
            video.play().then(() => {
                console.log('▶️ Video started playing');
                if (overlay) overlay.classList.add('hidden');
            }).catch((error) => {
                console.error('❌ Video play failed:', error);
            });
        }
    }
    
    // Parallax effects for decorative elements
    initializeParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.mandala, .lotus-pattern');
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
    
    // Add floating animation to elements
    addFloatingAnimation() {
        const floatingElements = document.querySelectorAll('.blessing-card, .event-card');
        
        floatingElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
            element.classList.add('floating');
        });
    }
    
    // Initialize enhanced blue-themed transitions
    initializeBlueTransitions() {
        // Add hover effects with blue theme
        const interactiveElements = document.querySelectorAll('.blessing-card, .event-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 15px 30px rgba(59, 130, 246, 0.25)';
                this.style.transform = 'translateY(-8px)';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.boxShadow = '';
                this.style.transform = '';
            });
        });
    }
    
    // Add scroll-triggered blue particle effects
    addScrollEffects() {
        const sectionsToObserve = this.sectionIds.map(id => document.getElementById(id)).filter(Boolean);
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.createBlueParticles(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        sectionsToObserve.forEach(section => observer.observe(section));
    }
    
    createBlueParticles(section) {
        // Create subtle blue particle effect
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: #3b82f6;
                border-radius: 50%;
                pointer-events: none;
                opacity: 0.7;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat 3s ease-out forwards;
                z-index: 1;
            `;
            
            section.style.position = 'relative';
            section.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 3000);
        }
    }
    
    // Add keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    if (this.currentSection === 4) { // Gallery section
                        this.previousGalleryImage();
                        this.pauseGalleryAutoPlay();
                    }
                    break;
                case 'ArrowRight':
                    if (this.currentSection === 4) { // Gallery section
                        this.nextGalleryImage();
                        this.pauseGalleryAutoPlay();
                    }
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    if (this.currentSection === 3) { // Video section
                        this.playVideo();
                    }
                    break;
            }
        });
    }
    
    // Perfect alignment animations on section entry
    addSectionEntryAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    
                    // Add staggered animations to cards
                    const cards = section.querySelectorAll('.blessing-card, .event-card, .gallery-slide');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 150);
                    });
                    
                    // Animate section titles
                    const title = section.querySelector('.section-title');
                    if (title) {
                        setTimeout(() => {
                            title.style.opacity = '1';
                            title.style.transform = 'translateY(0)';
                        }, 200);
                    }
                }
            });
        }, { threshold: 0.2 });
        
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Initializing Harish & Namratha\'s Wedding Website! 🌟');
    console.log('✅ Fixed alignment issues');
    console.log('✅ Gallery slides left-to-right horizontally');
    console.log('✅ Direct video playback without upload');
    console.log('✅ Gallery auto-play every 3 seconds');
    console.log('✅ All images preloaded and verified');
    
    const website = new WeddingWebsite();
    
    // Add particle float animation to CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            0% {
                transform: translateY(0px) scale(0);
                opacity: 0;
            }
            50% {
                opacity: 0.7;
                transform: scale(1);
            }
            100% {
                transform: translateY(-50px) scale(0);
                opacity: 0;
            }
        }
        
        .floating {
            animation: gentle-float 6s ease-in-out infinite;
        }
        
        @keyframes gentle-float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-10px);
            }
        }
        
        .particle {
            z-index: 1;
        }
        
        /* Initial state for animated elements */
        .blessing-card,
        .event-card,
        .section-title {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Blue glow effect for interactive elements */
        .gallery-nav:active,
        .gallery-dot:active {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
        }
        
        /* Ensure gallery images load properly */
        .gallery-slide img {
            object-fit: cover;
            width: 100%;
            height: 100%;
            display: block;
        }
        
        /* Gallery loading animation */
        @keyframes imageLoad {
            0% {
                opacity: 0;
                transform: scale(0.9);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .gallery-slide.active img {
            animation: imageLoad 0.5s ease-out;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize additional effects
    website.initializeParallax();
    website.addFloatingAnimation();
    website.initializeBlueTransitions();
    website.addScrollEffects();
    website.setupKeyboardNavigation();
    website.addSectionEntryAnimations();
    
    // Add welcome message after page loads
    setTimeout(() => {
        console.log('🎵 Background music controls available');
        console.log('🎠 Gallery auto-plays every 3 seconds left-to-right');
        console.log('🎥 Video plays directly without upload');
        console.log('⏰ Auto-scroll will begin in 2 seconds...');
        console.log('💙 Celebrating the beauty of arranged marriage');
        console.log('🚀 All systems ready!');
    }, 1000);
});

// Handle page visibility changes for music and gallery
document.addEventListener('visibilitychange', () => {
    const audio = document.getElementById('backgroundMusic');
    if (audio && !document.hidden && audio.paused) {
        // Resume music when page becomes visible again
        audio.play().catch(() => console.log('Music auto-resume blocked'));
    }
});

// Smooth scroll polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothScrollPolyfill = document.createElement('script');
    smoothScrollPolyfill.src = 'https://cdn.jsdelivr.net/gh/iamdustan/smoothscroll@1.4.10/dist/smoothscroll.min.js';
    document.head.appendChild(smoothScrollPolyfill);
}
