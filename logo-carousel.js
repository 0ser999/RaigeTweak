/**
 * Logo Carousel - Scrolls on hover with infinite loop
 */

function initLogoCarousel() {
    const carousel = document.querySelector('.logo-carousel');
    if (!carousel) return;
    
    const track = carousel.querySelector('.logo-carousel-track');
    if (!track) return;
    
    let animationId = null;
    let scrollPosition = 0;
    const baseScrollSpeed = 0.6; // pixels per frame
    let currentSpeed = 0;
    let targetSpeed = 0;
    const speedLerp = 0.08;
    
    // Wait for images to load to get accurate widths
    const images = track.querySelectorAll('img');
    let imagesLoaded = 0;
    const totalImages = images.length;
    
    function checkImagesLoaded() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            setupCarousel();
        }
    }
    
    if (totalImages === 0) {
        setupCarousel();
    } else {
        images.forEach(img => {
            if (img.complete) {
                checkImagesLoaded();
            } else {
                img.addEventListener('load', checkImagesLoaded);
                img.addEventListener('error', checkImagesLoaded);
            }
        });
    }
    
    function setupCarousel() {
        const logos = track.querySelectorAll('.logo-item');
        if (logos.length === 0) return;
        
        const computedTrackStyle = window.getComputedStyle(track);
        const gapPx = Number.parseFloat(computedTrackStyle.gap) || 0;

        // Calculate total width of one set of logos accurately
        let totalWidth = 0;
        logos.forEach((logo, index) => {
            totalWidth += logo.offsetWidth;
            // Add gap after each logo except the last one
            if (index < logos.length - 1) {
                totalWidth += gapPx;
            }
        });
        
        // Duplicate logos multiple times for seamless infinite loop
        // Duplicate at least 2 times to ensure smooth transition
        for (let i = 0; i < 2; i++) {
            logos.forEach(logo => {
                const clone = logo.cloneNode(true);
                track.appendChild(clone);
            });
        }
        
        function animate() {
            currentSpeed += (targetSpeed - currentSpeed) * speedLerp;
            if (Math.abs(currentSpeed) < 0.001 && targetSpeed === 0) {
                currentSpeed = 0;
            }

            scrollPosition += currentSpeed;

            // Use modulo directly for seamless infinite loop
            // This ensures constant speed without any jump or acceleration
            scrollPosition = scrollPosition % totalWidth;
            
            track.style.transform = `translateX(-${scrollPosition}px)`;
            track.style.transition = 'none'; // Prevent any CSS transitions
            
            animationId = requestAnimationFrame(animate);
        }
        
        // Default: move continuously.
        targetSpeed = baseScrollSpeed;

        // Pause when hovering a logo, resume when leaving it.
        // This matches: hover on logo = stop; cursor elsewhere = continue.
        track.addEventListener('mouseenter', (e) => {
            const hoveredLogo = e.target && e.target.closest ? e.target.closest('.logo-item') : null;
            if (hoveredLogo) {
                targetSpeed = 0;
            }
        }, true);

        track.addEventListener('mouseleave', (e) => {
            const leftLogo = e.target && e.target.closest ? e.target.closest('.logo-item') : null;
            if (leftLogo) {
                targetSpeed = baseScrollSpeed;
            }
        }, true);
        
        // Start animation
        animate();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogoCarousel);
} else {
    initLogoCarousel();
}

