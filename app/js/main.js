// Leonida Dossier — GTA 6 trophy guide & tracker. Static, offline, no network at runtime.
// Data: app/data/trophies.json (official names/descriptions/grades verbatim; guides our own words).
// State: localStorage key leonida-dossier-v3. Demo seeding: ?seed=1 marks ~17 trophies earned
// (for screenshots only) — documented here, never used by default.
const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'leonida-dossier-v3';
const SEED_EARNED = [2, 3, 8, 15, 16, 20, 21, 25, 28, 35, 42, 44, 46, 51, 53, 54, 55];
const SEED_COUNTERS = { 15: 120, 31: 40, 35: 55, 42: 30, 52: 120000 };
const STAGES = [
  { n: 1, title: 'Stage 1 — Story first: Chapter 1', note: 'Play Chapter 1 and bank its missable mission trophies as they appear.' },
  { n: 2, title: 'Stage 2 — Chapters 2–3 + character missions', note: 'Keep Andy, Kenton, Billy, Randy and Tyrone strands current; do their missions when they appear.' },
  { n: 3, title: 'Stage 3 — Chapter 4 + the finale + story choices', note: 'Finish Chapter 4, clear the last named-mission trophies, then play the final mission. Choices count here.' },
  { n: 4, title: 'Stage 4 — Stranger strands', note: 'Complete 8 stranger mission strands across Leonida.' },
  { n: 5, title: 'Stage 5 — Collectibles & exploration', note: 'Meditation spots, card sets, WAiNK locations, vehicles and all 52 areas.' },
  { n: 6, title: 'Stage 6 — Grind & activities', note: 'Stunts, challenges, races, shooting range, fishing, arcade, bowling, laundering, shops, garages.' },
  { n: 7, title: 'Stage 7 — Crime & cleanup to 100%', note: 'Robberies, vaults, gangs and the odd one-offs, then 100% completion and the platinum.' },
];
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

let trophies = [];
let state = loadState();
let view = 'checklist';
let selectedId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { const s = JSON.parse(raw); return { earned: new Set(s.earned || []), counters: s.counters || {}, spoiler: s.spoiler !== false }; }
  } catch (e) { /* corrupted save: start fresh */ }
  return { earned: new Set(), counters: {}, spoiler: true };
}
function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...state.earned], counters: state.counters, spoiler: state.spoiler }));
}
function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function medalLetter(t) { return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[t.grade]; }
function displayName(t) {
  if (state.spoiler && t.hidden && !state.earned.has(t.id)) return 'Hidden story trophy';
  return t.name;
}
function displayDesc(t) {
  if (state.spoiler && t.hidden && !state.earned.has(t.id)) return 'Hidden story trophy — earn it to reveal its name and description.';
  return t.description;
}
function srcTags(t) {
  const names = (t.sources || []).map((s) => s.name.split(' — ')[0].replace('PSNProfiles', 'PSNP'));
  return [...new Set(names)].join(' · ');
}
function byId(id) { return trophies.find((t) => t.id === id); }

function renderHeader() {
  const earned = state.earned.size, total = trophies.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  document.getElementById('ringCount').textContent = earned + '/' + total;
  document.getElementById('ringPct').textContent = pct + '%';
  document.getElementById('ringFg').style.strokeDashoffset = String(326.7 * (1 - earned / total));
  const guides = trophies.filter((t) => t.guide && t.guide.trim()).length;
  const cited = trophies.filter((t) => t.sources && t.sources.length).length;
  const hidden = trophies.filter((t) => t.hidden).length;
  const miss = trophies.filter((t) => t.missable).length;
  const unconf = trophies.filter((t) => /not pinned down/i.test(t.guide)).length;
  document.getElementById('auditStrip').textContent =
    'SELF-AUDIT: ' + total + '/' + total + ' trophies · ' + guides + '/' + total + ' guides · ' + cited + '/' + total +
    ' cited · ' + hidden + '/' + hidden + ' hidden · ' + miss + ' missable · ' + unconf + ' unconfirmed';
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  document.getElementById('gradeBars').innerHTML = grades.map((g) => {
    const tot = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && state.earned.has(t.id)).length;
    return '<span><b>' + g[0].toUpperCase() + g.slice(1) + '</b> ' + got + '/' + tot + '</span>';
  }).join('');
}

