/**
 * Full-screen homepage hero slider, sticky navbar, back-to-top
 */
(function () {
  let slideIndex = 0;
  let slideTimer;
  let slidesData = [];

  function lang() {
    return window.I18n?.lang || 'en';
  }

  function slideText(slide, field) {
    const key = `${field}_${lang()}`;
    return slide[key] || slide[`${field}_en`] || '';
  }

  function renderHeroSlides(slides) {
    const root = document.getElementById('heroSlider');
    if (!root || !slides.length) return;

    const slidesHtml = slides.map((slide, i) => `
      <article class="hero-slide ${i === 0 ? 'active' : ''} theme-${slide.theme || 'willow'}" data-index="${i}">
        <div class="hero-slide-bg" aria-hidden="true"></div>
        <div class="hero-slide-overlay" aria-hidden="true"></div>
        <div class="hero-slide-particles" aria-hidden="true"></div>
        <div class="wrap hero-slide-inner">
          <p class="hero-slide-eyebrow">Udaya CC · Est. 1999</p>
          <h2 class="hero-slide-title">${slideText(slide, 'title')}</h2>
          <p class="hero-slide-sub">${slideText(slide, 'subtitle')}</p>
          <button class="btn btn-primary hero-slide-cta tab-link" data-tab="${slide.ctaTab || 'home'}" type="button">
            ${slideText(slide, 'cta')}
          </button>
        </div>
      </article>
    `).join('');

    const dots = slides.map((_, i) =>
      `<button class="hero-slide-dot ${i === 0 ? 'active' : ''}" type="button" data-index="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join('');

    root.innerHTML = `
      <div class="hero-slides">${slidesHtml}</div>
      <button class="hero-slide-arrow prev" type="button" aria-label="Previous slide">&#10094;</button>
      <button class="hero-slide-arrow next" type="button" aria-label="Next slide">&#10095;</button>
      <div class="hero-slide-dots">${dots}</div>
      <div class="hero-slide-progress" aria-hidden="true"><span></span></div>
    `;

    bindHeroControls(slides.length);
    showSlide(0);
    restartHeroTimer(slides.length);
  }

  function showSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-slide-dot');
    if (!slides.length) return;

    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((el, i) => el.classList.toggle('active', i === slideIndex));
    dots.forEach((el, i) => el.classList.toggle('active', i === slideIndex));
    resetHeroProgress();
  }

  function resetHeroProgress() {
    const bar = document.querySelector('.hero-slide-progress span');
    if (!bar) return;
    bar.style.animation = 'none';
    void bar.offsetWidth;
    bar.style.animation = 'hero-progress 6s linear forwards';
  }

  function restartHeroTimer(total) {
    clearInterval(slideTimer);
    slideTimer = setInterval(() => showSlide(slideIndex + 1), 6000);
    resetHeroProgress();
  }

  function bindHeroControls(total) {
    const root = document.getElementById('heroSlider');
    if (!root) return;

    root.querySelector('.hero-slide-arrow.prev')?.addEventListener('click', () => {
      showSlide(slideIndex - 1);
      restartHeroTimer(total);
    });

    root.querySelector('.hero-slide-arrow.next')?.addEventListener('click', () => {
      showSlide(slideIndex + 1);
      restartHeroTimer(total);
    });

    root.querySelectorAll('.hero-slide-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.index));
        restartHeroTimer(total);
      });
    });

    root.addEventListener('mouseenter', () => clearInterval(slideTimer));
    root.addEventListener('mouseleave', () => restartHeroTimer(total));
  }

  async function loadHeroSlides() {
    try {
      const res = await fetch('home.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('home.json missing');
      const data = await res.json();
      slidesData = data.slides || [];
      renderHeroSlides(slidesData);
    } catch (err) {
      console.error('Could not load hero slides:', err);
    }
  }

  function initNavbarShrink() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.refreshHeroSlides = function refreshHeroSlides() {
    if (slidesData.length) renderHeroSlides(slidesData);
  };

  window.addEventListener('languagechange', () => {
    if (slidesData.length) renderHeroSlides(slidesData);
  });

  document.addEventListener('DOMContentLoaded', () => {
    initNavbarShrink();
    initBackToTop();
  });

  async function bootHero() {
    if (window.I18n?.init) await I18n.init().catch(() => {});
    await loadHeroSlides();
  }

  bootHero();
})();
