// Builds broadsheet.html for Wednesday 25 November 2026 (23 dispatches, 7 regions, Natural Earth 110m).
import * as fs from 'node:fs';
import * as module from 'node:module';
import * as path from 'node:path';
import * as url from 'node:url';

const loadPkg = module.createRequire(import.meta.url);
const topoClient = loadPkg('topojson-client');
const atlasJsonPath = loadPkg.resolve('world-atlas/countries-110m.json');
const atlasPayload = JSON.parse(fs.readFileSync(atlasJsonPath, 'utf8'));
const countryFeatures = topoClient.feature(atlasPayload, atlasPayload.objects.countries).features;

const ATLAS_WIDTH = 466;
const ATLAS_HEIGHT = 244;
const MIN_LON = -170;
const MAX_LON = 180;
const MIN_LAT = -54;
const MAX_LAT = 78;

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

function createSpaceScene() {
  return `<svg viewBox="0 0 300 72" width="100%" height="72">
    <defs><linearGradient id="skyOrbital" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#042F2E"/><stop offset="100%" stop-color="#0F172A"/></linearGradient></defs>
    <rect width="300" height="72" rx="4" fill="url(#skyOrbital)"/>
    <circle cx="28" cy="14" r="1.2" fill="#E2E8F0"/><circle cx="74" cy="18" r="1" fill="#94A3B8"/>
    <circle cx="145" cy="12" r="1.4" fill="#FDE047"/><circle cx="268" cy="16" r="1.2" fill="#E2E8F0"/>
    <path d="M0 64 Q150 48 300 66 L300 72 L0 72 Z" fill="#0EA5E9" opacity="0.28"/>
    <g transform="translate(36,12) rotate(-18 18 28)">
      <path d="M14 48 L10 58 L22 52 Z" fill="#F97316"/><ellipse cx="16" cy="56" rx="4" ry="7" fill="#FACC15" opacity="0.9"/>
      <rect x="12" y="16" width="8" height="32" rx="2" fill="#F8FAFC"/><polygon points="16,4 11,16 21,16" fill="#EF4444"/>
      <rect x="8" y="34" width="4" height="14" rx="1" fill="#CBD5E1"/><rect x="20" y="34" width="4" height="14" rx="1" fill="#CBD5E1"/>
    </g>
    <g transform="translate(106,16)">
      <rect x="0" y="14" width="54" height="6" rx="2" fill="#94A3B8"/><rect x="20" y="6" width="14" height="22" rx="2" fill="#E2E8F0"/>
      <rect x="4" y="2" width="12" height="10" fill="#0284C7" stroke="#7DD3FC" stroke-width="0.8"/><rect x="38" y="2" width="12" height="10" fill="#0284C7" stroke="#7DD3FC" stroke-width="0.8"/>
      <rect x="4" y="22" width="12" height="10" fill="#0284C7" stroke="#7DD3FC" stroke-width="0.8"/><rect x="38" y="22" width="12" height="10" fill="#0284C7" stroke="#7DD3FC" stroke-width="0.8"/>
    </g>
    <rect x="174" y="12" width="116" height="48" rx="4" fill="#064E3B" stroke="#34D399" stroke-width="1.4"/>
    <text x="232" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#A7F3D0">00:19 UTC · TIANGONG</text>
    <text x="232" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF">CN + PK CREW</text>
    <text x="232" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="800" fill="#6EE7B7">3 ASTRONAUTS</text>
  </svg>`;
}

