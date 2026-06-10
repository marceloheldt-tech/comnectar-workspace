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

// === CARTA AUTORAL ===
console.log('Abrindo AUTORAL...');
let btns = page.locator('button:has-text("Selecionar carta")');
let count = await btns.count();
console.log('Botões encontrados:', count);
await btns.first().click();
await page.waitForTimeout(5000);

const autoralText = await page.evaluate(() => document.body.innerText);
writeFileSync('tanyno-autoral-raw.txt', autoralText, 'utf8');
console.log('Autoral salvo! Chars:', autoralText.length);

// === VOLTAR E PEGAR SIGNATURE ===
console.log('Voltando ao inventário...');
await page.goto('https://estoque.tanyno.com/inventory', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(6000); // Aguardar mais tempo pra carregar

let btns2 = page.locator('button:has-text("Selecionar carta")');
let count2 = await btns2.count();
console.log('Botões na segunda vez:', count2);

if (count2 === 0) {
  // Esperar mais
  await page.waitForTimeout(5000);
  count2 = await btns2.count();
  console.log('Após espera extra:', count2);
}

// Screenshot pra ver o estado da página
await page.screenshot({ path: 'tanyno-back.png', fullPage: false });

// Pegar todos os botões disponíveis
const allBtns = await page.evaluate(() =>
  Array.from(document.querySelectorAll('button')).map(e => e.textContent.trim().substring(0, 50))
);
console.log('Todos os botões:', allBtns);

// Tentar clicar no 2º Selecionar carta (índice depende do layout)
if (count2 >= 2) {
  await btns2.nth(1).click();
} else if (count2 === 1) {
  // Talvez só apareceu 1 (só o Signature agora, pois Autoral já foi selecionado)
  await btns2.first().click();
}

await page.waitForTimeout(5000);
const signatureText = await page.evaluate(() => document.body.innerText);
writeFileSync('tanyno-signature-raw.txt', signatureText, 'utf8');
console.log('Signature salvo! Chars:', signatureText.length);

await browser.close();
console.log('Concluído!');
