import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const PDF_DIR = 'C:/Users/marce/AppData/Local/Temp/claude/c--Users-marce-Desktop-claude-comn-ctar/b42994ea-3282-409b-ad7d-6f9092181d27/scratchpad/pdfs';
const OUT_DIR = 'C:/Users/marce/Desktop/claude comnéctar/conteudo/catalogos/2026-08-25-espanhois-andre/imagens';
mkdirSync(OUT_DIR, { recursive: true });

const jobs = [
  { pdf: 'la-horra', page: 4, slug: '02-corimbo-i' },
  { pdf: 'mauro', page: 5, slug: '03-mauro' },
  { pdf: 'roda', page: 2, slug: '04-roda-sela' },
  { pdf: 'roda', page: 10, slug: '05-cirsion' },
  { pdf: 'roda', page: 6, slug: '06-roda-reserva' },
  { pdf: 'clos-obac', page: 10, slug: '08-miserere' },
  { pdf: 'jose-gil', page: 7, slug: '10-camino-de-ribas' },
  { pdf: 'jose-gil', page: 3, slug: '11-jose-gil-vinedos' },
  { pdf: 'miguel-merino', page: 14, slug: '12-la-quinta-cruz' },
  { pdf: 'miguel-merino', page: 10, slug: '13-miguel-merino-gran-reserva' },
  { pdf: 'miguel-merino', page: 12, slug: '14-miguel-merino-la-loma' },
  { pdf: 'miguel-merino', page: 9, slug: '15-miguel-merino-reserva' },
  { pdf: 'miguel-merino', page: 5, slug: '16-vinas-jovenes' },
  { pdf: 'miguel-merino', page: 8, slug: '17-vitola-reserva' },
  { pdf: 'veronica-ortega', page: 8, slug: '18-cobrana' },
  { pdf: 'veronica-ortega', page: 4, slug: '19-kinki' },
  { pdf: 'veronica-ortega', page: 6, slug: '20-quite' },
  { pdf: 'veronica-ortega', page: 9, slug: '21-roc' },
  { pdf: 'veronica-ortega', page: 10, slug: '22-vo-version-original' },
  { pdf: 'sastre', page: 6, slug: '23-crianza-sastre' },
  { pdf: 'sastre', page: 10, slug: '24-pago-de-santa-cruz' },
  { pdf: 'sastre', page: 17, slug: '25-regina-vides' },
  { pdf: 'sastre', page: 3, slug: '26-roble' },
];

const browser = await chromium.launch({ headless: false, channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1400, height: 1150 } });

for (const job of jobs) {
  const pdfPath = `${PDF_DIR}/${job.pdf}.pdf`;
  const outPath = `${OUT_DIR}/${job.slug}.png`;
  const page = await context.newPage();
  try {
    await page.goto(`file:///${pdfPath}#page=${job.page}&zoom=100`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(2000);
    try {
      const thumb = page.locator(`a[href*="#page=${job.page}"]`).first();
      if (await thumb.count() > 0) { await thumb.click(); await page.waitForTimeout(1200); }
    } catch {}
    await page.screenshot({ path: outPath, clip: { x: 380, y: 100, width: 460, height: 980 } });
    console.log(`✅ ${job.slug} (${job.pdf} p${job.page})`);
  } catch (e) {
    console.log(`❌ ${job.slug}: ${e.message}`);
  } finally {
    await page.close();
  }
}

await context.close();
await browser.close();
console.log('\nConcluído.');
