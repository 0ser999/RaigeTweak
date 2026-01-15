// Initialize Stripe (only if Stripe.js is loaded - not needed for Payment Links)
let stripe = null;
if (typeof Stripe !== 'undefined') {
    stripe = Stripe('pk_test_51SYXwmKAPuvrP2bDdQOh1DSzeaHsmAc2wgkJhPxhzpeZB4XyQSTJnw6nb9QEkrhoMJgyXfET9CtPMKO6GSZ4YvQs00HHbMmGhE');
} else {
    console.log('Stripe.js not loaded - using Payment Links directly (no Stripe.js needed)');
}

// ==================== CUSTOM TOAST NOTIFICATIONS ====================

// Show custom toast notification
function showToast(message, type = 'info', title = null) {
    // Remove existing toasts if too many
    const container = document.getElementById('toastContainer');
    if (!container) {
        // Create container if it doesn't exist
        const newContainer = document.createElement('div');
        newContainer.id = 'toastContainer';
        newContainer.className = 'toast-container';
        document.body.appendChild(newContainer);
        return showToast(message, type, title);
    }
    
    // Remove old toasts if more than 3
    const toasts = container.querySelectorAll('.toast');
    if (toasts.length >= 3) {
        toasts[0].classList.add('slide-out');
        setTimeout(() => toasts[0].remove(), 300);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icons for different types
    const icons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };
    
    // Default titles
    const defaultTitles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-title">${title || defaultTitles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.classList.add('slide-out'); setTimeout(() => this.parentElement.remove(), 300);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('slide-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

function getScrollOffsetTop() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return 0;
    const position = window.getComputedStyle(navbar).position;
    if (position === 'fixed' || position === 'sticky') {
        return navbar.offsetHeight;
    }
    return 0;
}

function slowScrollToY(targetY, durationMs = null) {
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startY = window.scrollY || window.pageYOffset || 0;
    const clampedTargetY = Math.max(0, targetY);
    const delta = clampedTargetY - startY;

    if (reducedMotion || Math.abs(delta) < 2) {
        window.scrollTo(0, clampedTargetY);
        return;
    }

    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        const computedDuration = durationMs ?? Math.min(2400, Math.max(900, 800 + Math.abs(delta) * 0.35));
        window.lenis.scrollTo(clampedTargetY, { duration: computedDuration / 1000 });
        return;
    }

    if (window.__slowScrollRaf) {
        cancelAnimationFrame(window.__slowScrollRaf);
        window.__slowScrollRaf = null;
    }

    if (typeof window.__smoothWheelCancel === 'function') {
        window.__smoothWheelCancel();
    }

    const computedDuration = durationMs ?? Math.min(2400, Math.max(900, 800 + Math.abs(delta) * 0.35));
    const startTime = performance.now();

    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const tick = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / computedDuration);
        const eased = easeInOutCubic(t);
        window.scrollTo(0, startY + delta * eased);

        if (t < 1) {
            window.__slowScrollRaf = requestAnimationFrame(tick);
        } else {
            window.__slowScrollRaf = null;
        }
    };

    window.__slowScrollRaf = requestAnimationFrame(tick);
}

function slowScrollToElement(element, options = {}) {
    if (!element) return;
    const offsetTop = options.offsetTop ?? (getScrollOffsetTop() + 12);
    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        const opts = { offset: -offsetTop };
        if (typeof options.durationMs === 'number') {
            opts.duration = options.durationMs / 1000;
        }
        window.lenis.scrollTo(element, opts);
        return;
    }
    const rect = element.getBoundingClientRect();
    const targetY = rect.top + (window.scrollY || window.pageYOffset || 0) - offsetTop;
    slowScrollToY(targetY, options.durationMs);
}

window.slowScrollToY = slowScrollToY;
window.slowScrollToElement = slowScrollToElement;

