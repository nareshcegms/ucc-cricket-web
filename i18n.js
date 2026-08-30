/**
 * Lightweight i18n — English & Tamil
 */
const I18n = {
  lang: localStorage.getItem('ucc-lang') || 'en',
  strings: {},
  ready: null,

  async init() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = (async () => {
      await this.load(this.lang);
      this.apply();
      this.bindSwitcher();
      document.documentElement.lang = this.lang;
    })();
    return this._initPromise;
  },

  async load(lang) {
    const res = await fetch(`locales/${lang}.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Locale ${lang} not found`);
    this.strings = await res.json();
    this.lang = lang;
  },

  t(key, vars = {}) {
    const value = key.split('.').reduce((obj, part) => obj?.[part], this.strings);
    if (typeof value !== 'string') return key;
    return value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
  },

  apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = this.t(el.dataset.i18n);
    });

    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = this.t(el.dataset.i18nHtml);
    });

    root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (attr && key) el.setAttribute(attr, this.t(key));
      });
    });

    document.title = this.t('meta.title');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = this.t('meta.description');

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === this.lang);
      btn.setAttribute('aria-pressed', btn.dataset.lang === this.lang ? 'true' : 'false');
    });

    document.body.classList.toggle('lang-ta', this.lang === 'ta');
  },

  bindSwitcher() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.setLanguage(btn.dataset.lang));
    });
  },

  async setLanguage(lang) {
    if (lang === this.lang || !['en', 'ta'].includes(lang)) return;
    localStorage.setItem('ucc-lang', lang);
    await this.load(lang);
    document.documentElement.lang = lang;
    this.apply();
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  },

  localeDate(iso, options = {}) {
    if (!iso) return '';
    const date = new Date(iso);
    const locale = this.lang === 'ta' ? 'ta-IN' : 'en-IN';
    return date.toLocaleDateString(locale, options);
  },

  role(name) {
    return this.t(`roles.${name}`) || name || this.t('players.roleTbd');
  },
};

window.I18n = I18n;

document.addEventListener('DOMContentLoaded', () => {
  I18n.init().catch((err) => console.error('i18n init failed:', err));
});

if (document.readyState !== 'loading') {
  I18n.init().catch((err) => console.error('i18n init failed:', err));
}
