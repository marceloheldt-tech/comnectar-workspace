import { chromium } from 'playwright';

const [,, pdfPath, pageNum, outPath] = process.argv;

const browser = await chromium.launch({ headless: false, channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1400, height: 1150 } });
const page = await context.newPage();

await page.goto(`file:///${pdfPath}#page=${pageNum}&zoom=100`, { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(2500);

// clica na miniatura da pagina certa pra garantir que ela fique alinhada no topo
try {
  const thumb = page.locator(`a[href*="#page=${pageNum}"]`).first();
  if (await thumb.count() > 0) {
    await thumb.click();
    await page.waitForTimeout(1500);
  }
} catch {}

await page.screenshot({ path: outPath, clip: { x: 380, y: 100, width: 460, height: 980 } });
console.log(`Salvo: ${outPath}`);

await browser.close();
