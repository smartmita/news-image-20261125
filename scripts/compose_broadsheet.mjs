// Builds broadsheet.html for Wednesday 25 November 2026 (36 single-topic dispatches, 7 regions, Natural Earth 110m).
import * as fs from 'node:fs';
import * as module from 'node:module';
import * as path from 'node:path';
import * as url from 'node:url';

const loadPkg = module.createRequire(import.meta.url);
const topoClient = loadPkg('topojson-client');
const atlasJsonPath = loadPkg.resolve('world-atlas/countries-110m.json');
const atlasPayload = JSON.parse(fs.readFileSync(atlasJsonPath, 'utf8'));
const countryFeatures = topoClient.feature(atlasPayload, atlasPayload.objects.countries).features;

const ATLAS_WIDTH = 352;
const ATLAS_HEIGHT = 212;
const MIN_LON = -168;
const MAX_LON = 180;
const MIN_LAT = -54;
const MAX_LAT = 76;

const REGION_STYLE = {
  ASIA: { label: 'ASIA', color: '#0F766E' },
  EUROPE: { label: 'EUROPE', color: '#1D4ED8' },
  AMERICAS: { label: 'AMERICAS', color: '#B45309' },
  MIDEAST: { label: 'MIDEAST', color: '#991B1B' },
  AFRICA: { label: 'AFRICA', color: '#9A3412' },
  OCEANIA: { label: 'OCEANIA', color: '#0369A1' },
  GLOBAL: { label: 'GLOBAL', color: '#6D28D9' },
};

function projectGeoPoint(lon, lat) {
  const safeLon = Math.min(MAX_LON, Math.max(MIN_LON, lon));
  const safeLat = Math.min(MAX_LAT, Math.max(MIN_LAT, lat));
  const px = ((safeLon - MIN_LON) / (MAX_LON - MIN_LON)) * ATLAS_WIDTH;
  const py = ((MAX_LAT - safeLat) / (MAX_LAT - MIN_LAT)) * ATLAS_HEIGHT;
  return [px, py];
}

function buildPolygonPath(coords) {
  if (!coords || coords.length < 3) return '';
  const cmds = [];
  let lastLon = coords[0][0];
  coords.forEach(([lon, lat], idx) => {
    const [x, y] = projectGeoPoint(lon, lat);
    const verb = idx === 0 || Math.abs(lon - lastLon) > 180 ? 'M' : 'L';
    cmds.push(`${verb}${x.toFixed(1)},${y.toFixed(1)}`);
    lastLon = lon;
  });
  return `${cmds.join('')}Z`;
}

function serializeCountryShapes(features) {
  return features
    .filter((item) => String(item.id) !== '010')
    .map((item) => {
      const g = item.geometry;
      if (!g) return '';
      if (g.type === 'Polygon') return `<path d="${g.coordinates.map(buildPolygonPath).join(' ')}" />`;
      if (g.type === 'MultiPolygon') {
        const d = g.coordinates.map((poly) => poly.map(buildPolygonPath).join(' ')).join(' ');
        return `<path d="${d}" />`;
      }
      return '';
    })
    .join('\n');
}

function buildGridLines() {
  const lines = [];
  for (let lon = -150; lon <= 150; lon += 30) {
    const [x1, y1] = projectGeoPoint(lon, MAX_LAT);
    const [x2, y2] = projectGeoPoint(lon, MIN_LAT);
    lines.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`);
  }
  for (let lat = -40; lat <= 60; lat += 20) {
    const [x1, y1] = projectGeoPoint(MIN_LON, lat);
    const [x2, y2] = projectGeoPoint(MAX_LON, lat);
    lines.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`);
  }
  return lines.join('\n');
}

// Clean iconic vector scenes for the 3 lead stories (no cluttered text boxes inside SVGs).
function heroSpaceScene() {
  return `<svg viewBox="0 0 300 72" width="100%" height="72">
    <defs><linearGradient id="gSpace" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#042F2E"/><stop offset="100%" stop-color="#0F172A"/></linearGradient></defs>
    <rect width="300" height="72" rx="4" fill="url(#gSpace)"/>
    <circle cx="24" cy="14" r="1.3" fill="#E2E8F0"/><circle cx="72" cy="18" r="1" fill="#94A3B8"/>
    <circle cx="136" cy="12" r="1.4" fill="#FDE047"/><circle cx="220" cy="14" r="1.2" fill="#E2E8F0"/><circle cx="278" cy="18" r="1.4" fill="#FDE047"/>
    <path d="M0 59 Q150 38 300 61 L300 72 L0 72 Z" fill="#0284C7" opacity="0.35"/>
    <path d="M0 63 Q150 46 300 65" fill="none" stroke="#38BDF8" stroke-width="1.5" opacity="0.7"/>
    <g transform="translate(52,11) rotate(-22 18 28)">
      <path d="M14 48 L8 60 L24 52 Z" fill="#F97316"/><ellipse cx="16" cy="56" rx="4.5" ry="7.5" fill="#FACC15"/>
      <rect x="12" y="14" width="8" height="34" rx="2" fill="#F8FAFC"/><polygon points="16,2 10,14 22,14" fill="#EF4444"/>
      <rect x="7" y="34" width="5" height="14" rx="1" fill="#CBD5E1"/><rect x="20" y="34" width="5" height="14" rx="1" fill="#CBD5E1"/>
    </g>
    <g transform="translate(178,13)">
      <rect x="0" y="16" width="82" height="7" rx="2" fill="#CBD5E1"/>
      <rect x="31" y="7" width="20" height="25" rx="3" fill="#F8FAFC"/>
      <rect x="6" y="2" width="18" height="12" fill="#0284C7" stroke="#7DD3FC" stroke-width="1"/>
      <rect x="58" y="2" width="18" height="12" fill="#0284C7" stroke="#7DD3FC" stroke-width="1"/>
      <rect x="6" y="25" width="18" height="12" fill="#0284C7" stroke="#7DD3FC" stroke-width="1"/>
      <rect x="58" y="25" width="18" height="12" fill="#0284C7" stroke="#7DD3FC" stroke-width="1"/>
      <circle cx="41" cy="19" r="3" fill="#10B981"/>
    </g>
    <path d="M92 31 Q138 15 176 25" fill="none" stroke="#34D399" stroke-width="1.6" stroke-dasharray="4,3"/>
  </svg>`;
}

