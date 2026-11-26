// DataNusa page behaviour: renders charts from data.js, wires the chart
// type toggles, the show/hide data tables and the live search filters.
import { INDICATORS, SERIES, PROVINCE_HDI, EXPORT_DESTINATIONS } from './data.js';
import { barChart, lineChart, formatNumber, miniBars } from './charts.js';

function seriesById(id) {
  const found = SERIES.find((s) => s.id === id);
  if (!found) throw new Error(`unknown series: ${id}`);
  return found;
}

function renderChartSlot(slot) {
  const series = seriesById(slot.dataset.chart);
  const type = slot.dataset.type || 'bar';
  slot.innerHTML = type === 'line' ? lineChart(series) : barChart(series);
  const caption = slot.parentElement.querySelector('.chart-source');
  if (caption) caption.textContent = `Sumber: ${series.source} · Satuan: ${series.unit}`;
}

function renderAllCharts() {
  document.querySelectorAll('[data-chart]').forEach(renderChartSlot);
}

// Chart type toggle: two buttons switch one chart between bar and line.
function wireToggles() {
  document.querySelectorAll('[data-toggle-for]').forEach((group) => {
    const target = document.getElementById(group.dataset.toggleFor);
    if (!target) return;
    group.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        target.dataset.type = btn.dataset.chartType;
        renderChartSlot(target);
      });
    });
  });
}

// Show/hide the data table under a chart.
function wireTableToggles() {
  document.querySelectorAll('[data-table-toggle]').forEach((btn) => {
    const table = document.getElementById(btn.dataset.tableToggle);
    if (!table) return;
    btn.addEventListener('click', () => {
      const hidden = table.classList.toggle('hidden');
      btn.textContent = hidden ? 'Tampilkan tabel data' : 'Sembunyikan tabel data';
      btn.setAttribute('aria-expanded', String(!hidden));
    });
  });
}

// Live search: filters rows of a list/table by their text.
function wireSearch(inputId, listId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;
  const empty = document.getElementById(`${listId}-empty`);
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let visible = 0;
    list.querySelectorAll('[data-searchable]').forEach((row) => {
      const hit = row.textContent.toLowerCase().includes(q);
      row.classList.toggle('hidden', !hit);
      if (hit) visible += 1;
    });
    if (empty) empty.classList.toggle('hidden', visible !== 0);
  });
}

function renderIndicatorIndex() {
  const list = document.getElementById('indicator-index');
  if (!list) return;
  list.innerHTML = INDICATORS.map((ind) => `
    <li data-searchable>
      <a href="${ind.page}">${ind.label}</a>
      <strong>${formatNumber(ind.value)} ${ind.unit}</strong>
      <span>${ind.source} · ${ind.year}</span>
    </li>`).join('');
}

function renderProvinceRows() {
  const body = document.getElementById('province-hdi-body');
  if (!body) return;
  body.innerHTML = PROVINCE_HDI.map((r) => `
    <tr data-searchable>
      <td>${r.province}</td><td>${formatNumber(r.value)}</td><td>${r.category}</td>
    </tr>`).join('');
}

function renderDestinations() {
  const slot = document.getElementById('destination-chart');
  if (!slot) return;
  slot.innerHTML = miniBars(
    EXPORT_DESTINATIONS.map((d) => ({ label: d.country, value: d.value, note: 'USD miliar' })),
  );
}

function markActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach((a) => {
    if (a.getAttribute('href') === page) a.setAttribute('aria-current', 'page');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  renderIndicatorIndex();
  renderProvinceRows();
  renderAllCharts();
  wireToggles();
  wireTableToggles();
  wireSearch('indicator-search', 'indicator-index');
  wireSearch('province-search', 'province-hdi-body');
});
