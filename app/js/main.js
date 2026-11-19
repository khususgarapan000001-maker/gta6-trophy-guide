// main.js — wires the Leonida Case File app together.
// Loads trophies.json, keeps earned progress in localStorage, applies the
// filters and the spoiler setting, and switches between the checklist,
// roadmap and missables views. URL parameters: ?seed=1 seeds 13 earned
// trophies for demo screenshots, ?view=roadmap|missables picks a view,
// ?open=<id> opens a trophy's guide, ?kind=missable pre-sets the filter,
// ?spoiler=1 turns the spoiler setting on.
import { loadTrophies, GRADES } from './data.js';
import { seedIfRequested, saveEarned, exportProgress, parseImportedFile } from './store.js';
import { renderList, renderDetail, renderRoadmap, renderMissables, renderProgress } from './views.js';

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const detailEl = $('detailPane');
const roadmapEl = $('roadmapView');
const missablesEl = $('missablesView');

let trophies = [];
let earned = new Set();
let selectedId = null;
let view = 'checklist';

function spoilerOn() { return $('spoilerToggle').checked; }

function applyFilters() {
  const q = $('searchInput').value.trim().toLowerCase();
  const kind = $('kindFilter').value;
  const grade = $('gradeFilter').value;
  const status = $('statusFilter').value;
  const sort = $('sortSelect').value;
  let list = trophies.filter((t) => {
    if (kind === 'online') return false; // No online trophies in the official list.
    if (kind === 'missable' && !t.missable) return false;
    if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (status === 'earned' && !earned.has(t.id)) return false;
    if (status === 'todo' && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
  if (sort === 'grade') {
    list = [...list].sort((a, b) => GRADES.indexOf(a.grade) - GRADES.indexOf(b.grade) || a.name.localeCompare(b.name));
  } else if (sort === 'name') {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  }
  return list;
}

function renderAll() {
  renderProgress($('ringFill'), $('ringCount'), $('ringPct'), $('gradeBars'), trophies, earned);
  $('missableCount').textContent = trophies.filter((t) => t.missable).length;
  $('onlineNote').hidden = $('kindFilter').value !== 'online';
  const filtered = applyFilters();
  if (view === 'checklist') {
    listEl.hidden = false; roadmapEl.hidden = true; missablesEl.hidden = true;
    renderList(listEl, filtered, earned, spoilerOn(), selectedId);
    $('listCount').textContent = `${filtered.length} of ${trophies.length} trophies shown`;
    $('listHint').textContent = filtered.length === 0 ? '— no trophies match these filters.' : '— click a trophy to open its guide.';
    if (filtered.length === 0) listEl.innerHTML = '<p class="empty-note">No trophies match these filters. Try clearing the search or choosing another kind.</p>';
  } else if (view === 'roadmap') {
    listEl.hidden = true; roadmapEl.hidden = false; missablesEl.hidden = true;
    renderRoadmap(roadmapEl, trophies, earned);
    $('listCount').textContent = 'Roadmap to platinum — 4 stages';
    $('listHint').textContent = '— work the stages in order.';
  } else {
    listEl.hidden = true; roadmapEl.hidden = true; missablesEl.hidden = false;
    renderMissables(missablesEl, trophies, earned);
    $('listCount').textContent = `${trophies.filter((t) => t.missable).length} missable trophies`;
    $('listHint').textContent = '— earn each one while its mission is running.';
  }
  const selected = trophies.find((t) => t.id === selectedId) || null;
  renderDetail(detailEl, selected, earned, spoilerOn());
  document.querySelectorAll('.tab').forEach((tab) => {
    const active = tab.dataset.view === view;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id); else earned.add(id);
  saveEarned(earned);
  renderAll();
}

function setView(next) {
  view = next;
  renderAll();
}

function initFromUrl() {
  const params = new URLSearchParams(location.search);
  const wantedView = params.get('view');
  if (wantedView === 'roadmap' || wantedView === 'missables') view = wantedView;
  const kind = params.get('kind');
  if (kind) $('kindFilter').value = kind;
  if (params.get('spoiler') === '1') $('spoilerToggle').checked = true;
  const open = Number(params.get('open'));
  if (Number.isInteger(open) && trophies.some((t) => t.id === open)) selectedId = open;
}

async function init() {
  trophies = await loadTrophies();
  earned = seedIfRequested();
  initFromUrl();

  $('searchInput').addEventListener('input', renderAll);
  for (const id of ['kindFilter', 'gradeFilter', 'statusFilter', 'sortSelect']) {
    $(id).addEventListener('change', renderAll);
  }
  $('spoilerToggle').addEventListener('change', renderAll);
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));

  listEl.addEventListener('click', (event) => {
    const check = event.target.closest('[data-earned]');
    if (check) { event.stopPropagation(); toggleEarned(Number(check.dataset.earned)); return; }
    const card = event.target.closest('[data-id]');
    if (card) { selectedId = Number(card.dataset.id); renderAll(); }
  });
  listEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('[data-id]');
    if (card) { event.preventDefault(); selectedId = Number(card.dataset.id); renderAll(); }
  });
  missablesEl.addEventListener('click', (event) => {
    const check = event.target.closest('[data-earned]');
    if (check) { event.stopPropagation(); toggleEarned(Number(check.dataset.earned)); return; }
    const card = event.target.closest('[data-id]');
    if (card) { selectedId = Number(card.dataset.id); view = 'checklist'; renderAll(); }
  });
  detailEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-mark]');
    if (btn) toggleEarned(Number(btn.dataset.mark));
  });

  $('exportBtn').addEventListener('click', () => exportProgress(earned));
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = parseImportedFile(await file.text());
      earned = new Set([...imported].filter((id) => trophies.some((t) => t.id === id)));
      saveEarned(earned);
      renderAll();
      alert(`Imported progress: ${earned.size} trophies earned.`);
    } catch (err) {
      alert('Could not import that file: ' + err.message);
    }
    event.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all earned progress?')) return;
    earned = new Set();
    saveEarned(earned);
    renderAll();
  });

  renderAll();
  window.__shotReady = true;
}

init().catch((err) => {
  listEl.innerHTML = '<p class="empty-note">Could not load the trophy list: ' + err.message + '</p>';
  window.__shotReady = true;
});