function enableSmoothWheelScroll(options = {}) {
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    if (typeof window.Lenis === 'function') return;
    if (window.lenis) return;
    if (window.__smoothWheelEnabled) return;
    window.__smoothWheelEnabled = true;

    const speed = typeof options.speed === 'number' ? options.speed : 1;
    const smoothness = typeof options.smoothness === 'number' ? options.smoothness : 0.14;

    let targetY = window.scrollY || window.pageYOffset || 0;
    let currentY = targetY;
    let raf = null;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const getMaxScroll = () => Math.max(0, (document.documentElement.scrollHeight || 0) - window.innerHeight);

    const getDeltaY = (e) => {
        let dy = e.deltaY;
        if (e.deltaMode === 1) dy *= 16;
        if (e.deltaMode === 2) dy *= window.innerHeight;
        return dy;
    };

    const isScrollable = (el) => {
        if (!el || el === document.body || el === document.documentElement) return false;
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') return false;
        return el.scrollHeight > el.clientHeight + 1;
    };

    const hasScrollableParent = (start) => {
        let el = start;
        while (el && el !== document.body && el !== document.documentElement) {
            if (isScrollable(el)) return true;
            el = el.parentElement;
        }
        return false;
    };

    const shouldIgnoreWheel = (e) => {
        if (!e) return true;
        if (e.defaultPrevented) return true;
        if (e.ctrlKey || e.metaKey) return true;
        if (e.shiftKey && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return true;
        const target = e.target;
        if (target && target.closest && target.closest('input, textarea, select, [contenteditable="true"]')) return true;
        return target ? hasScrollableParent(target) : false;
    };

    const tick = () => {
        const max = getMaxScroll();
        targetY = clamp(targetY, 0, max);
        currentY = currentY + (targetY - currentY) * smoothness;
        if (Math.abs(targetY - currentY) < 0.5) {
            currentY = targetY;
        }
        window.scrollTo(0, currentY);
        if (currentY !== targetY) {
            raf = requestAnimationFrame(tick);
        } else {
            raf = null;
        }
    };

    const onWheel = (e) => {
        if (shouldIgnoreWheel(e)) return;
        e.preventDefault();
        const max = getMaxScroll();
        const dy = getDeltaY(e) * speed;
        targetY = clamp(targetY + dy, 0, max);
        if (!raf) {
            currentY = window.scrollY || window.pageYOffset || 0;
            raf = requestAnimationFrame(tick);
        }
    };

    window.__smoothWheelCancel = () => {
        if (raf) {
            cancelAnimationFrame(raf);
            raf = null;
        }
        targetY = window.scrollY || window.pageYOffset || 0;
        currentY = targetY;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', () => {
        const max = getMaxScroll();
        targetY = clamp(targetY, 0, max);
        currentY = clamp(currentY, 0, max);
    });
}

let currentProduct = null;
let currentPrice = null;
let paymentWindow = null;
let paymentCheckInterval = null;

// Payment Links Stripe - Configuration
const STRIPE_PAYMENT_LINKS = {
    'raige-tweak': 'https://buy.stripe.com/28EeVe3DCgI7cLBcUY57W05',
    'raige-tweak-ultra': 'https://buy.stripe.com/4gMbJ2fmkezZbHx6wA57W06',
    'raige-tweak-premium': 'https://buy.stripe.com/28EeVe3DCgI7cLBcUY57W05' // Alias for raige-tweak
};

// Note: License key generation is now handled by the secure API
// This function is kept for backward compatibility but should not be used

// Handle Purchase - Open Stripe in new tab with loading
function handlePurchase(productName, paymentLink = null) {
    console.log('handlePurchase called with:', productName, paymentLink);
    
    // Get payment link from configuration if not provided
    if (!paymentLink) {
        paymentLink = STRIPE_PAYMENT_LINKS[productName];
        console.log('Payment link from config:', paymentLink);
    }
    
    if (!paymentLink) {
        console.error('No payment link found for:', productName);
        showToast('Payment link not configured for this product. Please contact support.', 'error', 'Configuration Error');
        return;
    }
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.classList.add('show');
        
        // Avertissement pour la session de 30 minutes
        const loadingContent = loadingOverlay.querySelector('.loading-content');
        if (loadingContent) {
            const warningText = loadingContent.querySelector('p');
            if (warningText) {
                warningText.innerHTML = 'You will be redirected to the secure payment page.<br><small style="opacity: 0.8; margin-top: 0.5rem; display: block;">⚠️ Session expires in 30 minutes</small>';
            }
        }
    } else {
        console.error('Loading overlay not found!');
    }
    
    // Ouvrir Stripe dans le même onglet pour une meilleure fluidité
    console.log('Redirecting to Stripe payment page:', paymentLink);
    window.location.href = paymentLink;
    return;
}

