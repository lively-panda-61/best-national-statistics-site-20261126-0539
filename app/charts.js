// Pure SVG chart renderers for DataNusa. No DOM, no dependencies:
// each function takes a series and returns an SVG string, so the same code
// runs in the browser and in the test suite.
const TEAL = '#0f766e';
const TEAL_LIGHT = '#14b8a6';
const AMBER = '#d97706';
const SLATE = '#475569';
const GRID = '#e2e8f0';

export function formatNumber(value, decimals = 2) {
  const fixed = Number(value).toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
  const [whole, frac] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return frac === undefined ? grouped : `${grouped},${frac}`;
}

function niceCeiling(max) {
  if (max <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(max));
  const scaled = max / power;
  const nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
  return nice * power;
}

function frame({ width, height, title, unit }) {
  return {
    open: `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="${escapeXml(title)}">`
      + `<title>${escapeXml(title)}</title>`,
    padL: 56, padR: 12, padT: 14, padB: 34,
    unit,
  };
}

export function escapeXml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function gridlines(max, plotW, plotH, padL, padT) {
  let out = '';
  for (let i = 0; i <= 4; i += 1) {
    const v = (max / 4) * i;
    const y = padT + plotH - (v / max) * plotH;
    out += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${padL + plotW}" y2="${y.toFixed(1)}" stroke="${GRID}" stroke-width="1"/>`
      + `<text x="${padL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="${SLATE}">${formatNumber(v, 1)}</text>`;
  }
  return out;
}

export function barChart(series, { width = 640, height = 280, color = TEAL } = {}) {
  const { open, padL, padR, padT, padB } = frame({ width, height, title: series.title });
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const max = niceCeiling(Math.max(...series.points.map((p) => p.value)) * 1.08);
  const slot = plotW / series.points.length;
  const barW = Math.min(64, slot * 0.58);
  let body = gridlines(max, plotW, plotH, padL, padT);
  series.points.forEach((p, i) => {
    const h = (p.value / max) * plotH;
    const x = padL + i * slot + (slot - barW) / 2;
    const y = padT + plotH - h;
    body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${color}"/>`
      + `<text x="${(x + barW / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="600" fill="#0f172a">${formatNumber(p.value)}</text>`
      + `<text x="${(x + barW / 2).toFixed(1)}" y="${(padT + plotH + 20).toFixed(1)}" text-anchor="middle" font-size="12" fill="${SLATE}">${escapeXml(p.label)}</text>`;
  });
  return `${open}${body}</svg>`;
}

export function lineChart(series, { width = 640, height = 280, color = AMBER } = {}) {
  const { open, padL, padR, padT, padB } = frame({ width, height, title: series.title });
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const values = series.points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const top = niceCeiling(max * 1.02);
  const bottom = Math.max(0, min - span * 0.4);
  const yFor = (v) => padT + plotH - ((v - bottom) / (top - bottom)) * plotH;
  const xFor = (i) => padL + (series.points.length === 1 ? plotW / 2 : (i / (series.points.length - 1)) * plotW);
  let body = gridlines(top, plotW, plotH, padL, padT);
  const coords = series.points.map((p, i) => `${xFor(i).toFixed(1)},${yFor(p.value).toFixed(1)}`).join(' ');
  body += `<polyline points="${coords}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  series.points.forEach((p, i) => {
    body += `<circle cx="${xFor(i).toFixed(1)}" cy="${yFor(p.value).toFixed(1)}" r="4.5" fill="#fff" stroke="${color}" stroke-width="2.5"/>`
      + `<text x="${xFor(i).toFixed(1)}" y="${(yFor(p.value) - 10).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="600" fill="#0f172a">${formatNumber(p.value)}</text>`
      + `<text x="${xFor(i).toFixed(1)}" y="${(padT + plotH + 20).toFixed(1)}" text-anchor="middle" font-size="12" fill="${SLATE}">${escapeXml(p.label)}</text>`;
  });
  return `${open}${body}</svg>`;
}

export function miniBars(rows, { width = 640, height = 200 } = {}) {
  // Horizontal bars for a ranked list: [{label, value, note}].
  const max = Math.max(...rows.map((r) => r.value));
  const rowH = height / rows.length;
  let body = '';
  rows.forEach((r, i) => {
    const y = i * rowH;
    const w = ((r.value / max) * (width - 190)).toFixed(1);
    body += `<text x="0" y="${(y + rowH / 2 + 4).toFixed(1)}" font-size="13" fill="#0f172a">${escapeXml(r.label)}</text>`
      + `<rect x="150" y="${(y + 8).toFixed(1)}" width="${w}" height="${(rowH - 16).toFixed(1)}" rx="3" fill="${TEAL_LIGHT}"/>`
      + `<text x="${(158 + Number(w)).toFixed(1)}" y="${(y + rowH / 2 + 4).toFixed(1)}" font-size="12" font-weight="600" fill="#0f172a">${formatNumber(r.value)}${r.note ? ` ${escapeXml(r.note)}` : ''}</text>`;
  });
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img">${body}</svg>`;
}
