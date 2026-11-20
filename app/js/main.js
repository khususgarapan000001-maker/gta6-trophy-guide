// Leonida Dossier — GTA VI trophy guide & tracker. Static, offline, no network at runtime.
// Data: app/data/trophies.json (55 official trophies, own-words guides with citations).
// State: localStorage. Demo seeding: ?seed=1 marks ~17 trophies earned (documented demo only).

const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'leonida-dossier-v1';
const params = new URLSearchParams(location.search);

const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', strands: 'Strands', crime: 'Crime', side: 'Side', feats: 'Feats' };
const STAGES = [
  { n: 1, title: 'Story first — Chapter 1', note: 'Clear the Chapter 1 missables as you pass them.' },
  { n: 2, title: 'Chapters 2–3 + story missions', note: 'Keep the chapter missables banked.' },
  { n: 3, title: 'Chapter 4 + finale + choices', note: 'Finish the story; choices count toward Actions Speak Louder.' },
  { n: 4, title: 'Stranger strands & character missions', note: 'Andy, Kenton, Billy, Randy, Tyrone, Bret + 8 stranger strands.' },
  { n: 5, title: 'Collectibles & exploration', note: 'Cards, WAiNK, meditation, vehicles, all 52 areas.' },
  { n: 6, title: 'Grind & activities', note: 'Stunts, challenges, ranges, races, shops, properties.' },
  { n: 7, title: 'Cleanup → 100% → platinum', note: 'Crime trophies, side moments, then A Long Road and the platinum.' },
];

let trophies = [];
let earned = new Set();
let counters = {};
let spoilerOn = true;

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    earned = new Set(raw.earned || []);
    counters = raw.counters || {};
    spoilerOn = raw.spoiler !== false;
  } catch { earned = new Set(); counters = {}; }
}
function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned], counters, spoiler: spoilerOn }));
}
function seedDemo() {
  // Demo seeding for screenshots only (?seed=1): ~17 earned + some counters.
  const ids = [2, 3, 8, 10, 15, 16, 18, 20, 21, 28, 33, 35, 42, 44, 46, 51, 55];
  ids.forEach((id) => earned.add(id));
  counters = { 15: 143, 28: 9, 31: 41, 35: 58, 42: 30 };
}
function trophyById(id) { return trophies.find((t) => t.id === id); }
function isHiddenSpoiler(t) { return spoilerOn && t.hidden && !earned.has(t.id); }
function displayName(t) { return isHiddenSpoiler(t) ? 'Hidden story trophy' : t.name; }
function displayDesc(t) { return isHiddenSpoiler(t) ? 'Hidden story trophy — earn to reveal its name and description.' : t.description; }
function gradeLetter(g) { return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[g] || '?'; }
function sourceTags(t) { return (t.sources || []).map((s) => s.n === 'PowerPyx' ? 'PPX' : s.n === 'Exophase' ? 'EXO' : s.n === 'PSNProfiles' ? 'PSN' : 'GTB').join(' · '); }

function renderHeader() {
  const total = trophies.length;
  const got = earned.size;
  const pct = total ? Math.round((got / total) * 100) : 0;
  document.getElementById('ringCount').textContent = `${got}/${total}`;
  document.getElementById('ringPct').textContent = `${pct}%`;
  document.getElementById('ringFg').style.strokeDashoffset = String(326.7 * (1 - got / total));
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  document.getElementById('gradeBars').innerHTML = grades.map((g) => {
    const all = trophies.filter((t) => t.grade === g);
    const done = all.filter((t) => earned.has(t.id)).length;
    const w = all.length ? Math.round((done / all.length) * 100) : 0;
    return `<div class="gbar ${g}"><b>${gradeLetter(g)} ${done}/${all.length}</b>${g}<div class="bar"><i style="width:${w}%"></i></div></div>`;
  }).join('');
  const guides = trophies.filter((t) => t.guide && t.guide.trim()).length;
  const cited = trophies.filter((t) => t.sources && t.sources.length).length;
  const hiddenDone = trophies.filter((t) => t.hidden && earned.has(t.id)).length;
  const hiddenTotal = trophies.filter((t) => t.hidden).length;
  const miss = trophies.filter((t) => t.missable).length;
  const unc = trophies.filter((t) => t.unconfirmed).length;
  document.getElementById('auditStrip').textContent =
    `SELF-AUDIT · ${total}/${total} trophies · ${guides}/${total} guides · ${cited}/${total} cited · ${hiddenDone}/${hiddenTotal} hidden · ${miss} missable · ${unc} unconfirmed`;
  renderNextUp();
}

