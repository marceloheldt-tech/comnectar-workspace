#!/usr/bin/env node
// fetch-tanyno-images.mjs
// Busca as imagens das garrafas nos PDFs do Google Drive (Tanyno)
// Uso: node ".claude/skills/catalogo-tanyno/fetch-tanyno-images.mjs" '[JSON]' 'conteudo/catalogos/data-nome/imagens'

import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

const allWines  = JSON.parse(readFileSync(join(ROOT, 'dados/tanyno-catalogo.json'), 'utf8'));
const driveAut  = JSON.parse(readFileSync(join(ROOT, 'dados/tanyno-drive-autoral.json'), 'utf8'));
const driveSign = JSON.parse(readFileSync(join(ROOT, 'dados/tanyno-drive-signature.json'), 'utf8'));

const wines  = JSON.parse(process.argv[2]);
const outDir = join(ROOT, process.argv[3]);
mkdirSync(outDir, { recursive: true });

// Região de corte da garrafa nos PDFs Tanyno (renderizado a w=1600px, A4 portrait ~2263px tall)
// Garrafa fica na metade direita da página, região central-inferior
const BOTTLE_CLIP = { x: 720, y: 380, width: 820, height: 1350 };

// Cada PDF tem: página 0 = capa, página 1 = índice, páginas 2+ = vinhos em ordem
function getPageIdx(wine) {
  const list = allWines.filter(w => w.produtor === wine.produtor && w.linha === wine.linha);
  const pos  = list.findIndex(w => w.nome === wine.nome && w.safra === wine.safra);
  return pos < 0 ? 2 : 2 + pos;
}

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// Agrupa por produtor para abrir cada PDF uma única vez
const byProducer = {};
for (const wine of wines) {
  const key = `${wine.linha}|||${wine.produtor}`;
  (byProducer[key] = byProducer[key] || []).push(wine);
}

console.log(`\n🍷 Buscando imagens para ${wines.length} vinho(s)...\n`);

// Inicializa browser — tenta Chrome com perfil do usuário (Google logado),
// senão usa Chromium bundled (para Drive compartilhado via link público)
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

for (const [key, group] of Object.entries(byProducer)) {
  const [linha, produtor] = key.split('|||');
  const driveMap = linha === 'Tanyno Autoral' ? driveAut : driveSign;
  const driveUrl = driveMap[produtor];

  if (!driveUrl) {
    console.log(`⚠  ${produtor} — sem Drive URL, imagem omitida`);
    for (const w of group) w._imageSlug = null;
    continue;
  }

  const fileId = driveUrl.match(/\/d\/([^/]+)\//)?.[1];
  if (!fileId) {
    console.log(`⚠  ${produtor} — URL Drive inválida`);
    for (const w of group) w._imageSlug = null;
    continue;
  }

  console.log(`📂 ${produtor} (${group.length} vinho${group.length > 1 ? 's' : ''})`);

  const viewerPage = await browser.newPage();
  try {
    await viewerPage.goto(
      `https://drive.google.com/file/d/${fileId}/view`,
      { waitUntil: 'networkidle', timeout: 30000 }
    );
    await viewerPage.waitForTimeout(4000);

    // Pegar o encoded ID do token da imagem no viewer
    const imgEl  = viewerPage.locator('img[src*="viewer/img"]').first();
    const rawSrc = await imgEl.getAttribute('src', { timeout: 8000 });
    const src    = rawSrc.startsWith('//') ? `https:${rawSrc}` : rawSrc;
    const encodedId = new URL(src).searchParams.get('id');

    if (!encodedId) throw new Error('encodedId não encontrado na página');

    for (const wine of group) {
      const pageIdx = getPageIdx(wine);
      const hiResUrl = `https://drive.google.com/viewer/img?id=${encodedId}&page=${pageIdx}&w=1600`;
      const slug = slugify(`${wine.produtor}-${wine.nome}-${wine.safra}`);
      const outPath = join(outDir, `${slug}.png`);

      console.log(`  🍾 ${wine.nome} ${wine.safra} → página ${pageIdx}`);

      const imgPage = await browser.newPage();
      await imgPage.setViewportSize({ width: 1640, height: 2400 });
      try {
        await imgPage.goto(hiResUrl, { waitUntil: 'load', timeout: 20000 });
        await imgPage.waitForTimeout(1500);
        await imgPage.screenshot({ path: outPath, clip: BOTTLE_CLIP });
        wine._imageSlug = slug;
        console.log(`     ✅ Salvo: ${outPath}`);
      } catch (e) {
        console.log(`     ❌ Erro na página ${pageIdx}: ${e.message}`);
        wine._imageSlug = null;
      } finally {
        await imgPage.close();
      }
    }

  } catch (e) {
    console.log(`  ❌ Erro abrindo Drive: ${e.message}`);
    for (const w of group) w._imageSlug = null;
  } finally {
    await viewerPage.close();
  }
}

// Fecha browser
if (browserInstance) {
  await browserInstance.close();
} else {
  await browser.close();
}

writeFileSync(join(outDir, '_wines.json'), JSON.stringify(wines, null, 2));

const ok   = wines.filter(w => w._imageSlug).length;
const fail = wines.length - ok;
console.log(`\n✅ Concluído: ${ok} imagem(ns) coletada(s)${fail ? `, ${fail} sem imagem` : ''}.`);
console.log(`📄 Dados: ${join(outDir, '_wines.json')}`);