function heroPolitburoScene() {
  return `<svg viewBox="0 0 300 72" width="100%" height="72">
    <defs><linearGradient id="gBeijing" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#450A0A"/><stop offset="100%" stop-color="#1F2937"/></linearGradient></defs>
    <rect width="300" height="72" rx="4" fill="url(#gBeijing)"/>
    <rect x="0" y="57" width="300" height="15" fill="#0F172A"/>
    <rect x="22" y="32" width="22" height="25" fill="#334155"/><rect x="50" y="21" width="26" height="36" fill="#475569"/>
    <polygon points="96,10 103,57 89,57" fill="#64748B"/><circle cx="96" cy="25" r="7" fill="#94A3B8"/><circle cx="96" cy="40" r="5" fill="#94A3B8"/>
    <rect x="120" y="29" width="20" height="28" fill="#334155"/>
    <g transform="translate(168,11)">
      <rect x="10" y="22" width="94" height="25" fill="#991B1B" stroke="#FCA5A5" stroke-width="1"/>
      <polygon points="0,22 57,4 114,22" fill="#DC2626" stroke="#FDE047" stroke-width="1.2"/>
      <rect x="20" y="25" width="7" height="20" fill="#FDE68A"/><rect x="38" y="25" width="7" height="20" fill="#FDE68A"/>
      <rect x="56" y="25" width="7" height="20" fill="#FDE68A"/><rect x="74" y="25" width="7" height="20" fill="#FDE68A"/>
      <rect x="92" y="25" width="7" height="20" fill="#FDE68A"/>
    </g>
    <circle cx="255" cy="16" r="9" fill="#FACC15" opacity="0.22"/>
  </svg>`;
}

function heroCourtScene() {
  return `<svg viewBox="0 0 300 72" width="100%" height="72">
    <rect width="300" height="72" rx="4" fill="#1E293B"/>
    <rect x="0" y="59" width="300" height="13" fill="#0F172A"/>
    <g transform="translate(26,9)">
      <polygon points="48,2 96,17 0,17" fill="#E2E8F0"/>
      <rect x="6" y="17" width="84" height="5" fill="#CBD5E1"/>
      <rect x="12" y="22" width="9" height="26" fill="#F8FAFC"/><rect x="32" y="22" width="9" height="26" fill="#F8FAFC"/>
      <rect x="55" y="22" width="9" height="26" fill="#F8FAFC"/><rect x="75" y="22" width="9" height="26" fill="#F8FAFC"/>
      <rect x="4" y="48" width="88" height="5" fill="#94A3B8"/>
    </g>
    <g transform="translate(152,11)">
      <rect x="12" y="10" width="46" height="32" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.8"/>
      <rect x="24" y="19" width="22" height="14" fill="#1E3A8A" stroke="#93C5FD" stroke-width="1"/>
      <line x1="20" y1="6" x2="20" y2="10" stroke="#38BDF8" stroke-width="2"/><line x1="35" y1="6" x2="35" y2="10" stroke="#38BDF8" stroke-width="2"/><line x1="50" y1="6" x2="50" y2="10" stroke="#38BDF8" stroke-width="2"/>
      <line x1="20" y1="42" x2="20" y2="46" stroke="#38BDF8" stroke-width="2"/><line x1="35" y1="42" x2="35" y2="46" stroke="#38BDF8" stroke-width="2"/><line x1="50" y1="42" x2="50" y2="46" stroke="#38BDF8" stroke-width="2"/>
      <line x1="10" y1="42" x2="60" y2="10" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g transform="translate(232,11)">
      <rect x="16" y="6" width="4" height="42" fill="#FACC15"/>
      <line x1="0" y1="16" x2="36" y2="10" stroke="#FACC15" stroke-width="2.5"/>
      <path d="M-4,28 L8,28 L2,16 Z" fill="#FDE047"/><path d="M28,22 L40,22 L34,10 Z" fill="#FDE047"/>
      <rect x="6" y="46" width="24" height="5" rx="2" fill="#F59E0B"/>
    </g>
  </svg>`;
}

