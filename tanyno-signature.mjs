import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: false, args: ['--disable-blink-features=AutomationControlled'] });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});
const page = await context.newPage();

// Login
await page.goto('https://estoque.tanyno.com/login?next=%2Finventory', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2000);
await page.fill('#username', 'marcelo@comnectar.com.br');
await page.fill('#password', 'TANYNO');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
console.log('URL:', page.url());

// Ver os 4 botões
const allSelects = page.locator('button:has-text("Selecionar carta")');
const count = await allSelects.count();
console.log('Total botões Selecionar carta:', count);

// Screenshot para ver o estado
await page.screenshot({ path: 'tanyno-inventory-fresh.png', fullPage: false });

// Clicar no SEGUNDO (índice 1 = SIGNATURE)
console.log('Clicando SIGNATURE (índice 1)...');
await allSelects.nth(1).click();
await page.waitForTimeout(5000);

const text = await page.evaluate(() => document.body.innerText);
console.log('Chars capturados:', text.length);
console.log('Primeiros 300 chars:', text.substring(0, 300));

writeFileSync('tanyno-signature-raw.txt', text, 'utf8');
console.log('Signature salvo!');

await browser.close();
