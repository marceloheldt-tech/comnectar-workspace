import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../..');
const b64 = f => 'data:image/png;base64,' + readFileSync(path.join(root, f)).toString('base64');
const logo = b64('dados/comnectar-transparente.png');
const gota = b64('dados/gota-transparente.png');

// [nome, produtor, país, tipo, preço cheio, pix fixo (opcional)]
const vinhos = [
  ['Langhe Nebbiolo 2024', 'Mario Costa', 'Itália', 'Tinto', 279, 220],
  ['La Piu Belle Rosé 2024', 'Viña Vik', 'Chile', 'Rosé', 189],
  ['Blanc de Blanc', 'Cave Geisse', 'Brasil', 'Espumante', 239],
  ['La Piu Belle Rosé 2022', 'Viña Vik', 'Chile', 'Rosé', 219],
  ['Langhe Nebbiolo 2021', 'Fontanafredda', 'Itália', 'Tinto', 279],
  ["Sant'Antimo Rosso 2020", 'Capanna', 'Itália', 'Tinto', 229],
  ['Stravaganzza Brut', 'Don Giovanni', 'Brasil', 'Espumante', 139],
  ["A d'Aussières 2023", "Domaine d'Aussières", 'França', 'Tinto', 219],
  ['Preludio Barrel Select 2023', 'Familia Deicas', 'Uruguai', 'Branco', 439],
  ['Villa Pattono Monferrato 2016', 'Ratti', 'Itália', 'Tinto', 369],
  ['Blanc de Noir Brut', 'Don Giovanni', 'Brasil', 'Espumante', 179],
  ['Tempo de Angelus 2023', 'Angelus', 'França', 'Tinto', 429],
  ['Extreme Vineyard Suelo Invertido Tannat 2021', 'Familia Deicas', 'Uruguai', 'Tinto', 399],
  ['Vinhas Velhas 2023', 'Luis Pato', 'Portugal', 'Branco', 279],
  ['Langhe Nebbiolo 2023', 'Castello di Verduno', 'Itália', 'Tinto', 289],
  ['Langhe Nebbiolo Reggimento 2020', 'Ratti', 'Itália', 'Tinto', 559],
  ['Delon Médoc 2014', 'Château Potensac', 'França', 'Tinto', 499],
  ['Giuletta Langhe Rosso 2023', 'Olek Bondonio', 'Itália', 'Tinto', 479],
  ['Pequeñas Producciones Malbec 2021', 'Escorihuela Gascón', 'Argentina', 'Tinto', 309],
  ['Garzón Reserva Tannat 2022', 'Bodega Garzón', 'Uruguai', 'Tinto', 184],
  ['Private Selection Chardonnay 2023', 'Robert Mondavi', 'EUA', 'Branco', 209],
  ['La Piu Belle Rosé 2024 Magnum', 'Viña Vik', 'Chile', 'Rosé', 399],
  ['Prugnolo Rosso di Montepulciano 2023', 'Boscarelli', 'Itália', 'Tinto', 279],
  ['Capisme-e Langhe Nebbiolo 2023', 'Domenico Clerico', 'Itália', 'Tinto', 319],
  ['Il Gentile di Casanova Prugnolo 2016', 'La Spinetta', 'Itália', 'Tinto', 419],
  ['Barolo Marcenasco 2020', 'Ratti', 'Itália', 'Tinto', 899],
  ['Sofi Müller Thurgau 2024', 'Franz Haas', 'Itália', 'Branco', 189],
  ['Milla Cala 2022', 'Viña Vik', 'Chile', 'Tinto', 339],
  ['CastelGiocondo Brunello 2020', 'Frescobaldi', 'Itália', 'Tinto', 899],
  ['Sierra de Las Palmas Pinot Noir 2021', 'Vinos de Mar', 'Uruguai', 'Tinto', 549],
  ['Sierra de Las Palmas Albariño 2021', 'Vinos de Mar', 'Uruguai', 'Branco', 519],
  ['Bourgogne Couvent des Jacobins Pinot Noir 2022', 'Louis Jadot', 'França', 'Tinto', 399],
  ['Poggio Badiola 2022', 'Mazzei', 'Itália', 'Tinto', 209],
  ['Petit Chablis 2023', 'Louis Jadot', 'França', 'Branco', 419],
  ['Capitel Amarone 2016', 'Montresor', 'Itália', 'Tinto', 599],
  ['La Piu Belle Tinto 2022', 'Viña Vik', 'Chile', 'Tinto', 579],
];

