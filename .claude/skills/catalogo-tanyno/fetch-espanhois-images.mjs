import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const OUT_DIR = 'C:/Users/marce/Desktop/claude comnéctar/conteudo/catalogos/2026-08-25-espanhois-andre/imagens';
mkdirSync(OUT_DIR, { recursive: true });

// Região de corte da garrafa nos PDFs Tanyno (mesma calibragem usada anteriormente)
const BOTTLE_CLIP = { x: 20, y: 650, width: 550, height: 1050 };

const wines = [
  { slug: '01-akutain-reserva', driveUrl: 'https://drive.google.com/file/d/1PbTwtw1zuUOMm3I6Dvrz12FHSSWS_mgB/view?usp=sharing', page: 4, nome: 'Akutain Reserva Selección 2014' },
  { slug: '02-corimbo-i', driveUrl: 'https://drive.google.com/file/d/1d1FENnJ2Rl1QwL1ruBiyK8hU2IFxMnC2/view?usp=sharing', page: 2, nome: 'Corimbo I 2017' },
  { slug: '03-mauro', driveUrl: 'https://drive.google.com/file/d/1RlSc8FiRa7UODc8S8_Zy4PEAjS1wZr3E/view?usp=sharing', page: 2, nome: 'Mauro 2022' },
  { slug: '04-roda-sela', driveUrl: 'https://drive.google.com/file/d/1HfcT1eQyrmB4pZG5OWYUB8bhh9zs7dVu/view?usp=sharing', page: 2, nome: 'Bodegas Roda Sela 2022' },
  { slug: '05-cirsion', driveUrl: 'https://drive.google.com/file/d/1HfcT1eQyrmB4pZG5OWYUB8bhh9zs7dVu/view?usp=sharing', page: 3, nome: 'Cirsion 2019' },
  { slug: '06-roda-reserva', driveUrl: 'https://drive.google.com/file/d/1HfcT1eQyrmB4pZG5OWYUB8bhh9zs7dVu/view?usp=sharing', page: 4, nome: 'Roda Reserva 2021' },
  { slug: '07-clos-obac', driveUrl: 'https://drive.google.com/file/d/1ce7Huuo68yzh7T-NHRwKn640udtURP6t/view?usp=sharing', page: 2, nome: "Clos de l'Obac 2015" },
  { slug: '08-miserere', driveUrl: 'https://drive.google.com/file/d/1ce7Huuo68yzh7T-NHRwKn640udtURP6t/view?usp=sharing', page: 6, nome: 'Miserere 2005' },
  { slug: '09-usatges', driveUrl: 'https://drive.google.com/file/d/1ce7Huuo68yzh7T-NHRwKn640udtURP6t/view?usp=sharing', page: 8, nome: 'Usatges 2023' },
  { slug: '10-camino-de-ribas', driveUrl: 'https://drive.google.com/file/d/1VxG2Ns-xMxyfm059npLytBLWVagkV39m/view?usp=sharing', page: 2, nome: 'Camino de Ribas Parcela La Cóncova 2023' },
  { slug: '11-jose-gil-vinedos', driveUrl: 'https://drive.google.com/file/d/1VxG2Ns-xMxyfm059npLytBLWVagkV39m/view?usp=sharing', page: 3, nome: 'Jose Gil Viñedos en San Vicente de la Sonsierra 2023' },
  { slug: '12-la-quinta-cruz', driveUrl: 'https://drive.google.com/file/d/1yqeqc0HnwGPbohD8wb9JcKdcjvwx4Dag/view?usp=sharing', page: 2, nome: 'La Quinta Cruz 2022' },
  { slug: '13-miguel-merino-gran-reserva', driveUrl: 'https://drive.google.com/file/d/1yqeqc0HnwGPbohD8wb9JcKdcjvwx4Dag/view?usp=sharing', page: 4, nome: 'Miguel Merino Gran Reserva 2019' },
  { slug: '14-miguel-merino-la-loma', driveUrl: 'https://drive.google.com/file/d/1yqeqc0HnwGPbohD8wb9JcKdcjvwx4Dag/view?usp=sharing', page: 5, nome: 'Miguel Merino La Loma 2022' },
  { slug: '15-miguel-merino-reserva', driveUrl: 'https://drive.google.com/file/d/1yqeqc0HnwGPbohD8wb9JcKdcjvwx4Dag/view?usp=sharing', page: 6, nome: 'Miguel Merino Reserva 2019' },
  { slug: '16-vinas-jovenes', driveUrl: 'https://drive.google.com/file/d/1yqeqc0HnwGPbohD8wb9JcKdcjvwx4Dag/view?usp=sharing', page: 8, nome: 'Viñas Jóvenes 2022' },
  { slug: '17-vitola-reserva', driveUrl: 'https://drive.google.com/file/d/1yqeqc0HnwGPbohD8wb9JcKdcjvwx4Dag/view?usp=sharing', page: 9, nome: 'Vitola Reserva 2020' },
  { slug: '18-cobrana', driveUrl: 'https://drive.google.com/file/d/1suq8c-8zBVI-SGS1wv4ean6Cmqw7D2nQ/view?usp=sharing', page: 2, nome: 'Cobrana 2022' },
  { slug: '19-kinki', driveUrl: 'https://drive.google.com/file/d/1suq8c-8zBVI-SGS1wv4ean6Cmqw7D2nQ/view?usp=sharing', page: 3, nome: 'Kinki 2023' },
  { slug: '20-quite', driveUrl: 'https://drive.google.com/file/d/1suq8c-8zBVI-SGS1wv4ean6Cmqw7D2nQ/view?usp=sharing', page: 5, nome: 'Quite 2022' },
  { slug: '21-roc', driveUrl: 'https://drive.google.com/file/d/1suq8c-8zBVI-SGS1wv4ean6Cmqw7D2nQ/view?usp=sharing', page: 6, nome: 'Roc 2022' },
  { slug: '22-vo-version-original', driveUrl: 'https://drive.google.com/file/d/1suq8c-8zBVI-SGS1wv4ean6Cmqw7D2nQ/view?usp=sharing', page: 8, nome: 'VO Version Original 2022' },
  { slug: '23-crianza-sastre', driveUrl: 'https://drive.google.com/file/d/1kg1gX8gr2-DQEd6Ws_M6ILAwG0JngZMx/view', page: 2, nome: 'Crianza 2021' },
  { slug: '24-pago-de-santa-cruz', driveUrl: 'https://drive.google.com/file/d/1kg1gX8gr2-DQEd6Ws_M6ILAwG0JngZMx/view', page: 3, nome: 'Pago de Santa Cruz 2021' },
  { slug: '25-regina-vides', driveUrl: 'https://drive.google.com/file/d/1kg1gX8gr2-DQEd6Ws_M6ILAwG0JngZMx/view', page: 4, nome: 'Regina Vides 2021' },
  { slug: '26-roble', driveUrl: 'https://drive.google.com/file/d/1kg1gX8gr2-DQEd6Ws_M6ILAwG0JngZMx/view', page: 5, nome: 'Roble 2022' },
];

