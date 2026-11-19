# Leonida Dossier — GTA 6 Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/khususgarapan000001-maker/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/khususgarapan000001-maker/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

The complete offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — a dark case-file dossier with a cited guide for every trophy, a 7-stage roadmap to the platinum, missable flags, a saved checklist with export/import, filters, a spoiler setting, counters and a self-audit strip.

## What it does

- **Checklist** — every trophy with its official name, description and grade, a one-line guide excerpt, source tags, stage and chapter labels, and an earned checkbox saved in localStorage.
- **Cited guides** — each trophy's detail pane opens with a guide summary, numbered steps in our own words, and named sources with links and retrieval dates (Exophase official list, PowerPyx, PSNProfiles, GTABase).
- **Roadmap** — 7 stages from Chapter 1 to 100% completion and the platinum, each with its trophy list and progress.
- **Missables** — all 18 missable trophies with warnings and points of return, in chapter order.
- **Next up** — the next unearned trophy in roadmap order, plus the two after it.
- **Tracker** — platinum progress ring, per-grade bars, self-audit strip (55/55 trophies · 55/55 guides · 55/55 cited · 28/28 hidden), export/import of progress as JSON, spoiler toggle that hides hidden story trophies until earned, and interactive counters on count trophies.
- **Offline** — static files under `app/` only; no network requests at runtime. Run with `node serve.ts` and open http://localhost:8080. `?seed=1` seeds ~17 earned trophies for demo screenshots.

## Layout

- `app/index.html` — the dossier page
- `app/css/style.css` — the dark case-file theme
- `app/js/main.js` — tracker, filters, views, detail pane, export/import
- `app/data/trophies.json` — the 55 official trophies with guides, steps, sources, stages and counters
- `main.ts` — hands the entry in (copies `app/` + `screenshots/` to `/output`, writes `dossier.json`)
- `screenshots/` — 4 renders of the app in desktop Chrome
