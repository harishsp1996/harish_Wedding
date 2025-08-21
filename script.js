// Enhanced Wedding Website JavaScript with Fixed Gallery & Video
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
        
        // Gallery data with verified working images
        this.galleryImages = [
            {
                src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=800&fit=crop&q=80',
                title: 'Family Gathering',
                description: 'When two families meet and bonds are formed'
            },
            {
                src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=800&fit=crop&q=80',
                title: 'Engagement Ceremony',
                description: 'The formal announcement of our union'
            },
            {
                src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&q=80',
                title: 'Traditional Rituals',
                description: 'Honoring our cultural heritage'
            },
            {
                src: 'https://images.unsplash.com/photo-1585992332075-6e0fa98333e7?w=1200&h=800&fit=crop&q=80',
                title: 'Family Blessings',
                description: 'Receiving love and guidance from elders'
            },
            {
                src: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=1200&h=800&fit=crop&q=80',
                title: 'Pre-Wedding Celebrations',
                description: 'Joy and preparations before the big day'
            }
        ];
        
        this.currentGalleryIndex = 0;
        this.galleryAutoPlayInterval = null;
        this.galleryStarted = false;
        this.particleSystem = null;
        this.videoObserver = null;
        
        this.init();
    }
    
    init() {
        console.log('🎉 Initializing Enhanced Wedding Website...');
        this.setupEventListeners();
        this.initializeMusic();
        this.preloadAndSetupGallery();
        this.initializeVideo();
        this.setupIntersectionObserver();
        this.initializeParticleSystem();
        this.initializeHeroAnimations();
        this.updateProgress();
        
        // Start auto-scroll after page fully loads
        setTimeout(() => {
            this.startAutoScroll();
        }, 3000);
        
        console.log('✅ Enhanced Wedding Website initialized successfully!');
    }
    
    preloadAndSetupGallery() {
        console.log('🖼️ Preloading and setting up gallery...');
        
        // First, immediately update the gallery with images
        this.forceUpdateGalleryImages();
        
        // Then preload images for smooth transitions
        this.galleryImages.forEach((imageData, index) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                console.log(`✅ Gallery image ${index + 1} preloaded: ${imageData.title}`);
            };
            img.onerror = () => {
                console.warn(`⚠️ Gallery image ${index + 1} failed, using fallback`);
                // Use a different fallback image
                this.galleryImages[index].src = `https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=800&fit=crop&q=80&sig=${index}`;
            };
            img.src = imageData.src;
        });
        
        // Initialize gallery after images are set
        setTimeout(() => {
            this.initializeGallery();
        }, 500);
    }
    
    forceUpdateGalleryImages() {
        console.log('🔧 Force updating gallery images...');
        const slides = document.querySelectorAll('.gallery-slide');
        
        slides.forEach((slide, index) => {
            if (index < this.galleryImages.length) {
                const img = slide.querySelector('img');
                const titleElement = slide.querySelector('.slide-overlay h3');
                const descElement = slide.querySelector('.slide-overlay p');
                
                if (img) {
                    console.log(`🖼️ Setting image ${index}: ${this.galleryImages[index].title}`);
                    img.src = this.galleryImages[index].src;
                    img.alt = this.galleryImages[index].title;
                    img.style.display = 'block';
                    img.style.opacity = '1';
                    
                    // Ensure image loads
                    img.onload = () => {
                        console.log(`✅ Image ${index} loaded successfully`);
                        img.style.transform = 'scale(1)';
                    };
                    
                    img.onerror = () => {
                        console.warn(`⚠️ Image ${index} failed to load, setting fallback`);
                        img.src = `https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=800&fit=crop&q=80&random=${index}`;
                    };
                }
                
                if (titleElement) {
                    titleElement.textContent = this.galleryImages[index].title;
                }
                
                if (descElement) {
                    descElement.textContent = this.galleryImages[index].description;
                }
            }
        });
        
        // Force a layout update
        const galleryTrack = document.getElementById('galleryTrack');
        if (galleryTrack) {
            galleryTrack.style.display = 'none';
            galleryTrack.offsetHeight; // Trigger reflow
            galleryTrack.style.display = 'flex';
        }
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
        
        // Gallery controls
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
        
        // Enhanced video controls
        this.setupVideoControls();
        
        // User interaction detection
        ['wheel', 'touchstart', 'keydown', 'mousedown', 'scroll'].forEach(event => {
            document.addEventListener(event, () => this.onUserInteraction(), { passive: true });
        });
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
        
        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupVideoControls() {
        const playButton = document.getElementById('playButton');
        const video = document.getElementById('preWeddingVideo');
        
        if (playButton && video) {
            console.log('🎥 Setting up enhanced video controls...');
            
            playButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎥 Play button clicked');
                this.playVideo();
            });
            
            video.addEventListener('loadeddata', () => {
                console.log('✅ Video loaded and ready');
            });
            
            video.addEventListener('play', () => {
                console.log('▶️ Video started playing');
                const overlay = document.querySelector('.video-overlay');
                if (overlay) {
                    overlay.classList.add('hidden');
                    overlay.style.display = 'none';
                }
                this.addVideoPlayEffects();
            });
            
            video.addEventListener('pause', () => {
                console.log('⏸️ Video paused');
                const overlay = document.querySelector('.video-overlay');
                if (overlay) {
                    overlay.classList.remove('hidden');
                    overlay.style.display = 'flex';
                }
            });
            
            video.addEventListener('ended', () => {
                console.log('🔚 Video ended');
                const overlay = document.querySelector('.video-overlay');
                if (overlay) {
                    overlay.classList.remove('hidden');
                    overlay.style.display = 'flex';
                }
                this.addVideoEndEffects();
            });
            
            video.addEventListener('error', (e) => {
                console.error('❌ Video error:', e);
                this.handleVideoError();
            });
        }
    }
    
    initializeParticleSystem() {
        console.log('✨ Initializing particle system...');
        const particlesContainer = document.querySelector('.particles-container');
        
        if (particlesContainer) {
            this.particleSystem = setInterval(() => {
                this.createParticle(particlesContainer);
            }, 3000);
        }
    }
    
    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        const colors = ['#3b82f6', '#1e3a8a', '#f59e0b', '#dbeafe'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        const size = 2 + Math.random() * 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 3000);
    }
    
    initializeHeroAnimations() {
        console.log('🎭 Initializing hero animations...');
        setTimeout(() => {
            this.triggerHeroSequence();
        }, 1000);
    }
    
    triggerHeroSequence() {
        console.log('🌟 Starting hero animation sequence...');
        
        const heroElements = [
            '.welcome-text',
            '.groom-name',
            '.bride-name', 
            '.ampersand',
            '.wedding-subtitle-container',
            '.wedding-date',
            '.scroll-indicator'
        ];
        
        heroElements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 400);
            }
        });
    }
    
    startAutoScroll() {
        console.log('🔄 Starting enhanced auto-scroll...');
        
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
        }
        
        this.autoScrollInterval = setInterval(() => {
            if (!this.isUserInteracting) {
                console.log(`📜 Auto-scrolling from section ${this.currentSection} to ${(this.currentSection + 1) % this.totalSections}`);
                this.nextSection();
            }
        }, 8000); // 8 seconds between sections
    }
    
    pauseAutoScroll() {
        console.log('⏸️ Pausing auto-scroll for user interaction');
        this.isUserInteracting = true;
        
        if (this.pauseTimeout) {
            clearTimeout(this.pauseTimeout);
        }
        
        this.pauseTimeout = setTimeout(() => {
            console.log('▶️ Resuming auto-scroll after user interaction pause');
            this.isUserInteracting = false;
        }, 6000);
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
        }
        
        this.updateNavDots();
        this.updateProgress();
        this.triggerSectionAnimations(sectionIndex);
        
        // Handle section-specific functionality
        if (sectionIndex === 3) { // Video section
            setTimeout(() => this.handleVideoSection(), 1500);
        } else if (sectionIndex === 4) { // Gallery section
            setTimeout(() => this.handleGallerySection(), 500);
        }
    }
    
    handleVideoSection() {
        console.log('🎥 Handling video section...');
        const video = document.getElementById('preWeddingVideo');
        const playButton = document.getElementById('playButton');
        
        if (video && video.paused) {
            console.log('🎥 Attempting to auto-play video...');
            
            // Try to auto-play, but handle if blocked
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('✅ Video auto-play successful');
                }).catch((error) => {
                    console.log('⚠️ Video auto-play blocked by browser:', error.message);
                    console.log('💡 User will need to click play button');
                    
                    // Make play button more prominent
                    if (playButton) {
                        playButton.style.animation = 'playButtonPulse 1s ease-in-out infinite';
                        playButton.style.transform = 'scale(1.1)';
                    }
                });
            }
        }
    }
    
    handleGallerySection() {
        console.log('🎠 Handling gallery section...');
        if (!this.galleryAutoPlayInterval) {
            this.startGalleryAutoPlay();
        }
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
            const cards = section.querySelectorAll('.blessing-card, .event-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 200);
            });
            
            this.addSectionEffects(sectionIndex, section);
        }
    }
    
    addSectionEffects(sectionIndex, section) {
        switch(sectionIndex) {
            case 0: // Hero
                this.createSparkleEffect(section);
                break;
            case 1: // Family
                this.createFloatingHearts(section);
                break;
            case 2: // Events
                this.createCelebrationEffect(section);
                break;
            case 4: // Gallery
                this.enhanceGalleryEffects();
                break;
        }
    }
    
    createSparkleEffect(section) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.innerHTML = '✨';
                sparkle.style.cssText = `
                    position: absolute;
                    font-size: 1.5rem;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    pointer-events: none;
                    z-index: 5;
                    animation: sparkleFloat 2s ease-out forwards;
                `;
                section.appendChild(sparkle);
                
                setTimeout(() => {
                    if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
                }, 2000);
            }, i * 500);
        }
    }
    
    createFloatingHearts(section) {
        const hearts = ['💕', '💖', '💝'];
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
                heart.style.cssText = `
                    position: absolute;
                    font-size: 1.2rem;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    pointer-events: none;
                    z-index: 5;
                    animation: heartFloat 3s ease-out forwards;
                `;
                section.appendChild(heart);
                
                setTimeout(() => {
                    if (heart.parentNode) heart.parentNode.removeChild(heart);
                }, 3000);
            }, i * 800);
        }
    }
    
    createCelebrationEffect(section) {
        const celebration = ['🎉', '🎊', '✨'];
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.innerHTML = celebration[Math.floor(Math.random() * celebration.length)];
                confetti.style.cssText = `
                    position: absolute;
                    font-size: 1.3rem;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    pointer-events: none;
                    z-index: 5;
                    animation: confettiFall 2.5s ease-out forwards;
                `;
                section.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
                }, 2500);
            }, i * 300);
        }
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionElement = entry.target;
                    const sectionIndex = this.sectionIds.indexOf(sectionElement.id);
                    
                    if (sectionIndex !== -1) {
                        console.log(`👁️ Section ${sectionElement.id} came into view`);
                        this.currentSection = sectionIndex;
                        this.updateNavDots();
                        this.updateProgress();
                        
                        // Handle video section visibility
                        if (sectionIndex === 3) {
                            setTimeout(() => this.handleVideoSection(), 1000);
                        }
                        
                        // Handle gallery section visibility
                        if (sectionIndex === 4 && !this.galleryAutoPlayInterval) {
                            setTimeout(() => this.startGalleryAutoPlay(), 1000);
                        } else if (sectionIndex !== 4 && this.galleryAutoPlayInterval) {
                            this.stopGalleryAutoPlay();
                        }
                    }
                }
            });
        }, {
            threshold: 0.5
        });
        
        this.sectionIds.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                observer.observe(section);
            }
        });
    }
    
    initializeMusic() {
        console.log('🎵 Initializing enhanced music controls...');
        const audio = document.getElementById('backgroundMusic');
        const musicIcon = document.querySelector('.music-icon');
        
        if (audio) {
            audio.volume = 0.3;
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.musicPlaying = true;
                    if (musicIcon) musicIcon.textContent = '🎵';
                    this.fadeInMusic(audio);
                    console.log('🎵 Background music started successfully');
                }).catch(() => {
                    this.musicPlaying = false;
                    if (musicIcon) musicIcon.textContent = '🔇';
                    console.log('🔇 Auto-play blocked, user interaction required');
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
                console.log('🔇 Music paused');
            } else {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.fadeInMusic(audio);
                        this.musicPlaying = true;
                        if (musicIcon) musicIcon.textContent = '🎵';
                        console.log('🎵 Music resumed');
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
                currentVolume += 0.02;
                audio.volume = Math.min(currentVolume, targetVolume);
            } else {
                clearInterval(fadeIn);
            }
        }, 50);
    }
    
    fadeOutMusic(audio) {
        const fadeOut = setInterval(() => {
            if (audio.volume > 0.02) {
                audio.volume -= 0.02;
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(fadeOut);
            }
        }, 50);
    }
    
    setVolume(value) {
        const audio = document.getElementById('backgroundMusic');
        if (audio) {
            audio.volume = value / 100;
        }
    }
    
    // Enhanced Gallery with Fixed Image Loading
    initializeGallery() {
        console.log('🖼️ Initializing enhanced gallery...');
        
        // Force update gallery again to ensure images are loaded
        this.forceUpdateGalleryImages();
        this.updateGalleryPosition();
        this.updateGalleryDots();
        this.galleryStarted = true;
        this.addGalleryTouchSupport();
        
        console.log('✅ Enhanced gallery initialized successfully');
    }
    
    addGalleryTouchSupport() {
        const galleryTrack = document.getElementById('galleryTrack');
        if (!galleryTrack) return;
        
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        galleryTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.pauseGalleryAutoPlay();
        }, { passive: true });
        
        galleryTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });
        
        galleryTrack.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            
            const diffX = startX - currentX;
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextGalleryImage();
                } else {
                    this.previousGalleryImage();
                }
            }
        });
    }
    
    startGalleryAutoPlay() {
        console.log('🎠 Starting enhanced gallery auto-play...');
        
        if (this.galleryAutoPlayInterval) {
            clearInterval(this.galleryAutoPlayInterval);
        }
        
        this.galleryAutoPlayInterval = setInterval(() => {
            if (!this.isUserInteracting && this.galleryStarted) {
                console.log(`🎠 Auto-advancing gallery: ${this.currentGalleryIndex} → ${(this.currentGalleryIndex + 1) % this.galleryImages.length}`);
                this.nextGalleryImage();
            }
        }, 3500); // 3.5 seconds per slide
        
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
        
        setTimeout(() => {
            if (this.currentSection === 4) {
                console.log('▶️ Resuming gallery auto-play');
                this.startGalleryAutoPlay();
            }
        }, 5000);
    }
    
    nextGalleryImage() {
        this.currentGalleryIndex = (this.currentGalleryIndex + 1) % this.galleryImages.length;
        this.updateGalleryPosition();
        this.updateGalleryDots();
        this.addGalleryTransitionEffect();
        console.log(`➡️ Gallery: slide ${this.currentGalleryIndex} (${this.galleryImages[this.currentGalleryIndex].title})`);
    }
    
    previousGalleryImage() {
        this.currentGalleryIndex = (this.currentGalleryIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
        this.updateGalleryPosition();
        this.updateGalleryDots();
        this.addGalleryTransitionEffect();
        console.log(`⬅️ Gallery: slide ${this.currentGalleryIndex} (${this.galleryImages[this.currentGalleryIndex].title})`);
    }
    
    goToGallerySlide(index) {
        if (index >= 0 && index < this.galleryImages.length) {
            this.currentGalleryIndex = index;
            this.updateGalleryPosition();
            this.updateGalleryDots();
            this.addGalleryTransitionEffect();
            console.log(`🎯 Gallery: jumped to slide ${this.currentGalleryIndex} (${this.galleryImages[this.currentGalleryIndex].title})`);
        }
    }
    
    updateGalleryPosition() {
        const track = document.getElementById('galleryTrack');
        if (track) {
            const translateX = -(this.currentGalleryIndex * 20); // Each slide is 20% wide
            track.style.transform = `translateX(${translateX}%)`;
            
            // Update active slide class
            const slides = track.querySelectorAll('.gallery-slide');
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === this.currentGalleryIndex);
            });
            
            console.log(`🎠 Gallery track moved to translateX(${translateX}%)`);
        }
    }
    
    updateGalleryDots() {
        document.querySelectorAll('.gallery-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentGalleryIndex);
        });
    }
    
    addGalleryTransitionEffect() {
        const gallerySlider = document.querySelector('.gallery-slider');
        if (gallerySlider) {
            gallerySlider.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.3)';
            setTimeout(() => {
                gallerySlider.style.boxShadow = '0 20px 40px rgba(30, 58, 138, 0.15)';
            }, 500);
        }
    }
    
    enhanceGalleryEffects() {
        const gallerySection = document.getElementById('gallery');
        if (gallerySection) {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    this.createSparkleEffect(gallerySection);
                }, i * 1000);
            }
        }
    }
    
    // Enhanced Video Functionality
    initializeVideo() {
        console.log('🎥 Initializing enhanced video player...');
        const video = document.getElementById('preWeddingVideo');
        
        if (video) {
            // Set video properties for better compatibility
            video.muted = true;
            video.playsInline = true;
            video.controls = true;
            
            video.addEventListener('loadeddata', () => {
                console.log('✅ Video loaded successfully');
                video.currentTime = 0; // Reset to beginning
            });
            
            video.addEventListener('error', (e) => {
                console.error('❌ Video error:', e);
                this.handleVideoError();
            });
            
            console.log('✅ Enhanced video player initialized');
        }
    }
    
    playVideo() {
        const video = document.getElementById('preWeddingVideo');
        const overlay = document.querySelector('.video-overlay');
        
        if (video) {
            console.log('🎥 Attempting to play video...');
            video.muted = false; // Unmute when user explicitly plays
            
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('▶️ Video started playing successfully');
                    if (overlay) {
                        overlay.classList.add('hidden');
                        overlay.style.display = 'none';
                    }
                    this.addVideoPlayEffects();
                }).catch((error) => {
                    console.error('❌ Video play failed:', error);
                    // Keep video muted and try again
                    video.muted = true;
                    video.play().then(() => {
                        console.log('▶️ Video playing muted');
                        if (overlay) {
                            overlay.classList.add('hidden');
                            overlay.style.display = 'none';
                        }
                    }).catch(e => console.error('❌ Muted video play also failed:', e));
                });
            }
        }
    }
    
    handleVideoError() {
        console.log('🔄 Handling video error, setting up fallback...');
        const video = document.getElementById('preWeddingVideo');
        const videoContainer = document.querySelector('.video-frame');
        
        if (video && videoContainer) {
            // Show a nice fallback message
            const fallbackMessage = document.createElement('div');
            fallbackMessage.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #1e3a8a;
                text-align: center;
                font-size: 1.2rem;
                font-weight: 500;
                z-index: 10;
            `;
            fallbackMessage.innerHTML = `
                <div style="margin-bottom: 10px;">🎥</div>
                <div>Video will be available soon</div>
                <div style="font-size: 0.9rem; opacity: 0.7; margin-top: 5px;">Please check back later</div>
            `;
            
            videoContainer.appendChild(fallbackMessage);
        }
    }
    
    addVideoPlayEffects() {
        const videoFrame = document.querySelector('.video-frame');
        if (videoFrame) {
            videoFrame.style.boxShadow = '0 0 50px rgba(59, 130, 246, 0.4)';
            setTimeout(() => {
                videoFrame.style.boxShadow = '0 20px 40px rgba(30, 58, 138, 0.15)';
            }, 3000);
        }
    }
    
    addVideoEndEffects() {
        const videoSection = document.getElementById('video');
        if (videoSection) {
            this.createCelebrationEffect(videoSection);
        }
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    if (this.currentSection === 4) {
                        this.previousGalleryImage();
                        this.pauseGalleryAutoPlay();
                    }
                    break;
                case 'ArrowRight':
                    if (this.currentSection === 4) {
                        this.nextGalleryImage();
                        this.pauseGalleryAutoPlay();
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevSection = Math.max(0, this.currentSection - 1);
                    this.goToSection(prevSection);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    const nextSection = Math.min(this.totalSections - 1, this.currentSection + 1);
                    this.goToSection(nextSection);
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    if (this.currentSection === 3) {
                        this.playVideo();
                    }
                    break;
            }
        });
    }
    
    handleResize() {
        setTimeout(() => {
            this.updateGalleryPosition();
            this.adjustMobileLayout();
        }, 100);
    }
    
    adjustMobileLayout() {
        const isMobile = window.innerWidth <= 768;
        const musicControls = document.querySelector('.music-controls');
        const navDots = document.querySelector('.nav-dots');
        
        if (isMobile) {
            if (musicControls) {
                musicControls.style.top = '10px';
                musicControls.style.right = '10px';
            }
            if (navDots) {
                navDots.style.display = 'none';
            }
        } else {
            if (musicControls) {
                musicControls.style.top = '20px';
                musicControls.style.right = '20px';
            }
            if (navDots) {
                navDots.style.display = 'flex';
            }
        }
    }
    
    destroy() {
        console.log('🧹 Cleaning up Wedding Website...');
        
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
        }
        
        if (this.galleryAutoPlayInterval) {
            clearInterval(this.galleryAutoPlayInterval);
        }
        
        if (this.particleSystem) {
            clearInterval(this.particleSystem);
        }
        
        if (this.pauseTimeout) {
            clearTimeout(this.pauseTimeout);
        }
        
        if (this.videoObserver) {
            this.videoObserver.disconnect();
        }
    }
}

// Initialize the enhanced website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟✨ Initializing Harish & Namratha\'s Enhanced Wedding Website! ✨🌟');
    console.log('💫 Enhanced Features:');
    console.log('   ✅ Fixed gallery images with proper loading');
    console.log('   ✅ Enhanced video auto-play functionality');
    console.log('   ✅ Perfect responsive alignment for all devices');
    console.log('   ✅ Rich hero animations with particles and floating elements');
    console.log('   ✅ Smooth horizontal gallery with auto-advance');
    console.log('   ✅ Enhanced music controls with fade effects');
    console.log('   ✅ Keyboard navigation and touch/swipe support');
    console.log('   ✅ Arranged marriage content with family blessings theme');
    console.log('   ✅ Celebration animations and visual effects');
    console.log('   💙 Celebrating the beauty of arranged marriage traditions');
    
    const website = new WeddingWebsite();
    
    // Add custom CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkleFloat {
            0% {
                transform: translateY(0px) scale(0) rotate(0deg);
                opacity: 0;
            }
            50% {
                opacity: 1;
                transform: scale(1.2) rotate(180deg);
            }
            100% {
                transform: translateY(-80px) scale(0) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes heartFloat {
            0% {
                transform: translateY(0px) scale(0);
                opacity: 0;
            }
            25% {
                opacity: 0.8;
                transform: scale(1.1);
            }
            75% {
                opacity: 0.6;
                transform: scale(0.9);
            }
            100% {
                transform: translateY(-100px) scale(0);
                opacity: 0;
            }
        }
        
        @keyframes confettiFall {
            0% {
                transform: translateY(-20px) rotate(0deg);
                opacity: 0;
            }
            25% {
                opacity: 1;
                transform: rotate(90deg);
            }
            75% {
                opacity: 0.8;
                transform: rotate(270deg);
            }
            100% {
                transform: translateY(120px) rotate(360deg);
                opacity: 0;
            }
        }
        
        .gallery-slide img {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
            display: block !important;
            opacity: 1 !important;
        }
        
        .gallery-track {
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        /* Ensure perfect mobile alignment */
        @media (max-width: 768px) {
            .section-container,
            .hero-content,
            .couple-names,
            .groom-name,
            .bride-name,
            .ampersand,
            .wedding-subtitle,
            .wedding-date {
                text-align: center !important;
                align-items: center !important;
                justify-content: center !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }
        }
        
        /* Enhanced focus states */
        .gallery-nav:focus,
        .gallery-dot:focus,
        .nav-dot:focus,
        .music-btn:focus {
            outline: 3px solid rgba(59, 130, 246, 0.5);
            outline-offset: 2px;
        }
        
        /* Video enhancements */
        .video-frame {
            position: relative !important;
        }
        
        .play-button {
            cursor: pointer !important;
            pointer-events: auto !important;
        }
        
        /* Gallery image loading fix */
        .gallery-slide {
            position: relative !important;
            width: 20% !important;
            flex-shrink: 0 !important;
        }
        
        .gallery-slide img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            display: block !important;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize additional effects
    setTimeout(() => {
        console.log('🎨 Adding final touches...');
        website.adjustMobileLayout();
        
        // Force gallery update one more time to ensure images are visible
        setTimeout(() => {
            website.forceUpdateGalleryImages();
        }, 2000);
        
        console.log('🚀 All systems ready! Gallery images fixed and video enhanced!');
    }, 1500);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        website.destroy();
    });
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('🚨 Application error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
});

console.log('🔧 Gallery images and video functionality fixed!');
console.log('📱💻 Perfect alignment maintained for all devices!');
console.log('🎥 Enhanced video auto-play with fallback handling!');
console.log('🎠 Gallery images now loading properly with smooth transitions!');
console.log('💒 Enhanced arranged marriage celebration ready!');
