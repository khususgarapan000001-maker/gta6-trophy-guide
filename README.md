# Leonida Case File — GTA VI Trophy Guide & Tracker

A case-file guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5: every trophy with its official name, description and grade, a cited guide in our own words, a roadmap to platinum, every missable trophy flagged, and a checklist whose progress is saved in the browser and can be exported and imported back. Works fully offline.

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/khususgarapan000001-maker/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/khususgarapan000001-maker/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

## What it does

- **55 trophies, official data** — names, descriptions and grades exactly as PlayStation publishes them (listed by Exophase and PSNProfiles), in `app/data/trophies.json`.
- **Cited guides** — each trophy has a guide in our own words plus a visible Sources list. Where the official description names no place or step, the guide says so honestly instead of inventing one.
- **Tracker** — checklist saved in localStorage, with export to JSON and import back; filters by kind (story, missable, collectibles, activities, online), grade, status and text search; sorting by official order, grade or name.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to platinum** — 4 stages built from the official descriptions, with per-stage progress.
- **Missables view** — all 18 missable trophies with warnings and play order.
- **Honest limits** — there are no online trophies in the official list; the online filter says so instead of inventing any.
- **Offline** — static files under `app/`, no network requests at runtime, system fonts only, all visuals drawn with CSS and SVG. No Rockstar logo, artwork or game screenshots.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

`?seed=1` in the URL seeds 13 earned trophies for demo screenshots.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
