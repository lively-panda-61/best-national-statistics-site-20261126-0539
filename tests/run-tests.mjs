// Tests for the DataNusa national statistics site (best-national-statistics-site-20261126-0539).
// Run: node tests/run-tests.mjs
// Stdlib only (node:test). The main.ts determinism + dossier tests skip
// gracefully when vendor/makefun-frontend.ts is not present yet (parent adds it).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync, readFileSync, readdirSync, statSync, mkdtempSync, rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, 'app');
const WALLET = 'oeRaeKYYYjLewHcQ1AvDsLbSs9hsfr3AgPGyzWNbCqK';

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile()) out.push(p);
  }
  return out;
}

function pngSize(buf) {
  assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'PNG magic');
  assert.equal(buf.toString('ascii', 12, 16), 'IHDR', 'PNG IHDR');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  assert.equal(buf[0], 0xff);
  assert.equal(buf[1], 0xd8);
  let off = 2;
  while (off < buf.length) {
    if (buf[off] !== 0xff) throw new Error('bad JPEG marker');
    const marker = buf[off + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
    }
    off += 2 + buf.readUInt16BE(off + 2);
  }
  throw new Error('no JPEG SOF found');
}

test('data: every indicator and series is real, sourced and dated', async () => {
  const { INDICATORS, SERIES } = await import('../app/data.js');
  assert.ok(Array.isArray(INDICATORS) && INDICATORS.length >= 12, 'at least 12 indicators');
  const ids = new Set();
  for (const ind of INDICATORS) {
    assert.ok(ind.id && !ids.has(ind.id), `unique id: ${ind.id}`);
    ids.add(ind.id);
    assert.ok(ind.label && ind.label.length > 3, `${ind.id}: label`);
    assert.ok(ind.value !== undefined && ind.value !== null && ind.value !== '', `${ind.id}: value`);
    assert.ok(ind.unit, `${ind.id}: unit`);
    assert.ok(ind.source && ind.source.includes('BPS'), `${ind.id}: source names BPS`);
    assert.ok(Number.isInteger(ind.year) && ind.year >= 2024 && ind.year <= 2026, `${ind.id}: year`);
  }
  assert.ok(Array.isArray(SERIES) && SERIES.length >= 5, 'at least 5 series');
  for (const s of SERIES) {
    assert.ok(s.id && s.title && s.unit && s.source.includes('BPS'), `${s.id}: meta`);
    assert.ok(Array.isArray(s.points) && s.points.length >= 3, `${s.id}: >=3 points`);
    const labels = new Set();
    for (const p of s.points) {
      assert.ok(typeof p.label === 'string' && p.label.length > 0, `${s.id}: point label`);
      assert.ok(!labels.has(p.label), `${s.id}: unique labels`);
      labels.add(p.label);
      assert.ok(Number.isFinite(p.value), `${s.id}: finite value`);
    }
  }
});

test('charts: pure SVG renderers produce well-formed charts', async () => {
  const { barChart, lineChart, formatNumber } = await import('../app/charts.js');
  const sample = { points: [{ label: '2021', value: 3.7 }, { label: '2022', value: 5.31 }, { label: '2023', value: 5.05 }] };
  const bar = barChart(sample, { width: 600, height: 260 });
  assert.ok(bar.startsWith('<svg'), 'bar starts with <svg');
  assert.equal((bar.match(/<rect/g) || []).length, 3, 'bar has one rect per point');
  assert.ok(bar.includes('2021') && bar.includes('5,31'), 'bar labels values (Indonesian decimal comma)');
  const line = lineChart(sample, { width: 600, height: 260 });
  assert.ok(line.startsWith('<svg'), 'line starts with <svg');
  assert.ok(line.includes('<polyline') || line.includes('<path'), 'line has a path');
  assert.equal(formatNumber(23821.1), '23.821,1', 'Indonesian number format');
  assert.equal(formatNumber(284.67), '284,67', 'decimal comma');
});

