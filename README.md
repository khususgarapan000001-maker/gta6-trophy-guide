# Leonida Dossier — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/khususgarapan000001-maker/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/khususgarapan000001-maker/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

A dark case-file dossier for all 55 Grand Theft Auto VI PlayStation trophies: cited step-by-step guides, a saved checklist tracker, a 7-stage roadmap to platinum, a missables view with points of return, and a Next up panel.

## What it does

- **Tracker** — checklist of all 55 official trophies (names, descriptions and grades exactly as PlayStation publishes them), saved in localStorage, with text search, kind/grade/status filters, sorting, and a spoiler toggle that hides hidden story trophies until earned.
- **Cited guides** — every trophy has numbered steps in our own words, inline citations, and a named Sources list (Exophase official list, PowerPyx, GTABase) with links and retrieval date. Where a spot is not pinned down, the guide says so honestly in a "NOT PINNED DOWN YET" box.
- **Roadmap** — 7 stages from Chapter 1 to 100% completion and the platinum, each with its trophy list and progress.
- **Missables** — all 12 missable trophies with warnings and their point of return.
- **Counters** — interactive steppers on count trophies (100 vehicles, 100 WAiNK, 18 meditations, 3 card sets, 250 stunts, 50 challenges, and more).
- **Export / Import** — download progress as JSON and load it back.
- **Self-audit strip** — 55/55 trophies · 55/55 guides · 55/55 cited · 28/28 hidden · 12 missable · 9 unconfirmed · 0 online trophies in the official list.
- **Offline** — no network requests at runtime; system fonts only. `?seed=1` seeds ~17 earned trophies for demo/screenshot purposes.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
