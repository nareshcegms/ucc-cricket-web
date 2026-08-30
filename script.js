
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');
let cachedPlayers = [];

function t(key, vars) {
  return window.I18n?.t(key, vars) ?? key;
}

function localeDate(iso, options) {
  if (window.I18n?.localeDate) return I18n.localeDate(iso, options);
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, options);
}

function storyLocalized(story, field) {
  if (I18n?.lang === 'ta' && story[`${field}_ta`]) return story[`${field}_ta`];
  return story[field];
}

if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// ---------------------------------------------------------------------
// Tabs with animated transitions
// ---------------------------------------------------------------------
function ensureVisibleContent() {
  document.querySelectorAll('.stagger-item').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

function showTab(tabName) {
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.remove('active');
  });

  requestAnimationFrame(() => {
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.tab === tabName);
    });

    animateCounters(document.getElementById(`tab-${tabName}`));
    triggerReveal(document.getElementById(`tab-${tabName}`));
    setTimeout(ensureVisibleContent, 800);

    if (tabName === 'stories' && pendingStoryId) {
      selectStory(pendingStoryId);
      pendingStoryId = null;
    }
  });

  window.scrollTo({ top: 0, behavior: 'auto' });

  if (primaryNav) primaryNav.classList.remove('open');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');

  if (tabName === 'players') {
    requestAnimationFrame(() => updatePlayerSlider());
  }
}

function showSoonToast(message) {
  let toast = document.getElementById('soonToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'soonToast';
    toast.className = 'soon-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showSoonToast._timer);
  showSoonToast._timer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('.tab-link');
  if (!link?.dataset.tab) return;

  if (link.classList.contains('nav-soon')) {
    e.preventDefault();
    showSoonToast(t('nav.comingSoon'));
    return;
  }

  showTab(link.dataset.tab);
});

const brandLink = document.getElementById('brandLink');
if (brandLink) {
  brandLink.addEventListener('click', (e) => {
    e.preventDefault();
    showTab('home');
  });
}

// ---------------------------------------------------------------------
// Sparkle field
// ---------------------------------------------------------------------
function initSparkles() {
  const field = document.getElementById('sparkleField');
  if (!field) return;
  const COUNT = 22;
  for (let i = 0; i < COUNT; i++) {
    const dot = document.createElement('span');
    dot.className = 'sparkle';
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.animationDelay = `${(Math.random() * 3.2).toFixed(2)}s`;
    dot.style.animationDuration = `${(2.4 + Math.random() * 2.2).toFixed(2)}s`;
    field.appendChild(dot);
  }
}
initSparkles();

// ---------------------------------------------------------------------
// Scroll / tab reveal animations
// ---------------------------------------------------------------------
function triggerReveal(scope = document) {
  scope.querySelectorAll('.reveal-up').forEach((el, i) => {
    el.classList.remove('is-visible');
    void el.offsetWidth;
    el.style.setProperty('--reveal-delay', `${i * 0.08}s`);
    el.classList.add('is-visible');
  });
}

function initRevealObserver() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal-up').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-up').forEach((el) => observer.observe(el));
}

initRevealObserver();
triggerReveal(document.querySelector('.tab-panel.active'));

// ---------------------------------------------------------------------
// Count-up animation
// ---------------------------------------------------------------------
function animateCounters(scope = document) {
  scope.querySelectorAll('.count-up').forEach((el) => {
    if (el.dataset.done === 'true') return;

    const target = Number(el.dataset.count || 0);
    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.dataset.done = 'true';
      }
    }

    requestAnimationFrame(frame);
  });
}

// ---------------------------------------------------------------------
// Player profiles + slider
// ---------------------------------------------------------------------
const STAT_FIELDS = ['matches', 'runs', 'wickets', 'average', 'highest_score', 'best_bowling'];
let playerIndex = 0;
let playerTimer;

function renderPlayerDots(total) {
  const dots = document.getElementById('playerDots');
  if (!dots || total <= 1) {
    if (dots) dots.innerHTML = '';
    return;
  }

  dots.innerHTML = Array.from({ length: total }, (_, i) =>
    `<button class="slider-dot ${i === playerIndex ? 'active' : ''}" data-index="${i}" aria-label="Player ${i + 1}"></button>`
  ).join('');

  dots.querySelectorAll('.slider-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      playerIndex = Number(dot.dataset.index);
      updatePlayerSlider();
      restartPlayerTimer();
    });
  });
}

