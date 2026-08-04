// Converte financeiro/[AAAA-MM]/apresentacao.html em PDF — comnéctar
// Uso: node gerar-pdf-apresentacao.mjs --mes 2026-07
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const args = process.argv.slice(2);
const mesIdx = args.indexOf('--mes');
if (mesIdx === -1 || !args[mesIdx + 1]) {
  console.error('Uso: node gerar-pdf-apresentacao.mjs --mes 2026-07');
  process.exit(1);
}
const mes = args[mesIdx + 1];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(__dirname, '..', '..', '..');
const pasta = path.join(workspace, 'financeiro', mes);
const htmlPath = path.join(pasta, 'apresentacao.html');
const pdfPath = path.join(pasta, `apresentacao-${mes}.pdf`);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
await browser.close();

console.log(`✅ PDF gerado: ${pdfPath}`);