// Start checking payment status
function startPaymentCheck(productName) {
    let checkCount = 0;
    const maxChecks = 300; // 10 minutes max (300 * 2 seconds)
    let windowClosedDetected = false;
    
    // Check every 1 second if payment window is closed (more responsive)
    paymentCheckInterval = setInterval(() => {
        checkCount++;
        
        // Check if payment was successful
        checkPaymentStatus(productName);
        
        // If window is closed, hide loading immediately
        if (paymentWindow && paymentWindow.closed && !windowClosedDetected) {
            windowClosedDetected = true;
            
            // Check one more time if payment was successful
            setTimeout(() => {
                checkPaymentStatus(productName);
                
                // If no payment detected, hide loading
                const paymentStatus = localStorage.getItem(`payment_${productName}`);
                if (!paymentStatus || paymentStatus === 'failed') {
                    stopPaymentCheck();
                    hideLoading();
                }
            }, 2000);
        }
        
        // Timeout after max checks
        if (checkCount >= maxChecks) {
            stopPaymentCheck();
            hideLoading();
            showToast('Payment check timed out. If you completed the payment, please refresh the page.', 'warning', 'Timeout');
        }
    }, 1000); // Check every 1 second for faster response
    
    // Also listen for storage events (from success page)
    window.addEventListener('storage', handleStorageEvent);
    
    // Check localStorage for payment confirmation immediately
    checkPaymentStatus(productName);
}

// Check payment status
function checkPaymentStatus(productName) {
    const paymentStatus = localStorage.getItem(`payment_${productName}`);
    
    if (paymentStatus) {
        try {
            const paymentData = JSON.parse(paymentStatus);
            
            if (paymentData.success && paymentData.licenseKey) {
                // Payment successful - license key received from API
                const licenseKey = paymentData.licenseKey;
                
                // Clear payment status
                localStorage.removeItem(`payment_${productName}`);
                
                // Stop checking
                stopPaymentCheck();
                
                // Hide loading
                hideLoading();
                
                // Show success message with license key
                showLicenseKey(licenseKey, productName);
            }
        } catch (e) {
            // Legacy format (just 'success' string)
            if (paymentStatus === 'success') {
                // Old format - redirect to success page to get license from API
                window.location.href = `success.html?product=${productName}`;
            }
        }
    }
    
    // Check for failed payment
    const failedStatus = localStorage.getItem(`payment_${productName}_failed`);
    if (failedStatus === 'true') {
        localStorage.removeItem(`payment_${productName}_failed`);
        stopPaymentCheck();
        hideLoading();
        showToast('Payment was not completed. Please try again.', 'error', 'Payment Failed');
    }
}

// Handle storage event (from success page)
function handleStorageEvent(e) {
    if (e.key && e.key.startsWith('payment_')) {
        const productName = e.key.replace('payment_', '');
        checkPaymentStatus(productName);
    }
}

// Stop payment check
function stopPaymentCheck() {
    if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
        paymentCheckInterval = null;
    }
    window.removeEventListener('storage', handleStorageEvent);
}

// Hide loading overlay
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
        loadingOverlay.classList.remove('show');
    }
}

// Show license key to user
function showLicenseKey(licenseKey, productName) {
    const productDisplayName = productName === 'raige-tweak' ? 'Raige Tweak' : 'Raige Tweak Ultra';
    
    showToast(`Your license key has been generated! Product: ${productDisplayName}. Check your email for the receipt with your license key.`, 'success', 'Payment Successful');
    
    // Stocker la clé dans localStorage
    const licenseData = {
        key: licenseKey,
        product: productName.toLowerCase().includes('ultimate') ? 'raige-tweak-ultra' : 'raige-tweak',
        productName: productDisplayName,
        date: new Date().toISOString(),
        status: 'active'
    };
    
    const existingLicenses = JSON.parse(localStorage.getItem('raigeTweakLicenses') || '[]');
    existingLicenses.push(licenseData);
    localStorage.setItem('raigeTweakLicenses', JSON.stringify(existingLicenses));
    
    // Afficher la clé dans le footer
    displayUserLicense();
    
    // Ne pas afficher les sections de licence et téléchargement publiquement
    // showLicenseSections(); // Désactivé - les sections restent cachées
    
    // Optionally copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(licenseKey).then(() => {
            console.log('License key copied to clipboard');
        });
    }
}

