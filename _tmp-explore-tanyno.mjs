#!/usr/bin/env node
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const context = await browser.newContext({ viewport: null });
const page = await context.newPage();

await page.goto('https://estoque.tanyno.com/inventory', { waitUntil: 'networkidle', timeout: 30000 });
console.log('Janela aberta. Faça login manualmente. Aguardando até 5 minutos...');

const deadline = Date.now() + 5 * 60 * 1000;
let loggedIn = false;
while (Date.now() < deadline) {
  await page.waitForTimeout(2000);
  const url = page.url();
  if (!url.includes('/login')) {
    loggedIn = true;
    break;
  }
}

if (!loggedIn) {
  console.log('Timeout — login não detectado em 5 minutos.');
  await browser.close();
  process.exit(1);
}

console.log('Login detectado! URL atual:', page.url());
await page.waitForTimeout(2000);

// salva o estado de sessão pra reusar depois
await context.storageState({ path: 'c:/Users/marce/Desktop/claude comnéctar/_tmp-tanyno-session.json' });
console.log('Sessão salva.');

await page.screenshot({ path: 'c:/Users/marce/Desktop/claude comnéctar/_tmp-tanyno-inventory.png', fullPage: false });

const bodyText = await page.locator('body').innerText();
console.log('--- Primeiros 3000 chars do body ---');
console.log(bodyText.slice(0, 3000));

await browser.close();
