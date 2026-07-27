
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// ---------------------------------------------------------------------
// Tabs with animated transitions
// ---------------------------------------------------------------------
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
  });

  window.scrollTo({ top: 0, behavior: 'auto' });

  if (primaryNav) primaryNav.classList.remove('open');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
}

document.querySelectorAll('.tab-link').forEach((link) => {
  link.addEventListener('click', () => showTab(link.dataset.tab));
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
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function lastSyncedLine(player) {
  if (!player.cricheroes_url) {
    return 'Not yet connected to CricHeroes — add a profile URL to players.json to enable auto-sync.';
  }
  if (!player.last_synced) {
    return 'Connected — waiting on the first sync to run.';
  }
  const date = new Date(player.last_synced);
  return `Last synced from CricHeroes on ${date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}.`;
}

function renderMatchAwards(awards) {
  const list = Array.isArray(awards) ? awards.filter(Boolean) : [];

  if (list.length === 0) {
    return `
      <div class="match-awards muted">
        <span class="awards-empty">No award</span>
      </div>
    `;
  }

  const tags = list.map((award) => `<span class="award-tag">${award}</span>`).join('');
  return `
    <div class="match-awards">
      <span class="awards-lab">Awards</span>
      <div class="award-tags">${tags}</div>
    </div>
  `;
}

function renderLeatherMatches(player) {
  const matches = (player.leather_matches || [])
    .filter((match) => !match.ball_type || String(match.ball_type).toUpperCase() === 'LEATHER')
    .slice(0, 5);

  if (matches.length === 0) {
    return `
      <div class="player-matches">
        <div class="matches-head">
          <h4>Last 5 performances</h4>
          <p>No leather-ball matches listed yet.</p>
        </div>
      </div>
    `;
  }

  const rows = matches.map((match) => {
    const href = match.url || `https://cricheroes.com/scorecard/${match.id}`;
    const batting = match.batting || 'Did not bat';
    const bowling = match.bowling || 'Did not bowl';
    const batMuted = /did not bat|not batted/i.test(batting);
    const bowlMuted = /did not bowl|not bowled/i.test(bowling);

    return `
      <a class="match-row" href="${href}" target="_blank" rel="noopener noreferrer">
        <div class="match-meta">
          <span class="match-tour">${match.tournament || 'Match'}</span>
          <span class="match-date">${fmtMatchDate(match.date)}</span>
        </div>
        <div class="match-teams">
          <span>${match.team_a} <em>${match.team_a_score || ''}</em></span>
          <span class="vs">vs</span>
          <span>${match.team_b} <em>${match.team_b_score || ''}</em></span>
        </div>
        <div class="match-perf">
          <div class="perf-item ${batMuted ? 'muted' : ''}">
            <span class="perf-lab">Bat</span>
            <span class="perf-val">${batting}</span>
          </div>
          <div class="perf-item ${bowlMuted ? 'muted' : ''}">
            <span class="perf-lab">Bowl</span>
            <span class="perf-val">${bowling}</span>
          </div>
        </div>
        ${renderMatchAwards(match.awards)}
        <div class="match-result">${match.result || ''}</div>
        <div class="match-venue">${[match.ground, match.city].filter(Boolean).join(', ')}${match.overs ? ` · ${match.overs} ov` : ''}</div>
      </a>
    `;
  }).join('');

  return `
    <div class="player-matches">
      <div class="matches-head">
        <h4>Last 5 performances</h4>
        <p>Leather ball only — batting, bowling, and match awards from CricHeroes.</p>
      </div>
      <div class="match-list">${rows}</div>
    </div>
  `;
}

function renderPlayerCard(player) {
  return `
    <div class="player-card">
      <div class="player-photo">
        <div>
          <div class="avatar">${initials(player.name)}</div>
          Photo coming soon
        </div>
      </div>
      <div class="player-body">
        <div class="name-row">
          <h3>${player.name}</h3>
          <span class="role-tag">${player.role || 'Role — TBD'}</span>
        </div>
        <p style="color: var(--ink-soft); margin-top: 6px;">${player.bio || ''}</p>
        <div class="stat-row" data-player-id="${player.id}">
          <div class="stat"><div class="val" data-field="matches">${fmt(player.matches)}</div><div class="lab">Matches</div></div>
          <div class="stat"><div class="val" data-field="runs">${fmt(player.runs)}</div><div class="lab">Runs</div></div>
          <div class="stat"><div class="val" data-field="wickets">${fmt(player.wickets)}</div><div class="lab">Wickets</div></div>
          <div class="stat"><div class="val" data-field="average">${fmt(player.average)}</div><div class="lab">Average</div></div>
          <div class="stat"><div class="val" data-field="highest_score">${fmt(player.highest_score)}</div><div class="lab">Highest</div></div>
          <div class="stat"><div class="val" data-field="best_bowling">${fmt(player.best_bowling)}</div><div class="lab">Best Bowl</div></div>
        </div>
        <p class="stat-scope">Leather ball only</p>
        <div class="player-note">${lastSyncedLine(player)}</div>
        ${renderLeatherMatches(player)}
      </div>
    </div>
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
  if (!grid) return;

  const cards = grid.querySelectorAll('.player-card');
  const card = cards[0];
  if (!card) return;

  const gap = 24;
  const cardWidth = card.getBoundingClientRect().width + gap;
  grid.style.transform = `translateX(-${playerIndex * cardWidth}px)`;

  cards.forEach((el, i) => {
    el.classList.toggle('is-active', i === playerIndex);
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

async function loadPlayers() {
  const grid = document.getElementById('playerGrid');
  if (!grid) return;

  try {
    const res = await fetch('players.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const players = data.players || [];

    if (players.length === 0) {
      grid.innerHTML = '<p class="story-empty">No player profiles added yet.</p>';
      return;
    }

    grid.innerHTML = players.map(renderPlayerCard).join('');
    highlightChangedStats(players);
    setupPlayerSlider(players.length);
    renderPlayerDots(players.length);
    updatePlayerSlider();
    restartPlayerTimer();
  } catch (err) {
    console.error('Could not load player data:', err);
    grid.innerHTML = '<p class="story-empty">Could not load player profiles right now.</p>';
  }
}

loadPlayers();

// ---------------------------------------------------------------------
// Match stories — pick by date
// ---------------------------------------------------------------------
let storiesData = [];
let activeStoryId = null;

function fmtStoryDate(iso) {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function renderStoryDetail(story) {
  const detail = document.getElementById('storyDetail');
  if (!detail || !story) return;

  const highlights = (story.highlights || [])
    .map((item) => `<span class="highlight-chip">${item}</span>`)
    .join('');

  const paragraphs = (story.paragraphs || [])
    .map((text) => `<p>${text}</p>`)
    .join('');

  detail.innerHTML = `
    <article class="story-card featured story-card-animated">
      <div class="story-meta pulse-meta">
        <span>${story.type || 'Match'}</span>
        <span class="dot"></span>
        <span>${fmtStoryDate(story.date)}</span>
      </div>
      <h3>${story.title}</h3>
      ${highlights ? `<div class="story-highlights">${highlights}</div>` : ''}
      ${paragraphs}
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
    detail.innerHTML = '<p class="story-empty">No match stories yet — add one to stories.json after your next game.</p>';
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
}

async function loadStories() {
  try {
    const res = await fetch('stories.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    storiesData = (data.stories || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    renderStoryDateList();
  } catch (err) {
    console.error('Could not load match stories:', err);
    const detail = document.getElementById('storyDetail');
    if (detail) {
      detail.innerHTML = '<p class="story-empty">Could not load match stories right now.</p>';
    }
  }
}

loadStories();

// Kick off counters on the initially visible tab
animateCounters(document.querySelector('.tab-panel.active'));
