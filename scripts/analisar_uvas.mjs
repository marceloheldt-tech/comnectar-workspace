import fs from 'fs';

const merged = JSON.parse(fs.readFileSync('scripts/produtos_merged.json', 'utf8'));
const vinhos = merged.filter((p) => /^(Vinho|Espumante|Champagne)/.test(p.title));

function norm(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function canon(g) {
  const n = norm(g);
  if (n.includes('aragonez') || n.includes('tinta roriz') || n.includes('tinta del pais') || n === 'tempranillo') return 'Tempranillo';
  if (n.includes('prugnolo')) return 'Sangiovese';
  if (n.includes('garnacha') || n.includes('grenache')) return 'Grenache';
  if (n.includes('nebiollo')) return 'Nebbiolo';
  if (n.includes('mourvedre')) return 'Mourvèdre';
  return g.trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const results = [];
for (const p of vinhos) {
  let grapes = p.uva
    ? p.uva.split(/,|;| e | E /).map((g) => g.replace(/\(.*?\)/g, '').replace(/\d+%/g, '').trim()).filter(Boolean)
    : [];
  grapes = grapes.map(canon);
  if (grapes.length === 0 && /barolo/i.test(p.title)) grapes = ['Nebbiolo'];

  if (grapes.length === 1) {
    results.push({ title: p.title, grape: grapes[0], pct: 100, source: 'unica' });
    continue;
  }

  let found = null;

  // 1. percentages already in the uva metafield itself
  const uvaStr = p.uva || '';
  const pctInUva = [...uvaStr.matchAll(/([A-Za-zÀ-ú][A-Za-zÀ-ú\s/]*?)\s*\((\d{1,3})%\)/g)]
    .concat([...uvaStr.matchAll(/([A-Za-zÀ-ú][A-Za-zÀ-ú\s/]*?)\s+(\d{1,3})%/g)])
    .concat([...uvaStr.matchAll(/(\d{1,3})%\s+([A-Za-zÀ-ú][A-Za-zÀ-ú\s/]*)/g)].map(m => [m[0], m[2], m[1]]));
  for (const m of pctInUva) {
    const name = (m[1] || '').trim();
    const pct = parseInt(m[2]);
    if (name && pct >= 50) { found = { grape: canon(name), pct }; break; }
  }

  // 2. percentage near grape name in description
  if (!found && p.description) {
    for (const g of grapes) {
      const gEsc = escapeRegex(g);
      const re1 = new RegExp('(\\d{1,3})\\s*%\\s*(?:de\\s+)?' + gEsc, 'i');
      const re2 = new RegExp(gEsc + '[^.]{0,20}?\\((\\d{1,3})%\\)', 'i');
      const re3 = new RegExp(gEsc + '\\s+(\\d{1,3})%', 'i');
      const m = p.description.match(re1) || p.description.match(re2) || p.description.match(re3);
      if (m) {
        const pct = parseInt(m[1]);
        if (pct >= 50) { found = { grape: g, pct }; break; }
      }
    }
  }

  results.push({
    title: p.title,
    grape: found ? found.grape : null,
    pct: found ? found.pct : null,
    source: found ? 'desc/uva' : 'indeterminado',
    grapesList: grapes.join('|'),
  });
}

fs.writeFileSync('scripts/uva_ranking_raw.json', JSON.stringify(results, null, 2));
const withGrape = results.filter((r) => r.grape);
const indet = results.filter((r) => !r.grape);
console.log('Com uva dominante >=50%:', withGrape.length);
console.log('Indeterminado:', indet.length);
