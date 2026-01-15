// Dock Effect - Vanilla JavaScript Implementation
class Dock {
  constructor(container, options = {}) {
    this.container = container;
    this.panelHeight = options.panelHeight || 68;
    this.baseItemSize = options.baseItemSize || 50;
    this.magnification = options.magnification || 70;
    this.distance = options.distance || 200;
    this.spring = {
      mass: options.spring?.mass || 0.1,
      stiffness: options.spring?.stiffness || 150,
      damping: options.spring?.damping || 12
    };

    this.mouseX = Infinity;
    this.isHovered = false;
    this.items = [];
    this.animationFrame = null;

    this.init();
  }

  init() {
    this.createDockPanel();
    this.attachEventListeners();
    this.animate();
  }

  createDockPanel() {
    const dockOuter = document.createElement('div');
    dockOuter.className = 'dock-outer';
    dockOuter.style.height = `${this.panelHeight}px`;

    const dockPanel = document.createElement('div');
    dockPanel.className = 'dock-panel';
    dockPanel.style.height = `${this.panelHeight}px`;

    // Get all dock items from the container
    const items = this.container.querySelectorAll('.dock-item');
    items.forEach((item, index) => {
      const dockItem = this.createDockItem(item, index);
      dockPanel.appendChild(dockItem);
      this.items.push({
        element: dockItem,
        originalSize: this.baseItemSize,
        currentSize: this.baseItemSize,
        targetSize: this.baseItemSize,
        velocity: 0,
        label: item.querySelector('.dock-label')?.textContent || item.getAttribute('data-label') || ''
      });
    });

    dockOuter.appendChild(dockPanel);
    this.container.appendChild(dockOuter);
    this.dockPanel = dockPanel;
    this.dockOuter = dockOuter;
    
    // Store reference for external access
    this.container.dockInstance = this;
  }