function createMarketsScene() {
  return `<svg viewBox="0 0 300 72" width="100%" height="72">
    <rect width="300" height="72" rx="4" fill="#1E1014"/>
    <line x1="10" y1="18" x2="290" y2="18" stroke="#451A22" stroke-width="1" stroke-dasharray="3,3"/>
    <line x1="10" y1="36" x2="290" y2="36" stroke="#451A22" stroke-width="1" stroke-dasharray="3,3"/>
    <line x1="10" y1="54" x2="290" y2="54" stroke="#451A22" stroke-width="1"/>
    <polyline points="16,14 44,20 72,17 104,35 128,41 154,57" fill="none" stroke="#F87171" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="160,60 146,59 154,49" fill="#F87171"/>
    <rect x="12" y="45" width="112" height="19" rx="3" fill="#450A0A" stroke="#EF4444" stroke-width="1.3"/>
    <text x="68" y="57.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.2" font-weight="900" fill="#FECACA">SIDECAR TRIGGERED</text>
    <rect x="172" y="10" width="118" height="48" rx="4" fill="#7F1D1D" stroke="#FCA5A5" stroke-width="1.4"/>
    <text x="231" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="10.5" font-weight="900" fill="#FFFFFF">KOSPI -4.8%</text>
    <text x="231" y="39" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#FDE047">NIKKEI -2.6%</text>
    <text x="231" y="52" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="800" fill="#FECACA">SAMSUNG / SK -7%</text>
  </svg>`;
}

function createHazardScene() {
  return `<svg viewBox="0 0 300 72" width="100%" height="72">
    <rect width="300" height="72" rx="4" fill="#1C1917"/>
    <circle cx="62" cy="36" r="28" fill="#451A03" stroke="#F59E0B" stroke-width="1.2" stroke-dasharray="3,2"/>
    <circle cx="62" cy="36" r="17" fill="#78350F" stroke="#FBBF24" stroke-width="1.4"/>
    <polygon points="62,22 74,45 50,45" fill="#FACC15" stroke="#1C1917" stroke-width="1.2"/>
    <text x="62" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#1C1917">!</text>
    <rect x="108" y="10" width="182" height="52" rx="4" fill="#292524" stroke="#F59E0B" stroke-width="1.4"/>
    <text x="199" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#FDE047">IOWA ARMY AMMO PLANT</text>
    <text x="199" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF">68 DRUMS · 5-MILE ZONE</text>
    <text x="199" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.5" font-weight="800" fill="#FED7AA">LEAD PLUME ALERT · SHELTER</text>
  </svg>`;
}

const LEAD_DISPATCHES = [
  { id: 1, place: 'JIUQUAN · SPACE', chip: 'FIRST FOREIGNER', tone: '#0F766E', title: 'China launches Shenzhou-24 with Pakistani', blurb: 'Lifts off 00:19 UTC to Tiangong; Muhammad Zeeshan Ali is 1st foreign astronaut. (CNA, Xinhua)', art: createSpaceScene() },
  { id: 2, place: 'SEOUL & TOKYO · MARKETS', chip: 'KOSPI -4.8%', tone: '#B91C1C', title: 'Asian chip stocks plunge; Kospi halts sells', blurb: 'Kospi sinks 4.8% below 5,000 triggering sidecar; Nikkei falls 2.6% on AI rout. (Chosun, TV)', art: createMarketsScene() },
  { id: 3, place: 'IOWA · UNITED STATES', chip: '09:00 CST BLAST', tone: '#B45309', title: 'US Army sets 5-ton lead azide blast today', blurb: 'Controlled detonation of 68 unstable drums at Middletown; 5-mile evacuation zone. (AP, Army)', art: createHazardScene() },
];

