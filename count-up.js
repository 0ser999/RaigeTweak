// CountUp - Vanilla JavaScript Implementation
class CountUp {
  constructor(element, options = {}) {
    this.element = element;
    this.from = options.from !== undefined ? options.from : parseFloat(element.dataset.from || 0);
    this.to = options.to !== undefined ? options.to : parseFloat(element.dataset.to || 0);
    this.duration = options.duration || 2;
    this.delay = options.delay || 0;
    this.separator = options.separator || '';
    this.direction = options.direction || 'up';
    this.startWhen = options.startWhen !== false;
    this.onStart = options.onStart;
    this.onEnd = options.onEnd;
    
    this.currentValue = this.direction === 'down' ? this.to : this.from;
    this.startTime = null;
    this.animationId = null;
    this.hasStarted = false;
    this.hasEnded = false;
    
    this.maxDecimals = Math.max(this.getDecimalPlaces(this.from), this.getDecimalPlaces(this.to));
    
    // Initialize with starting value
    this.element.textContent = this.formatValue(this.currentValue);
    
    // Start animation when element is in view
    if (this.startWhen) {
      this.initIntersectionObserver();
    } else {
      this.start();
    }
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
    const hasDecimals = this.maxDecimals > 0;
    const options = {
      useGrouping: !!this.separator,
      minimumFractionDigits: hasDecimals ? this.maxDecimals : 0,
      maximumFractionDigits: hasDecimals ? this.maxDecimals : 0
    };
    
    const formattedNumber = Intl.NumberFormat('en-US', options).format(value);
    return this.separator ? formattedNumber.replace(/,/g, this.separator) : formattedNumber;
  }
  
  initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasStarted) {
          this.start();
          observer.unobserve(this.element);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(this.element);
  }
  
  start() {
    if (this.hasStarted) return;
    this.hasStarted = true;
    
    if (typeof this.onStart === 'function') {
      this.onStart();
    }
    
    setTimeout(() => {
      this.startTime = performance.now();
      this.animate();
    }, this.delay * 1000);
    
    setTimeout(() => {
      if (typeof this.onEnd === 'function') {
        this.onEnd();
      }
      this.hasEnded = true;
    }, (this.delay + this.duration) * 1000);
  }
  
  animate() {
    const currentTime = performance.now();
    const elapsed = (currentTime - this.startTime) / 1000;
    const progress = Math.min(elapsed / this.duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    if (this.direction === 'down') {
      this.currentValue = this.to + (this.from - this.to) * (1 - easeOut);
    } else {
      this.currentValue = this.from + (this.to - this.from) * easeOut;
    }
    
    this.element.textContent = this.formatValue(this.currentValue);
    
    if (progress < 1) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      // Ensure final value is exact
      this.currentValue = this.to;
      this.element.textContent = this.formatValue(this.currentValue);
    }
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize all count-up elements on page load
document.addEventListener('DOMContentLoaded', () => {
  const countUpElements = document.querySelectorAll('.count-up');
  countUpElements.forEach(element => {
    new CountUp(element, {
      from: parseFloat(element.dataset.from || 0),
      to: parseFloat(element.dataset.to || 0),
      duration: parseFloat(element.dataset.duration || 2),
      delay: parseFloat(element.dataset.delay || 0),
      separator: element.dataset.separator || '',
      direction: element.dataset.direction || 'up'
    });
  });
});