// Compact mini-illustrations (46x60) for the 3x3 feature grid.
const MINI_SCENES = {
  tariffs: `<svg viewBox="0 0 46 60" width="46" height="60"><rect width="46" height="60" rx="4" fill="#FEF3C7"/><rect x="7" y="32" width="8" height="19" fill="#D97706"/><rect x="19" y="22" width="8" height="29" fill="#B45309"/><rect x="31" y="13" width="8" height="38" fill="#991B1B"/><path d="M6 21 L40 10" stroke="#DC2626" stroke-width="2.4"/><text x="11" y="17" font-family="Arial" font-size="11" font-weight="900" fill="#991B1B">%</text></svg>`,
  talks: `<svg viewBox="0 0 46 60" width="46" height="60"><rect width="46" height="60" rx="4" fill="#DBEAFE"/><rect x="0" y="41" width="46" height="19" fill="#E5DFCE"/><rect x="9" y="18" width="12" height="10" fill="#2563EB"/><rect x="9" y="23" width="12" height="5" fill="#FACC15"/><rect x="25" y="18" width="12" height="10" fill="#DC2626"/><rect x="25" y="18" width="12" height="4" fill="#F8FAFC"/><rect x="25" y="22" width="12" height="3" fill="#1D4ED8"/><ellipse cx="23" cy="41" rx="15" ry="5" fill="#1E3A8A"/></svg>`,
  riyadh: `<svg viewBox="0 0 46 60" width="46" height="60"><rect width="46" height="60" rx="4" fill="#450A0A"/><rect x="15" y="13" width="16" height="41" fill="#94A3B8"/><polygon points="17,13 23,4 29,13" fill="#CBD5E1"/><rect x="18" y="19" width="10" height="8" fill="#1E293B"/><polygon points="23,17 36,23 26,27 33,34 21,29 13,33 18,24" fill="#F97316"/><circle cx="23" cy="25" r="4" fill="#FACC15"/></svg>`,
  cyber: `<svg viewBox="0 0 46 60" width="46" height="60"><rect width="46" height="60" rx="4" fill="#0F172A"/><path d="M23 7 L38 15 V30 C38 41 23 51 23 51 C23 51 8 41 8 30 V15 Z" fill="#1E3A8A" stroke="#60A5FA" stroke-width="1.5"/><polygon points="23,17 34,36 12,36" fill="#FACC15"/><text x="23" y="33" text-anchor="middle" font-family="Arial" font-size="10.5" font-weight="900" fill="#0F172A">!</text></svg>`,
  iowa: `<svg viewBox="0 0 46 60" width="46" height="60"><rect width="46" height="60" rx="4" fill="#1C1917"/><circle cx="23" cy="30" r="18" fill="none" stroke="#F59E0B" stroke-width="1.3" stroke-dasharray="3,2"/><circle cx="23" cy="30" r="11" fill="#78350F" stroke="#FBBF24" stroke-width="1.3"/><polygon points="23,18 33,38 13,38" fill="#FACC15"/><text x="23" y="35" text-anchor="middle" font-family="Arial" font-size="10" font-weight="900" fill="#1C1917">!</text></svg>`,
  oecd: `<svg viewBox="0 0 46 60" width="46" height="60"><rect width="46" height="60" rx="4" fill="#CCFBF1"/><circle cx="23" cy="24" r="13" fill="#0F766E"/><ellipse cx="23" cy="24" rx="6.5" ry="13" fill="none" stroke="#99F6E4" stroke-width="1.2"/><line x1="10" y1="24" x2="36" y2="24" stroke="#99F6E4" stroke-width="1.2"/><rect x="10" y="43" width="26" height="5.5" fill="#DC2626"/><rect x="10" y="48.5" width="26" height="5.5" fill="#FFFFFF"/></svg>`,
  shein: `<svg viewBox="0 0 46 60" width="46" height="60"><rect width="46" height="60" rx="4" fill="#EDE9FE"/><rect x="9" y="17" width="28" height="28" rx="3" fill="#4338CA"/><path d="M16 17 C16 9 30 9 30 17" fill="none" stroke="#312E81" stroke-width="2.4"/><text x="23" y="36" text-anchor="middle" font-family="Arial" font-size="9.5" font-weight="900" fill="#FDE047">$100M</text></svg>`,
  kospi: `<svg viewBox="0 0 46 60" width="46" height="60"><rect width="46" height="60" rx="4" fill="#1E1014"/><line x1="6" y1="19" x2="40" y2="19" stroke="#451A22" stroke-width="1"/><line x1="6" y1="39" x2="40" y2="39" stroke="#451A22" stroke-width="1"/><polyline points="7,13 15,21 22,18 31,34 39,47" fill="none" stroke="#F87171" stroke-width="2.8" stroke-linecap="round"/><polygon points="41,50 33,48 38,41" fill="#F87171"/></svg>`,
  sarkozy: `<svg viewBox="0 0 46 60" width="46" height="60"><rect width="46" height="60" rx="4" fill="#EFF6FF"/><rect x="7" y="11" width="10" height="7.5" fill="#1D4ED8"/><rect x="17" y="11" width="12" height="7.5" fill="#FFFFFF"/><rect x="29" y="11" width="10" height="7.5" fill="#DC2626"/><rect x="11" y="26" width="24" height="21" fill="#334155"/><rect x="14" y="29" width="5" height="15" fill="#E2E8F0"/><rect x="21" y="29" width="5" height="15" fill="#E2E8F0"/><rect x="28" y="29" width="5" height="15" fill="#E2E8F0"/></svg>`,
};

