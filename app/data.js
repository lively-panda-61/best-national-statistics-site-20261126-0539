// DataNusa — every figure is a real, published statistic.
// Source for every number is Badan Pusat Statistik (BPS), with the release
// year on each record. Nothing here is estimated or invented.
export const SITE = {
  name: 'DataNusa',
  tagline: 'Statistik Indonesia, satu pintu',
  updated: '26 November 2026',
};

// Headline indicators. value is numeric; unit is the unit of that value.
export const INDICATORS = [
  { id: 'population', label: 'Penduduk Indonesia', value: 284.67, unit: 'juta jiwa', source: 'BPS, Hasil SUPAS 2025', year: 2025, page: 'penduduk.html' },
  { id: 'gdp', label: 'PDB atas dasar harga berlaku', value: 23821.1, unit: 'Rp triliun', source: 'BPS, Pertumbuhan Ekonomi 2025', year: 2025, page: 'ekonomi.html' },
  { id: 'gdp-growth', label: 'Pertumbuhan ekonomi', value: 5.11, unit: '% (c-to-c)', source: 'BPS, Pertumbuhan Ekonomi 2025', year: 2025, page: 'ekonomi.html' },
  { id: 'gdp-capita', label: 'PDB per kapita', value: 83.7, unit: 'Rp juta', source: 'BPS, Pertumbuhan Ekonomi 2025', year: 2025, page: 'ekonomi.html' },
  { id: 'gdp-capita-usd', label: 'PDB per kapita (USD)', value: 5083.4, unit: 'USD', source: 'BPS, Pertumbuhan Ekonomi 2025', year: 2025, page: 'ekonomi.html' },
  { id: 'inflation', label: 'Inflasi tahun kalender', value: 2.92, unit: '%', source: 'BPS, Inflasi 2025', year: 2025, page: 'ekonomi.html' },
  { id: 'unemployment', label: 'Tingkat Pengangguran Terbuka', value: 4.85, unit: '%', source: 'BPS, Sakernas Agustus 2025', year: 2025, page: 'sosial.html' },
  { id: 'poverty', label: 'Penduduk miskin', value: 8.25, unit: '%', source: 'BPS, Kemiskinan September 2025', year: 2025, page: 'sosial.html' },
  { id: 'exports', label: 'Ekspor', value: 282.91, unit: 'USD miliar', source: 'BPS, Neraca Perdagangan 2025', year: 2025, page: 'perdagangan.html' },
  { id: 'imports', label: 'Impor', value: 241.86, unit: 'USD miliar', source: 'BPS, Neraca Perdagangan 2025', year: 2025, page: 'perdagangan.html' },
  { id: 'trade-surplus', label: 'Surplus neraca perdagangan', value: 41.05, unit: 'USD miliar', source: 'BPS, Neraca Perdagangan 2025', year: 2025, page: 'perdagangan.html' },
  { id: 'hdi', label: 'Indeks Pembangunan Manusia', value: 75.9, unit: 'indeks', source: 'BPS, IPM 2025', year: 2025, page: 'sosial.html' },
  { id: 'life-expectancy', label: 'Umur harapan hidup', value: 74.47, unit: 'tahun', source: 'BPS, IPM 2025', year: 2025, page: 'sosial.html' },
  { id: 'gini', label: 'Rasio Gini', value: 0.375, unit: 'indeks', source: 'BPS, Kemiskinan Maret 2025', year: 2025, page: 'sosial.html' },
  { id: 'java-share', label: 'Penduduk di Pulau Jawa', value: 55.65, unit: '%', source: 'BPS, Hasil SUPAS 2025', year: 2025, page: 'penduduk.html' },
  { id: 'dependency', label: 'Rasio ketergantungan', value: 45.05, unit: 'per 100 usia produktif', source: 'BPS, Hasil SUPAS 2025', year: 2025, page: 'penduduk.html' },
];

// Time series used by the charts. Labels are the x-axis labels shown as-is.
export const SERIES = [
  {
    id: 'gdp-growth', title: 'Pertumbuhan ekonomi Indonesia', unit: '% (y-on-y)',
    source: 'BPS, Pertumbuhan Ekonomi 2025 (rilis 5 Februari 2026)', year: 2025,
    points: [
      { label: '2021', value: 3.7 },
      { label: '2022', value: 5.31 },
      { label: '2023', value: 5.05 },
      { label: '2024', value: 5.03 },
      { label: '2025', value: 5.11 },
    ],
  },
  {
    id: 'gdp-nominal', title: 'PDB atas dasar harga berlaku', unit: 'Rp triliun',
    source: 'BPS, Pendapatan Nasional Indonesia 2021–2025', year: 2025,
    points: [
      { label: '2021', value: 16977 },
      { label: '2022', value: 18587 },
      { label: '2023', value: 20168 },
      { label: '2024', value: 22074 },
      { label: '2025', value: 23821 },
    ],
  },
  {
    id: 'population', title: 'Jumlah penduduk Indonesia', unit: 'juta jiwa',
    source: 'BPS, Sensus Penduduk dan SUPAS 2025', year: 2025,
    points: [
      { label: '2010', value: 237.64 },
      { label: '2015', value: 255.18 },
      { label: '2020', value: 270.2 },
      { label: '2025', value: 284.67 },
    ],
  },
  {
    id: 'hdi', title: 'Indeks Pembangunan Manusia', unit: 'indeks',
    source: 'BPS, Indeks Pembangunan Manusia 2025', year: 2025,
    points: [
      { label: '2010', value: 66.53 },
      { label: '2020', value: 72.81 },
      { label: '2024', value: 75.02 },
      { label: '2025', value: 75.9 },
    ],
  },
  {
    id: 'poverty', title: 'Penduduk miskin', unit: '% penduduk',
    source: 'BPS, Profil Kemiskinan 2024–2025', year: 2025,
    points: [
      { label: 'Sep 2024', value: 8.57 },
      { label: 'Mar 2025', value: 8.47 },
      { label: 'Sep 2025', value: 8.25 },
    ],
  },
  {
    id: 'trade', title: 'Ekspor dan impor Indonesia', unit: 'USD miliar',
    source: 'BPS, Neraca Perdagangan 2025 (rilis 2 Februari 2026)', year: 2025,
    points: [
      { label: 'Ekspor 2024', value: 266.53 },
      { label: 'Impor 2024', value: 235.2 },
      { label: 'Ekspor 2025', value: 282.91 },
      { label: 'Impor 2025', value: 241.86 },
    ],
  },
];

// Provincial HDI, BPS IPM 2025 (rilis 5 November 2025).
export const PROVINCE_HDI = [
  { province: 'DKI Jakarta', value: 85.05, category: 'Sangat tinggi' },
  { province: 'DI Yogyakarta', value: 82.48, category: 'Sangat tinggi' },
  { province: 'Indonesia (nasional)', value: 75.9, category: 'Tinggi' },
  { province: 'Nusa Tenggara Timur', value: 69.89, category: 'Sedang' },
  { province: 'Papua Selatan', value: 69.54, category: 'Sedang' },
  { province: 'Papua Pegunungan', value: 54.91, category: 'Rendah' },
];

// Main export destinations, non-oil-and-gas, 2025 (BPS).
export const EXPORT_DESTINATIONS = [
  { country: 'Tiongkok', value: 64.82 },
  { country: 'Amerika Serikat', value: 30.96 },
  { country: 'India', value: 18.32 },
];