function nextUnearned() {
  const ordered = [...trophies].sort((a, b) => a.stage - b.stage || a.id - b.id);
  return ordered.filter((t) => !earned.has(t.id));
}
function renderNextUp() {
  const next = nextUnearned();
  const el = document.getElementById('nextUp');
  if (!next.length) { el.innerHTML = '<h3>NEXT UP</h3><div class="nu-name">Platinum earned — Leonida Legend!</div>'; return; }
  const [first, ...rest] = next;
  el.innerHTML = `<h3>NEXT UP</h3><div class="nu-name">${escapeHtml(displayName(first))}</div>` +
    `<div class="nu-guide">Do this first: ${escapeHtml(first.guide)}</div>` +
    `<div class="nu-after">Then: ${rest.slice(0, 2).map((t) => escapeHtml(displayName(t))).join(' · ')}</div>`;
}

function currentFilters() {
  return {
    q: (document.getElementById('searchBox').value || '').toLowerCase(),
    kind: document.getElementById('kindFilter').value,
    grade: document.getElementById('gradeFilter').value,
    status: document.getElementById('statusFilter').value,
    sort: document.getElementById('sortSel').value,
  };
}
function filteredTrophies() {
  const f = currentFilters();
  let list = trophies.filter((t) => {
    if (f.q && !(t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.chapter).toLowerCase().includes(f.q)) return false;
    if (f.kind === 'missable') { if (!t.missable) return false; }
    else if (f.kind && t.kind !== f.kind) return false;
    if (f.grade && t.grade !== f.grade) return false;
    if (f.status === 'earned' && !earned.has(t.id)) return false;
    if (f.status === 'todo' && earned.has(t.id)) return false;
    return true;
  });
  if (f.sort === 'grade') { const o = { platinum: 0, gold: 1, silver: 2, bronze: 3 }; list.sort((a, b) => o[a.grade] - o[b.grade] || a.id - b.id); }
  else if (f.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else list.sort((a, b) => a.stage - b.stage || a.id - b.id);
  return list;
}
function renderList() {
  const list = filteredTrophies();
  document.getElementById('listCount').textContent = `${list.length} of ${trophies.length} trophies shown`;
  document.getElementById('trophyList').innerHTML = list.map((t) => {
    const got = earned.has(t.id);
    return `<li class="trow${got ? ' earned' : ''}" data-id="${t.id}" tabindex="0" role="button" aria-label="${escapeHtml(displayName(t))}">
      <div class="medal ${t.grade}" aria-hidden="true">${gradeLetter(t.grade)}</div>
      <div>
        <div class="tname">${escapeHtml(displayName(t))}</div>
        <div class="tdesc">${escapeHtml(displayDesc(t))}</div>
        <div class="tguide"><b>Guide:</b> ${escapeHtml(t.guide)}</div>
        <div class="tmeta">
          <span class="badge stage">Stage ${t.stage} · #${t.id}/55</span>
          <span class="badge kind">${KIND_LABELS[t.kind] || t.kind}</span>
          ${t.missable ? '<span class="badge miss">MISSABLE</span>' : ''}
          ${t.hidden ? '<span class="badge hidden">HIDDEN</span>' : ''}
          ${t.counter ? `<span class="badge">Target ${t.counter.toLocaleString()}</span>` : ''}
          <span class="badge src">Sources: ${escapeHtml(sourceTags(t))}</span>
          <span class="badge">${escapeHtml(t.chapter)}</span>
        </div>
      </div>
      <div class="tcheck"><input type="checkbox" ${got ? 'checked' : ''} data-check="${t.id}" aria-label="Mark earned"><span class="pos">${t.grade} · ${t.difficulty}/5 ★ · ~${t.time}h</span></div>
    </li>`;
  }).join('');
}

function renderRoadmap() {
  document.getElementById('roadmapWrap').innerHTML = STAGES.map((s) => {
    const items = trophies.filter((t) => t.stage === s.n).sort((a, b) => a.id - b.id);
    const done = items.filter((t) => earned.has(t.id)).length;
    return `<div class="stage"><h3><span>Stage ${s.n}</span> — ${escapeHtml(s.title)}</h3>
      <div class="sprog">${done}/${items.length} earned · ${escapeHtml(s.note)}</div>
      <ul>${items.map((t) => `<li class="${earned.has(t.id) ? 'earned' : ''}">${earned.has(t.id) ? '✓ ' : '○ '}${escapeHtml(displayName(t))}${t.missable ? ' <span class="mk">MISSABLE</span>' : ''} <span style="color:var(--dim)">— ${escapeHtml(t.chapter)}</span></li>`).join('')}</ul></div>`;
  }).join('');
}
function renderMissables() {
  const list = trophies.filter((t) => t.missable).sort((a, b) => a.stage - b.stage || a.id - b.id);
  document.getElementById('missWrap').innerHTML = list.map((t) => {
    const got = earned.has(t.id);
    return `<div class="misscard"><h3>${got ? '✓ ' : '⚠ '}${escapeHtml(displayName(t))} <span class="badge miss">MISSABLE</span></h3>
      <p>${escapeHtml(t.description)}</p>
      <p class="por"><b>Point of return:</b> ${escapeHtml(t.chapter)} — finish it before the chapter closes; if you already passed it, replay the chapter or mission if the game offers it.</p>
      <p><b>Guide:</b> ${escapeHtml(t.guide)}</p></div>`;
  }).join('');
}

function openDetail(id) {
  const t = trophyById(id);
  if (!t) return;
  const pane = document.getElementById('detailPane');
  const got = earned.has(t.id);
  const count = t.counter ? (counters[t.id] || 0) : null;
  const ordered = [...trophies].sort((a, b) => a.stage - b.stage || a.id - b.id);
  const idx = ordered.findIndex((x) => x.id === t.id);
  const prev = ordered[(idx - 1 + ordered.length) % ordered.length];
  const nxt = ordered[(idx + 1) % ordered.length];
  pane.innerHTML = `
    <button class="close" id="detailClose" type="button">✕ Close</button>
    <div class="tmeta"><span class="badge stage">Stage ${t.stage} · #${t.id}/55</span>
    <span class="badge kind">${KIND_LABELS[t.kind] || t.kind}</span>
    ${t.missable ? '<span class="badge miss">MISSABLE</span>' : ''}
    ${t.hidden ? '<span class="badge hidden">HIDDEN</span>' : ''}
    <span class="badge">${t.grade.toUpperCase()}</span></div>
    <h2>${escapeHtml(displayName(t))}</h2>
    <p class="off">“${escapeHtml(displayDesc(t))}” — official description</p>
    <div class="gsum"><b>Guide summary:</b> ${escapeHtml(t.guide)}</div>
    <ol>${t.steps.map((s, i) => `<li>${escapeHtml(s)} <cite>[${i + 1}]</cite></li>`).join('')}</ol>
    <div class="srcline"><b>Sources:</b> ${t.sources.map((s) => `<a href="${escapeHtml(s.u)}" target="_blank" rel="noopener">${escapeHtml(s.n)}</a> (retrieved ${escapeHtml(s.d)})`).join(' · ')}</div>
    ${t.missable ? `<div class="warnbox"><b>⚠ MISSABLE</b> — one-time story content. Point of return: <b>${escapeHtml(t.chapter)}</b>. Finish it before the chapter closes; if you already passed it, replay the chapter or mission if the game offers it.</div>` : ''}
    ${t.unconfirmed ? `<div class="npbox"><b>NOT PINNED DOWN YET</b> — the exact trigger for this trophy is not pinned down by the official description or any cited source. What is written here is our best reading, stated honestly; do not take it as confirmed.</div>` : ''}
    ${t.counter ? `<div class="counter"><button id="cntMinus" type="button">−</button><span>Progress: <strong id="cntVal">${count} / ${t.counter.toLocaleString()}</strong></span><button id="cntPlus" type="button">+</button></div>` : ''}
    <p class="dest">Difficulty ${t.difficulty}/5 (estimate) · Time ~${t.time}h (estimate) · ${escapeHtml(t.chapter)}</p>
    <button id="detailEarned" type="button">${got ? '✓ Earned — unmark' : 'Mark earned'}</button>
    <div class="nav"><button id="detailPrev" type="button">← ${escapeHtml(displayName(prev))}</button><button id="detailNext" type="button">${escapeHtml(displayName(nxt))} →</button></div>`;
  pane.hidden = false;
  document.getElementById('detailClose').onclick = () => { pane.hidden = true; };
  document.getElementById('detailEarned').onclick = () => { toggleEarned(t.id); openDetail(t.id); };
  document.getElementById('detailPrev').onclick = () => openDetail(prev.id);
  document.getElementById('detailNext').onclick = () => openDetail(nxt.id);
  const minus = document.getElementById('cntMinus');
  const plus = document.getElementById('cntPlus');
  if (minus) minus.onclick = () => { counters[t.id] = Math.max(0, (counters[t.id] || 0) - 1); saveState(); openDetail(t.id); };
  if (plus) plus.onclick = () => { counters[t.id] = Math.min(t.counter, (counters[t.id] || 0) + 1); saveState(); openDetail(t.id); };
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id); else earned.add(id);
  saveState(); renderAll();
}
function renderAll() { renderHeader(); renderList(); renderRoadmap(); renderMissables(); }
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function switchView(view) {
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach((v) => { v.hidden = v.id !== `view-${view}`; });
  document.getElementById('filters').style.display = view === 'checklist' ? '' : 'none';
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...earned], counters, exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-dossier-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.earned)) throw new Error('bad file');
      earned = new Set(data.earned.filter((id) => trophyById(id)));
      counters = data.counters || {};
      saveState(); renderAll();
    } catch { alert('That file is not a Leonida Dossier progress export.'); }
  };
  reader.readAsText(file);
}