const STATS_STRIP = [
  { val: '1ST', desc: 'Pakistani astronaut to Tiangong' },
  { val: '4TH', desc: "Politburo chief probed since '25" },
  { val: '10/12', desc: 'Counts Huawei convicted in US' },
  { val: '16', desc: 'Economies hit by US tariff plan' },
  { val: '11', desc: 'Hurt in Houthi Riyadh strike' },
  { val: '$100M', desc: 'Shein FTC consumer settlement' },
];

const LEAD_DISPATCHES = [
  {
    id: 1, region: 'ASIA', place: 'JIUQUAN · SPACE', chip: '00:18 UTC',
    title: "Shenzhou-24 lifts off with Pakistan's first astronaut",
    blurb: 'Long March 2F launches to Tiangong; Muhammad Zeeshan Ali becomes the station’s first foreign crewmate. (Reuters, Xinhua)',
    art: heroSpaceScene(),
  },
  {
    id: 2, region: 'ASIA', place: 'SHANGHAI · POLITICS', chip: '4TH PROBE',
    title: 'China probes Shanghai party chief Chen Jining',
    blurb: 'CCDI investigates the Politburo member, 62, for severe discipline violations — fourth top leader probed since 2025. (Reuters)',
    art: heroPolitburoScene(),
  },
  {
    id: 3, region: 'AMERICAS', place: 'NEW YORK · JUSTICE', chip: 'GUILTY',
    title: 'Huawei convicted on 10 of 12 US criminal counts',
    blurb: 'Brooklyn federal jury convicts firm of fraud, Iran sanctions breaches and trade-secret theft; acquits racketeering. (Reuters)',
    art: heroCourtScene(),
  },
];

const FEATURE_DISPATCHES = [
  { id: 4, region: 'AMERICAS', place: 'WASHINGTON · TRADE', title: 'US readies Section 301 tariffs on 16 economies', blurb: 'New duties target China, India and EU over excess capacity after court setback. (Reuters)', scene: MINI_SCENES.tariffs },
  { id: 5, region: 'EUROPE', place: 'ABU DHABI · DIPLOMACY', title: 'Abu Dhabi hosts US-Ukraine-Russia talks', blurb: 'Trilateral talks weigh security and swaps as envoy Witkoff plans Moscow visit. (Reuters)', scene: MINI_SCENES.talks },
  { id: 6, region: 'MIDEAST', place: 'RIYADH · CONFLICT', title: 'Houthi drone strikes Riyadh tower, 11 hurt', blurb: 'Financial district hit draws UAE condemnation as UK sanctions Houthi figures. (AJ, Hindu)', scene: MINI_SCENES.riyadh },
  { id: 7, region: 'AMERICAS', place: 'LANGLEY · SECURITY', title: 'CIA and ODNI hit by unclassified cyber breach', blurb: 'Agencies report open-source network intrusion; classified systems stayed intact. (AP, NYT)', scene: MINI_SCENES.cyber },
  { id: 8, region: 'AMERICAS', place: 'IOWA · SAFETY', title: 'US Army schedules 5-ton lead azide blast', blurb: 'Controlled detonation of 68 drums sets 5-mile evacuation zone at Middletown. (AP, Army)', scene: MINI_SCENES.iowa },
  { id: 9, region: 'ASIA', place: 'JAKARTA · ECONOMY', title: 'OECD chief meets Prabowo on 25 reviews', blurb: 'Mathias Cormann advances Indonesia roadmap and regional chip-supply studies. (Antara)', scene: MINI_SCENES.oecd },
  { id: 10, region: 'AMERICAS', place: 'WASHINGTON · RETAIL', title: 'Shein agrees to $100M FTC settlement', blurb: 'Retailer settles charges over delivery delays, hidden reviews and greenwashing. (FTC, CBS)', scene: MINI_SCENES.shein },
  { id: 11, region: 'ASIA', place: 'SEOUL & TOKYO · MARKETS', title: 'Asian chips slide; Kospi triggers sidecar', blurb: 'Kospi tumbles 4.8% below 5,000 and Nikkei drops 2.6% on AI hardware rout. (Chosun)', scene: MINI_SCENES.kospi },
  { id: 12, region: 'EUROPE', place: 'PARIS · JUSTICE', title: 'Sarkozy and Carla Bruni ordered to stand trial', blurb: 'Court sends ex-president and spouse to trial over 2007 Libya witness tampering. (CNA)', scene: MINI_SCENES.sarkozy },
];