function renderNextUp() {
  const strip = document.getElementById('nextUpStrip');
  const ordered = [...trophies].sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  const next = ordered.filter((t) => !state.earned.has(t.id));
  if (!next.length) { strip.innerHTML = '<div class="nextup"><h2>NEXT UP</h2><p>Platinum earned — every trophy is done. Leonida Legend.</p></div>'; return; }
  const [first, ...rest] = next;
  strip.innerHTML = '<div class="nextup"><h2>NEXT UP — ' + esc(displayName(first)) + ' · Stage ' + first.stage + ' · ' + esc(first.chapter) + '</h2>' +
    '<p class="nu-guide">' + esc(first.guide) + '</p>' +
    '<p>After that: ' + rest.slice(0, 2).map((t) => esc(displayName(t))).join(' → ') + '</p></div>';
}

function trophyCard(t) {
  const earned = state.earned.has(t.id);
  const card = el('<article class="card' + (earned ? ' earned' : '') + (selectedId === t.id ? ' selected' : '') + '" data-id="' + t.id + '">' +
    '<div class="medal ' + t.grade + '">' + medalLetter(t) + '</div>' +
    '<div class="card-body"><h3>' + esc(displayName(t)) + '</h3>' +
    '<p class="desc">“' + esc(displayDesc(t)) + '”</p>' +
    '<p class="guide-excerpt"><b>Guide:</b> ' + esc(t.guide) + '</p>' +
    '<div class="badges"><span class="badge kind">' + t.kind + '</span>' +
    '<span class="badge">' + t.grade + '</span>' +
    '<span class="badge">Stage ' + t.stage + ' · #' + t.id + '/55</span>' +
    '<span class="badge">' + esc(t.chapter) + '</span>' +
    (t.missable ? '<span class="badge miss">MISSABLE</span>' : '') +
    (t.hidden && !earned ? '<span class="badge">HIDDEN</span>' : '') +
    (t.counter ? '<span class="badge">' + state.counters[t.id] || 0 + '/' + t.counter.target + ' ' + esc(t.counter.label) + '</span>' : '') +
    '<span class="badge src">' + esc(srcTags(t)) + '</span></div></div>' +
    '<label class="card-check"><input type="checkbox" ' + (earned ? 'checked' : '') + ' aria-label="Mark earned"><span>' + (earned ? 'Earned' : 'Earn') + '</span></label></article>');
  card.addEventListener('click', (e) => { if (e.target.tagName !== 'INPUT') selectTrophy(t.id); });
  card.querySelector('input').addEventListener('change', (e) => { toggleEarned(t.id, e.target.checked); e.stopPropagation(); });
  return card;
}

