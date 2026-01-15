// Features Carousel - Vanilla JavaScript Implementation
class FeaturesCarousel {
  constructor(container, options = {}) {
    this.container = container;
    this.baseWidth = options.baseWidth || 400;
    this.autoplay = options.autoplay !== false;
    this.autoplayDelay = options.autoplayDelay || 3000;
    this.pauseOnHover = options.pauseOnHover !== false;
    this.loop = options.loop !== false;
    this.gap = 20;
    this.dragBuffer = 50;
    this.velocityThreshold = 300;
    this.visibleItems = 3; // Show 3 items at once
    this.freeDrag = true; // Allow free dragging without snap
    this.momentum = true; // Enable momentum scrolling
    this.momentumDeceleration = 0.95; // Deceleration factor for momentum
    
    this.itemWidth = this.baseWidth - 32; // containerPadding * 2
    this.trackItemOffset = this.itemWidth + this.gap;
    
    this.isHovered = false;
    this.isAnimating = false;
    this.isJumping = false;
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;
    this.lastDragTime = 0;
    this.lastDragX = 0;
    this.velocity = 0;
    this.momentumAnimation = null;
    
    this.items = [];
    this.itemsForRender = [];
    this.autoplayTimer = null;
    this.mouseActivityTimer = null;
    this.isMouseActive = false; // Track if mouse is moving
    this.mouseInactivityDelay = 3000; // Resume autoplay after 3 seconds of no mouse movement
    this.position = 0; // Will be set after items are extracted
    
    this.init();
  }
  
  init() {
    this.extractItems();
    this.createCarousel();
    this.attachEventListeners();
    if (this.autoplay) {
      this.startAutoplay();
    }
  }
  
  extractItems() {
    const featureCards = this.container.querySelectorAll('.features-grid:not(.features-grid-trust) .feature-card');
    featureCards.forEach((card, index) => {
      const iconElement = card.querySelector('.feature-icon');
      const iconImg = iconElement?.querySelector('img');
      const iconSrc = iconImg?.src || iconElement?.textContent || '';
      const title = card.querySelector('h3')?.textContent || '';
      const description = card.querySelector('p')?.textContent || '';
      
      this.items.push({
        id: index + 1,
        icon: iconSrc,
        title,
        description,
        element: card.cloneNode(true)
      });
    });
    
    if (this.loop && this.items.length > 0) {
      // Create multiple clones for truly infinite loop (no visible restart)
      // Structure: [clone set 1] [original] [clone set 2] [clone set 3]
      this.itemsForRender = [
        ...this.items, // Clone set 1 (for backward scrolling)
        ...this.items, // Original set
        ...this.items, // Clone set 2 (for forward scrolling)
        ...this.items  // Clone set 3 (extra buffer for seamless loop)
      ];
      // Start at the beginning of the original set
      this.position = this.items.length;
    } else {
      this.itemsForRender = this.items;
      this.position = 0;
    }
  }
  
