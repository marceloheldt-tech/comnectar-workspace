// Uso: node .claude/skills/anuncio-vinho/scripts/gerar.js <pasta-do-anuncio>
// A pasta precisa ter foto.jpg (garrafa em fundo branco) e dados.json.
// Gera garrafa.png, gota.png, logo.png, stories.html/png e feed.html/png na mesma pasta.
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '../../../..');
const pasta = path.resolve(process.argv[2] || '');
if (!fs.existsSync(path.join(pasta, 'dados.json'))) {
  console.error('Uso: node gerar.js <pasta-do-anuncio> (com foto.jpg e dados.json)');
  process.exit(1);
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Recorta o fundo branco da garrafa por flood fill a partir das bordas.
// O rótulo branco fica preservado porque está cercado pelo vidro escuro.
// (canvas não abre caminhos com acento no Windows, por isso as imagens entram como buffer)
async function recortarGarrafa(entrada, saida) {
  const img = await loadImage(fs.readFileSync(entrada));
  const w = img.width, h = img.height;
  const c = createCanvas(w, h), ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, w, h), d = id.data;
  const claro = (i) => Math.min(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]) >= 236;
  const fundo = new Uint8Array(w * h);
  const fila = new Int32Array(w * h);
  let ini = 0, fim = 0;
  const push = (i) => { if (!fundo[i] && claro(i)) { fundo[i] = 1; fila[fim++] = i; } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (ini < fim) {
    const i = fila[ini++], x = i % w, y = (i / w) | 0;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x, p = i * 4;
      if (fundo[i]) { d[p + 3] = 0; continue; }
      const borda = (x > 0 && fundo[i - 1]) || (x < w - 1 && fundo[i + 1]) || (y > 0 && fundo[i - w]) || (y < h - 1 && fundo[i + w]);
      if (borda) {
        // pixel de transição: separa o branco do fundo da cor real do vidro
        const v = Math.min(d[p], d[p + 1], d[p + 2]);
        const a = clamp((255 - v) / 225, 0.05, 1);
        for (let k = 0; k < 3; k++) d[p + k] = clamp((d[p + k] - 255 * (1 - a)) / a, 0, 255);
        d[p + 3] = Math.round(a * 255);
      }
      if (d[p + 3] > 20) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(id, 0, 0);
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  const out = createCanvas(cw, ch);
  out.getContext('2d').drawImage(c, minX, minY, cw, ch, 0, 0, cw, ch);
  fs.writeFileSync(saida, out.toBuffer('image/png'));
  return { w: cw, h: ch };
}

// Recolore a gota em vinho, corta a margem e devolve PNG transparente.
async function prepararGota(entrada, saida) {
  const img = await loadImage(fs.readFileSync(entrada));
  const w = img.width, h = img.height;
  const c = createCanvas(w, h), ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, w, h), d = id.data;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const lum = 0.3 * d[p] + 0.59 * d[p + 1] + 0.11 * d[p + 2];
      const a = (d[p + 3] / 255) * clamp((255 - lum) / 189);
      d[p] = 0x99; d[p + 1] = 0x13; d[p + 2] = 0x56; d[p + 3] = Math.round(a * 255);
      if (a > 0.05) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(id, 0, 0);
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  const esc = Math.min(1, 1400 / cw);
  const out = createCanvas(Math.round(cw * esc), Math.round(ch * esc));
  out.getContext('2d').drawImage(c, minX, minY, cw, ch, 0, 0, out.width, out.height);
  fs.writeFileSync(saida, out.toBuffer('image/png'));
}

// Logotipo completo: só corta a margem e tira o branco opaco, sem recolorir.
async function prepararLogo(entrada, saida) {
  const img = await loadImage(fs.readFileSync(entrada));
  const w = img.width, h = img.height;
  const c = createCanvas(w, h), ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, w, h), d = id.data;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      if (Math.min(d[p], d[p + 1], d[p + 2]) >= 250) d[p + 3] = 0;
      if (d[p + 3] > 12) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(id, 0, 0);
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  const esc = Math.min(1, 1400 / cw);
  const out = createCanvas(Math.round(cw * esc), Math.round(ch * esc));
  out.getContext('2d').drawImage(c, minX, minY, cw, ch, 0, 0, out.width, out.height);
  fs.writeFileSync(saida, out.toBuffer('image/png'));
}

(async () => {
  const dados = { nome_style: '', ...JSON.parse(fs.readFileSync(path.join(pasta, 'dados.json'), 'utf8')) };
  const g = await recortarGarrafa(path.join(pasta, 'foto.jpg'), path.join(pasta, 'garrafa.png'));
  await prepararGota(path.join(RAIZ, 'dados/gota-transparente.png'), path.join(pasta, 'gota.png'));

  await prepararLogo(path.join(RAIZ, 'dados/comnectar-transparente.png'), path.join(pasta, 'logo.png'));

  const bandeiras = JSON.parse(fs.readFileSync(path.join(__dirname, '../bandeiras.json'), 'utf8'));
  const svg = bandeiras[(dados.pais || '').toUpperCase()];
  if (!svg) throw new Error('Bandeira não encontrada pra pais=' + dados.pais + ' (adicione em bandeiras.json)');
  dados.bandeira = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

  const modelo = fs.readFileSync(path.join(__dirname, '../template.html'), 'utf8');
  const formatos = { stories: [1080, 1920], feed: [1080, 1350] };
  const browser = await chromium.launch();
  for (const [nome, [W, H]] of Object.entries(formatos)) {
    let html = modelo.replace(/{{FORMATO}}/g, nome).replace(/{{RATIO}}/g, (g.w / g.h).toFixed(4));
    for (const [k, v] of Object.entries(dados)) html = html.replace(new RegExp(`{{${k.toUpperCase()}}}`, 'g'), v);
    fs.writeFileSync(path.join(pasta, `${nome}.html`), html);
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    await page.goto('file:///' + path.join(pasta, `${nome}.html`).replace(/\\/g, '/'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(pasta, `${nome}.png`) });
    await page.close();
    console.log('ok', nome);
  }
  await browser.close();
})();
