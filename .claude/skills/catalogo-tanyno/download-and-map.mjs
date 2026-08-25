import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const PDF_DIR = 'C:/Users/marce/AppData/Local/Temp/claude/c--Users-marce-Desktop-claude-comn-ctar/b42994ea-3282-409b-ad7d-6f9092181d27/scratchpad/pdfs';
mkdirSync(PDF_DIR, { recursive: true });

const producers = [
  { key: 'akutain', fileId: '1PbTwtw1zuUOMm3I6Dvrz12FHSSWS_mgB' },
  { key: 'la-horra', fileId: '1d1FENnJ2Rl1QwL1ruBiyK8hU2IFxMnC2' },
  { key: 'mauro', fileId: '1RlSc8FiRa7UODc8S8_Zy4PEAjS1wZr3E' },
  { key: 'roda', fileId: '1HfcT1eQyrmB4pZG5OWYUB8bhh9zs7dVu' },
  { key: 'clos-obac', fileId: '1ce7Huuo68yzh7T-NHRwKn640udtURP6t' },
  { key: 'jose-gil', fileId: '1VxG2Ns-xMxyfm059npLytBLWVagkV39m' },
  { key: 'miguel-merino', fileId: '1yqeqc0HnwGPbohD8wb9JcKdcjvwx4Dag' },
  { key: 'veronica-ortega', fileId: '1suq8c-8zBVI-SGS1wv4ean6Cmqw7D2nQ' },
  { key: 'sastre', fileId: '1kg1gX8gr2-DQEd6Ws_M6ILAwG0JngZMx' },
];

const browser = await chromium.launchPersistentContext(
  'C:/Users/marce/AppData/Local/ChromeAutomationProfile',
  { channel: 'chrome', headless: false, args: ['--profile-directory=Default'], acceptDownloads: true }
);
console.log('Chrome iniciado');

for (const p of producers) {
  const savePath = `${PDF_DIR}/${p.key}.pdf`;
  const page = await browser.newPage();
  try {
    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
    await page.goto(`https://drive.google.com/uc?export=download&id=${p.fileId}`, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
    const download = await downloadPromise;
    await download.saveAs(savePath);
    console.log(`✅ ${p.key} baixado`);
  } catch (e) {
    console.log(`❌ ${p.key} falhou: ${e.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
console.log('\n📄 Extraindo texto de cada PDF...\n');

const mapping = {};
for (const p of producers) {
  const path = `${PDF_DIR}/${p.key}.pdf`;
  try {
    const data = new Uint8Array(await import('fs').then(fs => fs.readFileSync(path)));
    const doc = await getDocument({ data }).promise;
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const pg = await doc.getPage(i);
      const content = await pg.getTextContent();
      const text = content.items.map(it => it.str).join(' ');
      pages.push(text);
    }
    mapping[p.key] = pages;
    console.log(`${p.key}: ${doc.numPages} páginas extraídas`);
  } catch (e) {
    console.log(`${p.key}: erro na extração — ${e.message}`);
  }
}

writeFileSync(`${PDF_DIR}/_text_mapping.json`, JSON.stringify(mapping, null, 2));
console.log('\n✅ Mapa de texto salvo em _text_mapping.json');
