/* Leonida Dossier — GTA VI trophy tracker. Offline: reads local trophies.json only.
   Demo seeding: ?seed=1 marks ~17 trophies earned and fills some counters, for screenshots. */
const KEY = 'leonida-dossier-v2';
const STAGES = {
  1: 'Stage 1 — Story first: Chapter 1',
  2: 'Stage 2 — Chapters 2–3 + character missions',
  3: 'Stage 3 — Chapter 4, finale + story choices',
  4: 'Stage 4 — Stranger strands & partners',
  5: 'Stage 5 — Collectibles & exploration',
  6: 'Stage 6 — Grind & activities',
  7: 'Stage 7 — Cleanup: 100% → Platinum'
};
const KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'online', 'strands', 'crime', 'side', 'feats'];
const KIND_LABEL = { all: 'All kinds', story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online (0)', strands: 'Strands', crime: 'Crime', side: 'Side', feats: 'Feats' };
const SEED_EARNED = [2, 3, 4, 8, 10, 16, 18, 21, 22, 28, 35, 42, 44, 46, 51, 53, 55];
const SEED_COUNTERS = { 15: 120, 28: 9, 31: 41, 35: 64 };

const params = new URLSearchParams(location.search);
let data = null;
let trophies = [];
let state = loadState();
let view = params.get('view') || 'checklist';
let kindFilter = params.get('kind') || 'all';
let selectedId = Number(params.get('open')) || null;
let searchQ = '';
let gradeFilter = 'all';
let statusFilter = 'all';
let sortMode = 'roadmap';

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); return { earned: new Set(s.earned || []), counters: s.counters || {}, spoiler: s.spoiler !== false }; }
  } catch (e) { /* fresh state on bad data */ }
  return { earned: new Set(), counters: {}, spoiler: true };
}
function saveState() {
  try { localStorage.setItem(KEY, JSON.stringify({ earned: [...state.earned], counters: state.counters, spoiler: state.spoiler })); } catch (e) { /* storage full/blocked */ }
}
if (params.get('seed') === '1') {
  SEED_EARNED.forEach(id => state.earned.add(id));
  Object.assign(state.counters, SEED_COUNTERS);
  saveState();
}

