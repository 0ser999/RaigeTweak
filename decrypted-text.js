/**
 * Decrypted Text Animation - Vanilla JavaScript version
 * Adapted from React component
 */

class DecryptedText {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            text: options.text || element.textContent.trim(),
            speed: options.speed || 50,
            maxIterations: options.maxIterations || 10,
            sequential: options.sequential || false,
            revealDirection: options.revealDirection || 'start',
            useOriginalCharsOnly: options.useOriginalCharsOnly || false,
            characters: options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=',
            className: options.className || 'revealed',
            encryptedClassName: options.encryptedClassName || 'encrypted',
            animateOn: options.animateOn || 'view'
        };
        
        this.displayText = this.options.text;
        this.isHovering = false;
        this.isScrambling = false;
        this.revealedIndices = new Set();
        this.hasAnimated = false;
        this.interval = null;
        this.currentIteration = 0;
        
        this.init();
    }

    init() {
        // Create wrapper structure
        const wrapper = document.createElement('span');
        wrapper.className = 'decrypted-text-wrapper';
        wrapper.style.cssText = 'display: inline-block; white-space: pre-wrap;';
        
        // Create screen reader only text
        const srOnly = document.createElement('span');
        srOnly.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;';
        srOnly.textContent = this.displayText;
        
        // Create visible text container
        const visibleText = document.createElement('span');
        visibleText.setAttribute('aria-hidden', 'true');
        visibleText.className = 'decrypted-text-visible';
        
        wrapper.appendChild(srOnly);
        wrapper.appendChild(visibleText);
        
        // Replace element content
        this.element.innerHTML = '';
        this.element.appendChild(wrapper);
        
        this.visibleText = visibleText;
        this.wrapper = wrapper;
        
        // Setup animation based on animateOn option
        if (this.options.animateOn === 'view' || this.options.animateOn === 'both') {
            this.setupIntersectionObserver();
        }
        
        if (this.options.animateOn === 'hover' || this.options.animateOn === 'both') {
            this.setupHoverListeners();
        }
        
        // Initial render
        this.render();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.startAnimation();
                    this.hasAnimated = true;
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        });
        
        observer.observe(this.element);
    }

    setupHoverListeners() {
        this.wrapper.addEventListener('mouseenter', () => {
            this.isHovering = true;
            this.startAnimation();
        });
        
        this.wrapper.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.stopAnimation();
            this.displayText = this.options.text;
            this.revealedIndices = new Set();
            this.render();
        });
    }

    getNextIndex(revealedSet) {
        const textLength = this.options.text.length;
        switch (this.options.revealDirection) {
            case 'start':
                return revealedSet.size;
            case 'end':
                return textLength - 1 - revealedSet.size;
            case 'center': {
                const middle = Math.floor(textLength / 2);
                const offset = Math.floor(revealedSet.size / 2);
                const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;
                
                if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
                    return nextIndex;
                }
                
                for (let i = 0; i < textLength; i++) {
                    if (!revealedSet.has(i)) return i;
                }
                return 0;
            }
            default:
                return revealedSet.size;
        }
    }

    shuffleText(originalText, currentRevealed) {
        const availableChars = this.options.useOriginalCharsOnly
            ? Array.from(new Set(originalText.split(''))).filter(char => char !== ' ')
            : this.options.characters.split('');

        if (this.options.useOriginalCharsOnly) {
            const positions = originalText.split('').map((char, i) => ({
                char,
                isSpace: char === ' ',
                index: i,
                isRevealed: currentRevealed.has(i)
            }));

            const nonSpaceChars = positions.filter(p => !p.isSpace && !p.isRevealed).map(p => p.char);

            for (let i = nonSpaceChars.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [nonSpaceChars[i], nonSpaceChars[j]] = [nonSpaceChars[j], nonSpaceChars[i]];
            }

            let charIndex = 0;
            return positions
                .map(p => {
                    if (p.isSpace) return ' ';
                    if (p.isRevealed) return originalText[p.index];
                    return nonSpaceChars[charIndex++];
                })
                .join('');
        } else {
            return originalText
                .split('')
                .map((char, i) => {
                    if (char === ' ') return ' ';
                    if (currentRevealed.has(i)) return originalText[i];
                    return availableChars[Math.floor(Math.random() * availableChars.length)];
                })
                .join('');
        }
    }

    startAnimation() {
        if (this.interval) return;
        
        this.isScrambling = true;
        this.currentIteration = 0;
        
        this.interval = setInterval(() => {
            if (this.options.sequential) {
                if (this.revealedIndices.size < this.options.text.length) {
                    const nextIndex = this.getNextIndex(this.revealedIndices);
                    this.revealedIndices.add(nextIndex);
                    this.displayText = this.shuffleText(this.options.text, this.revealedIndices);
                    this.render();
                } else {
                    this.stopAnimation();
                    this.displayText = this.options.text;
                    this.render();
                }
            } else {
                this.displayText = this.shuffleText(this.options.text, this.revealedIndices);
                this.render();
                this.currentIteration++;
                if (this.currentIteration >= this.options.maxIterations) {
                    this.stopAnimation();
                    this.displayText = this.options.text;
                    this.render();
                }
            }
        }, this.options.speed);
    }

    stopAnimation() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isScrambling = false;
    }

    render() {
        if (!this.visibleText) return;
        
        this.visibleText.innerHTML = '';
        this.displayText.split('').forEach((char, index) => {
            const span = document.createElement('span');
            const isRevealedOrDone = this.revealedIndices.has(index) || !this.isScrambling || !this.isHovering;
            span.className = isRevealedOrDone ? this.options.className : this.options.encryptedClassName;
            span.textContent = char;
            this.visibleText.appendChild(span);
        });
        
        // Update screen reader text
        const srOnly = this.wrapper.querySelector('span[style*="position: absolute"]');
        if (srOnly) {
            srOnly.textContent = this.displayText;
        }
    }
}

// Auto-initialize elements with data-decrypted attribute
function initDecryptedText() {
    const elements = document.querySelectorAll('[data-decrypted]');
    elements.forEach(element => {
        const text = element.getAttribute('data-decrypted') || element.textContent.trim();
        const speed = parseInt(element.getAttribute('data-speed')) || 50;
        const maxIterations = parseInt(element.getAttribute('data-max-iterations')) || 10;
        const sequential = element.getAttribute('data-sequential') === 'true';
        const revealDirection = element.getAttribute('data-reveal-direction') || 'start';
        const animateOn = element.getAttribute('data-animate-on') || 'view';
        
        new DecryptedText(element, {
            text,
            speed,
            maxIterations,
            sequential,
            revealDirection,
            animateOn
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDecryptedText);
} else {
    initDecryptedText();
}

// Export for manual initialization
window.DecryptedText = DecryptedText;

