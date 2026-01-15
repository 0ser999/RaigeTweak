/**
 * Scroll Float Animation - Vanilla JavaScript version
 * Adapted from React/GSAP component
 */

// Register ScrollTrigger plugin
if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
}

function initScrollFloat() {
    const scrollFloatElements = document.querySelectorAll('.scroll-float');
    
    if (!scrollFloatElements.length || typeof gsap === 'undefined') {
        return;
    }

    scrollFloatElements.forEach((element) => {
        const text = element.getAttribute('data-text') || element.textContent.trim();
        const textSpan = element.querySelector('.scroll-float-text');
        
        if (!textSpan) return;

        // Split text into characters
        const chars = text.split('').map((char, index) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            return span;
        });

        // Clear and add characters
        textSpan.innerHTML = '';
        chars.forEach(char => textSpan.appendChild(char));

        const charElements = textSpan.querySelectorAll('.char');

        // Animation settings - smoother and less tense
        const animationDuration = 1.2;
        const ease = 'power1.out';
        const scrollStart = 'top bottom';
        const scrollEnd = 'bottom top';
        const stagger = 0.015;

        // Set initial state - less extreme values for smoother effect
        gsap.set(charElements, {
            willChange: 'opacity, transform',
            opacity: 0,
            yPercent: 80,
            scaleY: 1.5,
            scaleX: 0.85,
            transformOrigin: '50% 0%'
        });

        // Animate on scroll - smoother animation
        gsap.to(charElements, {
            duration: animationDuration,
            ease: ease,
            opacity: 1,
            yPercent: 0,
            scaleY: 1,
            scaleX: 1,
            stagger: stagger,
            scrollTrigger: {
                trigger: element,
                start: scrollStart,
                end: scrollEnd,
                scrub: 1.5
            }
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for GSAP to load
        setTimeout(initScrollFloat, 100);
    });
} else {
    setTimeout(initScrollFloat, 100);
}

