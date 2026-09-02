import { chromium } from 'playwright';

const OUT = 'C:/Users/marce/AppData/Local/Temp/claude/c--Users-marce-Desktop-claude-comn-ctar/061757e4-902f-4d79-95ae-3d2a61930cc0/scratchpad';

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--disable-blink-features=AutomationControlled'],
});
const context = await browser.newContext({ viewport: { width: 1700, height: 1000 } });
const page = await context.newPage();

await page.goto('https://estoque.tanyno.com/inventory', { waitUntil: 'load', timeout: 30000 });

console.log('Aguardando login... (verificando a cada 3s por até 5 minutos)');

let loggedIn = false;
for (let i = 0; i < 100; i++) {
  await page.waitForTimeout(3000);
  const url = page.url();
  const isInventory = url.includes('/inventory');
  const hasLoginForm = await page.locator('input[type="password"]').count();
  if (isInventory && hasLoginForm === 0) {
    loggedIn = true;
    break;
  }
}

if (!loggedIn) {
  console.log('Timeout esperando login. Feche o browser e tente de novo.');
  process.exit(1);
}

await context.storageState({ path: `${OUT}/tanyno-auth.json` });
console.log('LOGIN_OK - sessão salva em tanyno-auth.json');
await browser.close();
