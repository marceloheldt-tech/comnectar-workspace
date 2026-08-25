import { loadImage, createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const [,, inPath, outPath, profileArg] = process.argv;
const profile = profileArg || 'prose'; // 'table' | 'prose' | 'clean' (sem selo, garrafa 100% isolada)

const img = await loadImage(inPath);
const canvas = createCanvas(img.width, img.height);
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0);
const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);

function isBackground(r, g, b) {
  if (r > 225 && g > 225 && b > 225) return true; // branco da página
  // cinza neutro chapado das células de tabela (ex: 209,208,209) — sem cor, sem contraste
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (maxDiff < 8 && r > 195 && r < 226) return true;
  return false;
}

// Pula a faixa cinza-escura fixa da barra lateral do visualizador do Chrome (~0-70px,
// cor constante ~40,40,40) que não é conteúdo real da página.
const searchMinX = 72;
// Pula o topo (logo/título do produtor) — queremos só a garrafa + selos, sem cabeçalho.
const searchMinY = 150;
// Abaixo desse Y (região do rótulo/selos), aceita procurar mais pra direita — é onde os
// selos de avaliação costumam ficar, mesmo em templates onde o texto de bio vaza mais à
// esquerda lá em cima. Acima desse Y, mantém a busca mais estreita pra não pegar o texto.
const lowerZoneY = Math.floor(height * 0.5);
// Perfil 'table': La Horra / Mauro / Roda — tabela de dados técnicos chapada começa perto
// da garrafa (~x=360/460). Manter busca estreita o tempo todo (selos ficam dentro dessa faixa).
// Perfil 'prose': Miguel Merino / Verónica Ortega / Jose Gil / Clos de l'Obac / Sastre —
// texto corrido de bio vaza mais perto no topo, mas selo de avaliação fica bem mais à
// direita e mais embaixo — vale abrir a busca só na metade inferior.
const searchMaxXUpper = profile === 'table' ? Math.floor(width * 0.77) : Math.floor(width * 0.62);
const searchMaxXLower = profile === 'table' ? Math.floor(width * 0.77)
  : profile === 'clean' ? Math.floor(width * 0.62)
  : Math.floor(width * 0.95);

let minX = width, maxX = 0, minY = height, maxY = 0;
for (let y = searchMinY; y < height; y++) {
  const searchMaxX = y < lowerZoneY ? searchMaxXUpper : searchMaxXLower;
  for (let x = searchMinX; x < searchMaxX; x++) {
    const i = (y * width + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (!isBackground(r, g, b)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const pad = 14;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(width, maxX + pad);
maxY = Math.min(height, maxY + pad);

const cropW = maxX - minX;
const cropH = maxY - minY;
console.log(`bbox: x=${minX} y=${minY} w=${cropW} h=${cropH}`);

const outCanvas = createCanvas(cropW, cropH);
const outCtx = outCanvas.getContext('2d');
outCtx.fillStyle = '#ffffff';
outCtx.fillRect(0, 0, cropW, cropH);
outCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

writeFileSync(outPath, outCanvas.toBuffer('image/png'));
console.log('Salvo:', outPath);