const WIRE_ITEMS = [
  { id: 13, region: 'EUROPE', place: 'Brussels', text: 'EU and Western Balkans leaders review growth plan; Montenegro closes 25 chapters.', credit: 'Europa' },
  { id: 14, region: 'EUROPE', place: 'Athens', text: '24-hour general strike by ADEDY and GSEE unions halts ferries and cuts transit.', credit: 'To Vima' },
  { id: 15, region: 'EUROPE', place: 'Berlin', text: 'Ifo business morale index rises a 7th straight month to 90.6 on public stimulus.', credit: 'Reuters' },
  { id: 16, region: 'EUROPE', place: 'Stockholm', text: 'Speaker nominates Ulf Kristersson for Nov 30 vote to end coalition deadlock.', credit: 'Xinhua' },
  { id: 17, region: 'EUROPE', place: 'Zaporizhzhia', text: 'Russian airstrike hits apartment block, killing two and injuring dozens.', credit: 'AP' },
  { id: 18, region: 'EUROPE', place: 'Madrid', text: 'Real Madrid rout PSV 5–1 in Champions League as Mbappé and Vinícius score.', credit: 'Reuters' },
  { id: 19, region: 'ASIA', place: 'Dhaka', text: 'Wage board lifts entry garment pay 36% to 17,000 takas after plant protests.', credit: 'AP' },
  { id: 20, region: 'ASIA', place: 'Hanoi', text: 'Cooking-gas blast collapses Dong Da hot-pot eatery with multiple fatalities.', credit: 'Tuoi Tre' },
  { id: 21, region: 'ASIA', place: 'New Delhi', text: 'India and Nepal ink 10-point air and rail deals as PM Shah wraps visit.', credit: 'ANN' },
  { id: 22, region: 'ASIA', place: 'Bangkok', text: 'Bank of Thailand warns informal grey economy reached 48% of national GDP.', credit: 'ThaiEnq' },
  { id: 23, region: 'OCEANIA', place: 'Canberra', text: 'Australia and Solomons sign defense treaty barring rival foreign bases.', credit: 'ABC' },
  { id: 24, region: 'OCEANIA', place: 'Sydney', text: 'October inflation jumps to 4.9% on electricity costs, lifting rate-hike bets.', credit: 'ABS' },
  { id: 25, region: 'OCEANIA', place: 'Flinders I.', text: 'Lightning-sparked bushfire triggers emergency shelter-in-place alert.', credit: 'Xinhua' },
  { id: 26, region: 'MIDEAST', place: 'Jerusalem', text: 'Yashar leader Eisenkot inks initial coalition deal with Yisrael Beytenu.', credit: 'JPost' },
  { id: 27, region: 'MIDEAST', place: 'Doha', text: 'US Gulf embassies issue alert over Houthi drone and airspace threats.', credit: 'AJ' },
  { id: 28, region: 'MIDEAST', place: 'Gaza City', text: 'Oxfam warns war and water damage left parts of Gaza a "toxic wasteland."', credit: 'Oxfam' },
  { id: 29, region: 'AFRICA', place: 'Addis Ababa', text: 'Beijing sends envoys to Ethiopia, Egypt, Eritrea and Djibouti over Horn.', credit: 'AJ' },
  { id: 30, region: 'AFRICA', place: 'Khartoum', text: 'UN warns funding cuts closed community kitchens amid acute Sudan hunger.', credit: 'SudanTrib' },
  { id: 31, region: 'AFRICA', place: 'Juba', text: 'South Sudan delays elections to Feb 11, 2027 after Kiir dissolves cabinet.', credit: 'Tamazuj' },
  { id: 32, region: 'AMERICAS', place: 'Cartagena', text: 'Gunmen seize dozens of hostages in supermarket after botched heist.', credit: 'CBS' },
  { id: 33, region: 'AMERICAS', place: 'San Juan', text: 'Puerto Rico’s Jennifer Barreto wins 75th-anniversary Miss Universe crown.', credit: 'CNN' },
  { id: 34, region: 'AMERICAS', place: 'Buenos Aires', text: 'INDEC reports 1.8% Q3 activity drop, pushing Argentina near recession.', credit: 'FT' },
  { id: 35, region: 'GLOBAL', place: 'Geneva', text: 'UNODC Nov 25 report counts 47,000 women killed by partners or kin in 2025.', credit: 'UNODC' },
  { id: 36, region: 'GLOBAL', place: 'Geneva', text: 'World champion Gukesh and Sindarov draw Game 1 of FIDE title match.', credit: 'Guardian' },
];

const ALL_STORIES = [...LEAD_DISPATCHES, ...FEATURE_DISPATCHES, ...WIRE_ITEMS];

