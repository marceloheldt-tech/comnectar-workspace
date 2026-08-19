import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';

const dir = 'C:/Users/marce/Desktop/claude comnéctar/conteudo/catalogos/2026-08-19-alexandre-tintos';
const pages = ['catalog-capa', ...Array.from({ length: 20 }, (_, i) => `catalog-p${i + 1}`)];

const browser = await chromium.launch();
const context = await browser.newContext();
const pdfBuffers = [];
for (const name of pages) {
  const page = await context.newPage();
  await page.goto(`file:///${dir}/${name}.html`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(400);
  const pdf = await page.pdf({ width: '1080px', height: '1350px', printBackground: true });
  pdfBuffers.push(pdf);
  await page.close();
  console.log('rendered', name);
}
await browser.close();
const merged = await PDFDocument.create();
for (const buf of pdfBuffers) {
  const doc = await PDFDocument.load(buf);
  const copied = await merged.copyPages(doc, doc.getPageIndices());
  copied.forEach(p => merged.addPage(p));
}
writeFileSync(`${dir}/Vinhos Tintos para Alexandre.pdf`, await merged.save());
console.log('PDF saved. Total pages:', pages.length);
