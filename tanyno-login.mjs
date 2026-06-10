import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false, args: ['--disable-blink-features=AutomationControlled'] });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});
const page = await context.newPage();

await page.goto('https://estoque.tanyno.com/login?next=%2Finventory', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2000);

const inputs = await page.evaluate(() => 
  Array.from(document.querySelectorAll('input')).map(e => ({ type: e.type, name: e.name, id: e.id, placeholder: e.placeholder }))
);
console.log('Inputs:', JSON.stringify(inputs, null, 2));

const buttons = await page.evaluate(() =>
  Array.from(document.querySelectorAll('button')).map(e => ({ type: e.type, text: e.textContent.trim().substring(0, 50) }))
);
console.log('Botões:', JSON.stringify(buttons, null, 2));

await browser.close();