const FEATURE_DISPATCHES = [
  { id: 4, header: 'EU-BALKANS SUMMIT', place: 'BRUSSELS · EUROPE', chip: 'TODAY', tone: '#1D4ED8', title: 'EU leaders host Balkans integration summit', blurb: 'Von der Leyen & Costa review growth plan; Montenegro closes 25 chapters. (Europa)', icon: '<rect x="4" y="4" width="22" height="14" rx="2" fill="#1E3A8A"/><circle cx="15" cy="11" r="4.5" fill="none" stroke="#FACC15" stroke-width="1.6" stroke-dasharray="2,1.6"/>' },
  { id: 5, header: 'SECURITY TREATY', place: 'CANBERRA · OCEANIA', chip: 'SIGNED WED', tone: '#0369A1', title: 'Australia, Solomons sign historic defense pact', blurb: 'PMs Albanese & Wale sign Canberra treaty barring foreign bases. (ABC, PM)', icon: '<rect x="4" y="4" width="22" height="14" rx="2" fill="#0369A1"/><circle cx="15" cy="11" r="4.2" fill="none" stroke="#FFFFFF" stroke-width="1.8"/>' },
  { id: 6, header: 'GULF ESCALATION', place: 'DOHA & GULF · MIDEAST', chip: 'ALERT', tone: '#991B1B', title: 'US Gulf embassies issue Houthi attack alert', blurb: 'Doha mission warns Americans of drone and airspace threats amid blockade. (AJ)', icon: '<polygon points="15,3 25,18 5,18" fill="#FACC15"/><text x="15" y="16" text-anchor="middle" font-family="Arial" font-size="10" font-weight="900" fill="#7F1D1D">!</text>' },
  { id: 7, header: 'INDIA-NEPAL PACTS', place: 'NEW DELHI · ASIA', chip: '10-PT VISION', tone: '#047857', title: 'India, Nepal ink air & infrastructure deals', blurb: 'PM Balendra Shah wraps Delhi visit; MoUs open Bhairahawa-Lucknow route. (ANN)', icon: '<rect x="4" y="4" width="22" height="4.5" fill="#F97316"/><rect x="4" y="8.5" width="22" height="5" fill="#FFFFFF"/><rect x="4" y="13.5" width="22" height="4.5" fill="#15803D"/>' },
  { id: 8, header: 'HORN MEDIATION', place: 'ADDIS ABABA · AFRICA', chip: 'ENVOYS', tone: '#9A3412', title: 'Beijing sends envoys to ease Horn crisis', blurb: 'Diplomats visit Ethiopia, Egypt, Eritrea & Djibouti to avert regional war. (AJ)', icon: '<circle cx="15" cy="11" r="7" fill="#FDE047"/><path d="M10 11 L20 11 M15 6 L15 16" stroke="#9A3412" stroke-width="2"/>' },
  { id: 9, header: 'RECESSION RISK', place: 'BUENOS AIRES · LATAM', chip: '-1.8% Q3', tone: '#4338CA', title: 'Argentina nears technical recession in Q3', blurb: 'INDEC shows 1.8% activity contraction, testing Milei before 2027 vote. (FT)', icon: '<rect x="4" y="4" width="22" height="4.5" fill="#38BDF8"/><rect x="4" y="8.5" width="22" height="5" fill="#FFFFFF"/><rect x="4" y="13.5" width="22" height="4.5" fill="#38BDF8"/>' },
  { id: 10, header: 'INFLATION SURGE', place: 'SYDNEY · OCEANIA', chip: '4.9% CPI', tone: '#0284C7', title: 'Australia inflation jumps to 4.9% on power', blurb: 'October CPI tops forecasts from 4.3%, lifting Aussie dollar & rate bets. (ABS)', icon: '<polyline points="5,16 11,13 17,9 25,5" fill="none" stroke="#FFFFFF" stroke-width="2.2"/><polygon points="26,4 21,5 25,9" fill="#FFFFFF"/>' },
  { id: 11, header: 'UN GLOBAL BRIEF', place: 'GENEVA · GLOBAL', chip: 'NOV 25 DATA', tone: '#6D28D9', title: 'UN: 47,000 women killed by partners/kin', blurb: 'UNODC Nov 25 brief flags Africa highest per capita (2.9 per 100k). (UNODC)', icon: '<circle cx="15" cy="11" r="7" fill="none" stroke="#FFFFFF" stroke-width="1.8"/><circle cx="15" cy="11" r="2.5" fill="#FDE047"/>' },
];

