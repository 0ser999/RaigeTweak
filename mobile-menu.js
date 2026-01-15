(function () {
  function setMenuState(isOpen) {
    const menu = document.getElementById('mobileMenu');
    const button = document.getElementById('mobileMenuButton');
    if (!menu || !button) return;

    if (isOpen) {
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-expanded', 'true');
    } else {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    setMenuState(!menu.classList.contains('open'));
  }

  function init() {
    const menu = document.getElementById('mobileMenu');
    const button = document.getElementById('mobileMenuButton');
    if (!menu || !button) return;

    button.addEventListener('click', toggleMenu);

    document.addEventListener('click', (e) => {
      const clickedButton = e.target && e.target.closest && e.target.closest('#mobileMenuButton');
      const clickedInsideMenu = e.target && e.target.closest && e.target.closest('#mobileMenu');
      if (clickedButton || clickedInsideMenu) return;
      setMenuState(false);
    });

    menu.addEventListener('click', (e) => {
      const shouldClose = e.target && e.target.closest && e.target.closest('[data-mobile-menu-close]');
      if (shouldClose) {
        setMenuState(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setMenuState(false);
      }
    });

    setMenuState(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