test('app: structure, size caps and no external references', () => {
  const index = join(APP, 'index.html');
  assert.ok(existsSync(index), 'app/index.html exists');
  assert.ok(statSync(index).size <= 1024 * 1024, 'index.html <= 1 MiB');
  const files = walk(APP);
  assert.ok(files.length <= 993, 'app entries <= 993');
  const total = files.reduce((n, f) => n + statSync(f).size, 0);
  assert.ok(total <= 16 * 1024 * 1024, 'app total <= 16 MiB');
  const pages = files.filter((f) => f.endsWith('.html'));
  assert.ok(pages.length >= 4, 'at least 4 pages');
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    const rel = relative(APP, f);
    assert.ok(!/https?:\/\//.test(text), `${rel}: no absolute http(s) URL`);
    assert.ok(!/src\s*=\s*["']\/\//.test(text) && !/href\s*=\s*["']\/\//.test(text), `${rel}: no protocol-relative URL`);
    assert.ok(!/\beval\s*\(/.test(text), `${rel}: no eval`);
    assert.ok(!/new\s+Function\s*\(/.test(text), `${rel}: no new Function`);
    assert.ok(!/serviceWorker/.test(text), `${rel}: no service worker`);
    assert.ok(!/document\.cookie/.test(text), `${rel}: no cookies`);
    assert.ok(!/\bfetch\s*\(/.test(text), `${rel}: no fetch`);
    assert.ok(!/XMLHttpRequest/.test(text), `${rel}: no XHR`);
    assert.ok(!/WebSocket/.test(text), `${rel}: no WebSocket`);
  }
  // Every local page/script/style reference resolves to a file under app/.
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const refs = [...html.matchAll(/(?:src|href)="([^"#]+)(?:#[^"]*)?"/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (ref.startsWith('data:') || ref.startsWith('mailto:')) continue;
      const target = ref.startsWith('/') ? join(APP, ref.slice(1)) : join(dirname(page), ref);
      assert.ok(existsSync(target), `${relative(APP, page)}: reference ${ref} resolves`);
    }
    assert.ok(/<title>[^<]+<\/title>/.test(html), `${relative(APP, page)}: has <title>`);
    for (const other of ['index.html', 'ekonomi.html', 'penduduk.html', 'sosial.html', 'perdagangan.html']) {
      assert.ok(html.includes(`href="${other}"`) || html.includes(`href="/${other}"`), `${relative(APP, page)}: nav links to ${other}`);
    }
  }
});

test('screenshots: 3-4 real renders within the gate caps', () => {
  const dir = join(ROOT, 'screenshots');
  assert.ok(existsSync(dir), 'screenshots/ exists');
  const shots = readdirSync(dir).filter((n) => !n.startsWith('.')).sort();
  assert.ok(shots.length >= 3 && shots.length <= 4, `3-4 screenshots, got ${shots.length}`);
  for (const name of shots) {
    assert.ok(/^[A-Za-z0-9._-]{1,128}$/.test(name) && !name.startsWith('-'), `${name}: valid name`);
    const buf = readFileSync(join(dir, name));
    assert.ok(buf.length <= 262144, `${name}: <= 256 KiB (${buf.length} B)`);
    const dims = name.endsWith('.png') ? pngSize(buf) : jpegSize(buf);
    const long = Math.max(dims.width, dims.height);
    const short = Math.min(dims.width, dims.height);
    assert.ok(long <= 1280, `${name}: long side <= 1280 (${long})`);
    assert.ok(short >= 360, `${name}: short side >= 360 (${short})`);
  }
});

test('main.ts: entrypoint shape and output-dir safety', () => {
  const main = join(ROOT, 'main.ts');
  assert.ok(existsSync(main), 'main.ts exists');
  const src = readFileSync(main, 'utf8');
  assert.ok(src.includes("from './vendor/makefun-frontend.ts'"), 'imports buildDossier vendor');
  assert.ok(src.includes('buildDossier'), 'calls buildDossier');
  assert.ok(src.includes('MAKEFUN_OUTPUT_DIR'), 'honours MAKEFUN_OUTPUT_DIR');
  assert.ok(!/rmSync\(\s*out\b/.test(src), 'never removes /output itself');
  assert.ok(!/rm\(\s*out\b/.test(src), 'never removes /output itself (async)');
  assert.ok(src.includes('readdirSync') || src.includes('readdir'), 'empties output contents by listing them');
});

test('repo files: README badges, LICENSE SPDX, owner claim', () => {
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  const slug = 'best-national-statistics-site-20261126-0539';
  const owner = 'lively-panda-61';
  const repo = 'best-national-statistics-site-20261126-0539';
  assert.ok(readme.includes(`https://make.fun/badge/${slug}.svg`), 'badge 1 (competition)');
  assert.ok(readme.includes(`https://make.fun/badge/${slug}/${owner}/${repo}/rank.svg`), 'badge 2 (rank)');
  assert.ok(readme.includes(`https://make.fun/badge/${slug}/${owner}/${repo}/reward.svg`), 'badge 3 (reward)');
  assert.ok(!readme.includes('{owner}') && !readme.includes('{repo}'), 'no unfilled placeholders');
  assert.ok(readme.includes('ref=q85rcyn4'), 'referral code present');
  const license = readFileSync(join(ROOT, 'LICENSE'), 'utf8');
  assert.ok(license.split('\n')[0].includes('SPDX-License-Identifier: MIT'), 'LICENSE first line SPDX MIT');
  const claim = JSON.parse(readFileSync(join(ROOT, '.makefun', 'owner.json'), 'utf8'));
  assert.equal(claim.wallet, WALLET, 'owner.json wallet');
});

test('main.ts: two runs write byte-identical output (needs vendor file)', { skip: !existsSync(join(ROOT, 'vendor', 'makefun-frontend.ts')) }, () => {
  const run = (dir) => {
    execFileSync('node', ['main.ts'], {
      cwd: ROOT, env: { ...process.env, MAKEFUN_OUTPUT_DIR: dir }, stdio: 'pipe', timeout: 30000,
    });
  };
  const a = mkdtempSync(join(tmpdir(), 'mf-a-'));
  const b = mkdtempSync(join(tmpdir(), 'mf-b-'));
  try {
    run(a);
    run(b);
    const digest = (dir) => {
      const out = [];
      for (const f of walk(dir).sort()) out.push(`${relative(dir, f)}\0${readFileSync(f).toString('base64')}`);
      return out.join('\n');
    };
    assert.equal(digest(a), digest(b), 'two runs byte-identical');
    const dossier = JSON.parse(readFileSync(join(a, 'dossier.json'), 'utf8'));
    assert.equal(dossier.schema, 'makefun/dossier/v1', 'dossier schema');
    assert.ok(existsSync(join(a, 'app', 'index.html')), 'output has app/index.html');
    assert.ok(readdirSync(join(a, 'screenshots')).length >= 3, 'output has screenshots');
  } finally {
    rmSync(a, { recursive: true, force: true });
    rmSync(b, { recursive: true, force: true });
  }
});