function buildRegionCounts() {
  const counts = {};
  for (const s of ALL_STORIES) {
    counts[s.region] = (counts[s.region] || 0) + 1;
  }
  return Object.entries(REGION_STYLE).map(([key, meta]) => ({
    key,
    label: meta.label,
    color: meta.color,
    count: counts[key] || 0,
  }));
}

// Well-spaced map markers across all 7 regions (no touching/overlapping pins).
const ATLAS_MARKERS = [
  { id: 1, lon: 98.5, lat: 40.9, region: 'ASIA' },
  { id: 2, lon: 121.5, lat: 30.5, region: 'ASIA' },
  { id: 3, lon: -72.5, lat: 42.0, region: 'AMERICAS' },
  { id: 4, lon: -81.5, lat: 33.0, region: 'AMERICAS' },
  { id: 5, lon: 59.0, lat: 24.0, region: 'EUROPE' },
  { id: 6, lon: 43.5, lat: 22.5, region: 'MIDEAST' },
  { id: 8, lon: -94.0, lat: 41.5, region: 'AMERICAS' },
  { id: 9, lon: 106.8, lat: -6.2, region: 'ASIA' },
  { id: 11, lon: 132.0, lat: 37.5, region: 'ASIA' },
  { id: 12, lon: 2.3, lat: 49.5, region: 'EUROPE' },
  { id: 14, lon: 23.7, lat: 38.0, region: 'EUROPE' },
  { id: 17, lon: 35.1, lat: 48.2, region: 'EUROPE' },
  { id: 18, lon: -5.5, lat: 39.8, region: 'EUROPE' },
  { id: 19, lon: 90.4, lat: 23.8, region: 'ASIA' },
  { id: 23, lon: 149.1, lat: -35.3, region: 'OCEANIA' },
  { id: 29, lon: 38.7, lat: 9.0, region: 'AFRICA' },
  { id: 32, lon: -75.5, lat: 10.4, region: 'AMERICAS' },
  { id: 34, lon: -58.4, lat: -34.6, region: 'AMERICAS' },
  { id: 35, lon: 9.0, lat: 44.5, region: 'GLOBAL' },
];

function formatMarkersSvg(markers) {
  return markers
    .map((m) => {
      const [cx, cy] = projectGeoPoint(m.lon, m.lat);
      const tone = REGION_STYLE[m.region].color;
      return `<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)})"><circle r="7.0" fill="${tone}" stroke="#FFF" stroke-width="1.3"/><text y="2.8" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.0" font-weight="900" fill="#FFF">${m.id}</text></g>`;
    })
    .join('\n');
}

function formatStatsStrip() {
  return STATS_STRIP.map(
    (s) => `<div class="stat-box"><div class="stat-val">${s.val}</div><div class="stat-desc">${s.desc}</div></div>`
  ).join('\n');
}

function formatMixStrip(regionCounts) {
  const cols = regionCounts.map((r) => `${r.count}fr`).join(' ');
  const cells = regionCounts
    .map((r) => `<div class="mix-cell" style="background:${r.color};">${r.label} ${r.count}</div>`)
    .join('');
  return `<div class="mix-strip" style="grid-template-columns:${cols};">${cells}</div>`;
}

function formatHeroSection(items) {
  return items
    .map((d) => {
      const tone = REGION_STYLE[d.region].color;
      return `<div class="lead-card">
      <div class="lead-art">${d.art}</div>
      <div class="lead-meta"><span class="num-dot" style="background:${tone};">${d.id}</span><span class="place-lbl">${d.place}</span><span class="chip-tag" style="background:${tone};">${d.chip}</span></div>
      <div class="lead-title">${d.title}</div>
      <div class="lead-copy">${d.blurb}</div>
    </div>`;
    })
    .join('\n');
}

function formatFeatureGrid(items) {
  return items
    .map((d) => {
      const tone = REGION_STYLE[d.region].color;
      return `<div class="feat-card">
      <div class="feat-icon">${d.scene}</div>
      <div class="feat-body">
        <div class="feat-meta"><span class="feat-place" style="color:${tone};">${d.place}</span><span class="feat-num" style="background:${tone};">${d.id}</span></div>
        <div class="feat-title">${d.title}</div>
        <div class="feat-copy">${d.blurb}</div>
      </div>
    </div>`;
    })
    .join('\n');
}

function formatWireColumn(items) {
  return items
    .map((w) => {
      const tone = REGION_STYLE[w.region].color;
      return `<div class="wire-entry"><span class="wire-idx" style="color:${tone};">${w.id}</span><span class="wire-msg"><strong>${w.place}:</strong> ${w.text} <em>(${w.credit})</em></span></div>`;
    })
    .join('\n');
}

