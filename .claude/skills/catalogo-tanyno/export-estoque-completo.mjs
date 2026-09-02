import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const OUT = 'C:/Users/marce/AppData/Local/Temp/claude/c--Users-marce-Desktop-claude-comn-ctar/061757e4-902f-4d79-95ae-3d2a61930cc0/scratchpad';

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

const rowsA = flatten(dataA, 'Tanyno Autoral');
const rowsB = flatten(dataB, 'Tanyno Signature');
const all = [...rowsA, ...rowsB];

console.log('Total produtos Autoral:', rowsA.length);
console.log('Total produtos Signature:', rowsB.length);
console.log('Total geral:', all.length);
console.log('Com estoque > 0 - Autoral:', rowsA.filter(r => r.estoque > 0).length, '| Signature:', rowsB.filter(r => r.estoque > 0).length);

writeFileSync(`${OUT}/tanyno-estoque-completo.json`, JSON.stringify(all, null, 2));
console.log('JSON salvo em tanyno-estoque-completo.json');

await browser.close();
