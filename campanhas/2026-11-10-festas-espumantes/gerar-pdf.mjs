// PDF de página única: altura da página = altura do conteúdo, texto continua vetorial
import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(pathToFileURL(path.join(dir, 'festas-espumantes.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const h = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
await page.addStyleTag({ content: '@page { margin: 0 } html, body { margin: 0 }' });
await page.pdf({
  path: path.join(dir, 'Espumantes e Champagnes - comnectar.pdf'),
  width: '1080px', height: `${h + 2}px`,
  printBackground: true, pageRanges: '1',
});
await browser.close();
console.log('altura', h);