async function initApp() {
  const res = await fetch(DATA_URL);
  const data = await res.json();
  trophies = data.trophies || data;
  loadState();
  if (params.get('seed') === '1') seedDemo();
  document.getElementById('spoilerToggle').checked = spoilerOn;
  const kindSel = document.getElementById('kindFilter');
  kindSel.innerHTML = '<option value="">All kinds</option>' + Object.entries(KIND_LABELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  if (params.get('kind')) kindSel.value = params.get('kind');
  if (params.get('view')) switchView(params.get('view'));
  document.getElementById('spoilerToggle').addEventListener('change', (e) => { spoilerOn = e.target.checked; saveState(); renderAll(); });
  document.getElementById('searchBox').addEventListener('input', renderList);
  ['kindFilter', 'gradeFilter', 'statusFilter', 'sortSel'].forEach((id) => document.getElementById(id).addEventListener('change', renderList));
  document.querySelectorAll('#tabs button').forEach((b) => b.addEventListener('click', () => switchView(b.dataset.view)));
  document.getElementById('trophyList').addEventListener('click', (e) => {
    const check = e.target.closest('[data-check]');
    if (check) { toggleEarned(Number(check.dataset.check)); return; }
    const row = e.target.closest('.trow');
    if (row) openDetail(Number(row.dataset.id));
  });
  document.getElementById('trophyList').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const row = e.target.closest('.trow'); if (row) openDetail(Number(row.dataset.id)); }
  });
  document.getElementById('btnExport').addEventListener('click', exportProgress);
  document.getElementById('btnImport').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); });
  document.getElementById('btnReset').addEventListener('click', () => { if (confirm('Reset all progress?')) { earned = new Set(); counters = {}; saveState(); renderAll(); } });
  renderAll();
  const openId = Number(params.get('open'));
  if (openId) openDetail(openId);
  window.__shotReady = true;
}

initApp().catch((err) => { document.getElementById('auditStrip').textContent = 'Failed to load trophy data: ' + err.message; });