  createDockItem(originalItem, index) {
    const dockItem = document.createElement('div');
    
    // Copy classes from original
    const originalClasses = originalItem.className;
    dockItem.className = originalClasses.includes('dock-item') ? originalClasses : `dock-item ${originalClasses}`;
    
    // Set base size
    dockItem.style.width = `${this.baseItemSize}px`;
    dockItem.style.minHeight = `${this.baseItemSize}px`;
    
    // Accessibility attributes
    const ariaLabel = originalItem.getAttribute('aria-label') || originalItem.getAttribute('data-label') || '';
    dockItem.setAttribute('tabindex', '0');
    dockItem.setAttribute('role', 'button');
    dockItem.setAttribute('aria-label', ariaLabel);
    dockItem.setAttribute('data-label', originalItem.getAttribute('data-label') || '');
    
    // Copy disabled state
    if (originalItem.hasAttribute('disabled') || originalItem.getAttribute('aria-disabled') === 'true') {
      dockItem.setAttribute('aria-disabled', 'true');
      dockItem.setAttribute('tabindex', '-1');
    }

    // Copy icon
    const icon = originalItem.querySelector('.dock-icon') || originalItem.querySelector('svg') || originalItem;
    const iconClone = icon.cloneNode(true);
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'dock-icon';
    iconWrapper.setAttribute('aria-hidden', 'true');
    iconWrapper.appendChild(iconClone);
    dockItem.appendChild(iconWrapper);

    // Create label (always visible)
    const label = document.createElement('div');
    label.className = 'dock-label dock-label-visible';
    const labelText = originalItem.getAttribute('data-label') || originalItem.querySelector('.dock-label')?.textContent || '';
    label.textContent = labelText;
    dockItem.appendChild(label);

    // Navigation handler
    const handleNavigation = () => {
      if (originalItem.onclick) {
        originalItem.onclick();
      } else if (originalItem.getAttribute('data-href')) {
        const href = originalItem.getAttribute('data-href');
        if (href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!prefersReducedMotion && typeof window.slowScrollToElement === 'function') {
              window.slowScrollToElement(target);
            } else {
              target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            }
            // Update active state
            this.updateActiveState(dockItem, href);
          }
        } else {
          window.location.href = href;
        }
      }
    };

    // Click handler
    dockItem.addEventListener('click', (e) => {
      e.preventDefault();
      if (!dockItem.hasAttribute('aria-disabled')) {
        handleNavigation();
      }
    });

    // Keyboard navigation
    dockItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!dockItem.hasAttribute('aria-disabled')) {
          handleNavigation();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        this.navigateWithKeyboard(dockItem, e.key === 'ArrowRight' ? 1 : -1);
      }
    });

    // Focus events for accessibility
    dockItem.addEventListener('focus', () => {
      dockItem.setAttribute('aria-selected', 'true');
    });

    dockItem.addEventListener('blur', () => {
      dockItem.removeAttribute('aria-selected');
    });

    // Hover events
    dockItem.addEventListener('mouseenter', () => {
      this.items[index].isHovered = true;
    });

    dockItem.addEventListener('mouseleave', () => {
      this.items[index].isHovered = false;
    });

    return dockItem;
  }

  navigateWithKeyboard(currentItem, direction) {
    const allItems = Array.from(this.dockPanel.querySelectorAll('.dock-item[tabindex="0"]'));
    const currentIndex = allItems.indexOf(currentItem);
    const nextIndex = currentIndex + direction;
    
    if (nextIndex >= 0 && nextIndex < allItems.length) {
      allItems[nextIndex].focus();
    }
  }

  updateActiveState(item, href) {
    // Remove active state from all items
    this.dockPanel.querySelectorAll('.dock-item').forEach(i => {
      i.removeAttribute('aria-current');
    });
    
    // Set active state on current item
    if (href.startsWith('#')) {
      item.setAttribute('aria-current', 'page');
    }
  }

  attachEventListeners() {
    this.dockPanel.addEventListener('mousemove', (e) => {
      this.isHovered = true;
      this.mouseX = e.pageX;
      this.updateDockHeight(true);
    });

    this.dockPanel.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.mouseX = Infinity;
      this.updateDockHeight(false);
    });
  }

  updateDockHeight(isHovered) {
    const maxHeight = Math.max(256, this.magnification + this.magnification / 2 + 4);
    const targetHeight = isHovered ? maxHeight : this.panelHeight;
    
    this.dockOuter.style.height = `${targetHeight}px`;
  }

  springAnimation(current, target, velocity) {
    const spring = this.spring;
    const delta = target - current;
    const springForce = delta * spring.stiffness;
    const dampingForce = velocity * spring.damping;
    const acceleration = (springForce - dampingForce) / spring.mass;
    const newVelocity = velocity + acceleration * 0.016; // ~60fps
    const newCurrent = current + newVelocity * 0.016;

    return {
      value: newCurrent,
      velocity: newVelocity
    };
  }

  animate() {
    this.items.forEach((item, index) => {
      const rect = item.element.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(this.mouseX - itemCenterX);

      // Calculate target size based on distance
      let targetSize = this.baseItemSize;
      if (this.isHovered && this.mouseX !== Infinity && distance < this.distance) {
        const scale = 1 - (distance / this.distance);
        targetSize = this.baseItemSize + (this.magnification - this.baseItemSize) * scale;
      }

      item.targetSize = targetSize;

      // Spring animation
      const result = this.springAnimation(item.currentSize, item.targetSize, item.velocity);
      item.currentSize = result.value;
      item.velocity = result.velocity;

      // Apply size
      const size = Math.max(this.baseItemSize, Math.min(this.magnification, item.currentSize));
      item.element.style.width = `${size}px`;
      item.element.style.height = `${size}px`;

      // Labels are always visible now, no need to update visibility
      // But we can enhance them on hover
      const label = item.element.querySelector('.dock-label');
      if (label && item.isHovered) {
        label.style.transform = 'scale(1.05)';
      } else if (label) {
        label.style.transform = 'scale(1)';
      }
    });

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

// Initialize Dock when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const dockContainers = document.querySelectorAll('.dock-container');
  dockContainers.forEach(container => {
    const options = {
      panelHeight: parseInt(container.getAttribute('data-panel-height')) || 68,
      baseItemSize: parseInt(container.getAttribute('data-base-size')) || 50,
      magnification: parseInt(container.getAttribute('data-magnification')) || 70,
      distance: parseInt(container.getAttribute('data-distance')) || 200
    };
    const dock = new Dock(container, options);
    
    // Update active state on scroll
    updateActiveStateOnScroll(dock);
  });
});

// Update active state based on scroll position
function updateActiveStateOnScroll(dock) {
  const sections = document.querySelectorAll('section[id]');
  const dockItems = dock.dockPanel.querySelectorAll('.dock-item[data-href^="#"]');
  
  function updateActive() {
    const scrollPos = window.scrollY + 100; // Offset for header
    
    let activeSection = '';
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        activeSection = `#${section.id}`;
      }
    });
    
    // Update active state
    dockItems.forEach(item => {
      const href = item.getAttribute('data-href');
      if (href === activeSection || (activeSection === '' && href === '#home')) {
        item.setAttribute('aria-current', 'page');
        item.classList.add('dock-item-active');
      } else {
        item.removeAttribute('aria-current');
        item.classList.remove('dock-item-active');
      }
    });
  }
  
  // Throttle scroll events
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Initial update
  updateActive();
}

