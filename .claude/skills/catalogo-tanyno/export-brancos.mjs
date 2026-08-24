import { chromium } from 'playwright';
import ExcelJS from 'exceljs';
import { writeFileSync } from 'fs';

const OUT = 'C:/Users/marce/AppData/Local/Temp/claude/c--Users-marce-Desktop-claude-comn-ctar/b42994ea-3282-409b-ad7d-6f9092181d27/scratchpad';

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--disable-blink-features=AutomationControlled'],
});
const context = await browser.newContext({
  viewport: { width: 1700, height: 1000 },
  storageState: `${OUT}/tanyno-auth.json`,
});
const page = await context.newPage();

await page.goto('https://estoque.tanyno.com/inventory', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(1500);

async function fetchTable(cardKey) {
  const result = await page.evaluate(async (k) => {
    const res = await fetch(`/api/inventory/table?product=wine&card=${k}`, { credentials: 'include' });
    return { status: res.status, text: await res.text() };
  }, cardKey);
  if (result.status !== 200) throw new Error(`card ${cardKey} failed: ${result.status}`);
  return JSON.parse(result.text);
}

function flatten(data, linha) {
  const rows = [];
  for (const country of data) {
    for (const region of country.regions) {
      for (const producer of region.producers) {
        for (const key of Object.keys(producer.products)) {
          for (const p of producer.products[key]) {
            rows.push({
              linha,
              wine_code: p.wine_code,
              nome: p.wine_name?.trim(),
              produtor: p.producer?.trim(),
              safra: p.vintage,
              tipo: p.wine_type,
              pais: p.country_name,
              regiao: p.region,
              subregiao: p.subregion,
              preco: p.price,
              estoque: p.available_stock,
            });
          }
        }
      }
    }
  }
  return rows;
}

const dataA = await fetchTable('A');
await page.waitForTimeout(500);
const dataB = await fetchTable('B');

writeFileSync(`${OUT}/tanyno-table-A-full.json`, JSON.stringify(dataA));
writeFileSync(`${OUT}/tanyno-table-B-full.json`, JSON.stringify(dataB));

const rowsA = flatten(dataA, 'Tanyno Autoral');
const rowsB = flatten(dataB, 'Tanyno Signature');
const all = [...rowsA, ...rowsB];

console.log('Total produtos Autoral:', rowsA.length);
console.log('Total produtos Signature:', rowsB.length);
console.log('Total geral:', all.length);

const brancos = all.filter(r => r.tipo === 'BRANCO' && r.estoque > 0);
brancos.sort((a, b) => a.pais.localeCompare(b.pais) || a.nome.localeCompare(b.nome));

console.log('Total BRANCOS com estoque:', brancos.length);
console.log('  Autoral:', brancos.filter(r => r.linha === 'Tanyno Autoral').length);
console.log('  Signature:', brancos.filter(r => r.linha === 'Tanyno Signature').length);

writeFileSync(`${OUT}/tanyno-brancos.json`, JSON.stringify(brancos, null, 2));

// Build Excel
const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet('Vinhos Brancos');
ws.columns = [
  { header: 'Linha', key: 'linha', width: 18 },
  { header: 'Vinho', key: 'nome', width: 42 },
  { header: 'Produtor', key: 'produtor', width: 28 },
  { header: 'Safra', key: 'safra', width: 10 },
  { header: 'País', key: 'pais', width: 14 },
  { header: 'Região', key: 'regiao', width: 20 },
  { header: 'Preço (A37)', key: 'preco', width: 14 },
  { header: 'Estoque', key: 'estoque', width: 10 },
];
ws.getRow(1).font = { bold: true };
for (const r of brancos) {
  ws.addRow({
    linha: r.linha,
    nome: r.nome,
    produtor: r.produtor,
    safra: r.safra,
    pais: r.pais,
    regiao: r.regiao,
    preco: r.preco,
    estoque: r.estoque,
  });
}
ws.getColumn('preco').numFmt = '"R$" #,##0.00';

const outPath = 'C:/Users/marce/Desktop/claude comnéctar/analises/vinhos/tanyno-brancos-agosto-2026.xlsx';
await wb.xlsx.writeFile(outPath);
console.log('Excel salvo em:', outPath);

await browser.close();
