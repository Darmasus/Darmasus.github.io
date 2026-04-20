// =========================================================================
// DARMASUS // PORTFOLIO — live stage-select
// Fetches public repos from GitHub and renders them as retro arcade cards.
// =========================================================================

const USER   = 'Darmasus';
const API    = `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`;
const HIDDEN = new Set([
  'nvc-dhl-tracker',    // fork
  'Darmasus.github.io'  // this site — avoids recursive listing
]);

// GitHub's official language colors — trimmed.
const LANG_COLORS = {
  'C++':        '#f34b7d',
  'C':          '#aaaaaa',
  'Java':       '#ffa94d',
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Python':     '#4b8bbe',
  'HTML':       '#ff5722',
  'CSS':        '#b36cff',
  'Go':         '#00ADD8',
  'Rust':       '#ff7043',
  'Shell':      '#89e051',
  'Ruby':       '#ff5252',
  'Swift':      '#FF8C00',
  'Kotlin':     '#A97BFF',
  'Jupyter Notebook': '#DA5B0B',
  'Other':      '#858585'
};

// Curated descriptions for repos without a good one on GitHub.
const OVERRIDES = {
  'Artemis-Financial-Vulnerability-Assessment-Report':
    'Vulnerability analysis + mitigation report for a mock financial firm.',
  'BuzzB2B':
    'B2B marketplace platform prototype. Products, vendors, orders in TypeScript.',
  'ContactService':
    'Java contact CRUD service with exhaustive unit tests & bounds-checking.',
  'CS330-Final-Assignment':
    'Final 3D scene for CS-330: textured objects, lighting & camera controls in OpenGL.',
  'DSA-Analysis-and-Design':
    'Data-structure & algorithm studies — runtime analysis and tradeoff notes.',
  'WeightTracker':
    'Mobile weight-tracking client in Java with local persistence & goal screens.',
  'labense':
    'Upload medical lab results, get plain-English explanations and health tips. Python.',
  'pantryguard':
    'Pantry & food-inventory tracker prototype — TypeScript client with expiry alerts.',
  'Pirate-Game':
    'Reinforcement-learning agent solving a pirate treasure-map maze. Python + Jupyter.',
  'travlr':
    'Full-stack travel-booking app — customer-facing site + admin console.'
};

// --------- Utilities ---------
const prettyDate = iso =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

const hudDate = () =>
  new Date().toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  }).toUpperCase();

const langColor = lang => LANG_COLORS[lang] || LANG_COLORS.Other;

const prettyName = name =>
  name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

const escapeHtml = s =>
  String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

// --------- Boot ---------
async function load() {
  document.getElementById('hud-date').textContent = hudDate();

  try {
    const res = await fetch(API, {
      headers: { 'Accept': 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error(`GITHUB API RETURNED ${res.status}`);
    const repos = await res.json();
    const cleaned = repos
      .filter(r => !r.fork && !HIDDEN.has(r.name))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    render(cleaned);
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('grid');
    grid.removeAttribute('aria-busy');
    grid.innerHTML = `
      <div class="loading">
        ▸ ERROR: ${escapeHtml(err.message).toUpperCase()} <br>
        <span style="color:var(--cyan)">VISIT GITHUB.COM/${USER} DIRECTLY</span>
      </div>`;
  }
}

// --------- Render stats + filters ---------
function render(repos) {
  // Languages sorted by frequency (desc).
  const counts = {};
  repos.forEach(r => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
  const langs = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  document.getElementById('stat-projects').textContent =
    String(repos.length).padStart(2, '0');
  document.getElementById('stat-langs').textContent =
    String(langs.length).padStart(2, '0');
  document.getElementById('stat-updated').textContent =
    repos.length ? prettyDate(repos[0].updated_at).toUpperCase() : '--';

  // Filter bar
  const filters = document.querySelector('.filters');
  document.getElementById('count-all').textContent = repos.length;

  langs.forEach(lang => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter';
    btn.dataset.lang = lang;
    btn.innerHTML =
      `<span class="filter__dot" style="background:${langColor(lang)}"></span>` +
      `${escapeHtml(lang.toUpperCase())} <span class="count">${counts[lang]}</span>`;
    filters.appendChild(btn);
  });

  filters.addEventListener('click', e => {
    const btn = e.target.closest('.filter');
    if (!btn) return;
    filters.querySelectorAll('.filter').forEach(b =>
      b.classList.toggle('is-active', b === btn));
    apply(repos, btn.dataset.lang);
  });

  apply(repos, 'all');
}

// --------- Apply filter + render grid ---------
function apply(repos, lang) {
  const visible = lang === 'all'
    ? repos
    : repos.filter(r => r.language === lang);

  document.getElementById('visible-count').textContent =
    `${String(visible.length).padStart(2, '0')} ${visible.length === 1 ? 'STAGE' : 'STAGES'}`;

  const grid = document.getElementById('grid');
  grid.removeAttribute('aria-busy');

  if (!visible.length) {
    grid.innerHTML =
      `<div class="loading">▸ NO STAGES UNDER THIS GENRE.</div>`;
    return;
  }

  grid.innerHTML = visible.map((r, i) => cardHtml(r, i)).join('');
}

// --------- Card template ---------
function cardHtml(r, i) {
  const num   = String(i + 1).padStart(2, '0');
  const desc  = OVERRIDES[r.name] || r.description ||
                'UNDOCUMENTED STAGE. SEE SOURCE FOR NOTES.';
  const lang  = r.language || 'Other';
  const title = prettyName(r.name);
  const delay = (i * 55) + 'ms';

  return `
    <article class="card" style="animation-delay:${delay}">
      <span class="card__stage">STAGE ${num}</span>
      <h3 class="card__title">${escapeHtml(title)}</h3>
      <p class="card__desc">${escapeHtml(desc)}</p>
      <div class="card__meta">
        <span class="card__lang">
          <span class="card__dot" style="background:${langColor(lang)}"></span>
          ${escapeHtml(lang.toUpperCase())}
        </span>
        <span class="card__date">UPD ${prettyDate(r.updated_at).toUpperCase()}</span>
        ${r.stargazers_count ? `<span class="card__star">★${r.stargazers_count}</span>` : ''}
        <span class="card__enter">ENTER ▶</span>
      </div>
      <a class="card__link"
         href="${escapeHtml(r.html_url)}"
         target="_blank"
         rel="noopener"
         aria-label="Open ${escapeHtml(r.name)} on GitHub">
        Open on GitHub
      </a>
    </article>
  `;
}

load();
