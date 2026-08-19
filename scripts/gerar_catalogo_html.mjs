import fs from 'fs';
import path from 'path';

const data = JSON.parse(fs.readFileSync(new URL('./catalogo_dados.json', import.meta.url), 'utf8'));
const outDir = path.join(process.cwd(), 'conteudo', 'catalogos', '2026-08-19-novidades-comnectar');

const FLAGS = {
  FR: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDIzOTUiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2VkMjkzOSIvPjwvc3ZnPg==',
  IT: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDkyNDYiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2NlMmIzNyIvPjwvc3ZnPg==',
  CL: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIxIiB3aWR0aD0iMyIgaGVpZ2h0PSIxIiBmaWxsPSIjRDUyQjFFIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMzA4NyIvPjwvc3ZnPg==',
  UY: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIwLjIyMiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIwLjY2NiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIxLjExMSIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIxLjU1NiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48L3N2Zz4=',
  BR: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDljM2IiLz48cG9seWdvbiBwb2ludHM9IjEuNSwwLjI1IDIuODUsMSAxLjUsMS43NSAwLjE1LDEiIGZpbGw9IiNmZmRmMDAiLz48Y2lyY2xlIGN4PSIxLjUiIGN5PSIxIiByPSIwLjUiIGZpbGw9IiMwMDI3NzYiLz48L3N2Zz4=',
  US: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSIwLjA3NjkyMzA3NjkyMzA3NjkzIiBmaWxsPSIjQjIyMjM0Ii8+PHJlY3QgeT0iMC4xNTM4NDYxNTM4NDYxNTM4NSIgd2lkdGg9IjMiIGhlaWdodD0iMC4wNzY5MjMwNzY5MjMwNzY5MyIgZmlsbD0iI0IyMjIzNCIvPjxyZWN0IHk9IjAuMzA3NjkyMzA3NjkyMzA3NyIgd2lkdGg9IjMiIGhlaWdodD0iMC4wNzY5MjMwNzY5MjMwNzY5MyIgZmlsbD0iI0IyMjIzNCIvPjxyZWN0IHk9IjAuNDYxNTM4NDYxNTM4NDYxNTYiIHdpZHRoPSIzIiBoZWlnaHQ9IjAuMDc2OTIzMDc2OTIzMDc2OTMiIGZpbGw9IiNCMjIyMzQiLz48cmVjdCB5PSIwLjYxNTM4NDYxNTM4NDYxNTQiIHdpZHRoPSIzIiBoZWlnaHQ9IjAuMDc2OTIzMDc2OTIzMDc2OTMiIGZpbGw9IiNCMjIyMzQiLz48cmVjdCB5PSIwLjc2OTIzMDc2OTIzMDc2OTMiIHdpZHRoPSIzIiBoZWlnaHQ9IjAuMDc2OTIzMDc2OTIzMDc2OTMiIGZpbGw9IiNCMjIyMzQiLz48cmVjdCB5PSIwLjkyMzA3NjkyMzA3NjkyMzEiIHdpZHRoPSIzIiBoZWlnaHQ9IjAuMDc2OTIzMDc2OTIzMDc2OTMiIGZpbGw9IiNCMjIyMzQiLz48cmVjdCB3aWR0aD0iMS4yIiBoZWlnaHQ9IjEuMDc2OTIzMDc2OTIzMDc2OSIgZmlsbD0iIzNDM0I2RSIvPjwvc3ZnPg==',
};

const COUNTRY_NAMES = { FR: 'França', IT: 'Itália', CL: 'Chile', UY: 'Uruguai', BR: 'Brasil', US: 'Estados Unidos' };

function flagImg(pais) {
  return `<img class="flag-img" src="data:image/svg+xml;base64,${FLAGS[pais]}" alt="${pais}">`;
}

function fmtPrice(n) {
  return n.toLocaleString('pt-BR');
}

function cardHtml(w) {
  return `
    <div class="card">
      <div class="card-photo">
        <img src="./imagens/${w.img}.jpg" alt="">
      </div>
      <div class="card-line"></div>
      <div class="card-info">
        <p class="wine-name">${w.nome} — ${w.produtor}</p>
        <p class="wine-location">${flagImg(w.pais)} ${COUNTRY_NAMES[w.pais]} · ${w.regiao}</p>
        <p class="wine-grape">${w.uva}</p>
        <p class="wine-alcohol">${w.teor}% vol.</p>
        <div class="spacer"></div>
        <div class="price-block">
          <p class="price-original">De R$ ${fmtPrice(w.precoCheio)} no cartão</p>
          <p class="price-pix-label">Valor no Pix</p>
          <p class="price-discount">R$ ${fmtPrice(w.precoPix)}</p>
        </div>
      </div>
    </div>`;
}

function pageHtml(wines, pageLabel) {
  const cards = wines.map(cardHtml).join('\n');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./_shared.css">
</head>
<body>
<div class="page">

  <div class="header">
    <span class="header-label">${pageLabel}</span>
  </div>

  <div class="grid">${cards}
  </div>

  <div class="footer">
    <img src="../../../dados/gota-transparente.png" alt="">
  </div>

</div>
</body>
</html>
`;
}

const capaHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1350px; overflow: hidden; background: #fff; font-family: 'Rubik', sans-serif; position: relative; }
</style>
</head>
<body>
  <div style="position:absolute; left:52px; top:200px; bottom:120px; width:1.5px; background:#bbb;"></div>
  <div style="position:absolute; right:52px; top:200px; bottom:120px; width:1.5px; background:#bbb;"></div>

  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-52%); text-align:center; width:720px;">
    <img src="../../../dados/comnectar-transparente.png" alt="comnéctar" style="width:540px; display:block; margin:0 auto 44px;">
    <div style="width:52px; height:1.5px; background:#991356; margin:0 auto 40px;"></div>
    <h1 style="font-family:'Geotipe','Palatino Linotype',Georgia,serif; font-size:52px; color:#000; font-weight:400; letter-spacing:6px; text-transform:uppercase; margin-bottom:20px; line-height:1.25;">Novidades comnéctar</h1>
    <p style="font-size:13px; color:#991356; font-weight:500; letter-spacing:6px; text-transform:uppercase; margin-bottom:36px;">Chegaram nos últimos 60 dias</p>
    <p style="font-size:12px; color:#666; font-weight:500; letter-spacing:4px; text-transform:uppercase;">Valores exclusivos no Pix</p>
  </div>

  <div style="position:absolute; bottom:28px; right:44px;">
    <img src="../../../dados/gota-transparente.png" alt="" style="width:88px; opacity:0.75;">
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'catalog-capa.html'), capaHtml);

const perPage = 4;
let pageNum = 1;
for (let i = 0; i < data.length; i += perPage) {
  const chunk = data.slice(i, i + perPage);
  const html = pageHtml(chunk, `Novidades · Valores no Pix — Página ${pageNum}`);
  fs.writeFileSync(path.join(outDir, `catalog-p${pageNum}.html`), html);
  pageNum++;
}

console.log(`Geradas ${pageNum - 1} páginas de produto + capa.`);
