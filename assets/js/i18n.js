(() => {
  const LANGS = ["en","ru","de","ko","zh","es","ar","he","ja"];
  const RTL = new Set(["ar","he"]);

  const byId = id => document.getElementById(id);
  const getSelect = () => byId('lang-select');

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
      // Expose last dict for re-apply after dynamic includes
      window.gcI18n = { dict, lang, apply };
      const s = getSelect();
      if (s) s.value = lang;
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

  function bindLangSelect() {
    const s = getSelect();
    if (s && !s.dataset.bound) {
      s.dataset.bound = '1';
      s.addEventListener('change', () => {
        const L = s.value;
        localStorage.setItem('gc.lang', L);
        load(L);
      });
    }
  }

  // Fallback: observe DOM for header injection and bind when select appears
  const obs = new MutationObserver(() => {
    const s = getSelect();
    if (s && !s.dataset.bound) {
      bindLangSelect();
      if (window.gcI18n && window.gcI18n.lang) s.value = window.gcI18n.lang;
    }
  });
  try { obs.observe(document.documentElement, { childList: true, subtree: true }); } catch (_) {}

  document.addEventListener('DOMContentLoaded', () => {
    const lang = pickDefault();
    const s = getSelect();
    if (s) s.value = lang;
    bindLangSelect();
    load(lang);
  });

  // Re-apply translations and re-bind after header/footer includes
  window.addEventListener('gc:refresh', () => {
    try {
      bindLangSelect();
      if (window.gcI18n) {
        const { dict, lang, apply } = window.gcI18n;
        if (dict && lang && apply) {
          const s = getSelect();
          if (s) s.value = lang;
          apply(dict, lang);
        }
      }
    } catch (_) { /* noop */ }
  });
})();
