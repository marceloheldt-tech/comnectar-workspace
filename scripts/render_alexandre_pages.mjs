import { chromium } from 'playwright';

const dir = 'C:/Users/marce/Desktop/claude comnéctar/conteudo/catalogos/2026-08-19-alexandre-tintos';
const pages = ['catalog-capa', ...Array.from({ length: 20 }, (_, i) => `catalog-p${i + 1}`)];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1080, height: 1350 } });

for (const name of pages) {
  const page = await context.newPage();
  await page.goto(`file:///${dir}/${name}.html`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  await page.close();
  console.log('rendered', name);
}
await browser.close();
console.log('DONE rendering', pages.length, 'pages');
