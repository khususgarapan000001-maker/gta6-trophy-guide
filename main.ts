// Leonida Case File — gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide itself is plain static files under app/: app/index.html opens in a
// browser, loads its own CSS and ES modules, reads app/data/trophies.json and
// works with the network off. This program hands the entry in: it copies app/
// and screenshots/ from beside this file into /output (or $MAKEFUN_OUTPUT_DIR
// outside the grader) and writes /output/dossier.json with the vendored
// make.fun library, so the judge can read the screenshots and the source.
// vendor/makefun-frontend.ts is the kit's copy and must stay unchanged.
//
// Test it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Fail loudly instead of handing in a half-built entry: the guide's front
// page and at least one screenshot must be in the output before the dossier
// is written.
if (!existsSync(join(outputDir, 'app', 'index.html'))) {
  throw new Error('main.ts: app/index.html did not reach ' + outputDir);
}
if (!existsSync(join(outputDir, 'screenshots', '1-guide.jpg'))) {
  throw new Error('main.ts: screenshots/1-guide.jpg did not reach ' + outputDir);
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in app/
// or 48 MiB of app files: app/ counts beside /output's own 1000-entry cap,
// its screenshots/ and dossier.json).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
