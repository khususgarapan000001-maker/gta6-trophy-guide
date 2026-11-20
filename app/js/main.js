/* Leonida Dossier — tracker logic. All data comes from data/trophies.json; nothing is fetched from the network. */
const STAGES = [
  { n: 1, title: "Stage 1 — Story first: Chapter 1", text: "Play Chapter 1 and grab its missables on the way through." },
  { n: 2, title: "Stage 2 — Chapters 2–3 + character strands", text: "Chapters 2–3, plus Andy's and Kenton's strands as they open." },
  { n: 3, title: "Stage 3 — Chapter 4 + the finale", text: "Chapter 4, the last big missions, and the final mission. Clear every remaining missable before the finale." },
  { n: 4, title: "Stage 4 — Stranger strands & side moments", text: "Billy, Randy and Tyrone strands, stranger strands, and the one-off side trophies." },
  { n: 5, title: "Stage 5 — Collectibles & exploration", text: "Meditation spots, WAiNK locations, cards, vehicles, areas and garages." },
  { n: 6, title: "Stage 6 — Grind & activities", text: "Stunts, challenges, shooting range, races, robberies and the money trophies." },
  { n: 7, title: "Stage 7 — Cleanup: 100% → gold → platinum", text: "Finish A Long Road (100% completion), then the platinum pops." },
];
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const SEED_EARNED = [2, 3, 4, 8, 10, 16, 21, 22, 23, 28, 35, 42, 44, 46, 51, 53, 55];
const params = new URLSearchParams(location.search);
const seedMode = params.get("seed") === "1";

