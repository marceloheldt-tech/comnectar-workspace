import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';

const dir = 'C:/Users/marce/Desktop/claude comnéctar/conteudo/catalogos/2026-06-09-portfolio-pt-it-es';
const pages = [
  'catalog-capa-pt',
  'catalog-pt-p1',
  'catalog-pt-p2',
  'catalog-capa-es',
  'catalog-es-p1',
  'catalog-capa-it',
  'catalog-it-p1',
  'catalog-it-p2',
  'catalog-it-p3',
  'catalog-it-p4',
  'catalog-it-p5',
  'catalog-it-p6',
  'catalog-it-p7',
  'catalog-it-p8',
  'catalog-it-p9',
  'catalog-it-p10',
  'catalog-it-p11',
  'catalog-it-p12',
  'catalog-it-p13',
  'catalog-it-p14',
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
writeFileSync(`${dir}/catalogo-portfolio-pt-it-es-junho2026.pdf`, output);
console.log('\n✅ PDF gerado: catalogo-portfolio-pt-it-es-junho2026.pdf');