// Open payment modal
function openPaymentModal(productName, price) {
    currentProduct = productName;
    currentPrice = price;
    
    const modal = document.getElementById('paymentModal');
    const modalProductName = document.getElementById('modalProductName');
    const modalPrice = document.getElementById('modalPrice');
    
    // Format product name for display
    const displayName = productName === 'raige-tweak' ? 'Raige Tweak' : 'Raige Tweak Ultra';
    
    modalProductName.textContent = displayName;
    modalPrice.textContent = price;
    
    // Initialize PayPal button
    initializePayPal();
    
    // Setup Stripe button when modal opens
    setupStripeButton();
    
    modal.style.display = 'block';
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.style.display = 'none';
    currentProduct = null;
    currentPrice = null;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('paymentModal');
    if (event.target === modal) {
        closePaymentModal();
    }
}

// Fonction pour rediriger vers Stripe (utilisée par la modal)
function redirectToStripe(productName) {
    const paymentLink = STRIPE_PAYMENT_LINKS[productName];
    
    if (paymentLink && paymentLink.trim() !== '') {
        console.log('Redirecting to Stripe:', paymentLink);
        window.location.href = paymentLink;
    } else {
        console.error('Payment link not found for:', productName);
        showToast('Payment link not configured. Please contact support.', 'error', 'Configuration Error');
    }
}

// Stripe payment handler - Utilise Stripe Payment Links
function setupStripeButton() {
    if (typeof window.__stripeButtonInitAttempts !== 'number') {
        window.__stripeButtonInitAttempts = 0;
    }
    const stripeButton = document.getElementById('stripeButton');
    if (!stripeButton) {
        window.__stripeButtonInitAttempts++;
        if (window.__stripeButtonInitAttempts < 30) {
            setTimeout(setupStripeButton, 100);
        }
        return;
    }

    window.__stripeButtonInitAttempts = 0;
    
    // Supprimer tous les anciens event listeners en clonant le bouton
    const newButton = stripeButton.cloneNode(true);
    stripeButton.parentNode.replaceChild(newButton, stripeButton);
    
    // Attacher le nouvel event listener
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!currentProduct) {
            showToast('Please select a product first.', 'warning', 'No Product Selected');
            return;
        }
        
        // Rediriger directement vers Stripe
        redirectToStripe(currentProduct);
    });
}

// Initialiser le bouton Stripe quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupStripeButton);
} else {
    setupStripeButton();
}

// Initialize PayPal
function initializePayPal() {
    // Clear previous PayPal button
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = '';
    
    if (!currentPrice) return;
    
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: currentPrice.toString(),
                        currency_code: 'USD'
                    },
                    description: currentProduct === 'raige-tweak' ? 'Raige Tweak' : 'Raige Tweak Ultra'
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                // Handle successful payment
                showToast('Payment successful! Transaction ID: ' + details.id, 'success', 'Payment Successful');
                closePaymentModal();
                
                // In production, you would send this to your server to verify and process
                // fetch('/verify-payment', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ orderID: data.orderID })
                // });
            });
        },
        onError: function(err) {
            console.error('PayPal error:', err);
            showToast('An error occurred with PayPal. Please try again.', 'error', 'PayPal Error');
        }
    }).render('#paypal-button-container');
}

// Newsletter form handler
function handleNewsletterSubmit() {
    const input = document.querySelector('.newsletter-input');
    const email = input.value;
    
    if (email) {
        // Here you would typically send the email to your backend
        showToast('Thank you for subscribing! We\'ll keep you updated.', 'success', 'Subscribed');
        input.value = '';
    }
}

