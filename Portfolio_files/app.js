// Interactive 3D Portfolio - Sarah Rodriguez
// Enhanced with particle system, cursor following, and advanced interactions

class InteractivePortfolio {
    constructor() {
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isTouch = false;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.initParticleSystem();
        this.initAnimations();
        this.initInteractiveElements();
        this.initScrollAnimations();
        this.initNavigationEffects();
        this.initContactForm();
        this.startAnimationLoop();
        
        // Detect touch devices
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (this.isTouch) {
            document.body.classList.add('touch-device');
        }
    }

    setupCanvas() {
        this.canvas = document.getElementById('interactive-background');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // Mouse movement for particle attraction and cursor following
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            this.updateCursorFollower(e.clientX, e.clientY);
            this.updateParallaxElements(e.clientX, e.clientY);
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.touches[0]) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches[0]) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        });

        // Scroll events
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScrollEffects();
        }, 16));

        // Navigation clicks - Fixed implementation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                this.smoothScrollTo(targetId);
            });
        });

        // Explore button - Fixed implementation
        const exploreBtn = document.querySelector('.explore-btn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.smoothScrollTo('#about');
            });
        }

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Page load
        window.addEventListener('load', () => {
            this.onPageLoad();
        });
    }

    initParticleSystem() {
        if (!this.ctx) return;

        const particleCount = window.innerWidth > 768 ? 150 : 75;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                baseX: Math.random() * window.innerWidth,
                baseY: Math.random() * window.innerHeight,
                size: Math.random() * 3 + 1,
                density: Math.random() * 30 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5
            });
        }
    }

    updateParticleSystem() {
        if (!this.ctx || this.particles.length === 0) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((particle, index) => {
            // Calculate distance to mouse
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;

            if (distance < maxDistance) {
                // Attraction effect
                const force = (maxDistance - distance) / maxDistance;
                const attraction = force * 0.5;
                
                particle.x += dx * attraction * 0.02;
                particle.y += dy * attraction * 0.02;
                
                // Increase opacity when near mouse
                particle.opacity = Math.min(0.8, 0.2 + force * 0.6);
            } else {
                // Return to base position gradually
                particle.x += (particle.baseX - particle.x) * 0.005;
                particle.y += (particle.baseY - particle.y) * 0.005;
                particle.opacity = Math.max(0.2, particle.opacity - 0.01);
            }

            // Natural floating movement
            particle.x += Math.sin(Date.now() * 0.001 + particle.density) * 0.3;
            particle.y += Math.cos(Date.now() * 0.001 + particle.density) * 0.3;

            // Boundary checking
            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.y < 0) particle.y = window.innerHeight;
            if (particle.y > window.innerHeight) particle.y = 0;

            // Draw particle
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = '#00d4ff';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#00d4ff';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            // Draw connections
            this.particles.slice(index + 1).forEach(otherParticle => {
                const dx2 = particle.x - otherParticle.x;
                const dy2 = particle.y - otherParticle.y;
                const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                if (distance2 < 100) {
                    this.ctx.save();
                    this.ctx.globalAlpha = (100 - distance2) / 100 * 0.3;
                    this.ctx.strokeStyle = '#00d4ff';
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            });
        });
    }

    updateCursorFollower(x, y) {
        if (this.isTouch) return;
        
        const follower = document.getElementById('cursor-follower');
        if (follower) {
            follower.style.left = x - 10 + 'px';
            follower.style.top = y - 10 + 'px';
        }
    }

    updateParallaxElements(mouseX, mouseY) {
        const elements = document.querySelectorAll('.hero-3d-elements > *');
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        elements.forEach((element, index) => {
            const speed = parseFloat(element.dataset.speed) || 0.5;
            const x = (mouseX - centerX) * speed * 0.02;
            const y = (mouseY - centerY) * speed * 0.02;
            
            element.style.transform = `translate(${x}px, ${y}px) ${element.style.transform.replace(/translate\([^)]*\)/, '')}`;
        });
    }

    initAnimations() {
        // Typing animation for hero text
        this.typeWriterAnimation();
        
        // Stagger animations for elements
        setTimeout(() => this.revealHeroElements(), 500);
    }

    typeWriterAnimation() {
        const nameElement = document.getElementById('animated-name');
        const taglineElement = document.getElementById('typing-text');
        
        if (!nameElement || !taglineElement) return;
        
        const name = 'Kankala Nandu';
        const tagline = 'Analytics Enthusiast • Data Science Student • ML Explorer';
        
        // Type name
        this.typeText(nameElement, name, 100, () => {
            // After name is typed, type tagline
            setTimeout(() => {
                this.typeText(taglineElement, tagline, 50);
            }, 500);
        });
    }

    typeText(element, text, speed, callback) {
        element.textContent = '';
        element.style.opacity = '1';
        
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            
            if (i >= text.length) {
                clearInterval(timer);
                if (callback) callback();
            }
        }, speed);
    }

    revealHeroElements() {
        const elements = ['.hero-cta', '.scroll-indicator'];
        
        elements.forEach((selector, index) => {
            setTimeout(() => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            }, index * 300);
        });
    }

    initInteractiveElements() {
        this.initSkillSpheres();
        this.initProjectCubes();
        this.initAvatar();
        this.initSocialLinks();
        this.initButtonEffects();
    }

    initSkillSpheres() {
        const skillSpheres = document.querySelectorAll('.skill-sphere');
        
        skillSpheres.forEach(sphere => {
            sphere.addEventListener('click', () => {
                sphere.classList.toggle('active');
                
                // Close other active spheres
                skillSpheres.forEach(other => {
                    if (other !== sphere) {
                        other.classList.remove('active');
                    }
                });
            });

            // Mouse follow effect
            if (!this.isTouch) {
                sphere.addEventListener('mousemove', (e) => {
                    const rect = sphere.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 20;
                    const rotateY = (centerX - x) / 20;
                    
                    sphere.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                });

                sphere.addEventListener('mouseleave', () => {
                    if (!sphere.classList.contains('active')) {
                        sphere.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg)';
                    }
                });
            }
        });
    }

    initProjectCubes() {
        const projectCubes = document.querySelectorAll('.project-cube');
        
        projectCubes.forEach(cube => {
            if (!this.isTouch) {
                cube.addEventListener('mouseenter', () => {
                    cube.style.transform = 'rotateY(180deg)';
                });

                cube.addEventListener('mouseleave', () => {
                    cube.style.transform = 'rotateY(0deg)';
                });
            } else {
                // Touch interaction
                cube.addEventListener('click', () => {
                    const isFlipped = cube.style.transform.includes('180deg');
                    cube.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
                });
            }
        });
    }

    initAvatar() {
        const avatar = document.getElementById('interactive-avatar');
        if (!avatar) return;

        if (!this.isTouch) {
            avatar.addEventListener('mousemove', (e) => {
                const rect = avatar.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                avatar.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            });

            avatar.addEventListener('mouseleave', () => {
                avatar.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
            });
        }

        // Click effect
        avatar.addEventListener('click', () => {
            avatar.style.animation = 'none';
            setTimeout(() => {
                avatar.style.animation = 'avatarFloat 6s ease-in-out infinite';
            }, 10);
        });
    }

    initSocialLinks() {
        const socialLinks = document.querySelectorAll('.social-link-3d');
        
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                if (!this.isTouch) {
                    link.style.transform = 'translateY(-5px) rotateX(10deg) scale(1.05)';
                }
            });

            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0) rotateX(0deg) scale(1)';
            });
        });
    }

    initButtonEffects() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = button.querySelector('.btn-ripple');
                if (ripple) {
                    ripple.style.width = '0';
                    ripple.style.height = '0';
                    setTimeout(() => {
                        ripple.style.width = '300px';
                        ripple.style.height = '300px';
                    }, 10);
                }
            });
        });
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger specific animations
                    if (entry.target.classList.contains('skill-category')) {
                        this.animateSkillCategory(entry.target);
                    }
                    
                    if (entry.target.classList.contains('stat-item')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements
        document.querySelectorAll('.skill-category, .stat-item, .project-cube, .fade-in').forEach(element => {
            this.scrollObserver.observe(element);
        });
    }

    animateSkillCategory(category) {
        const spheres = category.querySelectorAll('.skill-sphere');
        spheres.forEach((sphere, index) => {
            setTimeout(() => {
                sphere.style.opacity = '1';
                sphere.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    animateCounter(statItem) {
        const numberElement = statItem.querySelector('.stat-number');
        if (!numberElement || numberElement.dataset.animated) return;
        
        const finalValue = numberElement.textContent;
        const numericValue = parseInt(finalValue.replace(/\D/g, '')) || 0;
        const suffix = finalValue.replace(/\d/g, '');
        
        if (numericValue === 0) return;
        
        numberElement.dataset.animated = 'true';
        
        let current = 0;
        const increment = numericValue / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                current = numericValue;
                clearInterval(timer);
            }
            numberElement.textContent = Math.floor(current) + suffix;
        }, 30);
    }

    initNavigationEffects() {
        const nav = document.querySelector('.nav');
        let lastScrollTop = 0;

        const handleNavScroll = () => {
            const scrollTop = window.pageYOffset;
            
            if (scrollTop > 100) {
                nav.style.background = 'rgba(0, 0, 0, 0.95)';
                nav.style.backdropFilter = 'blur(20px)';
            } else {
                nav.style.background = 'rgba(0, 0, 0, 0.1)';
                nav.style.backdropFilter = 'blur(20px)';
            }

            // Active nav link highlighting
            this.updateActiveNavLink();
        };

        window.addEventListener('scroll', this.throttle(handleNavScroll, 16));
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop <= 150) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const inputs = form.querySelectorAll('.form-control');
        const submitBtn = form.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateInput(input);
            });

            input.addEventListener('blur', () => {
                this.validateInput(input);
            });

            input.addEventListener('focus', () => {
                const feedback = input.parentElement.querySelector('.input-feedback');
                feedback.classList.remove('show');
            });
        });

        // Form submission removed for direct submission to formspree
       /* form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate all inputs
            let isValid = true;
            inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                this.showNotification('Please fix the errors in the form', 'error');
                return;
            }

            // Show loading state
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
            submitBtn.disabled = true;

            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success
            this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            form.reset();

            // Reset button
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            submitBtn.disabled = false;
        });*/
    }

    validateInput(input) {
        const value = input.value.trim();
        const feedback = input.parentElement.querySelector('.input-feedback');
        let isValid = true;
        let message = '';

        switch (input.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    message = 'Email is required';
                    isValid = false;
                } else if (!emailRegex.test(value)) {
                    message = 'Please enter a valid email';
                    isValid = false;
                }
                break;
            case 'text':
                if (!value) {
                    message = `${input.name} is required`;
                    isValid = false;
                } else if (value.length < 2) {
                    message = `${input.name} must be at least 2 characters`;
                    isValid = false;
                }
                break;
            default:
                if (!value) {
                    message = `${input.name} is required`;
                    isValid = false;
                }
        }

        if (message) {
            feedback.textContent = message;
            feedback.classList.add('show');
            input.style.borderColor = '#ff5459';
        } else {
            feedback.classList.remove('show');
            input.style.borderColor = '#00d4ff';
        }

        return isValid;
    }

    handleScrollEffects() {
        const scrolled = window.pageYOffset;
        
        // Parallax effect for floating elements
        const floatingElements = document.querySelectorAll('.hero-3d-elements > *');
        floatingElements.forEach((element, index) => {
            const speed = 0.3 + index * 0.1;
            element.style.transform += ` translateY(${scrolled * speed}px)`;
        });

        // Update scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.opacity = scrolled > 100 ? '0' : '1';
        }
    }

    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (!element) {
            console.warn(`Element not found: ${target}`);
            return;
        }

        const headerOffset = 80; // Account for fixed navigation
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;

        // Use smooth scroll API
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        // Fallback for older browsers
        if (!('scrollBehavior' in document.documentElement.style)) {
            this.animateScroll(window.pageYOffset, offsetPosition, 800);
        }
    }

    animateScroll(start, end, duration) {
        const startTime = performance.now();
        
        const scroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const ease = progress * (2 - progress);
            const currentPosition = start + (end - start) * ease;
            
            window.scrollTo(0, currentPosition);
            
            if (progress < 1) {
                requestAnimationFrame(scroll);
            }
        };
        
        requestAnimationFrame(scroll);
    }

    startAnimationLoop() {
        const animate = () => {
            this.updateParticleSystem();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    handleResize() {
        this.resizeCanvas();
        
        // Reinitialize particles with new screen size
        if (this.particles.length > 0) {
            this.particles.forEach(particle => {
                particle.baseX = Math.random() * window.innerWidth;
                particle.baseY = Math.random() * window.innerHeight;
            });
        }
    }

    onPageLoad() {
        // Add loading animation
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);

        // Trigger initial animations
        setTimeout(() => {
            this.revealHeroElements();
        }, 1000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        
        const colors = {
            success: { bg: 'rgba(0, 212, 255, 0.1)', border: 'rgba(0, 212, 255, 0.3)', text: '#00d4ff' },
            error: { bg: 'rgba(255, 84, 89, 0.1)', border: 'rgba(255, 84, 89, 0.3)', text: '#ff5459' },
            info: { bg: 'rgba(0, 212, 255, 0.1)', border: 'rgba(0, 212, 255, 0.3)', text: '#00d4ff' }
        };

        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: ${color.text};
            border: 1px solid ${color.border};
            padding: 1rem 1.5rem;
            border-radius: 0;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 350px;
            word-wrap: break-word;
            backdrop-filter: blur(10px);
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Utility functions
    throttle(func, wait) {
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

    debounce(func, wait) {
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

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Cleanup
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }
    }
}

// Initialize the portfolio when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portfolio = new InteractivePortfolio();
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (window.portfolio) {
        if (document.hidden) {
            // Pause animations when tab is not visible
            if (window.portfolio.animationId) {
                cancelAnimationFrame(window.portfolio.animationId);
            }
        } else {
            // Resume animations when tab becomes visible
            window.portfolio.startAnimationLoop();
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.portfolio) {
        window.portfolio.destroy();
    }
});

// Additional utility for performance monitoring
const PerformanceMonitor = {
    start: Date.now(),
    
    log(message) {
        if (window.console && console.log) {
            console.log(`[Portfolio] ${message} - ${Date.now() - this.start}ms`);
        }
    }
};

PerformanceMonitor.log('Portfolio script loaded');