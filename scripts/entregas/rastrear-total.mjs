// Consulta o rastreio público da Total Express (Total Conecta) pra uma lista de códigos.
// Uso: node scripts/entregas/rastrear-total.mjs TXAQ...tx TXAQ...tx [--debug pasta]
import { chromium } from 'playwright';
import fs from 'fs';

const args = process.argv.slice(2);
const dbgIdx = args.indexOf('--debug');
const debugDir = dbgIdx >= 0 ? args[dbgIdx + 1] : null;
const codigos = args.filter((a, i) => /^TX/i.test(a) && i !== dbgIdx + 1);

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-blink-features=AutomationControlled'] });
const ctx = await browser.newContext({
  viewport: { width: 1400, height: 900 }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
const page = await ctx.newPage();

let api = {};
page.on('response', async r => {
  const m = r.url().match(/\/mfe-rastreio\/api\/(basic|order-data)/);
  if (!m) return;
  try { api[m[1]] = { status: r.status(), body: await r.json() }; } catch { api[m[1]] = { status: r.status(), body: null }; }
});

const resultados = [];
for (const codigo of codigos) {
  api = {};
  try {
    await page.goto(`https://totalconecta.totalexpress.com.br/rastreamento?codigo=${codigo}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    await page.getByText('Sim, estou ciente').click({ timeout: 3000 }).catch(() => {});
    await page.locator('[data-testid="tracking-search-page-button"]').click({ timeout: 15000 });
    await page.waitForTimeout(8000);
    const texto = (await page.innerText('body')).replace(/\n{2,}/g, '\n');
    if (debugDir) await page.screenshot({ path: `${debugDir}/${codigo}.png`, fullPage: true });
    resultados.push({ codigo, url: page.url(), api, texto: texto.slice(0, 4000) });
  } catch (e) {
    resultados.push({ codigo, erro: e.message.split('\n')[0] });
  }
  await page.waitForTimeout(4000);
}
await browser.close();
const saida = JSON.stringify(resultados, null, 2);
if (debugDir) fs.writeFileSync(`${debugDir}/rastreio.json`, saida);
console.log(saida);
