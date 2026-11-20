# Leonida Dossier — GTA 6 Trophy Guide & Tracker

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/khususgarapan000001-maker/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/khususgarapan000001-maker/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

The complete offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — every trophy with its official name, description and grade, a cited guide in our own words, a 7-stage roadmap to the platinum, missable flags, and a checklist whose progress is saved in the browser and can be exported and imported.

## What it does

- **Checklist tracker** — all 55 trophies with official names, descriptions and grades, a one-line guide excerpt on every row, progress saved in localStorage, export to JSON and import back.
- **Cited guides** — every trophy carries a 1–2 sentence guide summary plus numbered steps, each with named sources (PowerPyx, Exophase, PSNProfiles, GTABase) with links and retrieval dates. Where a trigger is not pinned down by any cited source, the guide says so honestly in a NOT PINNED DOWN YET box.
- **Roadmap to platinum** — 7 stages in order, each with its trophy list and per-stage progress.
- **Missables view** — all 18 missable trophies with warnings and their point of return by chapter.
- **Next up** — the next unearned trophy in roadmap order, plus the two after it.
- **Spoiler setting** — hides the names and descriptions of hidden story trophies until earned (28 hidden).
- **Self-audit strip** — 55/55 trophies · 55/55 guides · 55/55 cited · 28/28 hidden · 18 missable · 6 unconfirmed, counted from the data.
- **Fully offline** — static files under `app/`, system fonts only, zero network requests at runtime. `?seed=1` seeds demo progress for screenshots.

## Run it

```sh
node serve.ts   # opens http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Sources

Trophy names, descriptions and grades are PlayStation's official list as published by Exophase / PSNProfiles. Guides are written in our own words from the official descriptions plus the cited guides, retrieved 20 Nov 2026. Difficulty and time figures are estimates. An unofficial fan guide; not affiliated with or endorsed by Rockstar Games, Sony or PlayStation. No Rockstar logo, artwork or game screenshots are used.
