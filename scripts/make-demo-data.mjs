/**
 * make-demo-data.mjs
 * Randomizes institution names and updates agreement data for demo purposes.
 * Run: node scripts/make-demo-data.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

// ---------------------------------------------------------------------------
// Seeded deterministic random (so output is reproducible across runs)
// ---------------------------------------------------------------------------

function makeRand(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
    h >>>= 0;
  }
  return () => {
    h ^= h << 13; h ^= h >> 17; h ^= h << 5; h >>>= 0;
    return h / 4294967296;
  };
}

function pick(arr, rand) {
  return arr[Math.floor(rand() * arr.length)];
}

// ---------------------------------------------------------------------------
// Name word lists
// ---------------------------------------------------------------------------

// International education
const INTL_EDU_ADJECTIVES = [
  'Apex', 'Arcadia', 'Atlantic', 'Beacon', 'Briarwood', 'Broadfield', 'Caldwell',
  'Carrington', 'Cascade', 'Centerfield', 'Clearwater', 'Clifton', 'Coastal',
  'Columbia', 'Crestwood', 'Dalton', 'Dunmore', 'Eastbridge', 'Edgewood',
  'Elmwood', 'Emerald', 'Fairmont', 'Farmington', 'Forestview', 'Franklin',
  'Glenbrook', 'Glendale', 'Glenfield', 'Granville', 'Greenfield', 'Greenwood',
  'Harborview', 'Hartwell', 'Haverford', 'Hayford', 'Highfield', 'Highland',
  'Hillcrest', 'Horizon', 'Ironwood', 'Lakeview', 'Lakewood', 'Langford',
  'Larkspur', 'Laurel', 'Ledgewood', 'Linwood', 'Longwood', 'Maplewood',
  'Mercer', 'Meridian', 'Midfield', 'Midland', 'Millbrook', 'Millfield',
  'Montclair', 'Moorfield', 'Mornington', 'Mountfield', 'Nexus', 'Northfield',
  'Northgate', 'Northwood', 'Oakdale', 'Oakfield', 'Oakridge', 'Oceanview',
  'Orchard', 'Pacific', 'Pineview', 'Pinewood', 'Pioneer', 'Plainfield',
  'Queensbury', 'Ravensworth', 'Redwood', 'Regent', 'Ridgewood', 'Riverdale',
  'Riverside', 'Rockfield', 'Rockford', 'Rosewood', 'Royalfield', 'Sagebrook',
  'Saltwater', 'Sandford', 'Seabrook', 'Sentinel', 'Shoreview', 'Silverfield',
  'Skyline', 'Southbrook', 'Southfield', 'Springdale', 'Springfield', 'Sterling',
  'Stonebrook', 'Stonehaven', 'Stoneridge', 'Summit', 'Sunbrook', 'Sunfield',
  'Sunridge', 'Sutherland', 'Terrace', 'Thornfield', 'Thornwood', 'Tidewater',
  'Timberfield', 'Timberline', 'Valcourt', 'Valleybrook', 'Valleyfield',
  'Valleyview', 'Ventura', 'Wentworth', 'Westbrook', 'Westfield', 'Westgate',
  'Westwood', 'Whitebrook', 'Whitfield', 'Wildwood', 'Willowbrook', 'Willowfield',
  'Windsor', 'Woodbridge', 'Woodfield', 'Woodlands', 'Woodland', 'Wyndham',
];

const INTL_EDU_SUFFIXES = [
  'University', 'Institute of Technology', 'College', 'Academy',
  'School of Business', 'Institute of Science', 'College of Arts',
  'University of Applied Sciences', 'College of Engineering',
  'University of Technology', 'School of Management',
  'Graduate School', 'Business School', 'Polytechnic University',
];

// International industry / org
const INTL_IND_WORDS = [
  'Acorn', 'Aegis', 'Aether', 'Alcyone', 'Aldgate', 'Alliant', 'Alloy',
  'Altair', 'Altitude', 'Altus', 'Alvera', 'Ambion', 'Amplify', 'Amthor',
  'Anchor', 'Andover', 'Anfield', 'Anker', 'Anlyn', 'Anmore', 'Antler',
  'Anvil', 'Apex', 'Arbor', 'Arcadia', 'Arcana', 'Arcanum', 'Archer',
  'Arclight', 'Arctis', 'Ardent', 'Ardmore', 'Argent', 'Argos', 'Ariel',
  'Arion', 'Arista', 'Arith', 'Arken', 'Arkon', 'Arkwright', 'Arlan',
  'Arlen', 'Arlette', 'Arley', 'Arlin', 'Armada', 'Armis', 'Armor',
  'Arora', 'Arris', 'Arrow', 'Arroyo', 'Arshan', 'Artis', 'Arvid',
  'Ascan', 'Ascend', 'Asgard', 'Ashby', 'Asher', 'Ashfield', 'Ashford',
  'Ashlawn', 'Ashmont', 'Ashmore', 'Ashton', 'Aspen', 'Aspiro', 'Aston',
  'Athos', 'Atlas', 'Atmos', 'Atrium', 'Attain', 'Attain', 'Auric',
  'Aurora', 'Austern', 'Austral', 'Avalo', 'Avana', 'Avant', 'Avante',
  'Avantis', 'Avara', 'Avari', 'Avaris', 'Avarna', 'Avatar', 'Avaya',
  'Avena', 'Avenge', 'Avenir', 'Avent', 'Aveo', 'Avera', 'Averis',
  'Bolide', 'Borealis', 'Boreal', 'Bravura', 'Breeze', 'Bright',
  'Cadence', 'Caliber', 'Calico', 'Callisto', 'Camber', 'Canopy',
  'Cantor', 'Capella', 'Capstan', 'Cardinal', 'Carion', 'Caris',
  'Cascade', 'Castor', 'Catalyst', 'Celara', 'Celaris', 'Celeron',
  'Celsius', 'Celtica', 'Centris', 'Centrix', 'Cepheid', 'Ceres',
  'Cerium', 'Certis', 'Charis', 'Chariot', 'Chromis', 'Cintra',
  'Cirrus', 'Citera', 'Citrine', 'Citrix', 'Citro', 'Claris', 'Clarity',
  'Clarix', 'Clause', 'Clavian', 'Cleon', 'Clio', 'Cobalt', 'Codec',
  'Cohere', 'Cohesion', 'Colibri', 'Collation', 'Collis', 'Columba',
  'Comet', 'Compact', 'Compas', 'Compel', 'Compex', 'Comport',
  'Condor', 'Conduit', 'Confer', 'Conifer', 'Connex', 'Connix',
  'Consar', 'Consect', 'Conservis', 'Conseva', 'Consilio', 'Consort',
  'Constra', 'Contex', 'Contino', 'Contour', 'Convoy', 'Corant',
  'Corant', 'Corbet', 'Cordia', 'Cordian', 'Corean', 'Corean',
  'Corelink', 'Corem', 'Coremax', 'Corena', 'Corenat', 'Corenet',
];

const INTL_IND_SUFFIXES = [
  'Solutions', 'Technologies', 'International', 'Group', 'Partners',
  'Consulting', 'Services', 'Systems', 'Corporation', 'Holdings',
  'Enterprises', 'Associates', 'Labs', 'Analytics', 'Dynamics',
  'Innovations', 'Ventures', 'Networks', 'Digital', 'Global',
];

// Government
const INTL_GOV_TERMS = [
  'National Board', 'Federal Agency', 'Public Authority', 'National Council',
  'Regional Authority', 'State Agency', 'National Institute', 'Public Board',
  'National Commission', 'Federal Bureau', 'National Bureau', 'State Council',
  'Regional Council', 'Public Council', 'National Foundation', 'State Institute',
  'National Accreditation Board', 'Professional Licensing Board',
  'National Research Council', 'National Science Foundation',
  'Regional Development Authority', 'National Trade Council',
  'National Innovation Agency', 'National Quality Board',
  'National Standards Authority', 'Public Health Authority',
];

const INTL_GOV_AREAS = [
  'for Education', 'for Research', 'for Technology', 'for Science',
  'for Higher Education', 'for Innovation', 'for International Affairs',
  'for Industry', 'for Commerce', 'for Economic Development',
  'for Academic Affairs', 'for Standards', 'for Quality Assurance',
];

// Domestic Indonesian education
const IND_EDU_PREFIXES = [
  'Universitas', 'Institut', 'Sekolah Tinggi', 'Politeknik', 'Akademi',
  'Universitas', 'Universitas', 'Institut', // weighted towards Universitas
];

const IND_EDU_WORDS_A = [
  'Nusantara', 'Bhakti', 'Karya', 'Bangsa', 'Mandiri', 'Maju', 'Jaya',
  'Mulia', 'Prima', 'Utama', 'Bina', 'Cipta', 'Duta', 'Fajar', 'Gema',
  'Harapan', 'Ilmu', 'Karsa', 'Lestari', 'Mahkota', 'Nusa', 'Panca',
  'Raya', 'Sakti', 'Tama', 'Unggul', 'Wira', 'Cita', 'Dharma', 'Cendekia',
  'Wijaya', 'Mitra', 'Wahana', 'Buana', 'Pratama', 'Sinar', 'Berkah',
  'Sejahtera', 'Abadi', 'Agung', 'Alam', 'Andalan', 'Anugrah', 'Artha',
  'Astra', 'Atma', 'Bahari', 'Bakrie', 'Bali', 'Banten', 'Batam',
  'Batu', 'Baya', 'Bekasi', 'Berlian', 'Bersatu', 'Bijak', 'Binawan',
  'Bintang', 'Bodhi', 'Bogor', 'Buana', 'Budaya', 'Cahaya', 'Cakra',
  'Cendana', 'Cendekia', 'Cemerlang', 'Cerdas', 'Ceria', 'Citra',
  'Damai', 'Darma', 'Daya', 'Dedikasi', 'Deli', 'Delta', 'Depok',
  'Dinamis', 'Duta', 'Eksa', 'Emas', 'Era', 'Estika', 'Etika',
];

const IND_EDU_WORDS_B = [
  'Indonesia', 'Nusantara', 'Pancasila', 'Persada', 'Negeri', 'Swasta',
  'Nasional', 'Terpadu', 'Terbuka', 'Bersama', 'Merdeka', 'Moestopo',
  'Pembangunan', 'Pendidikan', 'Penelitian', 'Pengembangan',
  'Khatulistiwa', 'Balikpapan', 'Bandung', 'Banjarmasin', 'Banten',
  'Batam', 'Bengkulu', 'Bima', 'Bogor', 'Bojonegoro', 'Boyolali',
  'Brawijaya', 'Bukittinggi', 'Cirebon', 'Depok', 'Gorontalo',
  'Indonesia', 'Jambi', 'Jawa', 'Jember', 'Karawang', 'Kediri',
  'Kendari', 'Lampung', 'Madiun', 'Magelang', 'Makassar', 'Malang',
  'Maluku', 'Manado', 'Manokwari', 'Mataram', 'Medan', 'Mojokerto',
  'Padang', 'Palangka', 'Palembang', 'Palu', 'Pasundan', 'Pekanbaru',
  'Pontianak', 'Purwokerto', 'Samarinda', 'Semarang', 'Sorong',
  'Surabaya', 'Surakarta', 'Tangerang', 'Tasikmalaya', 'Ternate',
  'Timur', 'Tondano', 'Udayana', 'Wahid', 'Wisnuwardhana', 'Yogyakarta',
];

// Domestic Indonesian industry/org
const IND_ORG_PREFIXES = ['PT', 'CV', 'UD', 'Yayasan', 'Koperasi', 'Lembaga', 'Asosiasi'];
const IND_ORG_WORDS = [
  'Abadi', 'Agung', 'Alam', 'Andalan', 'Anugrah', 'Artha', 'Astra',
  'Bahari', 'Bakrie', 'Bali', 'Banten', 'Baru', 'Berdaya', 'Berkah',
  'Berlian', 'Bersatu', 'Bijak', 'Bintang', 'Cahaya', 'Cakra',
  'Cendana', 'Cemerlang', 'Cerdas', 'Ceria', 'Citra', 'Damai',
  'Darma', 'Daya', 'Delta', 'Dinamis', 'Eksa', 'Emas', 'Era',
  'Fajar', 'Gema', 'Gemilang', 'Harapan', 'Harmoni', 'Inovasi',
  'Inspirasi', 'Integrasi', 'Jaya', 'Karya', 'Kreasi', 'Lestari',
  'Maju', 'Makmur', 'Mandiri', 'Mas', 'Mitra', 'Mulia', 'Nusantara',
  'Perkasa', 'Perdana', 'Prima', 'Pratama', 'Raya', 'Sakti',
  'Sejahtera', 'Sentosa', 'Sinar', 'Solusi', 'Sukses', 'Tama',
  'Terpadu', 'Unggul', 'Utama', 'Wahana', 'Wijaya', 'Wira',
];

// Domestic Indonesian government
const IND_GOV_TERMS = [
  'Dinas Pendidikan', 'Badan Pengembangan', 'Lembaga Penelitian',
  'Dinas Ketenagakerjaan', 'Badan Kepegawaian', 'Dinas Kesehatan',
  'Balai Penelitian', 'Balai Pelatihan', 'Pusat Pengembangan',
  'Dinas Perindustrian', 'Balai Pengujian', 'Pusat Inovasi',
  'Badan Standardisasi', 'Lembaga Akreditasi', 'Dinas Koperasi',
  'Pusat Penelitian', 'Balai Diklat', 'Badan Koordinasi',
  'Dinas Perdagangan', 'Badan Riset', 'Lembaga Pelatihan',
  'Dinas Komunikasi', 'Badan Pengkajian', 'Pusat Data',
];

// School / SMA / SMP / SD
const IND_SCHOOL_PREFIXES = ['SMA', 'SMP', 'SD', 'SMK', 'SMAN', 'SMKN', 'MAN', 'MTsN'];
const IND_SCHOOL_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const IND_SCHOOL_CITIES = [
  'Surabaya', 'Jakarta', 'Bandung', 'Semarang', 'Medan', 'Makassar',
  'Yogyakarta', 'Malang', 'Bogor', 'Tangerang', 'Bekasi', 'Depok',
  'Palembang', 'Denpasar', 'Batam', 'Pekanbaru', 'Banjarmasin',
  'Samarinda', 'Padang', 'Pontianak', 'Manado', 'Mataram', 'Ambon',
  'Jayapura', 'Kendari', 'Kupang', 'Palu', 'Ternate', 'Sorong',
];

// ---------------------------------------------------------------------------
// Name generator
// ---------------------------------------------------------------------------

function generateName(inst, rand) {
  const types = inst.institution_types || [];
  const kind = inst.kind || 'International';
  const rawType = (inst.type || '').toLowerCase();

  // Detect school-level domestic institutions
  const nameUpper = (inst.name || '').toUpperCase();
  const isSchool = kind === 'Domestic' && (
    nameUpper.startsWith('SMA') || nameUpper.startsWith('SMK') ||
    nameUpper.startsWith('SMP') || nameUpper.startsWith('SD ') ||
    nameUpper.startsWith('SMAN') || nameUpper.startsWith('SMKN') ||
    nameUpper.startsWith('MAN ') || nameUpper.startsWith('MTsN')
  );

  if (isSchool) {
    const prefix = pick(IND_SCHOOL_PREFIXES, rand);
    const num = pick(IND_SCHOOL_NUMBERS, rand);
    const city = pick(IND_SCHOOL_CITIES, rand);
    return `${prefix} ${num} ${city}`;
  }

  if (kind === 'Domestic') {
    if (types.includes('education') || rawType === 'education') {
      const prefix = pick(IND_EDU_PREFIXES, rand);
      const wordA = pick(IND_EDU_WORDS_A, rand);
      const wordB = pick(IND_EDU_WORDS_B, rand);
      // Avoid same word twice
      const finalB = wordB === wordA ? pick(IND_EDU_WORDS_B, rand) : wordB;
      return `${prefix} ${wordA} ${finalB}`;
    }
    if (types.includes('government') || rawType === 'government') {
      const term = pick(IND_GOV_TERMS, rand);
      const city = pick(IND_SCHOOL_CITIES, rand);
      return `${term} ${city}`;
    }
    // default domestic → org/industry
    const prefix = pick(IND_ORG_PREFIXES.filter(p => p !== 'CV' && p !== 'UD'), rand);
    const word1 = pick(IND_ORG_WORDS, rand);
    const word2 = pick(IND_ORG_WORDS, rand);
    const finalW2 = word2 === word1 ? pick(IND_ORG_WORDS, rand) : word2;
    return `${prefix} ${word1} ${finalW2}`;
  }

  // International
  if (types.includes('education') || rawType === 'education') {
    const adj = pick(INTL_EDU_ADJECTIVES, rand);
    const suffix = pick(INTL_EDU_SUFFIXES, rand);
    return `${adj} ${suffix}`;
  }
  if (types.includes('government') || rawType === 'government') {
    const term = pick(INTL_GOV_TERMS, rand);
    const area = pick(INTL_GOV_AREAS, rand);
    return `${term} ${area}`;
  }
  // Industry / org / foundation
  const word = pick(INTL_IND_WORDS, rand);
  const suffix = pick(INTL_IND_SUFFIXES, rand);
  return `${word} ${suffix}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const institutions = JSON.parse(readFileSync(join(dataDir, 'institutions.json'), 'utf8'));
const agreements   = JSON.parse(readFileSync(join(dataDir, 'agreements.json'),   'utf8'));
const departments  = JSON.parse(readFileSync(join(dataDir, 'departments.json'),  'utf8'));

// Build institution mapping: id → { old_name, new_name, new_canonical }
const instMap = new Map();

// Track used names to avoid obvious duplicates
const usedNames = new Set();

for (const inst of institutions) {
  const rand = makeRand(inst.id + '-name-seed-v1');
  let name;
  let attempts = 0;
  do {
    name = generateName(inst, makeRand(inst.id + `-attempt-${attempts}`));
    attempts++;
  } while (usedNames.has(name) && attempts < 10);
  usedNames.add(name);

  // Canonical name = same as name (strip any city suffix from original)
  const canonical = name;

  instMap.set(inst.id, { oldName: inst.name, oldCanonical: inst.canonical_name, newName: name, newCanonical: canonical });
}

// Randomize institutions.json
const newInstitutions = institutions.map(inst => {
  const mapped = instMap.get(inst.id);
  return {
    ...inst,
    name: mapped.newName,
    canonical_name: mapped.newCanonical,
    address: sanitizeText(inst.address),
    city: sanitizeText(inst.city),
  };
});

// Randomize agreements.json
// - Update title if it matches the institution name (or canonical name)
// - Replace "Petra Business School" → "Meridian Business School"
// - Replace "UK Petra", "Universitas Kristen Petra" references in text fields

const PETRA_PATTERNS = [
  /\bUK Petra\b/g,
  /\bUniversitas Kristen Petra\b/g,
  /\bPetra Christian University\b/g,
  /\bPetra\b/g,
];

function sanitizeText(text) {
  if (!text || typeof text !== 'string') return text;
  let t = text;
  // Compound branded names first (before the standalone \bPetra\b catch-all)
  t = t.replace(/Petraverse/gi, 'Meridiverse');
  t = t.replace(/Petranesian/gi, 'Meridianesian');
  t = t.replace(/Petradent/gi, 'MeridianDent');
  t = t.replace(/Petra Togamas/gi, 'Meridian Bookstore');
  // Named phrases
  t = t.replace(/\bUK Petra\b/g, 'Meridian University');
  t = t.replace(/\bUniversitas Kristen Petra\b/g, 'Meridian University');
  t = t.replace(/\bPetra Christian University\b/g, 'Meridian University');
  t = t.replace(/\bPetra Business School\b/g, 'Meridian Business School');
  // Standalone word (word-boundary safe)
  t = t.replace(/\bPetra\b/gi, 'Meridian');
  // Strip parenthetical address riders that name other real universities
  // e.g. "(di Universitas Kristen Duta Wacana)" → removed
  t = t.replace(/\s*\(di Universitas [^)]+\)/gi, '');
  t = t.replace(/\s*\(di [^)]+\)/gi, '');
  return t.trim();
}

function sanitizeArray(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => typeof item === 'string' ? sanitizeText(item) : item);
}

const newAgreements = agreements.map(ag => {
  const mapped = ag.institution_id ? instMap.get(ag.institution_id) : null;

  // Update title: if it roughly matches the old institution name, swap it
  let newTitle = ag.title;
  if (mapped) {
    const oldNameLower = (mapped.oldName || '').toLowerCase();
    const oldCanonLower = (mapped.oldCanonical || '').toLowerCase();
    const titleLower = (ag.title || '').toLowerCase();

    // If the title starts with the canonical name or the full name, replace it
    if (titleLower.startsWith(oldCanonLower) || titleLower.startsWith(oldNameLower)) {
      newTitle = mapped.newName;
    } else if (oldCanonLower && titleLower.includes(oldCanonLower)) {
      newTitle = mapped.newName;
    }
  }

  // Sanitize remaining text fields
  newTitle = sanitizeText(newTitle);

  return {
    ...ag,
    title: newTitle,
    agenda: sanitizeText(ag.agenda),
    note: sanitizeText(ag.note),
    description: sanitizeText(ag.description),
    implementing_unit: sanitizeText(ag.implementing_unit),
    units: sanitizeArray(ag.units),
    scope: ag.scope, // keep scope tags as-is
    realization: sanitizeText(ag.realization),
  };
});

// Randomize departments.json — only "Petra Business School" needs renaming
const newDepartments = departments.map(dept => ({
  ...dept,
  name: sanitizeText(dept.name),
  short: sanitizeText(dept.short),
}));

// Write output
writeFileSync(
  join(dataDir, 'institutions.json'),
  JSON.stringify(newInstitutions, null, 2),
  'utf8',
);
console.log(`✓ Randomized ${newInstitutions.length} institutions`);

writeFileSync(
  join(dataDir, 'agreements.json'),
  JSON.stringify(newAgreements, null, 2),
  'utf8',
);
console.log(`✓ Updated ${newAgreements.length} agreements`);

writeFileSync(
  join(dataDir, 'departments.json'),
  JSON.stringify(newDepartments, null, 2),
  'utf8',
);
console.log(`✓ Updated ${newDepartments.length} departments`);

console.log('\nDone! Demo data written to data/');
