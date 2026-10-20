import { chromium } from 'playwright';

const dir = 'C:/Users/marce/Desktop/claude comnéctar/campanhas/kit-albert-bichot-outubro-2026';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(`file:///${dir}/tabela-kit-bichot.html`, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(500);
await page.screenshot({ path: `${dir}/tabela-kit-bichot.png` });
await browser.close();
console.log('ok tabela-kit-bichot.png');