function assembleDocument() {
  const landSvg = serializeCountryShapes(countryFeatures);
  const gridSvg = buildGridLines();
  const markerSvg = formatMarkersSvg(ATLAS_MARKERS);
  const regionCounts = buildRegionCounts();
  const totalCount = ALL_STORIES.length;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1024px; height: 1024px; overflow: hidden; background: #F6F1E5; color: #0F172A; font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; }
  .sheet { width: 1024px; height: 1024px; padding: 8px 12px 7px; display: flex; flex-direction: column; gap: 5px; }
  .header-block { border-top: 3.5px solid #0F172A; border-bottom: 1.5px solid #0F172A; padding: 2px 0 4px; flex-shrink: 0; }
  .edition-bar { display: flex; justify-content: space-between; font-size: 10px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
  .edition-bar .alert-ink { color: #991B1B; }
  .headline-main { text-align: center; font-family: Georgia, "Times New Roman", serif; font-size: 35px; font-weight: 900; letter-spacing: 0.015em; line-height: 1.02; color: #0B1220; margin: 1px 0; }
  .deck-line { text-align: center; font-size: 10.6px; font-weight: 800; letter-spacing: 0.02em; color: #7F1D1D; text-transform: uppercase; margin-bottom: 3px; }
  .stats-strip { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; border-top: 1px solid #CBD5E1; border-bottom: 1px solid #CBD5E1; padding: 2.5px 0; margin-bottom: 3px; }
  .stat-box { border-right: 1px solid #CBD5E1; padding: 0 5px; }
  .stat-box:last-child { border-right: none; }
  .stat-val { font-family: Georgia, serif; font-size: 16px; font-weight: 900; color: #7F1D1D; line-height: 1.05; }
  .stat-desc { font-size: 8.8px; font-weight: 700; color: #334155; line-height: 1.15; white-space: nowrap; }
  .mix-strip { display: grid; height: 15px; border-radius: 2px; overflow: hidden; }
  .mix-cell { font-size: 8.8px; font-weight: 900; color: #FFF; display: flex; align-items: center; justify-content: center; letter-spacing: 0.03em; white-space: nowrap; }

  .lead-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; height: 184px; flex-shrink: 0; }
  .lead-card { background: #FFFDF8; border: 1.4px solid #94A3B8; border-radius: 4px; padding: 5px 8px; display: flex; flex-direction: column; gap: 3px; overflow: hidden; }
  .lead-art { border-radius: 3px; overflow: hidden; height: 72px; flex-shrink: 0; }
  .lead-meta { display: flex; align-items: center; gap: 5px; }
  .num-dot { width: 17px; height: 17px; border-radius: 50%; color: #FFF; font-size: 10px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .place-lbl { font-size: 9.8px; font-weight: 900; color: #1E293B; letter-spacing: 0.03em; flex-grow: 1; }
  .chip-tag { color: #FFF; font-size: 8.5px; font-weight: 900; padding: 1.5px 5px; border-radius: 2px; }
  .lead-title { font-family: Georgia, "Times New Roman", serif; font-size: 15px; font-weight: 900; line-height: 1.09; color: #0F172A; }
  .lead-copy { font-size: 10.6px; font-weight: 600; line-height: 1.2; color: #1F2937; }

  .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 5px 7px; height: 248px; flex-shrink: 0; }
  .feat-card { background: #FFFDF8; border: 1.2px solid #94A3B8; border-radius: 4px; padding: 4px 7px; display: flex; align-items: center; gap: 7px; overflow: hidden; }
  .feat-icon { width: 46px; height: 60px; flex-shrink: 0; border-radius: 3px; overflow: hidden; }
  .feat-body { display: flex; flex-direction: column; gap: 1.5px; min-width: 0; flex-grow: 1; }
  .feat-meta { display: flex; align-items: center; justify-content: space-between; gap: 4px; }
  .feat-place { font-size: 8.7px; font-weight: 900; letter-spacing: 0.03em; white-space: nowrap; overflow: hidden; }
  .feat-num { width: 15px; height: 15px; border-radius: 50%; color: #FFF; font-size: 8.6px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .feat-title { font-family: Georgia, "Times New Roman", serif; font-size: 12px; font-weight: 900; line-height: 1.1; color: #0F172A; }
  .feat-copy { font-size: 9.8px; font-weight: 600; line-height: 1.16; color: #334155; }

  .lower-grid { display: grid; grid-template-columns: 368px 1fr; gap: 7px; flex: 1; min-height: 0; }
  .map-card, .wire-card { background: #FFFDF8; border: 1.3px solid #94A3B8; border-radius: 4px; padding: 5px 7px; display: flex; flex-direction: column; justify-content: space-between; min-height: 0; overflow: hidden; }
  .sub-head { display: flex; justify-content: space-between; font-size: 9.8px; font-weight: 900; letter-spacing: 0.04em; color: #0F172A; border-bottom: 1.2px solid #CBD5E1; padding-bottom: 2px; margin-bottom: 3px; flex-shrink: 0; }
  .sub-head .mark { color: #991B1B; }
  .atlas-box { border: 1px solid #94A3B8; border-radius: 3px; overflow: hidden; height: 212px; background: #D6E6F2; flex-shrink: 0; }
  .map-legend { display: flex; flex-wrap: wrap; gap: 3px 9px; font-size: 8.8px; font-weight: 800; color: #334155; padding-top: 2px; }
  .swatch { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 3px; vertical-align: middle; }
  .map-note { font-size: 8.6px; font-weight: 600; color: #475569; line-height: 1.18; border-top: 1px dotted #CBD5E1; padding-top: 2px; }
  .wire-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; flex: 1; min-height: 0; }
  .wire-col { display: flex; flex-direction: column; justify-content: space-between; min-height: 0; }
  .wire-entry { display: flex; align-items: flex-start; gap: 4px; font-size: 9.8px; line-height: 1.17; border-bottom: 1px dotted #E2E8F0; padding-bottom: 1.5px; }
  .wire-entry:last-child { border-bottom: none; padding-bottom: 0; }
  .wire-idx { font-size: 10px; font-weight: 900; flex-shrink: 0; min-width: 15px; }
  .wire-msg strong { color: #0F172A; }
  .wire-msg em { color: #64748B; font-style: normal; font-size: 8.8px; }

  .date-check { background: #7F1D1D; color: #FEF2F2; font-size: 8.8px; font-weight: 600; line-height: 1.22; padding: 4px 8px; border-radius: 3px; flex-shrink: 0; }
  .date-check strong { color: #FDE047; font-weight: 900; letter-spacing: 0.04em; }
  .colophon-bar { display: flex; justify-content: space-between; font-size: 8.7px; font-weight: 800; color: #334155; padding: 0 2px; flex-shrink: 0; }
</style>
</head>
<body>
  <div class="sheet">
    <header class="header-block">
      <div class="edition-bar">
        <span>THE WORLD IN ONE DAY</span>
        <span class="alert-ink">${totalCount} VERIFIED SINGLE-TOPIC STORIES · 7 REGIONS · STRICTLY WEDNESDAY 25 NOVEMBER 2026</span>
      </div>
      <div class="headline-main">WEDNESDAY · 25 NOVEMBER 2026</div>
      <div class="deck-line">SHENZHOU-24 PAKISTANI ASTRONAUT · CHEN JINING PROBE · HUAWEI 10/12 VERDICT · US 16-NATION TARIFFS · ABU DHABI TALKS</div>
      <div class="stats-strip">${formatStatsStrip()}</div>
      ${formatMixStrip(regionCounts)}
    </header>
    <section class="lead-grid">${formatHeroSection(LEAD_DISPATCHES)}</section>
    <section class="feat-grid">${formatFeatureGrid(FEATURE_DISPATCHES)}</section>
    <section class="lower-grid">
      <div class="map-card">
        <div class="sub-head"><span>WHERE IT HAPPENED</span><span class="mark">PINS MATCH STORY NUMBERS</span></div>
        <div class="atlas-box">
          <svg viewBox="0 0 ${ATLAS_WIDTH} ${ATLAS_HEIGHT}" width="${ATLAS_WIDTH}" height="${ATLAS_HEIGHT}">
            <rect width="${ATLAS_WIDTH}" height="${ATLAS_HEIGHT}" fill="#D6E6F2"/>
            <g stroke="#B8CDE0" stroke-width="0.6" stroke-dasharray="2,2">${gridSvg}</g>
            <g fill="#E5DFCE" stroke="#8A8270" stroke-width="0.65">${landSvg}</g>
            ${markerSvg}
          </svg>
        </div>
        <div class="map-legend">
          ${regionCounts.map((r) => `<span><i class="swatch" style="background:${r.color};"></i>${r.label} ${r.count}</span>`).join('')}
        </div>
        <div class="map-note">Natural Earth 110m vector projection with lead/feature locations and key regional wire hubs numbered above.</div>
      </div>
      <div class="wire-card">
        <div class="sub-head"><span>ALSO ON WEDNESDAY 25 NOVEMBER · ${WIRE_ITEMS.length} MORE DISPATCHES</span><span class="mark">ONE STORY PER NUMBER</span></div>
        <div class="wire-columns">
          <div class="wire-col">${formatWireColumn(WIRE_ITEMS.slice(0, 12))}</div>
          <div class="wire-col">${formatWireColumn(WIRE_ITEMS.slice(12, 24))}</div>
        </div>
      </div>
    </section>
    <div class="date-check">
      <strong>DATE CHECK · STRICTLY WED 25 NOV 2026:</strong> Every story broke or led global wires on Wednesday 25 November 2026 (UTC). Left out as earlier news: BepiColombo Mercury orbit (21 Nov), COP31 breakdown (22 Nov), Nvidia Huang reinstatement &amp; Hormuz initial mine reports (23–24 Nov), Nepal Koshi morning quake (24 Nov).
    </div>
    <footer class="colophon-bar">
      <span>Sources: Reuters, AP, BBC, Guardian, FT, CNA, Xinhua, Al Jazeera, Chosun, FTC, Antara, Oxfam, UNODC</span>
      <span>${totalCount} STORIES · ALL MAPS &amp; DRAWINGS ORIGINAL IN CODE</span>
    </footer>
  </div>
</body>
</html>`;
}

const rootDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
fs.writeFileSync(path.join(rootDir, 'broadsheet.html'), assembleDocument(), 'utf8');
console.log(`Generated V2 broadsheet.html (${ALL_STORIES.length} stories) for Wed 25 Nov 2026`);
