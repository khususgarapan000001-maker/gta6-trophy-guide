# Leonida Dossier — GTA VI Trophy Guide & Tracker

![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/khususgarapan000001-maker/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/khususgarapan000001-maker/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

The complete offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — every trophy with its official name, description and grade, a cited guide in our own words, a 7-stage roadmap to the platinum, every missable trophy flagged, and a checklist that saves in your browser.

## What it does

- **Checklist tracker** — tick trophies as you earn them; progress saves in localStorage, exports to a JSON file and imports back. Filters by kind (story, missable, collectibles, activities, online, strands, crime, side, feats), grade, status and text search.
- **Cited guides** — every trophy has a 1–2 sentence guide summary plus numbered steps, each citing its sources by name, link and retrieval date (PowerPyx, OutputLag, Exophase, GTABase). Where a fact is not pinned down by any cited source, the guide says so honestly in a “NOT PINNED DOWN YET” box instead of inventing a location.
- **7-stage roadmap** to the platinum, with per-stage trophy lists and progress.
- **Missables view** — all 22 missable trophies in chapter order, each with its point of return.
- **Next up** — the next unearned trophy in roadmap order, plus the two after it.
- **Spoiler setting** — hides the names and descriptions of hidden story trophies until earned.
- **Self-audit strip** — live counts: 55/55 trophies · 55/55 guides · 55/55 cited · 28/28 hidden · 22 missable · 10 unconfirmed.
- **Counters** — interactive steppers on count trophies (250 stunts, 100 vehicles, 100 WAiNK, 18 meditations, 3 card sets, 50 challenges, and more).
- **Fully offline** — static files under `app/`, system fonts only, zero network requests. `?seed=1` seeds ~17 earned trophies for a demo.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Sources

Official trophy names, descriptions and grades as PlayStation publishes them (via Exophase / PSNProfiles, retrieved 2026-11-20). Guides are original writing; difficulty and time figures are estimates. No Rockstar logo, artwork or game screenshots — all visuals are drawn with CSS/SVG in this repo.

## License

MIT — see [LICENSE](LICENSE).
