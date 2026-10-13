// Converte proposta.html em PDF — comnéctar
// Uso: node gerar-pdf.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const pasta = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(pasta, 'proposta.html');
const pdfPath = path.join(pasta, 'proposta-vinhos-casamento-pedro.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
await browser.close();

console.log(`PDF gerado: ${pdfPath}`);
