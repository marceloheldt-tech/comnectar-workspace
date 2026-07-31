import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const dir = 'C:/Users/marce/Desktop/claude comnéctar/analises/forum-ecommerce-2026';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.emulateMedia({ media: 'screen' });
await page.goto(`file:///${dir}/resumo-forum-ecommerce-2026.html`, { waitUntil: 'networkidle' });

const pdf = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: { top: '0', bottom: '0', left: '0', right: '0' },
});

writeFileSync(`${dir}/resumo-forum-ecommerce-2026.pdf`, pdf);
await browser.close();
console.log('PDF gerado: resumo-forum-ecommerce-2026.pdf');