// FAQ Toggle function
function toggleFaq(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Smooth scrolling for anchor links (only on same page)
document.addEventListener('DOMContentLoaded', function() {
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reducedMotion && typeof window.Lenis === 'function') {
        return;
    }

    if (!reducedMotion) {
        enableSmoothWheelScroll({ speed: 0.9, smoothness: 0.08 });
    }

    if (!reducedMotion && window.location && window.location.hash && window.location.hash.length > 1) {
        const initialTarget = document.querySelector(window.location.hash);
        if (initialTarget) {
            window.scrollTo(0, 0);
            setTimeout(() => {
                slowScrollToElement(initialTarget, { offsetTop: getScrollOffsetTop() + 12 });
            }, 0);
        }
    }

    window.addEventListener('popstate', () => {
        if (reducedMotion) return;
        if (window.location && window.location.hash && window.location.hash.length > 1) {
            const popTarget = document.querySelector(window.location.hash);
            if (popTarget) {
                slowScrollToElement(popTarget, { offsetTop: getScrollOffsetTop() + 12 });
            }
        }
    });

    // Only handle anchor links that are on the current page and don't have data-no-smooth
    document.querySelectorAll('a[href^="#"]:not([data-no-smooth])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only prevent default if it's a valid anchor on the same page
            if (href && href.startsWith('#') && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    if (history && history.pushState) {
                        history.pushState(null, '', href);
                    }
                    slowScrollToElement(target, { offsetTop: getScrollOffsetTop() + 12 });
                    return false;
                }
            }
            // If target doesn't exist or href is just "#", allow default behavior
        });
    });

    // Smooth scrolling for nav-links that are anchor links only
    document.querySelectorAll('.nav-link[href^="#"]:not([data-no-smooth])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only prevent default if it's a valid anchor on the same page
            if (href && href.startsWith('#') && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    if (history && history.pushState) {
                        history.pushState(null, '', href);
                    }
                    slowScrollToElement(target, { offsetTop: getScrollOffsetTop() + 12 });
                    return false;
                }
            }
            // If target doesn't exist or href is just "#", allow default behavior
        });
    });
});

// Handle new pricing buttons with "Redirecting..." message
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing buy buttons...');
    const newButtons = document.querySelectorAll('.buy-button-new');
    console.log('Found buttons:', newButtons.length);
    
    newButtons.forEach((button, index) => {
        const productName = button.getAttribute('data-product');
        console.log(`Button ${index}: product = "${productName}"`);
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productName = this.getAttribute('data-product');
            console.log('Button clicked! Product:', productName);
            
            if (!productName) {
                console.error('No product name found on button');
                showToast('Error: Product not specified. Please contact support.', 'error', 'Error');
                return;
            }
            
            
            // Show "Redirecting..." state
            this.classList.add('loading');
            console.log('Loading state added to button');
            
            // Small delay to show the loading state, then proceed
            setTimeout(() => {
                console.log('Calling handlePurchase with:', productName);
                handlePurchase(productName);
            }, 300);
        });
    });
    
    // Also handle buttons that might be added dynamically
    if (newButtons.length === 0) {
        console.warn('No buy buttons found! Check if pricing.html is loaded correctly.');
    }
});


// ==================== LICENSE VALIDATION ====================

