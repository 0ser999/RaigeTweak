// Internationalization (i18n) System for Raige Tweak
class I18n {
  constructor() {
    this.currentLang = 'en';
    this.supportedLangs = ['en', 'fr', 'es', 'ar'];
    this.translations = translations;
    this.init();
  }
  
  async init() {
    // Check for saved language preference first
    const savedLang = localStorage.getItem('raigeTweakLang');
    if (savedLang && this.supportedLangs.includes(savedLang)) {
      this.currentLang = savedLang;
    } else {
      // Get browser language
      const browserLang = navigator.language || navigator.userLanguage;
      const browserCode = browserLang.split('-')[0].toLowerCase();
      
      // Try IP-based detection first (more accurate for location)
      let detectedLang = null;
      try {
        const ipData = await this.detectLanguageFromIP();
        if (ipData) {
          // Map countries to languages
          const countryToLang = {
            'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'LU': 'fr', 'MC': 'fr', 'CA': 'fr',
            'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'CL': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es', 'BO': 'es', 'DO': 'es', 'HN': 'es', 'PY': 'es', 'SV': 'es', 'NI': 'es', 'CR': 'es', 'PA': 'es', 'UY': 'es',
            'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'DZ': 'ar', 'MA': 'ar', 'TN': 'ar', 'YE': 'ar', 'IQ': 'ar', 'JO': 'ar', 'LB': 'ar', 'SY': 'ar', 'LY': 'ar', 'SD': 'ar', 'OM': 'ar', 'KW': 'ar', 'BH': 'ar', 'QA': 'ar',
            'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', 'IE': 'en', 'NZ': 'en', 'ZA': 'en', 'IN': 'en', 'PH': 'en', 'SG': 'en', 'MY': 'en', 'HK': 'en', 'NG': 'en', 'KE': 'en', 'GH': 'en', 'UG': 'ar', 'TZ': 'en', 'ZW': 'en'
          };
          
          detectedLang = countryToLang[ipData.country] || null;
        }
      } catch (error) {
        console.log('IP detection failed, using browser language');
      }
      
      // Combine both detections
      if (detectedLang && this.supportedLangs.includes(detectedLang)) {
        // IP detection takes priority
        this.currentLang = detectedLang;
      } else if (this.supportedLangs.includes(browserCode)) {
        // Fallback to browser language
        this.currentLang = browserCode;
      } else {
        // Final fallback to English
        this.currentLang = 'en';
      }
      
      // Save the detected language
      localStorage.setItem('raigeTweakLang', this.currentLang);
    }
    
    // Apply language
    this.applyLanguage(this.currentLang);
    this.updateLanguageSelector();
  }
  
  async detectLanguageFromIP() {
    try {
      // Use ipapi.co for IP-based location detection with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      
      // Return full location data for better detection
      return {
        country: data.country,
        country_name: data.country_name,
        city: data.city,
        region: data.region,
        languages: data.languages,
        ip: data.ip
      };
      
    } catch (error) {
      console.log('IP detection failed:', error);
      return null;
    }
  }
  
  setLanguage(lang) {
    if (this.supportedLangs.includes(lang)) {
      this.currentLang = lang;
      localStorage.setItem('raigeTweakLang', lang);
      this.applyLanguage(lang);
      this.updateLanguageSelector();
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;
      
      // Update text direction for Arabic
      if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  }
  
  applyLanguage(lang) {
    const t = this.translations[lang] || this.translations['en'];
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (t[key]) {
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.placeholder = t[key];
        } else if (element.tagName === 'INPUT' && element.type === 'submit') {
          element.value = t[key];
        } else {
          element.textContent = t[key];
        }
      }
    });
    
    // Update carousel swipe text
    const carouselContainer = document.getElementById('featuresCarouselContainer');
    if (carouselContainer) {
      carouselContainer.setAttribute('data-swipe-text', t.swipeToNavigate || '← Swipe to navigate →');
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update text direction for Arabic
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    }
  }
  
  updateLanguageSelector() {
    // No longer needed - using button + ul structure
    this.updateLanguageDisplay();
  }
  
  updateLanguageDisplay() {
    const flagImg = document.getElementById('selectedFlag');
    const languageText = document.getElementById('selectedLanguage');
    
    const languages = {
      en: {
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/2560px-Flag_of_the_United_States.svg.png',
        name: 'English',
        code: 'EN'
      },
      fr: {
        flag: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Flag_of_France.png',
        name: 'Français',
        code: 'FR'
      },
      es: {
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/960px-Flag_of_Spain.svg.png',
        name: 'Español',
        code: 'ES'
      },
      ar: {
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/800px-Flag_of_Saudi_Arabia.svg.png',
        name: 'العربية',
        code: 'AR'
      }
    };
    
    const current = languages[this.currentLang] || languages.en;
    
    // Update selector with delay to ensure DOM is ready
    setTimeout(() => {
      if (flagImg && languageText) {
        flagImg.src = current.flag;
        flagImg.alt = current.name;
        languageText.textContent = `${current.name} (${current.code})`;
      }
    }, 50);
  }
  
  updateLanguageOptions() {
    const currentLang = this.currentLang || 'en';
    const languageOptions = document.querySelectorAll('.lang-menu-item');
    
    languageOptions.forEach(option => {
      const value = option.getAttribute('data-value');
      if (value === currentLang) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }
  
  t(key) {
    return this.translations[this.currentLang]?.[key] || this.translations['en'][key] || key;
  }
}

// Initialize i18n when DOM is ready
let i18n;
document.addEventListener('DOMContentLoaded', () => {
  i18n = new I18n();
  
  // Handle language selector
  const langTrigger = document.getElementById('langTrigger');
  const langMenu = document.getElementById('langMenu');
  const langMenuItems = langMenu?.querySelectorAll('.lang-menu-item');
  const languageWrapper = langTrigger?.closest('.language-select-wrapper');
  
  if (langTrigger && langMenu) {
    // Toggle menu on button click
    langTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      languageWrapper.classList.toggle('active');
    });
    
    // Handle menu item clicks
    if (langMenuItems) {
      langMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const value = item.getAttribute('data-value');
          if (value) {
            i18n.setLanguage(value);
            i18n.updateLanguageDisplay();
            i18n.updateLanguageOptions();
            languageWrapper.classList.remove('active');

            const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!prefersReducedMotion && typeof window.slowScrollToY === 'function') {
              window.slowScrollToY(0);
            } else {
              window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            }
          }
        });
      });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!langTrigger.contains(e.target) && !langMenu.contains(e.target)) {
        languageWrapper.classList.remove('active');
      }
    });
    
    // Initial display update
    setTimeout(() => {
      i18n.updateLanguageDisplay();
      i18n.updateLanguageOptions();
    }, 100);
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}