const WIRE_ITEMS = [
  { id: 12, head: 'UK-Germany Grid', body: 'NeuConnect subsea power link hits milestone linking clean grids.', credit: 'RN', tone: '#1D4ED8' },
  { id: 13, head: 'Russia & Brunei', body: 'Putin hosts Brunei Sultan Bolkiah in Moscow for trade talks.', credit: 'Kremlin', tone: '#1D4ED8' },
  { id: 14, head: 'UK Healthcare', body: 'BMJ 10-nation study ranks UK family doctors highest in stress.', credit: 'BMJ', tone: '#1D4ED8' },
  { id: 15, head: 'Thailand Economy', body: 'BOT warns informal "grey" economy hit 48% of GDP vs 33% avg.', credit: 'ThaiEnq', tone: '#0F766E' },
  { id: 16, head: 'Korea / Sea', body: 'Seoul prepares repatriation of rescued North Korean boat crew.', credit: 'NK News', tone: '#0F766E' },
  { id: 17, head: 'Brazil / WTO', body: 'IOM aids Tupanciretã storm recovery; Brazil seeks US tariff panel.', credit: 'IOM, WTO', tone: '#4338CA' },
  { id: 18, head: 'Mexico / Sinaloa', body: 'Guasave raid captures cartel boss "El Chapo Isidro"; 11 dead.', credit: 'AP, MND', tone: '#B45309' },
  { id: 19, head: 'US / Markets', body: 'Nasdaq & chip index (-7.9%) slide on AI spend & US tariff plans.', credit: 'LAT, NBR', tone: '#B45309' },
  { id: 20, head: 'Gaza & Lebanon', body: 'Strikes hit Gaza security chief; MSF flags clinic damage in Lebanon.', credit: 'MSF', tone: '#991B1B' },
  { id: 21, head: 'UNAIDS & Africa', body: 'UNAIDS flags $4.3B funding gap; Somalia-UAE tensions escalate.', credit: 'UN, GI', tone: '#9A3412' },
  { id: 22, head: 'UCL & NBA Cup', body: 'Champions League MD5 kicks off (PSG-Roma); 9-game NBA Cup slate.', credit: 'NBC, ESPN', tone: '#1D4ED8' },
  { id: 23, head: 'India / Sport', body: 'India rout China 6–2 in Asian hockey; Sooryavanshi hits 28-ball 100.', credit: 'TOI', tone: '#047857' },
];

const ATLAS_MARKERS = [
  { id: 1, lon: 98.5, lat: 40.9, tone: '#0F766E' },
  { id: 2, lon: 127.0, lat: 37.6, tone: '#B91C1C' },
  { id: 3, lon: -91.3, lat: 40.8, tone: '#B45309' },
  { id: 4, lon: 8.5, lat: 47.5, tone: '#1D4ED8' },
  { id: 5, lon: 149.1, lat: -35.3, tone: '#0369A1' },
  { id: 6, lon: 53.5, lat: 24.5, tone: '#991B1B' },
  { id: 7, lon: 77.2, lat: 27.5, tone: '#047857' },
  { id: 8, lon: 35.0, lat: 10.5, tone: '#9A3412' },
  { id: 9, lon: -58.4, lat: -34.6, tone: '#4338CA' },
  { id: 13, lon: 37.6, lat: 55.8, tone: '#1D4ED8' },
  { id: 14, lon: -5.5, lat: 56.0, tone: '#1D4ED8' },
  { id: 15, lon: 100.5, lat: 13.7, tone: '#0F766E' },
  { id: 17, lon: -47.9, lat: -15.8, tone: '#4338CA' },
  { id: 18, lon: -108.4, lat: 25.6, tone: '#B45309' },
  { id: 19, lon: -74.0, lat: 40.7, tone: '#B45309' },
  { id: 20, lon: 34.5, lat: 32.5, tone: '#991B1B' },
  { id: 21, lon: 48.0, lat: 2.0, tone: '#9A3412' },
];

function formatMarkersSvg(markers) {
  return markers
    .map((m) => {
      const [cx, cy] = projectGeoPoint(m.lon, m.lat);
      return `<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)})"><circle r="8.6" fill="${m.tone}" stroke="#FFF" stroke-width="1.8"/><text y="3.2" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#FFF">${m.id}</text></g>`;
    })
    .join('\n');
}