// Validate license key via API
async function validateLicenseKey() {
    const input = document.getElementById('licenseKeyInput');
    const resultDiv = document.getElementById('licenseValidationResult');
    
    if (!input || !resultDiv) return;
    
    const licenseKey = input.value.trim();
    
    if (!licenseKey) {
        showToast('Please enter a license key', 'warning', 'Validation Error');
        return;
    }
    
    // Afficher le chargement
    resultDiv.innerHTML = '<div class="license-validation-loading">Validating license key...</div>';
    resultDiv.style.display = 'block';
    
    try {
        const response = await fetch('https://raigetweak.netlify.app/.netlify/functions/validate-license', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ licenseKey: licenseKey })
        });
        
        const data = await response.json();
        
        if (data.valid) {
            resultDiv.innerHTML = `
                <div class="license-validation-success">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <div>
                        <strong>License Key Valid!</strong>
                        <p>Product: ${data.product.name} (${data.product.code})</p>
                        <p style="font-size: 0.9rem; opacity: 0.8;">${data.message}</p>
                    </div>
                </div>
            `;
            showToast('License key is valid!', 'success', 'Validation Success');
        } else {
            resultDiv.innerHTML = `
                <div class="license-validation-error">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                        <strong>Invalid License Key</strong>
                        <p>${data.error || 'The license key you entered is not valid.'}</p>
                    </div>
                </div>
            `;
            showToast(data.error || 'Invalid license key', 'error', 'Validation Failed');
        }
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="license-validation-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                    <strong>Connection Error</strong>
                    <p>Unable to validate license key. Please check your internet connection and try again.</p>
                </div>
            </div>
        `;
        showToast('Connection error. Please try again.', 'error', 'Validation Error');
    }
}

// Handle Enter key in license input
document.addEventListener('DOMContentLoaded', function() {
    const licenseInput = document.getElementById('licenseKeyInput');
    if (licenseInput) {
        licenseInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                validateLicenseKey();
            }
        });
    }
});

// ==================== DOWNLOAD HANDLER ====================

// Configuration du lien de téléchargement (à remplacer par votre vrai lien)
const DOWNLOAD_URL = '#'; // TODO: Remplacer par votre lien de téléchargement (ex: 'https://example.com/raige-tweak.exe')

function handleDownload() {
    // Récupérer la clé de licence de l'utilisateur
    const licenses = JSON.parse(localStorage.getItem('raigeTweakLicenses') || '[]');
    
    if (licenses.length === 0) {
        showToast('Please purchase a license first to download the application.', 'warning', 'Download Required');
        // Rediriger vers la page de pricing
        window.location.href = 'https://raigetweak.netlify.app/pricing';
        return;
    }
    
    if (DOWNLOAD_URL && DOWNLOAD_URL !== '#') {
        window.open(DOWNLOAD_URL, '_blank');
        showToast('Download started!', 'success', 'Download');
    } else {
        showToast('Download link will be available soon. Check your email for the download link.', 'info', 'Download');
    }
}

// ==================== USER LICENSE DISPLAY ====================

function displayUserLicense() {
    const displayDiv = document.getElementById('userLicenseDisplay');
    const keyDisplay = document.getElementById('displayLicenseKey');
    
    if (!displayDiv || !keyDisplay) return;
    
    // Toujours cacher la section de licence dans le footer
    // Les utilisateurs reçoivent leur clé par email
    displayDiv.style.display = 'none';
}

// Afficher les sections de licence et téléchargement seulement si l'utilisateur a une licence valide
function showLicenseSections() {
    const licenses = JSON.parse(localStorage.getItem('raigeTweakLicenses') || '[]');
    
    // Vérifier qu'il y a vraiment une licence valide (avec une clé non vide)
    const hasValidLicense = licenses.length > 0 && licenses.some(license => 
        license.key && 
        license.key.trim() !== '' && 
        license.key !== 'undefined' &&
        license.status !== 'invalid'
    );
    
    // Section de validation de clé - toujours cachée par défaut (accessible via URL si besoin)
    const validateSection = document.getElementById('validate-license');
    if (validateSection) {
        validateSection.style.display = 'none'; // Toujours cachée - section publique pour validation
    }
    
    // Section de téléchargement - toujours cachée par défaut
    // Ne s'affiche que si l'utilisateur a vraiment acheté et a une licence valide
    const downloadSection = document.getElementById('download');
    if (downloadSection) {
        downloadSection.style.display = 'none'; // Toujours cachée par défaut
    }
}

function copyUserLicenseKey() {
    const keyDisplay = document.getElementById('displayLicenseKey');
    if (!keyDisplay) return;
    
    const licenseKey = keyDisplay.textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(licenseKey).then(() => {
            showToast('License key copied to clipboard!', 'success', 'Copied');
        }).catch(() => {
            showToast('Failed to copy license key', 'error', 'Error');
        });
    } else {
        // Fallback pour les navigateurs plus anciens
        const textArea = document.createElement('textarea');
        textArea.value = licenseKey;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('License key copied to clipboard!', 'success', 'Copied');
        } catch (err) {
            showToast('Failed to copy license key', 'error', 'Error');
        }
        document.body.removeChild(textArea);
    }
}


// Spotlight Card Effect - Track mouse movement
function initSpotlightCards() {
    const spotlightCards = document.querySelectorAll('.card-spotlight');
    
    spotlightCards.forEach(card => {
        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            card.style.setProperty('--spotlight-color', 'rgba(255, 255, 255, 0.25)');
        };
        
        card.addEventListener('mousemove', handleMouseMove);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayUserLicense();
    showLicenseSections(); // Afficher les sections de licence seulement si l'utilisateur a une licence
    initSpotlightCards(); // Initialize spotlight effect
});