console.log(`\n🍷 Buscando imagens para ${wines.length} vinho(s)...\n`);

let browser;
let browserInstance = null;

try {
  browser = await chromium.launchPersistentContext(
    'C:/Users/marce/AppData/Local/Google/Chrome/User Data',
    { channel: 'chrome', headless: false, args: ['--profile-directory=Default'] }
  );
  console.log('🌐 Chrome com perfil do usuário iniciado');
} catch {
  console.log('ℹ Chrome em uso — iniciando Chromium sem perfil');
  browserInstance = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  browser = await browserInstance.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  });
}

// Agrupa por driveUrl pra abrir cada PDF uma unica vez
const byDrive = {};
for (const w of wines) (byDrive[w.driveUrl] = byDrive[w.driveUrl] || []).push(w);

const results = [];

for (const [driveUrl, group] of Object.entries(byDrive)) {
  const fileId = driveUrl.match(/\/d\/([^/]+)\//)?.[1];
  console.log(`📂 ${group[0].nome.split(' ')[0]}... (${group.length} vinho${group.length > 1 ? 's' : ''})`);

  const viewerPage = await browser.newPage();
  try {
    await viewerPage.goto(`https://drive.google.com/file/d/${fileId}/view`, { waitUntil: 'networkidle', timeout: 30000 });
    await viewerPage.waitForTimeout(4000);

    const imgEl = viewerPage.locator('img[src*="viewer/img"]').first();
    const rawSrc = await imgEl.getAttribute('src', { timeout: 8000 });
    const src = rawSrc.startsWith('//') ? `https:${rawSrc}` : rawSrc;
    const encodedId = new URL(src).searchParams.get('id');
    if (!encodedId) throw new Error('encodedId não encontrado');

    for (const wine of group) {
      const hiResUrl = `https://drive.google.com/viewer/img?id=${encodedId}&page=${wine.page}&w=1600`;
      const outPath = join(OUT_DIR, `${wine.slug}.png`);
      console.log(`  🍾 ${wine.nome} → página ${wine.page}`);

      const imgPage = await browser.newPage();
      await imgPage.setViewportSize({ width: 1640, height: 2400 });
      try {
        await imgPage.goto(hiResUrl, { waitUntil: 'load', timeout: 20000 });
        await imgPage.waitForTimeout(1500);
        await imgPage.screenshot({ path: outPath, clip: BOTTLE_CLIP });
        results.push({ ...wine, ok: true });
        console.log(`     ✅ Salvo`);
      } catch (e) {
        console.log(`     ❌ Erro: ${e.message}`);
        results.push({ ...wine, ok: false, error: e.message });
      } finally {
        await imgPage.close();
      }
    }
  } catch (e) {
    console.log(`  ❌ Erro abrindo Drive: ${e.message}`);
    for (const w of group) results.push({ ...w, ok: false, error: e.message });
  } finally {
    await viewerPage.close();
  }
}

if (browserInstance) await browserInstance.close();
else await browser.close();

writeFileSync(join(OUT_DIR, '_results.json'), JSON.stringify(results, null, 2));
const ok = results.filter(r => r.ok).length;
console.log(`\n✅ Concluído: ${ok}/${wines.length} imagens coletadas.`);
