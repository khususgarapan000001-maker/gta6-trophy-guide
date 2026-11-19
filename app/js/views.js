// views.js — renders the checklist cards, the detail pane, the roadmap and
// the missables view, plus the platinum ring and the per-grade bars.
// All visuals are inline SVG drawn here; no images are loaded.
import { GRADES, ROADMAP_STAGES, missableTrophies } from './data.js';

const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

export function medalSvg(grade, size = 44) {
  const letter = GRADE_LETTER[grade] || '?';
  return `<svg class="medal" width="${size}" height="${size}" viewBox="0 0 44 44" aria-hidden="true">
    <circle class="m-${grade}" cx="22" cy="22" r="19"></circle>
    <circle cx="22" cy="22" r="14" fill="none" stroke="rgba(28,36,51,.35)" stroke-width="1"></circle>
    <text x="22" y="28" text-anchor="middle" font-size="16">${letter}</text>
  </svg>`;
}

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// A story trophy the player has not earned yet is hidden while the spoiler
// setting is on: its name and official description are replaced by "???".
export function displayName(trophy, spoilerOn, earned) {
  if (spoilerOn && trophy.kind === 'story' && !earned) return '???';
  return trophy.name;
}

export function displayDesc(trophy, spoilerOn, earned) {
  if (spoilerOn && trophy.kind === 'story' && !earned) return 'Story trophy — hidden until earned.';
  return trophy.description;
}

export function trophyCard(trophy, earned, spoilerOn, selected) {
  const name = displayName(trophy, spoilerOn, earned);
  const desc = displayDesc(trophy, spoilerOn, earned);
  const classes = ['trophy-card'];
  if (earned) classes.push('earned');
  if (trophy.missable) classes.push('missable-card');
  if (selected) classes.push('selected');
  const badges = [
    `<span class="badge grade-${trophy.grade}">${GRADE_LABEL[trophy.grade]}</span>`,
    `<span class="badge">${KIND_LABEL[trophy.kind] || trophy.kind}</span>`,
  ];
  if (trophy.missable) badges.push('<span class="badge missable">Missable</span>');
  return `<article class="${classes.join(' ')}" data-id="${trophy.id}" tabindex="0" role="button" aria-pressed="${earned}">
    ${medalSvg(trophy.grade)}
    <div class="card-body">
      <h3>${esc(name)}</h3>
      <p class="official-desc">${esc(desc)}</p>
      <div class="badges">${badges.join('')}</div>
    </div>
    <label class="earned-check"><input type="checkbox" data-earned="${trophy.id}" ${earned ? 'checked' : ''} aria-label="Mark ${esc(name)} earned"> Earned</label>
  </article>`;
}

export function renderList(container, trophies, earned, spoilerOn, selectedId) {
  container.innerHTML = trophies.map((t) =>
    trophyCard(t, earned.has(t.id), spoilerOn, t.id === selectedId)).join('');
}

export function renderDetail(pane, trophy, earned, spoilerOn) {
  if (!trophy) {
    pane.innerHTML = '<p class="detail-empty">Select a trophy from the list to open its full guide, steps and sources here.</p>';
    return;
  }
  const isEarned = earned.has(trophy.id);
  const name = displayName(trophy, spoilerOn, isEarned);
  const desc = displayDesc(trophy, spoilerOn, isEarned);
  const hiddenNote = spoilerOn && trophy.kind === 'story' && !isEarned
    ? '<p class="spoiler-hidden">The guide is hidden with the spoiler setting — mark this trophy earned to reveal it.</p>'
    : '';
  const guide = spoilerOn && trophy.kind === 'story' && !isEarned ? '' : `
    <h3>Guide</h3>
    <p class="guide-text">${esc(trophy.guide)}</p>
    <h3>Sources</h3>
    <div class="sources-box">
      <p>Sources — where each fact comes from</p>
      <ul>${trophy.sources.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    </div>
    <h3>Steps</h3>
    <ol class="steps">${trophy.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`;
  pane.innerHTML = `<div class="detail-pane">
    <div class="badges">
      <span class="badge grade-${trophy.grade}">${GRADE_LABEL[trophy.grade]}</span>
      <span class="badge">${KIND_LABEL[trophy.kind] || trophy.kind}</span>
      ${trophy.missable ? '<span class="badge missable">Missable</span>' : ''}
    </div>
    <h2>${esc(name)}</h2>
    <p class="official-desc">Official description: “${esc(desc)}”</p>
    ${trophy.missable ? '<p class="missable-warning"><strong>⚠ Missable.</strong> Earn this while its mission or chapter is running — once the story moves past it, only a chapter or mission replay (if the game offers one) can bring it back.</p>' : ''}
    ${hiddenNote}
    ${guide}
    <button class="mark-earned ${isEarned ? 'earned' : ''}" data-mark="${trophy.id}" type="button">${isEarned ? '✓ Earned — click to unmark' : 'Mark earned'}</button>
  </div>`;
}

export function renderRoadmap(container, trophies, earned) {
  container.innerHTML = ROADMAP_STAGES.map((stage) => {
    const list = trophies.filter(stage.trophies);
    const done = list.filter((t) => earned.has(t.id)).length;
    const items = list.map((t) => {
      const isDone = earned.has(t.id);
      const flag = t.missable ? ' <span class="mini-badge">MISSABLE</span>' : '';
      return `<li class="${isDone ? 'done' : ''}">${isDone ? '✓ ' : ''}${esc(t.name)} (${GRADE_LABEL[t.grade]})${flag}</li>`;
    }).join('');
    return `<section class="stage">
      <h2><span class="stage-num">Stage ${stage.n} —</span> ${esc(stage.title)}</h2>
      <p class="stage-desc">${esc(stage.desc)}</p>
      <p class="stage-progress">${done} of ${list.length} earned in this stage</p>
      <ul>${items}</ul>
    </section>`;
  }).join('');
}

export function renderMissables(container, trophies, earned) {
  const list = missableTrophies(trophies);
  const done = list.filter((t) => earned.has(t.id)).length;
  const cards = list.map((t) => trophyCard(t, earned.has(t.id), false, false)).join('');
  container.innerHTML = `<div class="missable-intro">
    <p><strong>${list.length} missable trophies — ${done} earned.</strong> Each one belongs to a single story chapter, mission or choice. Earn it while that mission is running; once the story moves past it, only a chapter or mission replay (if the game offers one) can bring it back.</p>
    <p>Order of play: Chapters 1–4 and the final mission first, then the named missions (Breakfast Run, The Cartel Heist, Child's Play, Headliners, VCIA Takedown, Operation Savage Glory), then the character finals (Andy, Kenton, Billy, Randy, Tyrone), and the story choices when they are offered.</p>
  </div>${cards}`;
}

export function renderProgress(ringFill, ringCount, ringPct, gradeBarsEl, trophies, earned) {
  const total = trophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const circumference = 326.7;
  ringFill.style.strokeDashoffset = String(circumference * (1 - done / total));
  ringCount.textContent = `${done}/${total}`;
  ringPct.textContent = `${pct}%`;
  gradeBarsEl.innerHTML = GRADES.map((g) => {
    const inGrade = trophies.filter((t) => t.grade === g);
    const got = inGrade.filter((t) => earned.has(t.id)).length;
    const barPct = inGrade.length ? Math.round((got / inGrade.length) * 100) : 0;
    return `<div class="grade-bar ${g}"><span>${GRADE_LABEL[g]}</span><span class="bar"><i style="width:${barPct}%"></i></span><b>${got}/${inGrade.length}</b></div>`;
  }).join('');
}
