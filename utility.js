(function () {
  const NAMESPACE = 'raige-tweak';
  const KEY = 'free-utility-installs';

  const DOWNLOAD_URL = '';

  function getCountEl() {
    return document.getElementById('utilityInstallCount');
  }

  function animateTo(targetValue) {
    const el = getCountEl();
    if (!el) return;

    const current = parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0;

    // If CountUp from count-up.js is available, use it.
    if (typeof CountUp === 'function') {
      new CountUp(el, {
        from: current,
        to: targetValue,
        duration: 1.2,
        separator: ','
      });
      return;
    }

    el.textContent = String(targetValue);
  }

  async function countApiGet() {
    const url = `https://api.countapi.xyz/get/${encodeURIComponent(NAMESPACE)}/${encodeURIComponent(KEY)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('countapi get failed');
    const data = await res.json();
    if (typeof data.value !== 'number') throw new Error('countapi invalid response');
    return data.value;
  }

  async function initCounter() {
    try {
      const value = await countApiGet();
      animateTo(value);
    } catch (_) {
      animateTo(0);
    }
  }

  async function handleDownloadClick(e) {
    e.preventDefault();

    if (!DOWNLOAD_URL) {
      window.alert('Download link not configured yet.');
      return;
    }

    window.location.href = DOWNLOAD_URL;
  }

  function initThemeToggleFromStorage() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  function init() {
    initThemeToggleFromStorage();
    initCounter();

    const btn = document.getElementById('utilityDownloadBtn');
    if (btn) {
      btn.addEventListener('click', handleDownloadClick);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
