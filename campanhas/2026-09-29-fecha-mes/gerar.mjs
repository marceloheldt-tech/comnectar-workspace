import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../..');
const b64 = f => 'data:image/png;base64,' + readFileSync(path.join(root, f)).toString('base64');
const logo = b64('dados/comnectar-transparente.png');
const gota = b64('dados/gota-transparente.png');

// [nome, produtor, país, tipo, preço cheio]
const vinhos = [
  ['Langhe Nebbiolo 2024', 'Mario Costa', 'Itália', 'Tinto', 246],
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

const brl = v => 'R$ ' + (Math.round(v * 100) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const grupos = ['Tintos:Tinto', 'Brancos:Branco', 'Rosés:Rosé', 'Espumantes:Espumante'].map(s => s.split(':'));

const secoes = grupos.map(([titulo, tipo]) => {
  const itens = vinhos.filter(v => v[3] === tipo).sort((a, b) => a[4] - b[4]);
  const linhas = itens.map(([nome, prod, pais, , p]) => `
      <tr>
        <td class="vinho"><span class="nome">${nome}</span><span class="meta">${prod} · ${pais}</span></td>
        <td class="cheio">${brl(p)}</td>
        <td class="cartao">${brl(p * 0.9)}</td>
        <td class="pix">${brl(p * 0.8)}</td>
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
await browser.close();
console.log('ok');