function formatHeroSection(items) {
  return items
    .map(
      (d) => `<div class="lead-card">
      <div class="lead-meta"><span class="num-dot" style="background:${d.tone};">${d.id}</span><span class="place-lbl">${d.place}</span><span class="chip-tag" style="background:${d.tone};">${d.chip}</span></div>
      <div class="lead-art">${d.art}</div>
      <div class="lead-title">${d.title}</div>
      <div class="lead-copy">${d.blurb}</div>
    </div>`
    )
    .join('\n');
}

function formatFeatureGrid(items) {
  return items
    .map(
      (d) => `<div class="story-card">
      <div class="story-strip" style="background:${d.tone};"><svg viewBox="0 0 30 22" width="28" height="20">${d.icon}</svg><span>${d.header}</span></div>
      <div class="story-inner">
        <div class="story-meta"><span class="num-sm" style="background:${d.tone};">${d.id}</span><span class="story-place">${d.place}</span><span class="story-chip" style="color:${d.tone};">${d.chip}</span></div>
        <div class="story-title">${d.title}</div>
        <div class="story-copy">${d.blurb}</div>
      </div>
    </div>`
    )
    .join('\n');
}

function formatWireColumn(items) {
  return items
    .map((w) => `<div class="wire-entry"><span class="wire-idx" style="color:${w.tone};">${w.id}</span><span class="wire-msg"><strong>${w.head}:</strong> ${w.body} <em>(${w.credit})</em></span></div>`)
    .join('\n');
}