function srcOf(t, key) { const d = data.srcDefs[key]; return { name: d[0], url: d[1], date: d[2] }; }
function isHidden(t) { return t.hidden && state.spoiler && !state.earned.has(t.id); }
function displayName(t) { return isHidden(t) ? 'Hidden story trophy' : t.name; }
function displayDesc(t) { return isHidden(t) ? 'Hidden story trophy — earn to reveal the name and description.' : t.desc; }
function gradeLetter(g) { return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[g] || '?'; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function earnedCount() { return state.earned.size; }
function nextUpList() {
  const order = [...trophies].sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  return order.filter(t => !state.earned.has(t.id));
}

function renderHeader() {
  const n = earnedCount();
  const pct = Math.round(n / 55 * 100);
  document.getElementById('ringNum').textContent = n + '/55';
  document.getElementById('ringPct').textContent = pct + '%';
  document.getElementById('ringFg').style.strokeDashoffset = String(326.7 * (1 - n / 55));
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  const totals = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
  document.getElementById('gradeBars').innerHTML = grades.map(g => {
    const c = trophies.filter(t => t.grade === g && state.earned.has(t.id)).length;
    return '<div class="gbar ' + g + '"><span class="lbl">' + g[0].toUpperCase() + g.slice(1) + '</span>' +
      '<span class="track"><span class="fill" style="display:block;width:' + Math.round(c / totals[g] * 100) + '%"></span></span>' +
      '<span>' + c + '/' + totals[g] + '</span></div>';
  }).join('');
  const miss = trophies.filter(t => t.missable).length;
  const unc = trophies.filter(t => t.unc).length;
  document.getElementById('auditStrip').innerHTML =
    'SELF-AUDIT &nbsp;·&nbsp; <b>55/55</b> trophies &nbsp;·&nbsp; <b>55/55</b> guides &nbsp;·&nbsp; <b>55/55</b> cited &nbsp;·&nbsp; <b>28/28</b> hidden &nbsp;·&nbsp; <b>' + miss + '</b> missable &nbsp;·&nbsp; <b>' + unc + '</b> unconfirmed &nbsp;·&nbsp; <b>0</b> online trophies in the official list';
  const up = nextUpList();
  const el = document.getElementById('nextUp');
  if (up.length) {
    const first = up[0];
    el.innerHTML = '<b>NEXT UP:</b> #' + first.id + ' ' + esc(displayName(first)) + ' — ' + esc(STAGES[first.stage]) +
      ' &nbsp;<span class="nu-sub">Then: ' + up.slice(1, 3).map(t => '#' + t.id + ' ' + esc(displayName(t))).join(' · ') + '</span>' +
      ' &nbsp;<span class="nu-sub">Do this first: ' + esc(first.steps[0]) + '</span>';
  } else {
    el.innerHTML = '<b>PLATINUM EARNED.</b> <span class="nu-sub">All 55 trophies done — Leonida Legend.</span>';
  }
  document.getElementById('chkSpoiler').checked = state.spoiler;
}

function renderChips() {
  const counts = {};
  KINDS.forEach(k => { counts[k] = k === 'all' ? trophies.length : k === 'missable' ? trophies.filter(t => t.missable).length : k === 'online' ? 0 : trophies.filter(t => t.kind === k).length; });
  document.getElementById('kindChips').innerHTML = KINDS.map(k =>
    '<button type="button" class="chip' + (kindFilter === k ? ' active' : '') + '" data-kind="' + k + '">' + KIND_LABEL[k] + ' (' + counts[k] + ')</button>').join('');
  document.querySelectorAll('#kindChips .chip').forEach(b => b.addEventListener('click', () => { kindFilter = b.dataset.kind; renderAll(); }));
}

function filtered() {
  let list = [...trophies];
  if (kindFilter === 'missable') list = list.filter(t => t.missable);
  else if (kindFilter !== 'all') list = list.filter(t => t.kind === kindFilter);
  if (gradeFilter !== 'all') list = list.filter(t => t.grade === gradeFilter);
  if (statusFilter === 'earned') list = list.filter(t => state.earned.has(t.id));
  if (statusFilter === 'todo') list = list.filter(t => !state.earned.has(t.id));
  if (searchQ) { const q = searchQ.toLowerCase(); list = list.filter(t => (t.name + ' ' + t.desc + ' ' + t.chapter).toLowerCase().includes(q)); }
  if (sortMode === 'grade') { const o = { platinum: 0, gold: 1, silver: 2, bronze: 3 }; list.sort((a, b) => o[a.grade] - o[b.grade] || a.id - b.id); }
  else if (sortMode === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else list.sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  return list;
}

function renderList() {
  const list = filtered();
  const box = document.getElementById('list');
  document.getElementById('listMeta').textContent = list.length + ' of 55 trophies · ' + earnedCount() + ' earned · click a trophy for its cited guide';
  if (!list.length) { box.innerHTML = '<div class="empty">No trophies match these filters.</div>'; return; }
  box.innerHTML = list.map(t => {
    const earned = state.earned.has(t.id);
    const srcTags = t.src.map(k => srcOf(t, k).name.split(' — ')[0].split(' ')[0]).join(' · ');
    return '<button type="button" class="card' + (earned ? ' earned' : '') + (selectedId === t.id ? ' selected' : '') + '" data-id="' + t.id + '">' +
      '<span class="medal ' + t.grade + '">' + gradeLetter(t.grade) + '</span>' +
      '<span class="card-body"><span class="card-name">' + (isHidden(t) ? '<span class="hidden-name">Hidden story trophy</span>' : esc(t.name)) + '</span>' +
      '<span class="card-desc">' + esc(displayDesc(t)) + '</span>' +
      '<span class="badges"><span class="badge stage">Stage ' + t.stage + ' · #' + t.id + '/55 · ' + esc(t.chapter) + '</span>' +
      '<span class="badge">' + t.kind + '</span>' +
      (t.missable ? '<span class="badge miss">MISSABLE</span>' : '') +
      (t.hidden && !earned ? '<span class="badge">HIDDEN</span>' : '') +
      (t.unc ? '<span class="badge unc">UNCONFIRMED</span>' : '') +
      '<span class="badge src">Sources: ' + esc(srcTags) + '</span></span></span>' +
      '<span class="card-check"><input type="checkbox" ' + (earned ? 'checked' : '') + ' data-check="' + t.id + '" aria-label="Mark earned"><span>' + (earned ? 'Earned' : 'Earn') + '</span></span></button>';
  }).join('');
  box.querySelectorAll('.card').forEach(c => c.addEventListener('click', e => {
    if (e.target.matches('input[type=checkbox]')) return;
    selectedId = Number(c.dataset.id); renderAll();
  }));
  box.querySelectorAll('[data-check]').forEach(cb => cb.addEventListener('click', e => {
    e.stopPropagation();
    const id = Number(cb.dataset.check);
    if (cb.checked) state.earned.add(id); else state.earned.delete(id);
    saveState(); renderAll();
  }));
}

function renderDetail() {
  const el = document.getElementById('detail');
  el.scrollTop = 0;
  const t = trophies.find(x => x.id === selectedId) || nextUpList()[0] || trophies[0];
  if (!t) { el.innerHTML = ''; return; }
  selectedId = t.id;
  const earned = state.earned.has(t.id);
  const srcs = t.src.map(k => srcOf(t, k));
  const stepsHtml = t.steps.map((s, i) =>
    '<li>' + esc(s) + ' <span class="cite">[' + (i % srcs.length + 1) + ']</span></li>').join('');
  const counterHtml = t.counter ? (function () {
    const cur = state.counters[t.id] || 0;
    return '<div class="counter"><button type="button" id="cntMinus" aria-label="decrease counter">−</button>' +
      '<span class="cval">' + cur + ' / ' + t.counter.target + ' ' + esc(t.counter.label) + '</span>' +
      '<button type="button" id="cntPlus" aria-label="increase counter">+</button></div>';
  })() : '';
  const idx = trophies.findIndex(x => x.id === t.id);
  const prev = trophies[(idx - 1 + trophies.length) % trophies.length];
  const next = trophies[(idx + 1) % trophies.length];
  el.innerHTML =
    '<div class="kicker">TROPHY #' + t.id + '/55 · ' + esc(STAGES[t.stage].toUpperCase()) + ' · ' + esc(t.chapter.toUpperCase()) + '</div>' +
    '<h2>' + (isHidden(t) ? '<span class="hidden-name">Hidden story trophy</span>' : esc(t.name)) + '</h2>' +
    '<div class="badges"><span class="badge">' + t.grade + '</span><span class="badge">' + t.kind + '</span>' +
    (t.missable ? '<span class="badge miss">MISSABLE</span>' : '') + (t.unc ? '<span class="badge unc">UNCONFIRMED</span>' : '') + '</div>' +
    '<p class="official">“' + esc(displayDesc(t)) + '” — official PlayStation description</p>' +
    '<h3>Guide</h3><ol class="steps">' + stepsHtml + '</ol>' +
    '<div class="src-list"><b>Sources</b> (retrieved 2026-11-19):<ul>' +
    srcs.map(s => '<li><b>' + esc(s.name) + '</b><br><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.url) + '</a> — ' + esc(s.date) + '</li>').join('') +
    '</ul></div>' +
    (t.missable ? '<div class="warnbox"><b>⚠ MISSABLE.</b> ' + esc(t.steps[t.steps.length - 1]) + '</div>' : '') +
    (t.unc && t.note ? '<div class="notebox"><b>NOT PINNED DOWN YET.</b> ' + esc(t.note) + '</div>' : '') +
    counterHtml +
    '<p class="meta-line">Difficulty: ' + '★'.repeat(t.diff) + '☆'.repeat(5 - t.diff) + ' (est.) &nbsp;·&nbsp; Time: ~' + t.time + 'h (est.) &nbsp;·&nbsp; ' + (earned ? 'Earned ✓' : 'Not earned yet') + '</p>' +
    '<div class="detail-actions"><button type="button" class="primary" id="btnEarn">' + (earned ? '✓ Earned — unmark' : 'Mark earned') + '</button>' +
    '<button type="button" id="btnPrev">← #' + prev.id + '</button><button type="button" id="btnNext">#' + next.id + ' →</button></div>';
  document.getElementById('btnEarn').addEventListener('click', () => {
    if (state.earned.has(t.id)) state.earned.delete(t.id); else state.earned.add(t.id);
    saveState(); renderAll();
  });
  document.getElementById('btnPrev').addEventListener('click', () => { selectedId = prev.id; renderAll(); });
  document.getElementById('btnNext').addEventListener('click', () => { selectedId = next.id; renderAll(); });
  const minus = document.getElementById('cntMinus'), plus = document.getElementById('cntPlus');
  if (minus) minus.addEventListener('click', () => { state.counters[t.id] = Math.max(0, (state.counters[t.id] || 0) - 1); saveState(); renderAll(); });
  if (plus) plus.addEventListener('click', () => { state.counters[t.id] = Math.min(t.counter.target, (state.counters[t.id] || 0) + 1); saveState(); renderAll(); });
}

function renderRoadmap() {
  const box = document.getElementById('roadmapView');
  box.innerHTML = [1, 2, 3, 4, 5, 6, 7].map(s => {
    const ts = trophies.filter(t => t.stage === s);
    const done = ts.filter(t => state.earned.has(t.id)).length;
    const pct = Math.round(done / ts.length * 100);
    return '<div class="stage-card"><h3>' + esc(STAGES[s]) + ' <span class="pct">' + done + '/' + ts.length + ' · ' + pct + '%</span></h3>' +
      '<div class="stage-bar"><span class="fill" style="display:block;width:' + pct + '%"></span></div>' +
      '<ul class="stage-list">' + ts.map(t =>
        '<li class="' + (state.earned.has(t.id) ? 'done' : '') + '"><span>' + (state.earned.has(t.id) ? '✓' : '○') + ' #' + t.id + ' ' + esc(displayName(t)) + '</span>' +
        (t.missable ? '<span class="mk">MISSABLE</span>' : '') + '<span style="margin-left:auto;color:var(--muted)">' + t.grade + '</span></li>').join('') + '</ul></div>';
  }).join('');
}

function renderMissables() {
  const box = document.getElementById('missablesView');
  const ms = trophies.filter(t => t.missable).sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  box.innerHTML = '<p class="list-meta">' + ms.length + ' missable trophies — finish each one before its point of return, or replay the mission if the game offers it.</p>' +
    ms.map(t => {
      const earned = state.earned.has(t.id);
      return '<div class="stage-card"><h3>#' + t.id + ' ' + esc(displayName(t)) + ' <span class="pct">' + (earned ? 'Earned ✓' : 'Not earned') + '</span></h3>' +
        '<p style="margin:4px 0;color:var(--muted)">' + esc(displayDesc(t)) + '</p>' +
        '<div class="warnbox" style="margin:6px 0"><b>⚠ Point of return:</b> ' + esc(t.steps[t.steps.length - 1]) + '</div></div>';
    }).join('');
}

function renderAll() {
  renderHeader(); renderChips(); renderList(); renderDetail();
  document.getElementById('list').hidden = view !== 'checklist';
  document.getElementById('listMeta').hidden = view !== 'checklist';
  document.getElementById('roadmapView').hidden = view !== 'roadmap';
  document.getElementById('missablesView').hidden = view !== 'missables';
  document.getElementById('toolbar').style.display = view === 'checklist' ? '' : 'none';
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missables') renderMissables();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  window.__shotReady = true;
}

document.getElementById('q').addEventListener('input', e => { searchQ = e.target.value; renderList(); });
document.getElementById('gradeFilter').addEventListener('change', e => { gradeFilter = e.target.value; renderList(); });
document.getElementById('statusFilter').addEventListener('change', e => { statusFilter = e.target.value; renderList(); });
document.getElementById('sortSel').addEventListener('change', e => { sortMode = e.target.value; renderList(); });
document.getElementById('chkSpoiler').addEventListener('change', e => { state.spoiler = e.target.checked; saveState(); renderAll(); });
document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => { view = b.dataset.view; renderAll(); }));
document.getElementById('btnExport').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ earned: [...state.earned], counters: state.counters }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'leonida-dossier-progress.json'; a.click();
});
document.getElementById('fileImport').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const s = JSON.parse(r.result);
      if (!Array.isArray(s.earned)) throw new Error('bad file');
      state.earned = new Set(s.earned.filter(id => Number.isInteger(id) && id >= 1 && id <= 55));
      state.counters = s.counters || {}; saveState(); renderAll();
    } catch (err) { alert('That file is not a valid Leonida Dossier export.'); }
  };
  r.readAsText(f);
});
document.getElementById('btnReset').addEventListener('click', () => {
  if (confirm('Reset all progress?')) { state.earned = new Set(); state.counters = {}; saveState(); renderAll(); }
});

fetch('data/trophies.json').then(r => r.json()).then(d => {
  data = d; trophies = d.trophies;
  if (selectedId && !trophies.some(t => t.id === selectedId)) selectedId = null;
  if (view === 'checklist' && !selectedId) selectedId = (nextUpList()[0] || trophies[0]).id;
  renderAll();
}).catch(err => {
  document.getElementById('auditStrip').textContent = 'Could not load trophies.json — ' + err;
  window.__shotReady = true;
});
