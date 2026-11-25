// Generates a self-contained 1024x1024 editorial world news broadsheet HTML for Wed 25 Nov 2026 (V1).
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const topojson = require('topojson-client');
const worldAtlasPath = require.resolve('world-atlas/countries-110m.json');
const worldData = JSON.parse(readFileSync(worldAtlasPath, 'utf8'));
const countries = topojson.feature(worldData, worldData.objects.countries);

const MAP_W = 466;
const MAP_H = 244;
const LON_MIN = -170;
const LON_MAX = 180;
const LAT_MIN = -54;
const LAT_MAX = 78;

function project(lon, lat) {
  const cLon = Math.max(LON_MIN, Math.min(LON_MAX, lon));
  const cLat = Math.max(LAT_MIN, Math.min(LAT_MAX, lat));
  return [
    ((cLon - LON_MIN) / (LON_MAX - LON_MIN)) * MAP_W,
    ((LAT_MAX - cLat) / (LAT_MAX - LAT_MIN)) * MAP_H,
  ];
}

function ringToPath(ring) {
  if (!ring || ring.length < 3) return '';
  let d = '';
  let prevLon = ring[0][0];
  for (let i = 0; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    const [x, y] = project(lon, lat);
    if (i > 0 && Math.abs(lon - prevLon) > 180) {
      d += `M${x.toFixed(1)},${y.toFixed(1)}`;
    } else {
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    prevLon = lon;
  }
  return d + 'Z';
}

function geomToPath(geom) {
  if (!geom) return '';
  if (geom.type === 'Polygon') return geom.coordinates.map(ringToPath).join(' ');
  if (geom.type === 'MultiPolygon') return geom.coordinates.map((p) => p.map(ringToPath).join(' ')).join(' ');
  return '';
}

const countryPaths = countries.features
  .filter((f) => String(f.id) !== '010')
  .map((f) => `<path d="${geomToPath(f.geometry)}" />`)
  .join('\n');

let graticules = '';
for (let lon = -150; lon <= 150; lon += 30) {
  const [x1, y1] = project(lon, LAT_MAX);
  const [x2, y2] = project(lon, LAT_MIN);
  graticules += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />\n`;
}
for (let lat = -40; lat <= 60; lat += 20) {
  const [x1, y1] = project(LON_MIN, lat);
  const [x2, y2] = project(LON_MAX, lat);
  graticules += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />\n`;
}

const heroStories = [
  {
    id: 1,
    location: 'JIUQUAN · SPACE',
    tag: 'FIRST FOREIGNER',
    color: '#0F766E',
    headline: 'China launches Shenzhou-24 with Pakistani',
    summary: 'Lifts off 00:19 UTC to Tiangong; Muhammad Zeeshan Ali is 1st foreign astronaut. (CNA, Xinhua)',
    scene: `<svg viewBox="0 0 300 72" width="100%" height="72">
      <defs>
        <linearGradient id="spaceSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#042F2E"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <rect width="300" height="72" rx="4" fill="url(#spaceSky)"/>
      <circle cx="28" cy="14" r="1.2" fill="#E2E8F0"/><circle cx="74" cy="18" r="1" fill="#94A3B8"/>
      <circle cx="145" cy="12" r="1.4" fill="#FDE047"/><circle cx="268" cy="16" r="1.2" fill="#E2E8F0"/>
      <path d="M0 64 Q150 48 300 66 L300 72 L0 72 Z" fill="#0EA5E9" opacity="0.28"/>
      <g transform="translate(36,12) rotate(-18 18 28)">
        <path d="M14 48 L10 58 L22 52 Z" fill="#F97316"/>
        <ellipse cx="16" cy="56" rx="4" ry="7" fill="#FACC15" opacity="0.9"/>
        <rect x="12" y="16" width="8" height="32" rx="2" fill="#F8FAFC"/>
        <polygon points="16,4 11,16 21,16" fill="#EF4444"/>
        <rect x="8" y="34" width="4" height="14" rx="1" fill="#CBD5E1"/>
        <rect x="20" y="34" width="4" height="14" rx="1" fill="#CBD5E1"/>
      </g>
      <g transform="translate(106,16)">
        <rect x="0" y="14" width="54" height="6" rx="2" fill="#94A3B8"/>
        <rect x="20" y="6" width="14" height="22" rx="2" fill="#E2E8F0"/>
        <rect x="4" y="2" width="12" height="10" fill="#0284C7" stroke="#7DD3FC" stroke-width="0.8"/>
        <rect x="38" y="2" width="12" height="10" fill="#0284C7" stroke="#7DD3FC" stroke-width="0.8"/>
        <rect x="4" y="22" width="12" height="10" fill="#0284C7" stroke="#7DD3FC" stroke-width="0.8"/>
        <rect x="38" y="22" width="12" height="10" fill="#0284C7" stroke="#7DD3FC" stroke-width="0.8"/>
      </g>
      <rect x="174" y="12" width="116" height="48" rx="4" fill="#064E3B" stroke="#34D399" stroke-width="1.4"/>
      <text x="232" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#A7F3D0">00:19 UTC · TIANGONG</text>
      <text x="232" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF">CN + PK CREW</text>
      <text x="232" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="800" fill="#6EE7B7">3 ASTRONAUTS</text>
    </svg>`,
  },
  {
    id: 2,
    location: 'SEOUL & TOKYO · MARKETS',
    tag: 'KOSPI -4.8%',
    color: '#B91C1C',
    headline: 'Asian chip stocks plunge; Kospi halts sells',
    summary: 'Kospi sinks 4.8% below 5,000 triggering sidecar; Nikkei falls 2.6% on AI rout. (Chosun, TV)',
    scene: `<svg viewBox="0 0 300 72" width="100%" height="72">
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
    </svg>`,
  },
  {
    id: 3,
    location: 'IOWA · UNITED STATES',
    tag: '09:00 CST BLAST',
    color: '#B45309',
    headline: 'US Army sets 5-ton lead azide blast today',
    summary: 'Controlled detonation of 68 unstable drums at Middletown; 5-mile evacuation zone. (AP, Army)',
    scene: `<svg viewBox="0 0 300 72" width="100%" height="72">
      <rect width="300" height="72" rx="4" fill="#1C1917"/>
      <circle cx="62" cy="36" r="28" fill="#451A03" stroke="#F59E0B" stroke-width="1.2" stroke-dasharray="3,2"/>
      <circle cx="62" cy="36" r="17" fill="#78350F" stroke="#FBBF24" stroke-width="1.4"/>
      <polygon points="62,22 74,45 50,45" fill="#FACC15" stroke="#1C1917" stroke-width="1.2"/>
      <text x="62" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#1C1917">!</text>
      <rect x="108" y="10" width="182" height="52" rx="4" fill="#292524" stroke="#F59E0B" stroke-width="1.4"/>
      <text x="199" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#FDE047">IOWA ARMY AMMO PLANT</text>
      <text x="199" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF">68 DRUMS · 5-MILE ZONE</text>
      <text x="199" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.5" font-weight="800" fill="#FED7AA">LEAD PLUME ALERT · SHELTER</text>
    </svg>`,
  },
];

const midStories = [
  {
    id: 4,
    banner: 'EU-BALKANS SUMMIT',
    location: 'BRUSSELS · EUROPE',
    tag: 'TODAY',
    color: '#1D4ED8',
    headline: 'EU leaders host Balkans integration summit',
    summary: 'Von der Leyen & Costa review growth plan; Montenegro closes 25 chapters. (Europa)',
    badge: `<rect x="4" y="4" width="22" height="14" rx="2" fill="#1E3A8A"/><circle cx="15" cy="11" r="4.5" fill="none" stroke="#FACC15" stroke-width="1.6" stroke-dasharray="2,1.6"/>`,
  },
  {
    id: 5,
    banner: 'SECURITY TREATY',
    location: 'CANBERRA · OCEANIA',
    tag: 'SIGNED WED',
    color: '#0369A1',
    headline: 'Australia, Solomons sign historic defense pact',
    summary: 'PMs Albanese & Wale sign Canberra treaty barring foreign bases. (ABC, PM)',
    badge: `<rect x="4" y="4" width="22" height="14" rx="2" fill="#0369A1"/><circle cx="15" cy="11" r="4.2" fill="none" stroke="#FFFFFF" stroke-width="1.8"/>`,
  },
  {
    id: 6,
    banner: 'GULF ESCALATION',
    location: 'DOHA & GULF · MIDEAST',
    tag: 'ALERT',
    color: '#991B1B',
    headline: 'US Gulf embassies issue Houthi attack alert',
    summary: 'Doha mission warns Americans of drone and airspace threats amid blockade. (AJ)',
    badge: `<polygon points="15,3 25,18 5,18" fill="#FACC15"/><text x="15" y="16" text-anchor="middle" font-family="Arial" font-size="10" font-weight="900" fill="#7F1D1D">!</text>`,
  },
  {
    id: 7,
    banner: 'INDIA-NEPAL PACTS',
    location: 'NEW DELHI · ASIA',
    tag: '10-PT VISION',
    color: '#047857',
    headline: 'India, Nepal ink air & infrastructure deals',
    summary: 'PM Balendra Shah wraps Delhi visit; MoUs open Bhairahawa-Lucknow route. (ANN)',
    badge: `<rect x="4" y="4" width="22" height="4.5" fill="#F97316"/><rect x="4" y="8.5" width="22" height="5" fill="#FFFFFF"/><rect x="4" y="13.5" width="22" height="4.5" fill="#15803D"/>`,
  },
  {
    id: 8,
    banner: 'HORN MEDIATION',
    location: 'ADDIS ABABA · AFRICA',
    tag: 'ENVOYS',
    color: '#9A3412',
    headline: 'Beijing sends envoys to ease Horn crisis',
    summary: 'Diplomats visit Ethiopia, Egypt, Eritrea & Djibouti to avert regional war. (AJ)',
    badge: `<circle cx="15" cy="11" r="7" fill="#FDE047"/><path d="M10 11 L20 11 M15 6 L15 16" stroke="#9A3412" stroke-width="2"/>`,
  },
  {
    id: 9,
    banner: 'RECESSION RISK',
    location: 'BUENOS AIRES · LATAM',
    tag: '-1.8% Q3',
    color: '#4338CA',
    headline: 'Argentina nears technical recession in Q3',
    summary: 'INDEC shows 1.8% activity contraction, testing Milei before 2027 vote. (FT)',
    badge: `<rect x="4" y="4" width="22" height="4.5" fill="#38BDF8"/><rect x="4" y="8.5" width="22" height="5" fill="#FFFFFF"/><rect x="4" y="13.5" width="22" height="4.5" fill="#38BDF8"/>`,
  },
  {
    id: 10,
    banner: 'INFLATION SURGE',
    location: 'SYDNEY · OCEANIA',
    tag: '4.9% CPI',
    color: '#0284C7',
    headline: 'Australia inflation jumps to 4.9% on power',
    summary: 'October CPI tops forecasts from 4.3%, lifting Aussie dollar & rate bets. (ABS)',
    badge: `<polyline points="5,16 11,13 17,9 25,5" fill="none" stroke="#FFFFFF" stroke-width="2.2"/><polygon points="26,4 21,5 25,9" fill="#FFFFFF"/>`,
  },
  {
    id: 11,
    banner: 'UN GLOBAL BRIEF',
    location: 'GENEVA · GLOBAL',
    tag: 'NOV 25 DATA',
    color: '#6D28D9',
    headline: 'UN: 47,000 women killed by partners/kin',
    summary: 'UNODC Nov 25 brief flags Africa highest per capita (2.9 per 100k). (UNODC)',
    badge: `<circle cx="15" cy="11" r="7" fill="none" stroke="#FFFFFF" stroke-width="1.8"/><circle cx="15" cy="11" r="2.5" fill="#FDE047"/>`,
  },
];

const briefs = [
  { id: 12, label: 'UK-Germany Grid', text: 'NeuConnect subsea power link hits milestone linking clean grids.', src: 'RN', color: '#1D4ED8' },
  { id: 13, label: 'Russia & Brunei', text: 'Putin hosts Brunei Sultan Bolkiah in Moscow for trade talks.', src: 'Kremlin', color: '#1D4ED8' },
  { id: 14, label: 'UK Healthcare', text: 'BMJ 10-nation study ranks UK family doctors highest in stress.', src: 'BMJ', color: '#1D4ED8' },
  { id: 15, label: 'Thailand Economy', text: 'BOT warns informal "grey" economy hit 48% of GDP vs 33% avg.', src: 'ThaiEnq', color: '#0F766E' },
  { id: 16, label: 'Korea / Sea', text: 'Seoul prepares repatriation of rescued North Korean boat crew.', src: 'NK News', color: '#0F766E' },
  { id: 17, label: 'Brazil / WTO', text: 'IOM aids Tupanciretã storm recovery; Brazil seeks US tariff panel.', src: 'IOM, WTO', color: '#4338CA' },
  { id: 18, label: 'Mexico / Sinaloa', text: 'Guasave raid captures cartel boss "El Chapo Isidro"; 11 dead.', src: 'AP, MND', color: '#B45309' },
  { id: 19, label: 'US / Markets', text: 'Nasdaq & chip index (-7.9%) slide on AI spend & US tariff plans.', src: 'LAT, NBR', color: '#B45309' },
  { id: 20, label: 'Gaza & Lebanon', text: 'Strikes hit Gaza security chief; MSF flags clinic damage in Lebanon.', src: 'MSF', color: '#991B1B' },
  { id: 21, label: 'UNAIDS & Africa', text: 'UNAIDS flags $4.3B funding gap; Somalia-UAE tensions escalate.', src: 'UN, GI', color: '#9A3412' },
  { id: 22, label: 'UCL & NBA Cup', text: 'Champions League MD5 kicks off (PSG-Roma); 9-game NBA Cup slate.', src: 'NBC, ESPN', color: '#1D4ED8' },
  { id: 23, label: 'India / Sport', text: 'India rout China 6–2 in Asian hockey; Sooryavanshi hits 28-ball 100.', src: 'TOI', color: '#047857' },
];

const mapPinList = [
  { id: 1, lon: 98.5, lat: 40.9, color: '#0F766E' },
  { id: 2, lon: 127.0, lat: 37.6, color: '#B91C1C' },
  { id: 3, lon: -91.3, lat: 40.8, color: '#B45309' },
  { id: 4, lon: 8.5, lat: 47.5, color: '#1D4ED8' },
  { id: 5, lon: 149.1, lat: -35.3, color: '#0369A1' },
  { id: 6, lon: 53.5, lat: 24.5, color: '#991B1B' },
  { id: 7, lon: 77.2, lat: 27.5, color: '#047857' },
  { id: 8, lon: 35.0, lat: 10.5, color: '#9A3412' },
  { id: 9, lon: -58.4, lat: -34.6, color: '#4338CA' },
  { id: 13, lon: 37.6, lat: 55.8, color: '#1D4ED8' },
  { id: 14, lon: -5.5, lat: 56.0, color: '#1D4ED8' },
  { id: 15, lon: 100.5, lat: 13.7, color: '#0F766E' },
  { id: 17, lon: -47.9, lat: -15.8, color: '#4338CA' },
  { id: 18, lon: -108.4, lat: 25.6, color: '#B45309' },
  { id: 19, lon: -74.0, lat: 40.7, color: '#B45309' },
  { id: 20, lon: 34.5, lat: 32.5, color: '#991B1B' },
  { id: 21, lon: 48.0, lat: 2.0, color: '#9A3412' },
];

const pinsSvg = mapPinList
  .map((p) => {
    const [x, y] = project(p.lon, p.lat);
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
      <circle r="8.6" fill="${p.color}" stroke="#FFFFFF" stroke-width="1.8"/>
      <text y="3.2" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#FFFFFF">${p.id}</text>
    </g>`;
  })
  .join('\n');

function renderHeroCard(s) {
  return `<div class="hero-card">
    <div class="hero-top">
      <span class="badge" style="background:${s.color};">${s.id}</span>
      <span class="loc">${s.location}</span>
      <span class="pill" style="background:${s.color};">${s.tag}</span>
    </div>
    <div class="hero-scene">${s.scene}</div>
    <div class="hero-hed">${s.headline}</div>
    <div class="hero-sum">${s.summary}</div>
  </div>`;
}

function renderMidCard(s) {
  return `<div class="mid-card">
    <div class="mid-banner" style="background:${s.color};">
      <svg viewBox="0 0 30 22" width="28" height="20">${s.badge}</svg>
      <span>${s.banner}</span>
    </div>
    <div class="mid-body">
      <div class="mid-meta">
        <span class="badge-sm" style="background:${s.color};">${s.id}</span>
        <span class="mid-loc">${s.location}</span>
        <span class="mid-tag" style="color:${s.color};">${s.tag}</span>
      </div>
      <div class="mid-hed">${s.headline}</div>
      <div class="mid-sum">${s.summary}</div>
    </div>
  </div>`;
}

function renderBrief(b) {
  return `<div class="brief-item">
    <span class="brief-num" style="color:${b.color};">${b.id}</span>
    <span class="brief-txt"><strong>${b.label}:</strong> ${b.text} <em>(${b.src})</em></span>
  </div>`;
}

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1024px;
    height: 1024px;
    overflow: hidden;
    background: #F6F1E5;
    color: #0F172A;
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }
  .page {
    width: 1024px;
    height: 1024px;
    padding: 10px 14px 8px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .masthead {
    border-top: 4px solid #0F172A;
    border-bottom: 2px solid #0F172A;
    padding-top: 3px;
    padding-bottom: 4px;
  }
  .top-strip {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.06em;
    color: #0F172A;
    text-transform: uppercase;
  }
  .top-strip .red { color: #991B1B; }
  .title-line {
    text-align: center;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 37px;
    font-weight: 900;
    letter-spacing: 0.02em;
    line-height: 1.03;
    color: #0B1220;
    margin: 1px 0 2px 0;
  }
  .sub-deck {
    text-align: center;
    font-size: 11.8px;
    font-weight: 900;
    letter-spacing: 0.03em;
    color: #7F1D1D;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .region-bar {
    display: grid;
    grid-template-columns: 6fr 5fr 2fr 3fr 2fr 3fr 2fr;
    height: 15px;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
  }
  .rb-seg {
    font-size: 9.5px;
    font-weight: 900;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0.04em;
  }
  .timeline {
    background: #111827;
    color: #F8FAFC;
    font-size: 10.6px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 3px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    white-space: nowrap;
  }
  .timeline .tl-k { color: #FACC15; font-weight: 900; }
  .timeline .tl-t { color: #93C5FD; font-weight: 900; }

  .hero-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    height: 204px;
  }
  .hero-card {
    background: #FFFDF8;
    border: 1.5px solid #94A3B8;
    border-radius: 5px;
    padding: 7px 9px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .hero-top { display: flex; align-items: center; gap: 6px; }
  .badge {
    width: 20px; height: 20px; border-radius: 50%;
    color: #FFFFFF; font-size: 11.5px; font-weight: 900;
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .loc { font-size: 11px; font-weight: 900; color: #1E293B; letter-spacing: 0.03em; flex-grow: 1; }
  .pill { color: #FFFFFF; font-size: 9.6px; font-weight: 900; padding: 2px 6px; border-radius: 3px; letter-spacing: 0.03em; }
  .hero-scene { border-radius: 4px; overflow: hidden; height: 72px; }
  .hero-hed { font-family: Georgia, "Times New Roman", serif; font-size: 17.4px; font-weight: 900; line-height: 1.1; color: #0F172A; }
  .hero-sum { font-size: 12.1px; font-weight: 600; line-height: 1.24; color: #1F2937; }

  .mid-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    height: 146px;
  }
  .mid-card {
    background: #FFFDF8;
    border: 1.5px solid #94A3B8;
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .mid-banner {
    height: 25px; padding: 0 7px;
    display: flex; align-items: center; gap: 6px;
    color: #FFFFFF; font-size: 10.5px; font-weight: 900; letter-spacing: 0.05em;
  }
  .mid-body { padding: 6px 8px; display: flex; flex-direction: column; gap: 3px; }
  .mid-meta { display: flex; align-items: center; gap: 5px; }
  .badge-sm {
    width: 17px; height: 17px; border-radius: 50%;
    color: #FFFFFF; font-size: 10px; font-weight: 900;
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .mid-loc { font-size: 9.6px; font-weight: 900; color: #334155; flex-grow: 1; white-space: nowrap; }
  .mid-tag { font-size: 9.4px; font-weight: 900; white-space: nowrap; }
  .mid-hed { font-family: Georgia, "Times New Roman", serif; font-size: 14.6px; font-weight: 900; line-height: 1.12; color: #0F172A; }
  .mid-sum { font-size: 11.5px; font-weight: 600; line-height: 1.22; color: #1F2937; }

  .bottom-row {
    display: grid;
    grid-template-columns: 482px 1fr;
    gap: 8px;
    height: 300px;
  }
  .atlas-panel, .briefs-panel {
    background: #FFFDF8;
    border: 1.5px solid #94A3B8;
    border-radius: 5px;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .panel-head {
    display: flex; justify-content: space-between;
    font-size: 10.5px; font-weight: 900; letter-spacing: 0.05em;
    color: #0F172A; border-bottom: 1.5px solid #CBD5E1;
    padding-bottom: 3px; margin-bottom: 4px;
  }
  .panel-head .accent { color: #991B1B; }
  .map-wrap { border: 1px solid #94A3B8; border-radius: 4px; overflow: hidden; height: 244px; background: #D6E6F2; }
  .legend { display: flex; justify-content: space-between; font-size: 9.5px; font-weight: 800; color: #334155; padding-top: 3px; }
  .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 3px; vertical-align: middle; }

  .briefs-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; height: 262px; }
  .brief-col { display: flex; flex-direction: column; justify-content: space-between; }
  .brief-item { display: flex; align-items: flex-start; gap: 5px; font-size: 11px; line-height: 1.2; border-bottom: 1px dotted #E2E8F0; padding-bottom: 2px; }
  .brief-item:last-child { border-bottom: none; padding-bottom: 0; }
  .brief-num { font-size: 11.4px; font-weight: 900; flex-shrink: 0; min-width: 15px; }
  .brief-txt strong { color: #0F172A; }
  .brief-txt em { color: #475569; font-style: italic; font-size: 10.1px; }

  .footer {
    background: #0F172A; color: #F8FAFC;
    font-size: 10.5px; font-weight: 800;
    padding: 5px 10px; border-radius: 4px;
    display: flex; justify-content: space-between; align-items: center;
  }
</style>
</head>
<body>
  <div class="page">
    <header class="masthead">
      <div class="top-strip">
        <span>THE WORLD IN ONE DAY</span>
        <span class="red">23 VERIFIED DISPATCHES · 7 REGIONS · STRICTLY WEDNESDAY 25 NOVEMBER 2026</span>
      </div>
      <div class="title-line">WEDNESDAY · 25 NOVEMBER 2026</div>
      <div class="sub-deck">SHENZHOU-24 PAKISTANI ASTRONAUT · KOSPI CIRCUIT BREAKER · IOWA ARMY BLAST · EU-BALKANS SUMMIT</div>
      <div class="region-bar">
        <div class="rb-seg" style="background:#0F766E;">ASIA 6</div>
        <div class="rb-seg" style="background:#1D4ED8;">EUROPE 5</div>
        <div class="rb-seg" style="background:#991B1B;">MIDEAST 2</div>
        <div class="rb-seg" style="background:#B45309;">N.AM 3</div>
        <div class="rb-seg" style="background:#0369A1;">OCEANIA 2</div>
        <div class="rb-seg" style="background:#9A3412;">AFRICA 2</div>
        <div class="rb-seg" style="background:#4338CA;">LATAM/UN 3</div>
      </div>
      <div class="timeline">
        <span><span class="tl-k">UTC TIMELINE:</span> <span class="tl-t">00:19</span> Shenzhou-24 launch</span>
        <span><span class="tl-t">00:30</span> Kospi -4.8% &amp; AU 4.9% CPI</span>
        <span><span class="tl-t">04:00</span> Canberra-Solomons pact</span>
        <span><span class="tl-t">09:00</span> EU-Balkans &amp; Horn envoys</span>
        <span><span class="tl-t">15:00</span> Iowa 5-ton Army blast</span>
      </div>
    </header>

    <section class="hero-row">
      ${heroStories.map(renderHeroCard).join('\n')}
    </section>

    <section class="mid-row">
      ${midStories.slice(0, 4).map(renderMidCard).join('\n')}
    </section>

    <section class="mid-row">
      ${midStories.slice(4, 8).map(renderMidCard).join('\n')}
    </section>

    <section class="bottom-row">
      <div class="atlas-panel">
        <div class="panel-head">
          <span>GLOBAL DISPATCH ATLAS · WEDNESDAY 25 NOV 2026</span>
          <span class="accent">PINS 1–9 · 13–15 · 17–21</span>
        </div>
        <div class="map-wrap">
          <svg viewBox="0 0 ${MAP_W} ${MAP_H}" width="${MAP_W}" height="${MAP_H}">
            <rect width="${MAP_W}" height="${MAP_H}" fill="#D6E6F2"/>
            <g stroke="#B8CDE0" stroke-width="0.6" stroke-dasharray="2,2">${graticules}</g>
            <g fill="#E5DFCE" stroke="#8A8270" stroke-width="0.65">${countryPaths}</g>
            ${pinsSvg}
          </svg>
        </div>
        <div class="legend">
          <span><i class="dot" style="background:#0F766E;"></i>Asia</span>
          <span><i class="dot" style="background:#1D4ED8;"></i>Europe</span>
          <span><i class="dot" style="background:#991B1B;"></i>Mideast</span>
          <span><i class="dot" style="background:#B45309;"></i>N.Am</span>
          <span><i class="dot" style="background:#0369A1;"></i>Oceania</span>
          <span><i class="dot" style="background:#9A3412;"></i>Africa</span>
          <span><i class="dot" style="background:#4338CA;"></i>LatAm/UN</span>
        </div>
      </div>

      <div class="briefs-panel">
        <div class="panel-head">
          <span>ALSO ON WED 25 NOV · 12 MORE BRIEFS</span>
          <span class="accent">ALL 7 REGIONS</span>
        </div>
        <div class="briefs-cols">
          <div class="brief-col">${briefs.slice(0, 6).map(renderBrief).join('\n')}</div>
          <div class="brief-col">${briefs.slice(6, 12).map(renderBrief).join('\n')}</div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <span>25 NOV EDITION · Strictly Wednesday 25 November 2026 events · Xinhua, CNA, Chosun, AP, Europa, ABS, Al Jazeera, FT, BMJ, ESPN</span>
      <span>23 DISPATCHES · 7 REGIONS · NATURAL EARTH</span>
    </footer>
  </div>
</body>
</html>`;

writeFileSync(new URL('../broadsheet.html', import.meta.url), html, 'utf8');
console.log('Wrote V1 broadsheet.html (23 dispatches, 7 regions, Natural Earth vector)');
