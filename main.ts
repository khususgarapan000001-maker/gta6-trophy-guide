// Leonida Dossier v4 — hand-in program (Node 22, standard library only).
// The guide lives in app/ (static files, no build step) and its screenshots in
// screenshots/. This program copies both into the output directory and writes
// output/dossier.json with the vendored make.fun library, exactly as the kit
// requires. vendor/makefun-frontend.ts is the kit's copy, untouched.
// Run locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// The repository root is the directory holding this file.
const repoRoot = fileURLToPath(new URL(".", import.meta.url));
// The grader sets /output; local runs use MAKEFUN_OUTPUT_DIR.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Start from a clean output directory so stale files never leak into a hand-in.
mkdirSync(outputDir, { recursive: true });
for (const name of ["app", "screenshots", "dossier.json"]) {
  const p = join(outputDir, name);
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}

// Copy the guide and its screenshots verbatim.
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
if (existsSync(join(repoRoot, "screenshots"))) {
  cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });
}

// Build the dossier the judge reads: screenshots, first-load totals and source.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
console.log("Leonida Dossier v4 handed in to", outputDir);