let trophies = [];
let earned = new Set();
let counters = {};
let spoiler = true;
let currentDetail = null;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function loadState() {
  try {
    const raw = localStorage.getItem("leonida-dossier-v4");
    if (raw) { const d = JSON.parse(raw); earned = new Set(d.earned || []); counters = d.counters || {}; }
  } catch { /* fresh state */ }
  if (seedMode && earned.size === 0) {
    // Demo seeding for screenshots only: ~17 earned trophies plus a few counters.
    earned = new Set(SEED_EARNED);
    counters = { 15: 120, 28: 9, 31: 47, 35: 63, 42: 30 };
  }
}
function saveState() {
  try { localStorage.setItem("leonida-dossier-v4", JSON.stringify({ earned: [...earned], counters })); } catch { /* storage unavailable */ }
}
function displayName(t) {
  if (spoiler && t.hidden && !earned.has(t.id) && t.kind === "story") return "Hidden story trophy";
  return t.name;
}
function displayDesc(t) {
  if (spoiler && t.hidden && !earned.has(t.id) && t.kind === "story") return "Hidden story trophy — earn to reveal.";
  return t.description;
}
function srcTag(t) {
  const names = (t.sources || []).map((s) => s.name.split(" — ")[0].replace(" — GTA VI trophy list", "").replace(" — GTA 6 trophies", "").replace(" — GTA 6 trophy guide", ""));
  const short = [...new Set(names)].map((n) => n === "Exophase" ? "EXO" : n === "PowerPyx" ? "PPX" : n === "OutputLag" ? "OL" : n === "GTABase" ? "GB" : n === "PSNProfiles" ? "PSN" : n);
  return short.join(" · ");
}
function gradeCounts() {
  const c = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) { c[t.grade][1]++; if (earned.has(t.id)) c[t.grade][0]++; }
  return c;
}
function renderHeader() {
  const n = earned.size, total = trophies.length;
  $("#ringCount").textContent = `${n}/${total}`;
  $("#ringPct").textContent = `${Math.round((n / total) * 100)}%`;
  $("#ringFg").style.strokeDashoffset = String(326.7 * (1 - n / total));
  const gc = gradeCounts();
  $("#gradeBars").innerHTML = ["platinum", "gold", "silver", "bronze"].map((g) => {
    const [e, t] = gc[g];
    return `<div class="gbar"><b>${g[0].toUpperCase() + g.slice(1)}</b><div class="track"><div class="fill ${g}" style="width:${t ? (e / t) * 100 : 0}%"></div></div><span>${e}/${t}</span></div>`;
  }).join("");
  const guides = trophies.filter((t) => t.guide && t.guide.trim()).length;
  const cited = trophies.filter((t) => t.sources && t.sources.length).length;
  const miss = trophies.filter((t) => t.missable).length;
  const unc = trophies.filter((t) => t.unconfirmed).length;
  $("#auditStrip").textContent = `${total}/${total} trophies · ${guides}/${total} guides · ${cited}/${total} cited · ${trophies.filter((t) => t.hidden).length}/28 hidden · ${miss} missable · ${unc} unconfirmed`;
  renderNextUp();
}
function nextUnearned() {
  const sorted = [...trophies].sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  return sorted.filter((t) => !earned.has(t.id));
}
function renderNextUp() {
  const [first, second, third] = nextUnearned();
  if (!first) { $("#nextUpBody").innerHTML = "<div class='nu-name'>Platinum earned!</div>"; return; }
  $("#nextUpBody").innerHTML = `<div class="nu-name">${esc(displayName(first))}</div>
    <div class="nu-meta">Stage ${first.stage} · ${esc(first.chapter)} · ${first.grade}</div>
    <div class="nu-guide">${esc(first.guide)}</div>
    <div class="nu-next">Then: ${second ? esc(displayName(second)) : "—"}${third ? ` · ${esc(displayName(third))}` : ""}</div>`;
}
function filtered() {
  const q = ($("#searchBox").value || "").toLowerCase();
  const kind = $("#kindFilter").value, grade = $("#gradeFilter").value, status = $("#statusFilter").value;
  let list = trophies.filter((t) => {
    if (kind === "missable" && !t.missable) return false;
    if (kind === "online") return false; // No online trophies exist in the official list.
    if (kind && kind !== "missable" && t.kind !== kind) return false;
    if (grade && t.grade !== grade) return false;
    if (status === "earned" && !earned.has(t.id)) return false;
    if (status === "unearned" && earned.has(t.id)) return false;
    if (q && !(t.name + " " + t.description + " " + t.guide + " " + t.chapter).toLowerCase().includes(q)) return false;
    return true;
  });
  const sort = $("#sortSelect").value;
  if (sort === "grade") list.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  else list.sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  return list;
}
function cardHtml(t) {
  const isEarned = earned.has(t.id);
  const medal = t.grade === "platinum" ? "◆" : t.grade === "gold" ? "★" : t.grade === "silver" ? "●" : "○";
  return `<button type="button" class="card${isEarned ? " earned" : ""}" data-id="${t.id}">
    <span class="card-head"><span class="medal ${t.grade}">${medal}</span>
    <span><h3>${esc(displayName(t))}</h3><span class="desc">${esc(displayDesc(t))}</span>
    <span class="guide-excerpt"><b>Guide:</b> ${esc(t.guide)}</span>
    <span class="badges"><span class="badge">${t.grade}</span><span class="badge">${t.kind}</span>
    ${t.missable ? '<span class="badge miss">MISSABLE</span>' : ""}
    ${t.hidden ? '<span class="badge">hidden</span>' : ""}
    <span class="badge src">Sources: ${esc(srcTag(t))}</span>
    <span class="badge stage">Stage ${t.stage} · #${t.id}/55 · ${esc(t.chapter)}</span></span></span>
    <span class="check ${isEarned ? "" : "off"}" data-check="${t.id}">${isEarned ? "✓" : "○"}</span></span>
  </button>`;
}
function renderChecklist() {
  const list = filtered();
  $("#checklist").innerHTML = list.length ? list.map(cardHtml).join("") : '<p class="empty">No trophies match these filters. (Note: the official list has no online trophies.)</p>';
}
function renderRoadmap() {
  $("#roadmap").innerHTML = STAGES.map((s) => {
    const ts = trophies.filter((t) => t.stage === s.n);
    const done = ts.filter((t) => earned.has(t.id)).length;
    return `<div class="stage-block"><h3>${esc(s.title)} <span class="st-count">${done}/${ts.length} earned</span></h3>
      <p>${esc(s.text)}</p><ul>${ts.map((t) => `<li class="${earned.has(t.id) ? "done" : ""}">${earned.has(t.id) ? "✓ " : ""}${esc(displayName(t))}${t.missable ? " ⚠ missable" : ""}</li>`).join("")}</ul></div>`;
  }).join("");
}
function renderMissables() {
  const list = trophies.filter((t) => t.missable).sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  $("#missables").innerHTML = `<div class="miss-list">${list.map((t) => `<div class="miss-card"><h3>${esc(displayName(t))}</h3>
    <div class="por">Point of return: ${esc(t.chapter)} — before the chapter closes</div>
    <p>${esc(t.guide)}</p></div>`).join("")}</div>`;
}
function renderNextView() {
  const [first, second, third] = nextUnearned();
  const items = [first, second, third].filter(Boolean);
  $("#nextView").innerHTML = items.length ? items.map((t, i) => `<div class="stage-block"><h3>${i === 0 ? "Do this first" : "Then"} — ${esc(displayName(t))}</h3>
    <p>Stage ${t.stage} · ${esc(t.chapter)} · ${t.grade}${t.missable ? " · MISSABLE" : ""}</p><p>${esc(t.guide)}</p></div>`).join("") : "<p class='empty'>Every trophy is earned — platinum complete.</p>";
}
function showDetail(id) {
  const t = trophies.find((x) => x.id === id);
  if (!t) return;
  currentDetail = id;
  const isEarned = earned.has(id);
  const srcs = (t.sources || []).map((s, i) => `[${i + 1}] ${esc(s.name)} — <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a> (retrieved ${esc(s.date)})`).join("<br>");
  const counter = t.counter ? `<div class="counterbox"><span>Progress:</span><button type="button" id="cntMinus">−</button><span class="count" id="cntVal">${counters[id] || 0} / ${t.counter.target} ${esc(t.counter.unit)}</span><button type="button" id="cntPlus">+</button></div>` : "";
  $("#detailBody").innerHTML = `
    <h2>${esc(displayName(t))}</h2>
    <p class="official">“${esc(displayDesc(t))}” — official description · ${t.grade} · Stage ${t.stage} · ${esc(t.chapter)}</p>
    <p class="summary"><b>Guide summary:</b> ${esc(t.guide)}</p>
    <ol>${t.steps.map((s) => `<li>${esc(s)} <cite>[${(t.sources || []).map((_, i) => i + 1).join("][")}]</cite></li>`).join("")}</ol>
    <p class="sources"><b>Sources:</b><br>${srcs}</p>
    ${t.missable ? `<p class="warnbox"><b>MISSABLE — point of return:</b> ${esc(t.chapter)}. Finish this before the chapter closes; after that, only a chapter/mission replay (if the game offers one) can recover it.</p>` : ""}
    ${t.unconfirmed ? `<p class="unconf"><b>NOT PINNED DOWN YET:</b> the exact spot or trigger for this one is not pinned down by any cited source yet — this guide says so honestly rather than inventing a location. Check the sources above for updates.</p>` : ""}
    ${counter}
    <p class="meta-line">Difficulty ${"★".repeat(t.difficulty)}${"☆".repeat(5 - t.difficulty)} (estimate) · ~${t.time}h (estimate) · ${t.hidden ? "Hidden on PlayStation until earned" : "Visible on PlayStation"}</p>
    <button type="button" id="markEarned">${isEarned ? "✓ Earned — click to unmark" : "Mark earned"}</button>`;
  $("#detailPane").hidden = false;
  document.body.classList.add("detail-open");
  if (window.innerWidth < 900) $("#detailPane").scrollIntoView({ behavior: "smooth", block: "start" });
  $("#markEarned").addEventListener("click", () => { toggleEarned(id); showDetail(id); });
  const minus = $("#cntMinus"), plus = $("#cntPlus");
  if (minus) minus.addEventListener("click", () => { counters[id] = Math.max(0, (counters[id] || 0) - 1); saveState(); showDetail(id); });
  if (plus) plus.addEventListener("click", () => { counters[id] = Math.min(t.counter.target, (counters[id] || 0) + 1); saveState(); showDetail(id); });
}
function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id); else earned.add(id);
  saveState(); renderHeader(); renderChecklist(); renderRoadmap(); renderMissables(); renderNextView();
}
function setView(v) {
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.view === v));
  document.querySelectorAll(".view").forEach((s) => s.classList.toggle("active", s.id === "view-" + v));
}
function renderAll() { renderHeader(); renderChecklist(); renderRoadmap(); renderMissables(); renderNextView(); }
function init() {
  loadState();
  $("#spoilerToggle").checked = spoiler;
  document.querySelectorAll("#tabs button").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  ["searchBox", "kindFilter", "gradeFilter", "statusFilter", "sortSelect"].forEach((id) => $("#" + id).addEventListener("input", renderChecklist));
  $("#spoilerToggle").addEventListener("change", (e) => { spoiler = e.target.checked; renderAll(); });
  $("#exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ earned: [...earned], counters }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "leonida-dossier-progress.json"; a.click();
    URL.revokeObjectURL(a.href);
  });
  $("#importFile").addEventListener("change", (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const d = JSON.parse(r.result); earned = new Set((d.earned || []).filter((id) => trophies.some((t) => t.id === id))); counters = d.counters || {}; saveState(); renderAll(); } catch { alert("That file is not valid Leonida Dossier progress."); } };
    r.readAsText(f);
  });
  $("#resetBtn").addEventListener("click", () => { if (confirm("Reset all progress?")) { earned = new Set(); counters = {}; saveState(); renderAll(); } });
  $("#checklist").addEventListener("click", (e) => {
    const check = e.target.closest("[data-check]");
    if (check) { e.stopPropagation(); toggleEarned(Number(check.dataset.check)); return; }
    const card = e.target.closest(".card");
    if (card) showDetail(Number(card.dataset.id));
  });
  $("#detailClose").addEventListener("click", () => { $("#detailPane").hidden = true; document.body.classList.remove("detail-open"); currentDetail = null; });
  $("#prevBtn").addEventListener("click", () => { const i = trophies.findIndex((t) => t.id === currentDetail); showDetail(trophies[(i - 1 + trophies.length) % trophies.length].id); });
  $("#nextBtn").addEventListener("click", () => { const i = trophies.findIndex((t) => t.id === currentDetail); showDetail(trophies[(i + 1) % trophies.length].id); });
  fetch("data/trophies.json").then((r) => r.json()).then((d) => {
    trophies = d.trophies;
    renderAll();
    const view = params.get("view");
    if (view === "roadmap" || view === "missables" || view === "next") setView(view);
    const detail = Number(params.get("detail") || 0);
    if (detail) showDetail(detail);
    window.__shotReady = true;
  }).catch((err) => { document.body.innerHTML = "<p style='padding:20px'>Failed to load trophy data: " + esc(err.message) + "</p>"; });
}
init();
