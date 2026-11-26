// DataNusa hand-in (Node 22, standard library only).
//
// The site is plain static files in app/ and its screenshots in screenshots/.
// This program copies both into the hand-in directory and writes
// dossier.json there with the vendored make.fun library, so the scorer can
// check the entry byte for byte. The hand-in directory itself is never
// removed: only its previous contents are cleared, so a second run writes
// exactly the same bytes as the first.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The caps the scorer applies to this bounty (see the kit's RULES.txt):
// at most 4 screenshots of 256 KiB each, app/ at most 993 files and
// directories and 16 MiB, and a dossier text of at most 160 KiB.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function clearContents(dir: string): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

mkdirSync(outDir, { recursive: true });
clearContents(outDir);

cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, DOSSIER_CAPS));
console.log(`DataNusa handed in to ${outDir}`);
