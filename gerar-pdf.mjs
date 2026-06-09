import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';

const dir = 'C:/Users/marce/Desktop/claude comnéctar/conteudo/catalogos/2026-06-09-italia-franca';
const pages = ['catalog-capa', 'catalog-p1', 'catalog-p2', 'catalog-p3', 'catalog-p4'];

const browser = await chromium.launch();
const context = await browser.newContext();
const pdfBuffers = [];

for (const name of pages) {
  const page = await context.newPage();
  await page.goto(`file:///${dir}/${name}.html`, { waitUntil: 'networkidle' });
  const pdf = await page.pdf({ width: '1080px', height: '1350px', printBackground: true });
  pdfBuffers.push(pdf);
  await page.close();
  console.log(`✓ ${name}`);
}

await browser.close();

const merged = await PDFDocument.create();
for (const buf of pdfBuffers) {
  const doc = await PDFDocument.load(buf);
  const copied = await merged.copyPages(doc, doc.getPageIndices());
  copied.forEach(p => merged.addPage(p));
}

const output = await merged.save();
writeFileSync(`${dir}/catalogo-italia-franca-junho2026.pdf`, output);
console.log('\n✅ PDF gerado: catalogo-italia-franca-junho2026.pdf');
