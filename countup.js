/**
 * CountUp Animation - Vanilla JavaScript version
 * Animates numbers from a starting value to an ending value
 */

class CountUp {
    constructor(element, options = {}) {
        this.element = element;
        this.from = options.from || 0;
        
        // Get target value from data attribute or text content
        if (element.dataset.originalValue) {
            this.to = parseFloat(element.dataset.originalValue);
        } else {
            this.to = parseFloat(element.textContent) || options.to || 0;
            element.dataset.originalValue = this.to.toString();
        }
        
        this.duration = options.duration || 1;
        this.delay = options.delay || 0;
        this.separator = options.separator || '';
        this.direction = options.direction || 'up';
        this.onStart = options.onStart;
        this.onEnd = options.onEnd;
        
        this.currentValue = this.direction === 'down' ? this.to : this.from;
        this.startTime = null;
        this.animationFrame = null;
        this.isAnimating = false;
    }
    
    getDecimalPlaces(num) {
        const str = num.toString();
        if (str.includes('.')) {
            const decimals = str.split('.')[1];
            if (parseInt(decimals) !== 0) {
                return decimals.length;
            }
        }
        return 0;
    }
    
    formatValue(value) {
        const maxDecimals = Math.max(
            this.getDecimalPlaces(this.from),
            this.getDecimalPlaces(this.to)
        );
        const hasDecimals = maxDecimals > 0;
        
        const options = {
            useGrouping: !!this.separator,
            minimumFractionDigits: hasDecimals ? maxDecimals : 0,
            maximumFractionDigits: hasDecimals ? maxDecimals : 0
        };
        
        const formattedNumber = Intl.NumberFormat('en-US', options).format(value);
        return this.separator ? formattedNumber.replace(/,/g, this.separator) : formattedNumber;
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        const now = performance.now();
        const elapsed = (now - this.startTime) / 1000;
        const progress = Math.min(elapsed / this.duration, 1);
        
        const easedProgress = this.easeOutCubic(progress);
        const range = this.to - this.from;
        this.currentValue = this.from + (range * easedProgress);
        
        this.element.textContent = this.formatValue(this.currentValue);
        
        if (progress < 1) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        } else {
            this.element.textContent = this.formatValue(this.to);
            this.isAnimating = false;
            if (this.onEnd) this.onEnd();
        }
    }
    
    start() {
        if (this.isAnimating) return;
        
        this.currentValue = this.direction === 'down' ? this.to : this.from;
        this.element.textContent = this.formatValue(this.currentValue);
        
        if (this.onStart) this.onStart();
        
        setTimeout(() => {
            this.isAnimating = true;
            this.startTime = performance.now();
            this.animate();
        }, this.delay * 1000);
    }
    
    reset() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.isAnimating = false;
        this.currentValue = this.from;
        this.element.textContent = this.formatValue(this.from);
    }
}

// Initialize CountUp on price elements when they come into view
function initCountUp() {
    const priceElements = document.querySelectorAll('.price-amount');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.countupInitialized) {
                entry.target.dataset.countupInitialized = 'true';
                
                const countUp = new CountUp(entry.target, {
                    from: 0,
                    duration: 1,
                    delay: 0.2
                });
                
                countUp.start();
            }
        });
    }, observerOptions);
    
    priceElements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountUp);
} else {
    initCountUp();
}

