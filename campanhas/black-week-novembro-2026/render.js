// Renderiza o card de Black Week em PNG (feed + stories). Uso: node render.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const targets = [
    { file: 'feed.html', width: 1080, height: 1350 },
    { file: 'stories.html', width: 1080, height: 1920 },
  ];
  const browser = await chromium.launch();
  for (const t of targets) {
    const page = await browser.newPage({ viewport: { width: t.width, height: t.height } });
    const f = path.resolve(__dirname, 'instagram', t.file);
    await page.goto('file:///' + f.replace(/\\/g, '/'), { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: f.replace('.html', '.png') });
    console.log(t.file);
    await page.close();
  }
  await browser.close();
})();
