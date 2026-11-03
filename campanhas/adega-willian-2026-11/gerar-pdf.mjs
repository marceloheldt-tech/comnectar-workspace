// Converte proposta.html em PDF — comnéctar
// Uso: node gerar-pdf.mjs [arquivo.html] [saida.pdf]
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const pasta = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(pasta, process.argv[2] || 'proposta.html');
const pdfPath = path.join(pasta, process.argv[3] || 'proposta-vinhos-casamento-pedro.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
await browser.close();

console.log(`PDF gerado: ${pdfPath}`);