function restartPlayerTimer() {
  clearInterval(playerTimer);
  const total = document.querySelectorAll('#playerGrid .player-card').length;
  if (total <= 1) return;
  playerTimer = setInterval(() => {
    playerIndex = (playerIndex + 1) % total;
    updatePlayerSlider();
  }, 7000);
}

function getPreviousStats(playerId) {
  try {
    const raw = localStorage.getItem(`udaya-cc:player:${playerId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePreviousStats(playerId, stats) {
  try {
    localStorage.setItem(`udaya-cc:player:${playerId}`, JSON.stringify(stats));
  } catch {}
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function fmt(value) {
  if (value === null || value === undefined || value === '') return '—';
  return typeof value === 'number' ? value.toLocaleString() : value;
}

function fmtMatchDate(iso) {
  return localeDate(iso, { day: 'numeric', month: 'short', year: 'numeric' });
}

function lastSyncedLine(player) {
  if (!player.cricheroes_url) {
    return t('players.notConnected');
  }
  if (!player.last_synced) {
    return t('players.waitingSync');
  }
  const date = localeDate(player.last_synced, { year: 'numeric', month: 'long', day: 'numeric' });
  return t('players.lastSynced', { date });
}

function renderMatchAwards(awards) {
  const list = Array.isArray(awards) ? awards.filter(Boolean) : [];

  if (list.length === 0) {
    return `
      <div class="match-awards muted">
        <span class="awards-empty">${t('players.noAward')}</span>
      </div>
    `;
  }

  const tags = list.map((award) => `<span class="award-tag">${award}</span>`).join('');
  return `
    <div class="match-awards">
      <span class="awards-lab">${t('players.awards')}</span>
      <div class="award-tags">${tags}</div>
    </div>
  `;
}

function renderMatchSlide(match) {
  const href = match.url || `https://cricheroes.com/scorecard/${match.id}`;
  const batting = match.batting || 'Did not bat';
  const bowling = match.bowling || 'Did not bowl';
  const batMuted = /did not bat|not batted/i.test(batting);
  const bowlMuted = /did not bowl|not bowled/i.test(bowling);

  return `
    <article class="match-slide">
      <div class="match-slide-head">
        <span class="match-tour">${match.tournament || t('players.match')}</span>
        <span class="match-date">${fmtMatchDate(match.date)}</span>
      </div>
      <div class="match-teams">
        <span>${match.team_a} <em>${match.team_a_score || ''}</em></span>
        <span class="vs">${t('players.vs')}</span>
        <span>${match.team_b} <em>${match.team_b_score || ''}</em></span>
      </div>
      <div class="match-perf">
        <div class="perf-item ${batMuted ? 'muted' : ''}">
          <span class="perf-lab">${t('players.bat')}</span>
          <span class="perf-val">${batting}</span>
        </div>
        <div class="perf-item ${bowlMuted ? 'muted' : ''}">
          <span class="perf-lab">${t('players.bowl')}</span>
          <span class="perf-val">${bowling}</span>
        </div>
      </div>
      ${renderMatchAwards(match.awards)}
      <div class="match-result">${match.result || ''}</div>
      <div class="match-venue">${[match.ground, match.city].filter(Boolean).join(', ')}${match.overs ? ` · ${match.overs} ov` : ''}</div>
      <a class="match-scorecard-link" href="${href}" target="_blank" rel="noopener noreferrer">${t('players.viewScorecard')} →</a>
    </article>
  `;
}

function renderMatchesDrawer(player) {
  const matches = (player.leather_matches || [])
    .filter((match) => !match.ball_type || String(match.ball_type).toUpperCase() === 'LEATHER')
    .slice(0, 5);

  if (matches.length === 0) {
    return `
      <div class="player-matches-drawer is-empty">
        <p class="matches-empty-note">${t('players.noMatches')}</p>
      </div>
    `;
  }

  const slides = matches.map(renderMatchSlide).join('');
  const dots = matches.map((_, i) =>
    `<button class="match-dot ${i === 0 ? 'active' : ''}" type="button" data-index="${i}" aria-label="${t('players.match')} ${i + 1}"></button>`
  ).join('');

  return `
    <div class="player-matches-drawer">
      <button class="matches-expand-btn" type="button" aria-expanded="false">
        <span class="matches-expand-label">${t('players.viewLastFive')}</span>
        <span class="matches-expand-icon" aria-hidden="true">▼</span>
      </button>
      <div class="matches-drawer-panel" hidden>
        <div class="matches-mini-slider">
          <button class="match-nav prev" type="button" aria-label="${t('players.matchPrev')}">&#10094;</button>
          <div class="match-slides-viewport">
            <div class="match-slides-track">${slides}</div>
          </div>
          <button class="match-nav next" type="button" aria-label="${t('players.matchNext')}">&#10095;</button>
        </div>
        <div class="match-slide-dots">${dots}</div>
      </div>
    </div>
  `;
}

function renderPlayerCard(player) {
  const roleLabel = I18n?.role(player.role) || player.role || t('players.roleTbd');

  return `
    <article class="player-card" data-player-id="${player.id}">
      <div class="player-card-shell">
        <div class="player-flip-scene">
          <div class="player-flip-card" tabindex="0" role="button" aria-label="${t('players.tapForStats')}">
            <div class="player-flip-face player-flip-front">
              <span class="profile-role-badge">${roleLabel}</span>
              <div class="avatar-large">${initials(player.name)}</div>
              <h3 class="profile-name">${player.name}</h3>
              <p class="profile-team">${player.team || 'Udhaya Cricket Club'}</p>
              <p class="flip-hint" data-i18n="players.tapForStats"></p>
            </div>
            <div class="player-flip-face player-flip-back">
              <h4 class="back-title">${player.name}</h4>
              <p class="back-subtitle">${t('players.careerStats')} · ${t('players.leatherOnly')}</p>
              <div class="stat-row stat-grid-back" data-player-id="${player.id}">
                <div class="stat"><div class="val" data-field="matches">${fmt(player.matches)}</div><div class="lab">${t('players.statMatches')}</div></div>
                <div class="stat"><div class="val" data-field="runs">${fmt(player.runs)}</div><div class="lab">${t('players.statRuns')}</div></div>
                <div class="stat"><div class="val" data-field="wickets">${fmt(player.wickets)}</div><div class="lab">${t('players.statWickets')}</div></div>
                <div class="stat"><div class="val" data-field="average">${fmt(player.average)}</div><div class="lab">${t('players.statAverage')}</div></div>
                <div class="stat"><div class="val" data-field="highest_score">${fmt(player.highest_score)}</div><div class="lab">${t('players.statHighest')}</div></div>
                <div class="stat"><div class="val" data-field="best_bowling">${fmt(player.best_bowling)}</div><div class="lab">${t('players.statBestBowl')}</div></div>
              </div>
              <p class="player-note">${lastSyncedLine(player)}</p>
              <p class="flip-hint flip-hint-back" data-i18n="players.tapToFlipBack"></p>
            </div>
          </div>
        </div>
        ${renderMatchesDrawer(player)}
      </div>
    </article>
  `;
}

function highlightChangedStats(players) {
  players.forEach((player) => {
    const previous = getPreviousStats(player.id);
    const current = {};
    STAT_FIELDS.forEach((field) => { current[field] = player[field]; });

    if (previous) {
      const row = document.querySelector(`.stat-row[data-player-id="${player.id}"]`);
      if (row) {
        STAT_FIELDS.forEach((field) => {
          if (previous[field] !== current[field] && current[field] !== null && current[field] !== undefined) {
            const el = row.querySelector(`.val[data-field="${field}"]`);
            if (el) {
              el.classList.add('glitch', 'just-updated');
              el.addEventListener('animationend', () => el.classList.remove('glitch'), { once: true });
            }
          }
        });
      }
    }

    savePreviousStats(player.id, current);
  });
}

function updatePlayerSlider() {
  const grid = document.getElementById('playerGrid');
  const track = document.getElementById('playerTrack');
  if (!grid || !track) return;

  const cards = grid.querySelectorAll('.player-card');
  if (!cards.length) return;

  const gap = 24;
  const trackWidth = track.clientWidth;
  const cardWidth = cards[0].offsetWidth;
  const step = cardWidth + gap;
  const centerPad = Math.max(0, (trackWidth - cardWidth) / 2);
  const offset = playerIndex * step;

  grid.style.transform = `translateX(${centerPad - offset}px)`;

  cards.forEach((el, i) => {
    el.classList.toggle('is-active', i === playerIndex);
    if (i !== playerIndex && window.resetPlayerCardUI) {
      window.resetPlayerCardUI(el);
    }
  });

  document.querySelectorAll('#playerDots .slider-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === playerIndex);
  });
}

function setupPlayerSlider(total) {
  const prev = document.getElementById('playerPrev');
  const next = document.getElementById('playerNext');
  const track = document.getElementById('playerTrack');

  if (!prev || !next || !track || total <= 1) return;
  if (track.dataset.sliderReady === 'true') return;
  track.dataset.sliderReady = 'true';

  prev.addEventListener('click', () => {
    playerIndex = (playerIndex - 1 + total) % total;
    updatePlayerSlider();
    restartPlayerTimer();
  });

  next.addEventListener('click', () => {
    playerIndex = (playerIndex + 1) % total;
    updatePlayerSlider();
    restartPlayerTimer();
  });

  let startX = 0;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 40) {
      playerIndex = delta > 0
        ? (playerIndex - 1 + total) % total
        : (playerIndex + 1) % total;
      updatePlayerSlider();
      restartPlayerTimer();
    }
  }, { passive: true });

  track.addEventListener('mouseenter', () => clearInterval(playerTimer));
  track.addEventListener('mouseleave', restartPlayerTimer);

  window.addEventListener('resize', updatePlayerSlider);
}

