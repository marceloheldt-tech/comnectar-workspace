import { chromium } from 'playwright';

const PDF_PATH = 'C:/Users/marce/AppData/Local/Temp/claude/c--Users-marce-Desktop-claude-comn-ctar/b42994ea-3282-409b-ad7d-6f9092181d27/scratchpad/pdfs/test.pdf';
const OUT = 'C:/Users/marce/AppData/Local/Temp/claude/c--Users-marce-Desktop-claude-comn-ctar/b42994ea-3282-409b-ad7d-6f9092181d27/scratchpad';

const browser = await chromium.launch({ headless: false, channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1600, height: 2400 } });
const page = await context.newPage();

// pagina 3 (1-based) = pagina 2 (0-based, convencao antiga: 0=capa,1=indice,2=1o vinho)
await page.goto(`file:///${PDF_PATH}#page=3`, { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/pdf-page3-full.png` });
console.log('Screenshot full salvo');

await browser.close();
