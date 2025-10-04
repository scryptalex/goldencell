// Golden Cell Interactive Features
class GoldenCellApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        this.setupScrollAnimations();
        this.setupContactForm();
        this.setupCharts();
        this.setupHeaderScroll();
    }

    // Smooth scrolling for navigation links
    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('.nav-menu a, .cta-button');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetSection = document.querySelector(targetId);
                    
                    if (targetSection) {
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    } else {
                        // For CTA button, scroll to about section
                        document.querySelector('#about').scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    // Mobile menu toggle
    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });

            // Close menu when clicking on a link
            navMenu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            });
        }
    }

    // Header scroll effect
    setupHeaderScroll() {
        const header = document.querySelector('.header');
        let lastScrollTop = 0;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScrollTop = scrollTop;
        });
    }

    // Scroll animations for elements
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        const animatedElements = document.querySelectorAll(
            '.tech-card, .product-card, .stat-card, .about-mission, .leadership-card'
        );

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });

        // Add CSS for animation
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            .header.scrolled {
                background: rgba(255, 255, 255, 0.98) !important;
                backdrop-filter: blur(20px) !important;
                box-shadow: 0 2px 20px rgba(0,0,0,0.1) !important;
            }
            @media (max-width: 768px) {
                .nav-menu {
                    position: fixed;
                    top: 70px;
                    left: -100%;
                    width: 100%;
                    height: calc(100vh - 70px);
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px);
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    padding-top: 2rem;
                    transition: left 0.3s ease;
                    border-top: 1px solid var(--color-card-border);
                }
                .nav-menu.active {
                    left: 0;
                }
                .menu-toggle.active span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }
                .menu-toggle.active span:nth-child(2) {
                    opacity: 0;
                }
                .menu-toggle.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(7px, -6px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Contact form handling
    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = new FormData(contactForm);
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const message = document.getElementById('message').value;

                // Simulate form submission
                this.showNotification('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.', 'success');
                contactForm.reset();
            });
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--golden-gradient);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    // Setup charts using Chart.js
    setupCharts() {
        this.createGlobalMarketChart();
        this.createCancerMarketChart();
    }

    // Global market chart
    createGlobalMarketChart() {
        const ctx = document.getElementById('globalMarketChart');
        if (!ctx) return;

        const globalMarketData = {
            biohealth: 8800,
            automotive: 2700,
            semiconductors: 510
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Биоздравоохранение', 'Автомобильная', 'Полупроводники'],
                datasets: [{
                    data: [globalMarketData.biohealth, globalMarketData.automotive, globalMarketData.semiconductors],
                    backgroundColor: ['#FFD700', '#FFA500', '#B8860B'],
                    borderColor: ['#B8860B', '#FF8C00', '#DAA520'],
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14,
                                weight: '500'
                            },
                            color: '#2C2C2C'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + ' трлн ₩';
                            }
                        },
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#FFD700',
                        bodyColor: '#fff'
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 2000
                }
            }
        });
    }

    // Cancer market growth chart
    createCancerMarketChart() {
        const ctx = document.getElementById('cancerMarketChart');
        if (!ctx) return;

        const cancerMarketData = {
            2017: 104,
            2020: 233
        };

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['2017 год', '2020 год', '2024 год (прогноз)'],
                datasets: [{
                    label: 'Рынок противораковых препаратов',
                    data: [cancerMarketData[2017], cancerMarketData[2020], 350],
                    backgroundColor: ['#FFD700', '#FFA500', '#B8860B'],
                    borderColor: ['#B8860B', '#FF8C00', '#DAA520'],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y + ' млрд';
                            }
                        },
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#FFD700',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value + ' млрд';
                            },
                            color: '#5D4E37',
                            font: {
                                weight: '500'
                            }
                        },
                        grid: {
                            color: 'rgba(184, 134, 11, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#5D4E37',
                            font: {
                                weight: '500'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GoldenCellApp();
});

// Add some extra interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    const molecules = document.querySelectorAll('.molecule');
    
    if (hero && molecules.length > 0) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            molecules.forEach((molecule, index) => {
                const speed = 0.3 + (index * 0.1);
                molecule.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // Tech cards hover effect enhancement
    const techCards = document.querySelectorAll('.tech-card');
    techCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 20px 40px rgba(255, 215, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '';
        });
    });

    // Product cards click interaction
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(1.02)';
            setTimeout(() => {
                card.style.transform = '';
            }, 200);
        });
    });
});