  createCarousel() {
    // Create carousel container
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'features-carousel-container';
    carouselContainer.style.width = '100%';
    carouselContainer.style.maxWidth = '1200px';
    carouselContainer.style.height = 'auto';
    carouselContainer.style.minHeight = '500px';
    carouselContainer.style.position = 'relative';
    carouselContainer.style.margin = '3rem auto 0';
    carouselContainer.style.overflowX = 'hidden';
    carouselContainer.style.overflowY = 'visible';
    carouselContainer.setAttribute('data-swipe-text', '← Swipe to navigate →');
    carouselContainer.id = 'featuresCarouselContainer';
    
    // Create track wrapper for infinite loop (hides edges)
    const trackWrapper = document.createElement('div');
    trackWrapper.className = 'features-carousel-track-wrapper';
    trackWrapper.style.overflowX = 'hidden';
    trackWrapper.style.overflowY = 'visible';
    trackWrapper.style.position = 'relative';
    trackWrapper.style.width = '100%';
    
    // Create track
    const track = document.createElement('div');
    track.className = 'features-carousel-track';
    track.style.width = `${this.itemsForRender.length * this.trackItemOffset}px`;
    track.style.gap = `${this.gap}px`;
    track.style.display = 'flex';
    track.style.justifyContent = 'flex-start';
    track.style.alignItems = 'stretch';
    track.style.transform = `translateX(${-this.position * this.trackItemOffset}px)`;
    track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Create items
    this.itemsForRender.forEach((item, index) => {
      const carouselItem = this.createCarouselItem(item, index);
      track.appendChild(carouselItem);
    });
    
    // Initial visibility update
    setTimeout(() => {
      this.updateItemVisibility();
    }, 100);
    
    trackWrapper.appendChild(track);
    carouselContainer.appendChild(trackWrapper);
    
    // Create indicators
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'features-carousel-indicators-container';
    const indicators = document.createElement('div');
    indicators.className = 'features-carousel-indicators';
    
    this.items.forEach((_, index) => {
      const indicator = document.createElement('div');
      // Calculate initial active index based on starting position
      const initialActiveIndex = this.loop ? this.position % this.items.length : 0;
      indicator.className = `features-carousel-indicator ${index === initialActiveIndex ? 'active' : 'inactive'}`;
      indicator.addEventListener('click', () => {
        if (this.loop) {
          // Jump to the equivalent position in the original set
          const targetPosition = this.items.length + index;
          this.goToPosition(targetPosition);
        } else {
          this.goToPosition(index);
        }
      });
      indicators.appendChild(indicator);
    });
    
    indicatorsContainer.appendChild(indicators);
    carouselContainer.appendChild(indicatorsContainer);
    
    // Replace grid with carousel
    const grid = this.container.querySelector('.features-grid');
    if (grid) {
      grid.style.display = 'none';
      this.container.appendChild(carouselContainer);

      const trustGrid = this.container.querySelector('.features-grid-trust');
      if (trustGrid) {
        const divider = document.createElement('div');
        divider.className = 'features-trust-divider';
        divider.setAttribute('aria-hidden', 'true');
        this.container.appendChild(divider);
        this.container.appendChild(trustGrid);
      }
    }
    
    this.track = track;
    this.trackWrapper = trackWrapper;
    this.carouselContainer = carouselContainer;
    this.indicators = indicators.querySelectorAll('.features-carousel-indicator');
  }
  
  createCarouselItem(item, index) {
    const carouselItem = document.createElement('div');
    carouselItem.className = 'features-carousel-item';
    carouselItem.style.width = `${this.itemWidth}px`;
    carouselItem.style.minWidth = `${this.itemWidth}px`;
    carouselItem.style.maxWidth = `${this.itemWidth}px`;
    carouselItem.style.flexShrink = '0';
    carouselItem.style.cursor = 'grab';
    carouselItem.style.opacity = '1';
    
    // Use the original card structure
    const card = item.element.cloneNode(true);
    card.style.margin = '0';
    card.style.width = '100%';
    card.style.height = 'auto';
    
    carouselItem.appendChild(card);
    
    // Drag handlers
    carouselItem.addEventListener('mousedown', (e) => this.handleDragStart(e, index));
    carouselItem.addEventListener('touchstart', (e) => this.handleDragStart(e, index));
    
    return carouselItem;
  }
  
  handleDragStart(e, index) {
    // Stop any momentum animation
    if (this.momentumAnimation) {
      cancelAnimationFrame(this.momentumAnimation);
      this.momentumAnimation = null;
    }
    
    this.isDragging = true;
    this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    this.currentX = this.startX;
    this.dragIndex = index;
    this.lastDragTime = Date.now();
    this.lastDragX = this.startX;
    this.velocity = 0;
    
    // Get current transform to start from exact position
    const currentTransform = this.track.style.transform;
    if (currentTransform) {
      const match = currentTransform.match(/translateX\(([^)]+)px\)/);
      if (match) {
        const currentOffset = parseFloat(match[1]);
        // Calculate position based on current offset
        this.position = Math.round(-currentOffset / this.trackItemOffset);
      }
    }
    
