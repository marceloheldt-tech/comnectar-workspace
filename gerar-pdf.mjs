import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';

const dir = 'C:/Users/marce/Desktop/claude comnéctar/conteudo/catalogos/2026-06-30-kit-italia';
const pages = [
  'catalog-p1',
];

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
writeFileSync(`${dir}/kit-italia-junho2026.pdf`, output);
console.log('\n✅ PDF gerado: kit-italia-junho2026.pdf');
