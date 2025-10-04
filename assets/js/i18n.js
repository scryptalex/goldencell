(() => {
  const LANGS = ["en","ru","de","ko","zh","es","ar","he","ja"];
  const RTL = new Set(["ar","he"]);

  const byId = id => document.getElementById(id);
  const select = byId('lang-select');

  function pickDefault() {
    const saved = localStorage.getItem('gc.lang');
    if (saved && LANGS.includes(saved)) return saved;
    const nav = (navigator.language || 'en').toLowerCase();
    const cand = nav.split('-')[0];
    return LANGS.includes(cand) ? cand : 'en';
  }

  async function load(lang) {
    try {
      const res = await fetch(`assets/i18n/${lang}.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error('i18n load failed');
      const dict = await res.json();
      apply(dict, lang);
    } catch (e) {
      if (lang !== 'en') return load('en');
      // eslint-disable-next-line no-console
      console.warn('Failed to load i18n:', e);
    }
  }

  function get(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj);
  }

  function apply(dict, lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL.has(lang) ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = get(dict, key);
      if (typeof val === 'string') {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.setAttribute('placeholder', val);
        } else {
          el.innerHTML = val;
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const lang = pickDefault();
    if (select) select.value = lang;
    load(lang);
    if (select) {
      select.addEventListener('change', () => {
        const L = select.value;
        localStorage.setItem('gc.lang', L);
        load(L);
      });
    }
  });
})();