const brl = v => 'R$ ' + Math.ceil(Math.round(v * 100) / 100).toLocaleString('pt-BR');

const grupos = ['Tintos:Tinto', 'Brancos:Branco', 'Rosés:Rosé', 'Espumantes:Espumante'].map(s => s.split(':'));

const secoes = grupos.map(([titulo, tipo]) => {
  const itens = vinhos.filter(v => v[3] === tipo).sort((a, b) => a[4] - b[4]);
  const linhas = itens.map(([nome, prod, pais, , p, pix]) => `
      <tr>
        <td class="vinho"><span class="nome">${nome}</span><span class="meta">${prod} · ${pais}</span></td>
        <td class="cheio">${brl(p)}</td>
        <td class="cartao">${brl(p * 0.9)}</td>
        <td class="pix">${brl(pix ?? p * 0.8)}</td>
      </tr>`).join('');
  return `
    <section>
      <h2>${titulo}</h2>
      <table>
        <thead><tr><th class="vinho">Vinho</th><th>Preço cheio</th><th>Cartão promo</th><th>PIX promo</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>
    </section>`;
}).join('');

const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 16mm 14mm 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Rubik', Arial, sans-serif; color: #000; background: #fff; font-size: 10.5pt; }
  .serif { font-family: 'Geotipe', 'Palatino Linotype', Georgia, serif; }
  header { text-align: center; padding: 4mm 0 7mm; }
  header img { width: 58mm; }
  .titulo { margin-top: 7mm; font-family: 'Geotipe','Palatino Linotype',Georgia,serif; font-size: 30pt; font-weight: 400; letter-spacing: 1.5pt; color: #991356; }
  .sub { margin-top: 3mm; font-size: 10pt; font-weight: 300; }
  .selos { display: flex; justify-content: center; gap: 4mm; margin-top: 5mm; }
  .selo { border: 1px solid #000; border-radius: 10px; padding: 2mm 5mm; font-size: 9.5pt; }
  .selo.v { background: #991356; border-color: #991356; color: #fff; }
  .selo b { font-weight: 500; }
  section { margin-top: 7mm; }
  h2 { font-family: 'Geotipe','Palatino Linotype',Georgia,serif; font-weight: 400; font-size: 17pt; color: #991356; padding-bottom: 2mm; border-bottom: 1px solid #991356; break-after: avoid; }
  table { width: 100%; border-collapse: collapse; }
  thead th { font-size: 7.5pt; font-weight: 500; text-transform: uppercase; letter-spacing: .8pt; text-align: right; padding: 2.5mm 0 1.5mm; }
  thead th.vinho { text-align: left; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  tbody td { padding: 2.4mm 0; border-bottom: 1px solid #e6e6e6; text-align: right; white-space: nowrap; vertical-align: middle; }
  td.vinho { text-align: left; white-space: normal; padding-right: 4mm; }
  .nome { display: block; font-weight: 500; font-size: 10.5pt; }
  .meta { display: block; font-size: 8.5pt; font-weight: 300; margin-top: .6mm; }
  td.cheio { text-decoration: line-through; font-weight: 300; font-size: 9.5pt; width: 26mm; }
  td.cartao { width: 28mm; }
  td.pix { width: 28mm; font-weight: 500; color: #991356; font-size: 11.5pt; }
  footer { margin-top: 10mm; text-align: center; font-size: 8.5pt; font-weight: 300; }
  footer img { width: 11mm; display: block; margin: 0 auto 3mm; }
</style></head>
<body>
  <header>
    <img src="${logo}">
    <div class="titulo">FECHA MÊS COMNÉCTAR</div>
    <div class="sub">Uma seleção de rótulos com condição especial pra fechar o mês.</div>
    <div class="selos">
      <div class="selo"><b>10% OFF</b> no cartão</div>
      <div class="selo v"><b>20% OFF</b> no PIX</div>
    </div>
  </header>
  ${secoes}
  <footer>
    <img src="${gota}">
    Condições válidas enquanto durarem os estoques.
  </footer>
</body></html>`;

writeFileSync(path.join(dir, 'fecha-mes.html'), html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
await page.pdf({
  path: path.join(dir, 'fecha-mes-comnectar.pdf'),
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: '<div style="width:100%;text-align:center;font-size:7pt;font-family:Arial;color:#991356">comnéctar · <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
});
await page.screenshot({ path: path.join(dir, 'preview.png'), fullPage: true });

// ---------- STORIES (1080x1920) ----------
const baseCss = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1080px; height: 1920px; }
  body { font-family: 'Rubik', Arial, sans-serif; color: #000; }
  .serif { font-family: 'Geotipe','Palatino Linotype',Georgia,serif; font-weight: 400; }`;
const fontLink = '<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500&display=swap" rel="stylesheet">';

const capa = `<!doctype html><html><head><meta charset="utf-8">${fontLink}<style>${baseCss}
  body { background: #991356; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .gota { width: 360px; filter: brightness(0) invert(1); margin-bottom: 40px; }
  .t1 { font-size: 150px; letter-spacing: 6px; line-height: 1; }
  .t2 { font-size: 96px; letter-spacing: 14px; margin-top: 30px; }
  .linha { width: 140px; height: 2px; background: #fff; margin: 80px 0 70px; }
  .sub { font-size: 40px; font-weight: 300; line-height: 1.4; max-width: 780px; }
  .selos { display: flex; gap: 28px; margin-top: 80px; }
  .selo { border: 2px solid #fff; border-radius: 12px; padding: 26px 40px; font-size: 40px; font-weight: 300; }
  .selo b { font-weight: 500; }
  .selo.v { background: #fff; color: #991356; }
  .rod { position: absolute; bottom: 260px; font-size: 30px; font-weight: 300; letter-spacing: 2px; }
</style></head><body>
  <img class="gota" src="${gota}">
  <div class="serif t1">FECHA MÊS</div>
  <div class="serif t2">SETEMBRO</div>
  <div class="linha"></div>
  <div class="sub">${vinhos.length} rótulos com condição especial pra fechar o mês.</div>
  <div class="selos">
    <div class="selo"><b>10% OFF</b> no cartão</div>
    <div class="selo v"><b>20% OFF</b> no PIX</div>
  </div>
  <div class="rod">TOQUE PRA VER A SELEÇÃO →</div>
</body></html>`;

const telas = [];

const tela = (t, i) => `<!doctype html><html><head><meta charset="utf-8">${fontLink}<style>${baseCss}
  body { background: #fff; padding: 230px 80px 0; }
  .topo { display: flex; align-items: center; justify-content: space-between; }
  .topo img { width: 200px; margin-left: -40px; }
  .topo .tag { font-size: 30px; letter-spacing: 3px; color: #991356; text-align: right; line-height: 1.3; }
  .topo .tag small { display: block; font-family: 'Rubik'; font-size: 24px; letter-spacing: 1px; font-weight: 300; color: #000; }
  h2 { font-size: 60px; color: #991356; margin-top: 50px; padding-bottom: 14px; border-bottom: 2px solid #991356; }
  .cols { display: flex; justify-content: flex-end; font-size: 20px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin: 18px 0 4px; }
  .cols span { width: 170px; text-align: right; }
  .row { display: flex; align-items: center; padding: 20px 0; border-bottom: 1px solid #e6e6e6; }
  .v { flex: 1; padding-right: 20px; }
  .nome { font-size: 33px; font-weight: 500; line-height: 1.15; }
  .meta { font-size: 25px; font-weight: 300; margin-top: 6px; }
  .p { width: 170px; text-align: right; white-space: nowrap; }
  .cheio { font-size: 28px; font-weight: 300; text-decoration: line-through; }
  .cartao { font-size: 32px; }
  .pix { font-size: 42px; font-weight: 500; color: #991356; }
  .pag { position: absolute; bottom: 250px; left: 0; right: 0; text-align: center; font-size: 24px; font-weight: 300; letter-spacing: 2px; }
</style></head><body>
  <div class="topo"><img src="${gota}"><div class="tag serif">FECHA MÊS SETEMBRO<small>10% OFF cartão · 20% OFF PIX</small></div></div>
  ${t.blocos.map(b => `
    <h2 class="serif">${b.titulo}</h2>
    <div class="cols"><span>Cheio</span><span>Cartão</span><span>PIX</span></div>
    ${b.itens.map(([nome, prod, pais, , p, pix]) => `
      <div class="row">
        <div class="v"><div class="nome">${nome}</div><div class="meta">${prod} · ${pais}</div></div>
        <div class="p cheio">${brl(p)}</div>
        <div class="p cartao">${brl(p * 0.9)}</div>
        <div class="p pix">${brl(pix ?? p * 0.8)}</div>
      </div>`).join('')}`).join('')}
  <div class="pag">${i === telas.length - 1 ? 'Condições válidas enquanto durarem os estoques.' : `${i + 1}/${telas.length} · continua →`}</div>
</body></html>`;

const sdir = path.join(dir, 'stories');
mkdirSync(sdir, { recursive: true });
const sp = await browser.newPage({ viewport: { width: 1080, height: 1920 } });

// monta as telas medindo a altura real: enche cada story até onde cabe (acima do rodapé),
// e não deixa título de grupo sozinho no fim da tela com só 1 vinho se o grupo tiver mais
const LIMITE = 1600;
const cabe = async t => {
  await sp.setContent(tela(t, 0), { waitUntil: 'networkidle' });
  return sp.evaluate(lim => Math.max(...[...document.querySelectorAll('.row')].map(r => r.getBoundingClientRect().bottom)) <= lim, LIMITE);
};
const com = (t, titulo, vs) => {
  const blocos = t.blocos.map(b => ({ titulo: b.titulo, itens: [...b.itens] }));
  if (blocos.at(-1)?.titulo !== titulo) blocos.push({ titulo, itens: [] });
  blocos.at(-1).itens.push(...vs);
  return { blocos };
};
for (const [titulo, tipo] of grupos) {
  const itens = vinhos.filter(v => v[3] === tipo).sort((a, b) => a[4] - b[4]);
  for (let k = 0; k < itens.length; k++) {
    const t = telas.at(-1);
    const novoGrupo = t && t.blocos.at(-1).titulo !== titulo;
    const teste = novoGrupo ? itens.slice(k, k + 2) : [itens[k]];
    if (t && await cabe(com(t, titulo, teste))) telas[telas.length - 1] = com(t, titulo, [itens[k]]);
    else telas.push(com({ blocos: [] }, titulo, [itens[k]]));
  }
}

const shots = [['00-capa', capa], ...telas.map((t, i) => [String(i + 1).padStart(2, '0') + '-selecao', tela(t, i)])];
for (const [nome, h] of shots) {
  await sp.setContent(h, { waitUntil: 'networkidle' });
  await sp.screenshot({ path: path.join(sdir, nome + '.png') });
}

await browser.close();
console.log('ok');