function renderPlayerGrid(players) {
  const grid = document.getElementById('playerGrid');
  if (!grid) return;

  grid.innerHTML = players.map(renderPlayerCard).join('');
  I18n.apply(grid);
  highlightChangedStats(players);
  setupPlayerSlider(players.length);
  renderPlayerDots(players.length);
  requestAnimationFrame(() => updatePlayerSlider());
  restartPlayerTimer();
  if (window.initPlayerCardsUI) window.initPlayerCardsUI();
}

async function loadPlayers() {
  const grid = document.getElementById('playerGrid');
  if (!grid) return [];

  grid.innerHTML = `<p class="story-empty">${t('players.loading')}</p>`;

  try {
    const res = await fetch('players.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const players = data.players || [];

    if (players.length === 0) {
      grid.innerHTML = `<p class="story-empty">${t('players.empty')}</p>`;
      return [];
    }

    cachedPlayers = players;
    renderPlayerGrid(players);
    return players;
  } catch (err) {
    console.error('Could not load player data:', err);
    grid.innerHTML = `<p class="story-empty">${t('players.error')}</p>`;
    return [];
  }
}

// ---------------------------------------------------------------------
// Club matches + auto-written stories
// ---------------------------------------------------------------------
const CLUB_NAME = /udhaya|udaya\s*cc|udaya cricket/i;
let storiesData = [];
let activeStoryId = null;
let pendingStoryId = null;
let clubMatches = [];

function isClubTeam(name) {
  return CLUB_NAME.test(name || '');
}

function shortClubName(name) {
  return isClubTeam(name) ? 'Udaya CC' : (name || 'Opposition');
}

function prettyPlace(text) {
  return String(text || '')
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map((word) => {
      if (/^(ocf|ucc|mh|dls|srcc)$/i.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function firstName(name) {
  return String(name || '').split(/\s+/)[0] || name;
}

function parseRuns(batting) {
  if (!batting || /did not bat/i.test(batting)) return null;
  const match = String(batting).match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

function parseWickets(bowling) {
  if (!bowling || /did not bowl/i.test(bowling)) return null;
  const match = String(bowling).match(/^(\d+)\s*\//);
  return match ? Number(match[1]) : null;
}

function clubOutcome(match) {
  const winner = String(match.result || '').split(/\s+won/i)[0];
  if (/abandoned|no result|tied/i.test(match.result || '')) return 'other';
  if (isClubTeam(winner)) return 'won';
  if (/won/i.test(match.result || '')) return 'lost';
  return 'other';
}

function collectClubMatches(players) {
  const byId = new Map();

  players.forEach((player) => {
    (player.leather_matches || []).forEach((match) => {
      if (!isClubTeam(match.team_a) && !isClubTeam(match.team_b)) return;
      if (!byId.has(match.id)) {
        byId.set(match.id, { ...match, contributions: [] });
      }
      byId.get(match.id).contributions.push({
        name: player.name,
        batting: match.batting,
        bowling: match.bowling,
        awards: match.awards || [],
      });
    });
  });

  return [...byId.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function writeAutoStory(match) {
  const date = String(match.date || '').slice(0, 10);
  const opp = isClubTeam(match.team_a) ? match.team_b : match.team_a;
  const clubScore = isClubTeam(match.team_a) ? match.team_a_score : match.team_b_score;
  const oppScore = isClubTeam(match.team_a) ? match.team_b_score : match.team_a_score;
  const outcome = clubOutcome(match);
  const venue = [prettyPlace(match.ground), prettyPlace(match.city)].filter(Boolean).join(', ');
  const result = match.result || '';
  const bats = [...(match.contributions || [])]
    .filter((row) => parseRuns(row.batting) != null)
    .sort((a, b) => parseRuns(b.batting) - parseRuns(a.batting));
  const bowls = [...(match.contributions || [])]
    .filter((row) => (parseWickets(row.bowling) || 0) > 0)
    .sort((a, b) => parseWickets(b.bowling) - parseWickets(a.bowling));
  const awards = (match.contributions || []).flatMap((row) =>
    (row.awards || []).map((award) => `${firstName(row.name)} — ${award}`)
  );

  const title = outcome === 'won'
    ? `Udaya CC beat ${opp}`
    : outcome === 'lost'
      ? `Udaya CC fall short against ${opp}`
      : `Udaya CC vs ${opp}`;
  const titleTa = outcome === 'won'
    ? `உதயா கிரிக்கெட் கிளப் ${opp}-ஐ வென்றது`
    : outcome === 'lost'
      ? `உதயா கிரிக்கெட் கிளப் ${opp}-க்கு தோற்றது`
      : `உதயா கிரிக்கெட் கிளப் vs ${opp}`;

  const highlights = [
    `UCC ${clubScore || ''}`.trim(),
    `${shortClubName(opp)} ${oppScore || ''}`.trim(),
    ...bats.slice(0, 2).map((row) => `${firstName(row.name)} ${row.batting}`),
    ...bowls.slice(0, 2).map((row) => `${firstName(row.name)} ${row.bowling}`),
    ...awards.slice(0, 1),
  ].filter((item) => item && item.length > 3).slice(0, 5);

  const batLine = bats.length
    ? bats.slice(0, 3).map((row) => `${row.name} ${row.batting}`).join('; ') + '.'
    : 'No synced batting figures are listed for this match yet.';
  const bowlLine = bowls.length
    ? bowls.slice(0, 3).map((row) => `${row.name} ${row.bowling}`).join('; ') + '.'
    : 'No synced wickets are listed for this match yet.';

  const openEn = [
    result,
    venue,
    match.overs ? `${match.overs} overs` : '',
    match.tournament && match.tournament !== 'Individual Match' ? match.tournament : '',
  ].filter(Boolean).join(' · ') + '.';

  const openTa = [
    result,
    venue,
    match.overs ? `${match.overs} overs` : '',
  ].filter(Boolean).join(' · ') + '.';

  const batTa = bats.length
    ? bats.slice(0, 3).map((row) => `${row.name} batting-ல் ${row.batting}`).join('; ') + '.'
    : 'இந்த போட்டிக்கு synced batting figures இன்னும் இல்லை.';
  const bowlTa = bowls.length
    ? bowls.slice(0, 3).map((row) => `${row.name} bowling-ல் ${row.bowling}`).join('; ') + '.'
    : 'இந்த போட்டிக்கு synced wickets இன்னும் இல்லை.';

  return {
    id: `auto-${match.id}`,
    date,
    match_id: match.id,
    auto: true,
    url: match.url,
    type: match.tournament || 'Match',
    type_ta: match.tournament || 'போட்டி',
    title,
    title_ta: titleTa,
    highlights,
    highlights_ta: highlights,
    paragraphs: [openEn, `With the bat: ${batLine}`, `With the ball: ${bowlLine}`],
    paragraphs_ta: [openTa, batTa, bowlTa],
  };
}

function mergeStoriesWithMatches(written, matches) {
  const usedDates = new Set(written.map((story) => story.date));
  const usedIds = new Set(written.map((story) => story.match_id).filter(Boolean));

  written.forEach((story) => {
    const match = matches.find((item) =>
      item.id === story.match_id || String(item.date || '').slice(0, 10) === story.date
    );
    if (!match) return;
    story.match_id = story.match_id || match.id;
    story.url = story.url || match.url;
  });

  const autos = matches
    .filter((match) => !usedIds.has(match.id) && !usedDates.has(String(match.date || '').slice(0, 10)))
    .map(writeAutoStory);

  return [...written, ...autos].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function findStoryForMatch(match) {
  if (!match) return null;
  const date = String(match.date || '').slice(0, 10);
  return storiesData.find((story) => story.match_id === match.id || story.date === date) || null;
}

function splitHighlight(text) {
  const raw = String(text).trim();
  const leadingNum = raw.match(/^(\d[\d\/*]*)\s+(.+)$/);
  if (leadingNum) return { val: leadingNum[1], lab: leadingNum[2] };
  const trailingScore = raw.match(/^(.+?)\s+(\d[\d\/*]*\*?(?:\s*\(\d+\))?)$/);
  if (trailingScore) return { val: trailingScore[2], lab: trailingScore[1] };
  const nameNum = raw.match(/^(.+?)\s+(\d+)\s+(.+)$/);
  if (nameNum) return { val: nameNum[2], lab: `${nameNum[1]} ${nameNum[3]}` };
  return { val: raw, lab: '' };
}

function renderHomeScoreboard(match, story) {
  const resultEl = document.getElementById('homeMatchResult');
  if (!match) {
    if (resultEl) resultEl.textContent = t('home.noResult');
    return;
  }

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('homeTeamAName', shortClubName(match.team_a));
  setText('homeTeamAScore', match.team_a_score || '—');
  setText('homeTeamBName', shortClubName(match.team_b));
  setText('homeTeamBScore', match.team_b_score || '—');

  const venue = [prettyPlace(match.ground), prettyPlace(match.city)].filter(Boolean).join(', ');
  setText('homeMatchResult', [match.result, venue].filter(Boolean).join(' · '));

  const stats = document.getElementById('homeMatchStats');
  if (stats) {
    const chips = (storyLocalized(story || {}, 'highlights') || story?.highlights || []).slice(0, 4);
    stats.innerHTML = chips
      .map((item) => {
        const { val, lab } = splitHighlight(item);
        return `<div class="score-stat"><span class="val">${val}</span><span class="lab">${lab}</span></div>`;
      })
      .join('');
  }

  const margin = document.getElementById('homeLatestMargin');
  if (margin) {
    const found = String(match.result || '').match(/won by\s+(.+)/i);
    margin.textContent = found ? found[1].replace(/\s+/g, ' ').trim() : '—';
  }
}

function openHomeStory() {
  const story = findStoryForMatch(clubMatches[0]) || storiesData[0];
  if (story) pendingStoryId = story.id;
  showTab('stories');
  if (story) selectStory(story.id);
}

function applyClubStoriesAndHome() {
  clubMatches = collectClubMatches(cachedPlayers);
  storiesData = mergeStoriesWithMatches(storiesData, clubMatches);
  renderStoryDateList();
  if (storiesData[0]) selectStory(pendingStoryId || storiesData[0].id);
  renderHomeScoreboard(clubMatches[0], findStoryForMatch(clubMatches[0]) || storiesData[0]);

  const squadCount = document.getElementById('homeSquadCount');
  if (squadCount && cachedPlayers.length) {
    squadCount.dataset.count = String(cachedPlayers.length);
    squadCount.dataset.done = 'false';
    animateCounters(squadCount.parentElement);
  }

  const homeBtn = document.getElementById('homeStoryBtn');
  if (homeBtn && homeBtn.dataset.bound !== 'true') {
    homeBtn.dataset.bound = 'true';
    homeBtn.addEventListener('click', openHomeStory);
  }
}

// ---------------------------------------------------------------------
// Match stories — pick by date
// ---------------------------------------------------------------------

function fmtStoryDate(iso) {
  return localeDate(iso, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function renderStoryDetail(story) {
  const detail = document.getElementById('storyDetail');
  if (!detail || !story) return;

  const highlights = (storyLocalized(story, 'highlights') || [])
    .map((item) => `<span class="highlight-chip">${item}</span>`)
    .join('');

  const paragraphs = (storyLocalized(story, 'paragraphs') || [])
    .map((text) => `<p>${text}</p>`)
    .join('');

  const storyType = storyLocalized(story, 'type') || t('stories.leagueMatch');
  const autoNote = story.auto
    ? `<p class="story-auto-note">${t('stories.autoNote')}</p>`
    : '';
  const scorecard = story.url
    ? `<a class="story-scorecard-link" href="${story.url}" target="_blank" rel="noopener noreferrer">${t('stories.viewScorecard')} →</a>`
    : '';

  detail.innerHTML = `
    <article class="story-card featured story-card-animated">
      <div class="story-meta pulse-meta">
        <span>${storyType}</span>
        <span class="dot"></span>
        <span>${fmtStoryDate(story.date)}</span>
      </div>
      <h3>${storyLocalized(story, 'title')}</h3>
      ${highlights ? `<div class="story-highlights">${highlights}</div>` : ''}
      ${paragraphs}
      ${autoNote}
      ${scorecard}
    </article>
  `;
}

function selectStory(storyId) {
  const story = storiesData.find((item) => item.id === storyId);
  if (!story) return;

  activeStoryId = storyId;
  renderStoryDetail(story);

  document.querySelectorAll('.story-date-link').forEach((link) => {
    const isActive = link.dataset.storyId === storyId;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
}

function renderStoryDateList() {
  const list = document.getElementById('storyDateList');
  const detail = document.getElementById('storyDetail');
  if (!list || !detail) return;

  if (storiesData.length === 0) {
    list.innerHTML = '';
    detail.innerHTML = `<p class="story-empty">${t('stories.empty')}</p>`;
    return;
  }

  list.innerHTML = storiesData
    .map((story) => `
      <li>
        <button
          class="story-date-link"
          type="button"
          data-story-id="${story.id}"
          aria-current="false"
        >${fmtStoryDate(story.date)}</button>
      </li>
    `)
    .join('');

  list.querySelectorAll('.story-date-link').forEach((link) => {
    link.addEventListener('click', () => selectStory(link.dataset.storyId));
  });

  if (activeStoryId && storiesData.some((story) => story.id === activeStoryId)) {
    selectStory(activeStoryId);
  } else if (storiesData[0]) {
    selectStory(storiesData[0].id);
  } else {
    detail.innerHTML = `<p class="story-prompt">${t('stories.prompt')}</p>`;
  }
}

async function loadStories() {
  try {
    const res = await fetch('stories.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    storiesData = (data.stories || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  } catch (err) {
    console.error('Could not load match stories:', err);
    storiesData = [];
    const detail = document.getElementById('storyDetail');
    if (detail) {
      detail.innerHTML = `<p class="story-empty">${t('stories.error')}</p>`;
    }
  }
}

async function boot() {
  await I18n.init();
  await Promise.all([loadPlayers(), loadStories()]);
  applyClubStoriesAndHome();
}

boot();

window.addEventListener('languagechange', () => {
  I18n.apply();
  if (cachedPlayers.length) renderPlayerGrid(cachedPlayers);
  renderStoryDateList();
  if (activeStoryId) renderStoryDetail(storiesData.find((s) => s.id === activeStoryId));
  renderHomeScoreboard(clubMatches[0], findStoryForMatch(clubMatches[0]) || storiesData[0]);
});

window.addEventListener('load', () => {
  setTimeout(ensureVisibleContent, 900);
});

// Kick off counters on the initially visible tab
animateCounters(document.querySelector('.tab-panel.active'));
