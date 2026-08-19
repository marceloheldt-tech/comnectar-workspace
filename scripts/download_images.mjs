import { wines } from './alexandre_catalog_data.mjs';
import { mkdirSync, createWriteStream, existsSync, statSync } from 'fs';
import https from 'https';
import path from 'path';

const outDir = 'C:/Users/marce/Desktop/claude comnéctar/conteudo/catalogos/2026-08-19-alexandre-tintos/imagens';
mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      file.close();
      reject(err);
    });
  });
}

const concurrency = 8;
let idx = 0;
let ok = 0, fail = 0;
const failed = [];

async function worker() {
  while (idx < wines.length) {
    const w = wines[idx++];
    const dest = path.join(outDir, `${w.slug}.jpg`);
    try {
      await download(w.imageUrl, dest);
      const size = statSync(dest).size;
      if (size < 500) throw new Error('file too small, likely error page: ' + size);
      ok++;
    } catch (e) {
      fail++;
      failed.push({ slug: w.slug, url: w.imageUrl, err: e.message });
      console.log('FAIL', w.slug, e.message);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`Done. OK=${ok} FAIL=${fail}`);
if (failed.length) console.log(JSON.stringify(failed, null, 2));
