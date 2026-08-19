import { wines, flags } from './alexandre_catalog_data.mjs';
import { writeFileSync } from 'fs';

const dir = 'C:/Users/marce/Desktop/claude comnéctar/conteudo/catalogos/2026-08-19-alexandre-tintos';

function cardHtml(w) {
  const flagB64 = flags[w.paisSigla];
  const flagImg = flagB64
    ? `<img class="flag-img" src="data:image/svg+xml;base64,${flagB64}" alt="${w.paisSigla}"> `
    : '';
  return `    <div class="card">
      <div class="card-photo"><img src="./imagens/${w.slug}.jpg" alt=""></div>
      <div class="card-line"></div>
      <div class="card-info">
        <p class="wine-name">${w.displayName}</p>
        <p class="wine-location">${flagImg}${w.pais} · ${w.regiao}</p>
        <p class="wine-grape">${w.uva}</p>
        <p class="wine-alcohol">${w.teor} vol.</p>
        <div class="spacer"></div>
        <div class="price-block">
          <p class="price-original">De R$ ${w.priceFull}</p>
          <p class="price-discount">R$ ${w.priceFinal}</p>
        </div>
      </div>
    </div>`;
}

function pageHtml(pageNum, pageWines, isGrid2 = false) {
  const gridClass = isGrid2 ? 'grid-2' : 'grid';
  const extraStyle = isGrid2 ? `
<style>
  .grid-2 {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 20px; flex: 1; min-height: 0;
  }
  .grid-2 .card-photo { height: 850px; }
  .grid-2 .card-photo img { max-height: 834px; max-width: 94%; }
</style>` : '';
  const cards = pageWines.map(cardHtml).join('\n');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./_shared.css">${extraStyle}
</head>
<body>
<div class="page">
  <div class="header">
    <span class="header-label">Vinhos Tintos para Alexandre</span>
  </div>
  <div class="${gridClass}">
${cards}
  </div>
  <div class="footer"><img src="../../../dados/gota-transparente.png" alt=""></div>
</div>
</body>
</html>
`;
}

// Distribution: pages 1-18 = 4 wines each (72), page 19 = 3 wines, page 20 = 2 wines (grid-2)
let cursor = 0;
let pageCount = 0;
for (let p = 1; p <= 18; p++) {
  const pageWines = wines.slice(cursor, cursor + 4);
  cursor += 4;
  writeFileSync(`${dir}/catalog-p${p}.html`, pageHtml(p, pageWines, false));
  pageCount++;
}
// page 19: 3 wines
{
  const pageWines = wines.slice(cursor, cursor + 3);
  cursor += 3;
  writeFileSync(`${dir}/catalog-p19.html`, pageHtml(19, pageWines, false));
  pageCount++;
}
// page 20: 2 wines, grid-2
{
  const pageWines = wines.slice(cursor, cursor + 2);
  cursor += 2;
  writeFileSync(`${dir}/catalog-p20.html`, pageHtml(20, pageWines, true));
  pageCount++;
}

console.log('Wines placed:', cursor, '/', wines.length);
console.log('Pages generated:', pageCount);