function assembleDocument() {
  const landSvg = serializeCountryShapes(countryFeatures);
  const gridSvg = buildGridLines();
  const markerSvg = formatMarkersSvg(ATLAS_MARKERS);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1024px; height: 1024px; overflow: hidden; background: #F6F1E5; color: #0F172A; font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; }
  .sheet { width: 1024px; height: 1024px; padding: 10px 14px 8px; display: flex; flex-direction: column; gap: 6px; }
  .header-block { border-top: 4px solid #0F172A; border-bottom: 2px solid #0F172A; padding: 3px 0 4px; }
  .edition-bar { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; }
  .edition-bar .alert-ink { color: #991B1B; }
  .headline-main { text-align: center; font-family: Georgia, "Times New Roman", serif; font-size: 37px; font-weight: 900; letter-spacing: 0.02em; line-height: 1.03; color: #0B1220; margin: 1px 0 2px; }
  .deck-line { text-align: center; font-size: 11.8px; font-weight: 900; letter-spacing: 0.03em; color: #7F1D1D; text-transform: uppercase; margin-bottom: 4px; }
  .mix-strip { display: grid; grid-template-columns: 6fr 5fr 2fr 3fr 2fr 3fr 2fr; height: 15px; border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
  .mix-cell { font-size: 9.5px; font-weight: 900; color: #FFF; display: flex; align-items: center; justify-content: center; letter-spacing: 0.04em; }
  .utc-ribbon { background: #111827; color: #F8FAFC; font-size: 10.6px; font-weight: 700; padding: 3px 8px; border-radius: 3px; display: flex; justify-content: space-between; align-items: center; white-space: nowrap; }
  .utc-ribbon .key-gold { color: #FACC15; font-weight: 900; }
  .utc-ribbon .stamp-sky { color: #93C5FD; font-weight: 900; }
  .lead-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; height: 204px; }
  .lead-card { background: #FFFDF8; border: 1.5px solid #94A3B8; border-radius: 5px; padding: 7px 9px; display: flex; flex-direction: column; gap: 4px; }
  .lead-meta { display: flex; align-items: center; gap: 6px; }
  .num-dot { width: 20px; height: 20px; border-radius: 50%; color: #FFF; font-size: 11.5px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .place-lbl { font-size: 11px; font-weight: 900; color: #1E293B; letter-spacing: 0.03em; flex-grow: 1; }
  .chip-tag { color: #FFF; font-size: 9.6px; font-weight: 900; padding: 2px 6px; border-radius: 3px; letter-spacing: 0.03em; }
  .lead-art { border-radius: 4px; overflow: hidden; height: 72px; }
  .lead-title { font-family: Georgia, "Times New Roman", serif; font-size: 17.4px; font-weight: 900; line-height: 1.1; color: #0F172A; }
  .lead-copy { font-size: 12.1px; font-weight: 600; line-height: 1.24; color: #1F2937; }
  .story-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; height: 146px; }
  .story-card { background: #FFFDF8; border: 1.5px solid #94A3B8; border-radius: 5px; overflow: hidden; display: flex; flex-direction: column; }
  .story-strip { height: 25px; padding: 0 7px; display: flex; align-items: center; gap: 6px; color: #FFF; font-size: 10.5px; font-weight: 900; letter-spacing: 0.05em; }
  .story-inner { padding: 6px 8px; display: flex; flex-direction: column; gap: 3px; }
  .story-meta { display: flex; align-items: center; gap: 5px; }
  .num-sm { width: 17px; height: 17px; border-radius: 50%; color: #FFF; font-size: 10px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .story-place { font-size: 9.6px; font-weight: 900; color: #334155; flex-grow: 1; white-space: nowrap; }
  .story-chip { font-size: 9.4px; font-weight: 900; white-space: nowrap; }
  .story-title { font-family: Georgia, "Times New Roman", serif; font-size: 14.6px; font-weight: 900; line-height: 1.12; color: #0F172A; }
  .story-copy { font-size: 11.5px; font-weight: 600; line-height: 1.22; color: #1F2937; }
  .lower-grid { display: grid; grid-template-columns: 482px 1fr; gap: 8px; height: 300px; }
  .map-card, .wire-card { background: #FFFDF8; border: 1.5px solid #94A3B8; border-radius: 5px; padding: 6px 8px; display: flex; flex-direction: column; justify-content: space-between; }
  .sub-head { display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 900; letter-spacing: 0.05em; color: #0F172A; border-bottom: 1.5px solid #CBD5E1; padding-bottom: 3px; margin-bottom: 4px; }
  .sub-head .mark { color: #991B1B; }
  .atlas-box { border: 1px solid #94A3B8; border-radius: 4px; overflow: hidden; height: 244px; background: #D6E6F2; }
  .key-row { display: flex; justify-content: space-between; font-size: 9.5px; font-weight: 800; color: #334155; padding-top: 3px; }
  .swatch { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 3px; vertical-align: middle; }
  .wire-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; height: 262px; }
  .wire-col { display: flex; flex-direction: column; justify-content: space-between; }
  .wire-entry { display: flex; align-items: flex-start; gap: 5px; font-size: 11px; line-height: 1.2; border-bottom: 1px dotted #E2E8F0; padding-bottom: 2px; }
  .wire-entry:last-child { border-bottom: none; padding-bottom: 0; }
  .wire-idx { font-size: 11.4px; font-weight: 900; flex-shrink: 0; min-width: 15px; }
  .wire-msg strong { color: #0F172A; }
  .wire-msg em { color: #475569; font-style: italic; font-size: 10.1px; }
  .colophon-bar { background: #0F172A; color: #F8FAFC; font-size: 10.5px; font-weight: 800; padding: 5px 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
</style>
</head>
<body>
  <div class="sheet">
    <header class="header-block">
      <div class="edition-bar">
        <span>THE WORLD IN ONE DAY</span>
        <span class="alert-ink">23 VERIFIED DISPATCHES · 7 REGIONS · STRICTLY WEDNESDAY 25 NOVEMBER 2026</span>
      </div>
      <div class="headline-main">WEDNESDAY · 25 NOVEMBER 2026</div>
      <div class="deck-line">SHENZHOU-24 PAKISTANI ASTRONAUT · KOSPI CIRCUIT BREAKER · IOWA ARMY BLAST · EU-BALKANS SUMMIT</div>
      <div class="mix-strip">
        <div class="mix-cell" style="background:#0F766E;">ASIA 6</div>
        <div class="mix-cell" style="background:#1D4ED8;">EUROPE 5</div>
        <div class="mix-cell" style="background:#991B1B;">MIDEAST 2</div>
        <div class="mix-cell" style="background:#B45309;">N.AM 3</div>
        <div class="mix-cell" style="background:#0369A1;">OCEANIA 2</div>
        <div class="mix-cell" style="background:#9A3412;">AFRICA 2</div>
        <div class="mix-cell" style="background:#4338CA;">LATAM/UN 3</div>
      </div>
      <div class="utc-ribbon">
        <span><span class="key-gold">UTC TIMELINE:</span> <span class="stamp-sky">00:19</span> Shenzhou-24 launch</span>
        <span><span class="stamp-sky">00:30</span> Kospi -4.8% &amp; AU 4.9% CPI</span>
        <span><span class="stamp-sky">04:00</span> Canberra-Solomons pact</span>
        <span><span class="stamp-sky">09:00</span> EU-Balkans &amp; Horn envoys</span>
        <span><span class="stamp-sky">15:00</span> Iowa 5-ton Army blast</span>
      </div>
    </header>
    <section class="lead-grid">${formatHeroSection(LEAD_DISPATCHES)}</section>
    <section class="story-grid">${formatFeatureGrid(FEATURE_DISPATCHES.slice(0, 4))}</section>
    <section class="story-grid">${formatFeatureGrid(FEATURE_DISPATCHES.slice(4, 8))}</section>
    <section class="lower-grid">
      <div class="map-card">
        <div class="sub-head"><span>GLOBAL DISPATCH ATLAS · WEDNESDAY 25 NOV 2026</span><span class="mark">PINS 1–9 · 13–15 · 17–21</span></div>
        <div class="atlas-box">
          <svg viewBox="0 0 ${ATLAS_WIDTH} ${ATLAS_HEIGHT}" width="${ATLAS_WIDTH}" height="${ATLAS_HEIGHT}">
            <rect width="${ATLAS_WIDTH}" height="${ATLAS_HEIGHT}" fill="#D6E6F2"/>
            <g stroke="#B8CDE0" stroke-width="0.6" stroke-dasharray="2,2">${gridSvg}</g>
            <g fill="#E5DFCE" stroke="#8A8270" stroke-width="0.65">${landSvg}</g>
            ${markerSvg}
          </svg>
        </div>
        <div class="key-row">
          <span><i class="swatch" style="background:#0F766E;"></i>Asia</span>
          <span><i class="swatch" style="background:#1D4ED8;"></i>Europe</span>
          <span><i class="swatch" style="background:#991B1B;"></i>Mideast</span>
          <span><i class="swatch" style="background:#B45309;"></i>N.Am</span>
          <span><i class="swatch" style="background:#0369A1;"></i>Oceania</span>
          <span><i class="swatch" style="background:#9A3412;"></i>Africa</span>
          <span><i class="swatch" style="background:#4338CA;"></i>LatAm/UN</span>
        </div>
      </div>
      <div class="wire-card">
        <div class="sub-head"><span>ALSO ON WED 25 NOV · 12 MORE BRIEFS</span><span class="mark">ALL 7 REGIONS</span></div>
        <div class="wire-columns">
          <div class="wire-col">${formatWireColumn(WIRE_ITEMS.slice(0, 6))}</div>
          <div class="wire-col">${formatWireColumn(WIRE_ITEMS.slice(6, 12))}</div>
        </div>
      </div>
    </section>
    <footer class="colophon-bar">
      <span>25 NOV EDITION · Strictly Wednesday 25 November 2026 events · Xinhua, CNA, Chosun, AP, Europa, ABS, Al Jazeera, FT, BMJ, ESPN</span>
      <span>23 DISPATCHES · 7 REGIONS · NATURAL EARTH</span>
    </footer>
  </div>
</body>
</html>`;
}

const rootDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
fs.writeFileSync(path.join(rootDir, 'broadsheet.html'), assembleDocument(), 'utf8');
console.log('Generated clean broadsheet.html for Wed 25 Nov 2026');
