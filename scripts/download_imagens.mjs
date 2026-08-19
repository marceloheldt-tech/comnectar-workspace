import fs from 'fs';
import https from 'https';
import path from 'path';

const wines = JSON.parse(fs.readFileSync(new URL('./novidades_vinhos.json', import.meta.url), 'utf8'));
const data = JSON.parse(fs.readFileSync(new URL('./catalogo_dados.json', import.meta.url), 'utf8'));

function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const outDir = path.join(process.cwd(), 'conteudo', 'catalogos', '2026-08-19-novidades-comnectar', 'imagens');
fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

// data and wines were both fetched in the same CREATED_AT desc order; data was
// filtered by removing the single out-of-stock item, which was also last in wines.
// Match by produtor name contained in wine title as a sanity check, index as primary key.
const results = [];
for (let i = 0; i < data.length; i++) {
  const w = data[i];
  const wine = wines[i];
  const prodKey = norm(w.produtor.replace('Château', 'Chateau'));
  const titleNorm = norm(wine.title);
  if (!titleNorm.includes(prodKey.split(' ')[0]) && !titleNorm.includes(prodKey)) {
    results.push({ wine: w.nome, status: 'MISMATCH index ' + i + ' -> ' + wine.title });
    continue;
  }
  const url = wine.featuredImage?.url || wine.images?.edges?.[0]?.node?.url;
  if (!url) {
    results.push({ wine: w.nome, status: 'NAO ENCONTRADO' });
    continue;
  }
  const dest = path.join(outDir, `${w.img}.jpg`);
  try {
    await download(url, dest);
    results.push({ wine: w.nome, status: 'OK', matchedTitle: wine.title });
  } catch (e) {
    results.push({ wine: w.nome, status: 'ERRO: ' + e.message });
  }
}

console.log(JSON.stringify(results, null, 2));