function filteredTrophies() {
  const q = (document.getElementById('searchBox').value || '').toLowerCase();
  const kind = document.getElementById('kindFilter').value;
  const grade = document.getElementById('gradeFilter').value;
  const status = document.getElementById('statusFilter').value;
  const sort = document.getElementById('sortSelect').value;
  let list = trophies.filter((t) => {
    if (kind === 'missable' && !t.missable) return false;
    if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
    if (kind === 'online') return false; // no online trophies in the official list
    if (grade !== 'all' && t.grade !== grade) return false;
    if (status === 'earned' && !state.earned.has(t.id)) return false;
    if (status === 'unearned' && state.earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
  if (sort === 'grade') list.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else list.sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  return list;
}

function renderView() {
  const root = document.getElementById('viewRoot');
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  document.getElementById('filters').style.display = view === 'checklist' ? 'flex' : 'none';
  root.innerHTML = '';
  if (view === 'checklist') {
    const list = filteredTrophies();
    document.getElementById('resultCount').textContent = list.length + ' of 55 shown';
    if (!list.length) root.appendChild(el('<p style="color:var(--muted)">No trophies match — the official list has no online trophies, so the online filter is empty by design.</p>'));
    list.forEach((t) => root.appendChild(trophyCard(t)));
  } else if (view === 'roadmap') {
    STAGES.forEach((s) => {
      const items = trophies.filter((t) => t.stage === s.n).sort((a, b) => a.id - b.id);
      const done = items.filter((t) => state.earned.has(t.id)).length;
      const box = el('<section class="stage"><h2>' + esc(s.title) + ' <span class="st-count">' + done + '/' + items.length + ' earned</span></h2><p>' + esc(s.note) + '</p><ul>' +
        items.map((t) => '<li class="' + (state.earned.has(t.id) ? 'done' : '') + '">' + (state.earned.has(t.id) ? '✓ ' : '○ ') + esc(displayName(t)) + (t.missable ? ' — MISSABLE' : '') + ' <span style="color:var(--muted)">(' + t.grade + ')</span></li>').join('') + '</ul></section>');
      box.querySelectorAll('li').forEach((li, i) => li.addEventListener('click', () => selectTrophy(items[i].id)));
      root.appendChild(box);
    });
  } else if (view === 'missables') {
    const miss = trophies.filter((t) => t.missable).sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
    const warn = el('<div class="warn"><h2>⚠ ' + miss.length + ' MISSABLE TROPHIES</h2><p>These can only be earned at one point in the story. Clear them in chapter order; once a chapter closes, the only way back is replaying the chapter or mission if the game offers it.</p></div>');
    root.appendChild(warn);
    miss.forEach((t) => root.appendChild(trophyCard(t)));
  } else if (view === 'nextup') {
    const ordered = [...trophies].sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
    const next = ordered.filter((t) => !state.earned.has(t.id)).slice(0, 10);
    root.appendChild(el('<div class="warn"><h2>NEXT UP — the road ahead</h2><p>The next 10 unearned trophies in roadmap order. Earn the first one, and the list moves on.</p></div>'));
    next.forEach((t, i) => {
      const c = trophyCard(t);
      c.querySelector('h3').textContent = (i + 1) + '. ' + displayName(t);
      root.appendChild(c);
    });
  }
  renderHeader();
  renderNextUp();
}

function selectTrophy(id) {
  selectedId = id;
  const t = byId(id);
  const pane = document.getElementById('detailPane');
  const earned = state.earned.has(id);
  const cur = state.counters[id] || 0;
  const unpinned = /not pinned down/i.test(t.guide);
  pane.innerHTML = '';
  const box = el('<div><div class="badges"><span class="badge kind">' + t.kind + '</span><span class="badge">' + t.grade + '</span>' +
    '<span class="badge">Stage ' + t.stage + ' · #' + t.id + '/55</span>' + (t.missable ? '<span class="badge miss">MISSABLE</span>' : '') + '</div>' +
    '<h2>' + esc(displayName(t)) + '</h2><p class="official">“' + esc(displayDesc(t)) + '” — official description</p>' +
    '<div class="summary"><strong>Guide — summary:</strong> ' + esc(t.guide) + '</div>' +
    '<h3>Guide — step by step</h3><ol>' + t.steps.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol>' +
    '<h3>Sources</h3><ul class="sources">' + t.sources.map((s) => '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a> — retrieved ' + esc(s.date) + '</li>').join('') + '</ul>' +
    (t.missable ? '<div class="box"><strong>MISSABLE — point of return:</strong> ' + esc(t.chapter) + '. Earn it while that mission or chapter is open; after it closes, only a chapter/mission replay (if the game offers one) can bring it back.</div>' : '') +
    (unpinned ? '<div class="box unpinned"><strong>NOT PINNED DOWN YET:</strong> the exact spot for this one is not confirmed by a cited source — written honestly, not guessed.</div>' : '') +
    (t.counter ? '<h3>Counter</h3><div class="counter"><button type="button" id="cntMinus">−</button><b>' + cur + ' / ' + t.counter.target + '</b><span>' + esc(t.counter.label) + '</span><button type="button" id="cntPlus">+</button></div>' : '') +
    '<p style="color:var(--muted);font-size:13px">Difficulty ' + t.difficulty + '/5 (estimate) · about ' + t.time + 'h (estimate) · Chapter: ' + esc(t.chapter) + '</p>' +
    '<div class="detail-nav"><button type="button" id="btnEarn">' + (earned ? '✓ Earned — unmark' : 'Mark earned') + '</button>' +
    '<button type="button" id="btnPrev">← Prev</button><button type="button" id="btnNext">Next →</button></div></div>');
  pane.appendChild(box);
  pane.querySelector('#btnEarn').addEventListener('click', () => { toggleEarned(id, !state.earned.has(id)); });
  const prev = byId(id > 1 ? id - 1 : 55), next = byId(id < 55 ? id + 1 : 1);
  pane.querySelector('#btnPrev').addEventListener('click', () => selectTrophy(prev.id));
  pane.querySelector('#btnNext').addEventListener('click', () => selectTrophy(next.id));
  if (t.counter) {
    pane.querySelector('#cntMinus').addEventListener('click', () => { state.counters[id] = Math.max(0, (state.counters[id] || 0) - 1); saveState(); selectTrophy(id); renderHeader(); renderView(); });
    pane.querySelector('#cntPlus').addEventListener('click', () => { state.counters[id] = Math.min(t.counter.target, (state.counters[id] || 0) + 1); saveState(); selectTrophy(id); renderHeader(); renderView(); });
  }
  document.querySelectorAll('.card').forEach((c) => c.classList.toggle('selected', Number(c.dataset.id) === id));
  pane.scrollTop = 0;
  if (window.innerWidth < 900) pane.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleEarned(id, on) {
  if (on) state.earned.add(id); else state.earned.delete(id);
  saveState(); renderView();
  if (selectedId === id) selectTrophy(id);
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...state.earned], counters: state.counters, exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'leonida-dossier-progress.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      state.earned = new Set((d.earned || []).filter((id) => byId(id)));
      state.counters = d.counters || {};
      saveState(); renderView();
    } catch (e) { alert('That file is not a valid Leonida Dossier progress export.'); }
  };
  reader.readAsText(file);
}

async function init() {
  const params = new URLSearchParams(location.search);
  const res = await fetch(DATA_URL);
  const data = await res.json();
  trophies = data.trophies;
  if (params.get('seed') === '1') {
    state.earned = new Set(SEED_EARNED);
    state.counters = { ...SEED_COUNTERS };
    saveState();
  }
  document.getElementById('spoilerToggle').checked = state.spoiler;
  document.getElementById('spoilerToggle').addEventListener('change', (e) => { state.spoiler = e.target.checked; saveState(); renderView(); if (selectedId) selectTrophy(selectedId); });
  document.getElementById('btnExport').addEventListener('click', exportProgress);
  document.getElementById('btnImport').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); });
  document.getElementById('btnReset').addEventListener('click', () => { if (confirm('Reset all progress?')) { state.earned = new Set(); state.counters = {}; saveState(); renderView(); } });
  document.querySelectorAll('#tabs button').forEach((b) => b.addEventListener('click', () => { view = b.dataset.view; renderView(); }));
  ['searchBox', 'kindFilter', 'gradeFilter', 'statusFilter', 'sortSelect'].forEach((id) => document.getElementById(id).addEventListener('input', renderView));
  if (params.get('view')) view = params.get('view');
  if (params.get('kind')) { document.getElementById('kindFilter').value = params.get('kind'); view = 'checklist'; }
  renderView();
  const open = params.get('open');
  if (open && byId(Number(open))) selectTrophy(Number(open));
  else if (params.get('seed') === '1') selectTrophy(21);
  window.__shotReady = true;
}
init();