    document.addEventListener('mousemove', this.handleDragMove);
    document.addEventListener('mouseup', this.handleDragEnd);
    document.addEventListener('touchmove', this.handleDragMove);
    document.addEventListener('touchend', this.handleDragEnd);
    
    e.preventDefault();
  }
  
  handleDragMove = (e) => {
    if (!this.isDragging) return;
    
    const currentTime = Date.now();
    this.currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const offset = this.currentX - this.startX;
    
    // Calculate velocity for momentum
    if (this.lastDragTime > 0) {
      const timeDelta = currentTime - this.lastDragTime;
      const distanceDelta = this.currentX - this.lastDragX;
      if (timeDelta > 0) {
        this.velocity = distanceDelta / timeDelta; // pixels per millisecond
      }
    }
    
    this.lastDragTime = currentTime;
    this.lastDragX = this.currentX;
    
    // Free drag - move exactly where the user drags
    let dragOffset = -this.position * this.trackItemOffset + offset;
    
    // During drag, check for loop bounds and adjust immediately
    if (this.loop && this.items.length > 0) {
      const itemsPerSet = this.items.length;
      let currentDragPosition = Math.round(-dragOffset / this.trackItemOffset);
      
      // If we've scrolled past the third clone set, jump back immediately
      if (currentDragPosition >= itemsPerSet * 3) {
        const excess = currentDragPosition - itemsPerSet * 3;
        this.position = itemsPerSet + excess;
        dragOffset = -this.position * this.trackItemOffset + (offset % (itemsPerSet * this.trackItemOffset));
      }
      // If we've scrolled before the first clone set, jump forward immediately
      else if (currentDragPosition < itemsPerSet) {
        const deficit = itemsPerSet - currentDragPosition;
        this.position = itemsPerSet * 2 - deficit;
        dragOffset = -this.position * this.trackItemOffset - (Math.abs(offset) % (itemsPerSet * this.trackItemOffset));
      }
    }
    
    this.track.style.transition = 'none';
    this.track.style.transform = `translateX(${dragOffset}px)`;
  }
  
  handleDragEnd = (e) => {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const offset = this.currentX - this.startX;
    
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
    document.removeEventListener('touchmove', this.handleDragMove);
    document.removeEventListener('touchend', this.handleDragEnd);
    
    // Get current transform to calculate exact position
    const currentTransform = this.track.style.transform;
    let currentOffset = -this.position * this.trackItemOffset + offset;
    
    if (currentTransform) {
      const match = currentTransform.match(/translateX\(([^)]+)px\)/);
      if (match) {
        currentOffset = parseFloat(match[1]);
      }
    }
    
    let newPosition = Math.round(-currentOffset / this.trackItemOffset);
    
    // Ensure position is within loop bounds before applying momentum
    if (this.loop && this.items.length > 0) {
      const itemsPerSet = this.items.length;
      // Normalize position to be within the safe range (original set + one clone set on each side)
      if (newPosition >= itemsPerSet * 3) {
        newPosition = itemsPerSet + (newPosition % itemsPerSet);
      } else if (newPosition < itemsPerSet) {
        newPosition = itemsPerSet * 2 + (newPosition % itemsPerSet);
      }
    }
    
    // Apply momentum if enabled and velocity is significant
    if (this.momentum && Math.abs(this.velocity) > 0.1) {
      this.applyMomentum(newPosition, this.velocity);
    } else {
      // No momentum - just go to the calculated position
      this.track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      this.goToPosition(newPosition);
    }
    
    // Reset drag tracking
    this.lastDragTime = 0;
    this.lastDragX = 0;
    this.velocity = 0;
  }
  
  applyMomentum(startPosition, initialVelocity) {
    // Cancel any existing momentum animation
    if (this.momentumAnimation) {
      cancelAnimationFrame(this.momentumAnimation);
    }
    
    let currentVelocity = initialVelocity * 10; // Convert to pixels per frame (roughly)
    let currentOffset = -startPosition * this.trackItemOffset;
    const minVelocity = 0.5; // Stop when velocity is too low
    const itemsPerSet = this.items.length;
    
    const animate = () => {
      if (Math.abs(currentVelocity) < minVelocity) {
        // Momentum ended - snap to nearest position
        const finalPosition = Math.round(-currentOffset / this.trackItemOffset);
        this.track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        this.goToPosition(finalPosition);
        this.momentumAnimation = null;
        return;
      }
      
      // Apply velocity
      currentOffset += currentVelocity;
      currentVelocity *= this.momentumDeceleration;
      
      // Calculate current position
      let currentPosition = Math.round(-currentOffset / this.trackItemOffset);
      
      // Check if we've exceeded bounds and need to loop
      if (this.loop && itemsPerSet > 0) {
        // If we've scrolled past the third clone set, jump back immediately
        if (currentPosition >= itemsPerSet * 3) {
          const excess = currentPosition - itemsPerSet * 3;
          currentPosition = itemsPerSet + excess; // Jump back to original set
          currentOffset = -currentPosition * this.trackItemOffset;
        }
        // If we've scrolled before the first clone set, jump forward immediately
        else if (currentPosition < itemsPerSet) {
          const deficit = itemsPerSet - currentPosition;
          currentPosition = itemsPerSet * 2 - deficit; // Jump forward to original set
          currentOffset = -currentPosition * this.trackItemOffset;
        }
      }
      
      // Update transform
      this.track.style.transition = 'none';
      this.track.style.transform = `translateX(${currentOffset}px)`;
      
      // Continue animation
      this.momentumAnimation = requestAnimationFrame(animate);
    };
    
    this.momentumAnimation = requestAnimationFrame(animate);
  }
  
  goToPosition(newPosition) {
    if (this.isAnimating && !this.isJumping) return;
    
    if (this.loop) {
      // Allow infinite loop - wrap around seamlessly
      // Don't restrict, let it go beyond and handle in updatePosition
      this.position = newPosition;
    } else {
      const max = this.itemsForRender.length - 1;
      this.position = Math.max(0, Math.min(newPosition, max));
    }
    this.updatePosition();
  }
  
  updatePosition() {
    // Check for loop bounds BEFORE animating and adjust immediately if needed
    if (this.loop && this.items.length > 0) {
      const itemsPerSet = this.items.length;
      
      // If we've scrolled past the third clone set, jump back immediately (no animation)
      if (this.position >= itemsPerSet * 3) {
        this.isJumping = true;
        this.track.style.transition = 'none';
        this.position = this.position - itemsPerSet * 2; // Jump back to equivalent position in original set
        this.track.style.transform = `translateX(${-this.position * this.trackItemOffset}px)`;
        requestAnimationFrame(() => {
          this.isJumping = false;
          this.isAnimating = false;
          this.updateItemVisibility();
          this.updateIndicators();
        });
        return;
      }
      
      // If we've scrolled before the first clone set, jump forward immediately (no animation)
      if (this.position < itemsPerSet) {
        this.isJumping = true;
        this.track.style.transition = 'none';
        this.position = this.position + itemsPerSet * 2; // Jump forward to equivalent position in original set
        this.track.style.transform = `translateX(${-this.position * this.trackItemOffset}px)`;
        requestAnimationFrame(() => {
          this.isJumping = false;
          this.isAnimating = false;
          this.updateItemVisibility();
          this.updateIndicators();
        });
        return;
      }
    }
    
    this.isAnimating = true;
    this.track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    this.track.style.transform = `translateX(${-this.position * this.trackItemOffset}px)`;
    
    // Update indicators
    this.updateIndicators();
    
    // Update item visibility/opacity for better UX
    this.updateItemVisibility();
    
    // Mark animation as complete after transition
    const handleTransitionEnd = () => {
      this.isAnimating = false;
      this.track.removeEventListener('transitionend', handleTransitionEnd);
    };
    
    this.track.addEventListener('transitionend', handleTransitionEnd, { once: true });
  }
  
  updateIndicators() {
    const activeIndex = this.loop 
      ? this.position % this.items.length 
      : Math.min(this.position, this.items.length - 1);
    
    this.indicators.forEach((indicator, index) => {
      if (index === activeIndex) {
        indicator.classList.add('active');
        indicator.classList.remove('inactive');
      } else {
        indicator.classList.remove('active');
        indicator.classList.add('inactive');
      }
    });
  }
  
  updateItemVisibility() {
    const items = this.track.querySelectorAll('.features-carousel-item');
    items.forEach((item, index) => {
      const distance = Math.abs(index - this.position);
      item.classList.remove('is-active', 'is-near', 'is-far');
      if (distance === 0) {
        item.classList.add('is-active');
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
        item.style.filter = 'none';
        item.style.zIndex = '2';
      } else if (distance === 1) {
        item.classList.add('is-near');
        item.style.opacity = '0.7';
        item.style.transform = 'scale(0.95)';
        item.style.filter = 'none';
        item.style.zIndex = '1';
      } else {
        item.classList.add('is-far');
        item.style.opacity = '0.4';
        item.style.transform = 'scale(0.9)';
        item.style.filter = 'none';
        item.style.zIndex = '0';
      }
    });
  }
  
  attachEventListeners() {
    if (this.pauseOnHover && this.carouselContainer) {
      this.carouselContainer.addEventListener('mouseenter', () => {
        this.isHovered = true;
        this.stopAutoplay();
      });
      
      this.carouselContainer.addEventListener('mouseleave', () => {
        this.isHovered = false;
        if (this.autoplay && !this.isMouseActive) {
          this.startAutoplay();
        }
      });
    }
    
    // Detect mouse movement globally
    this.handleMouseMove = () => {
      this.isMouseActive = true;
      this.stopAutoplay();
      
      // Clear existing inactivity timer
      if (this.mouseActivityTimer) {
        clearTimeout(this.mouseActivityTimer);
      }
      
      // Set timer to resume autoplay after inactivity
      this.mouseActivityTimer = setTimeout(() => {
        this.isMouseActive = false;
        if (this.autoplay && !this.isHovered && !this.isAnimating && !this.isDragging) {
          this.startAutoplay();
        }
      }, this.mouseInactivityDelay);
    };
    
    document.addEventListener('mousemove', this.handleMouseMove);
  }
  
  startAutoplay() {
    this.stopAutoplay();
    
    if (this.itemsForRender.length <= 1) return;
    
    // Only start autoplay if mouse is not active
    if (this.isMouseActive) return;
    
    this.autoplayTimer = setInterval(() => {
      if (!this.isHovered && !this.isAnimating && !this.isDragging && !this.isMouseActive) {
        // Always move forward - loop will handle wrapping
        const nextPosition = this.position + 1;
        this.goToPosition(nextPosition);
      }
    }, this.autoplayDelay);
  }
  
  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
  
  destroy() {
    this.stopAutoplay();
    if (this.mouseActivityTimer) {
      clearTimeout(this.mouseActivityTimer);
    }
    if (this.handleMouseMove) {
      document.removeEventListener('mousemove', this.handleMouseMove);
    }
    if (this.momentumAnimation) {
      cancelAnimationFrame(this.momentumAnimation);
    }
  }
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const featuresSection = document.querySelector('.features-section');
  if (featuresSection) {
    new FeaturesCarousel(featuresSection, {
      baseWidth: 320,
      autoplay: true,
      autoplayDelay: 4000,
      pauseOnHover: true,
      loop: true
    });
  }
});

