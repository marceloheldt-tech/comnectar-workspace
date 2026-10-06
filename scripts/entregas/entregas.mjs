// Acompanhamento de despachos Total Express via rastreio público do Total Conecta.
// Lista de despachos em dados/entregas/despachos.json
//
// Uso:
//   node scripts/entregas/entregas.mjs add <CODIGO> [cliente...]   adiciona um despacho
//   node scripts/entregas/entregas.mjs cliente <CODIGO> <cliente...> define o nome do cliente
//   node scripts/entregas/entregas.mjs remove <CODIGO>              tira da lista
//   node scripts/entregas/entregas.mjs list                         mostra a lista atual (sem consultar)
//   node scripts/entregas/entregas.mjs status                       consulta os ativos e imprime JSON com o resumo
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARQ = path.join('dados', 'entregas', 'despachos.json');
const hoje = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

function carregar() {
  if (!fs.existsSync(ARQ)) return { despachos: [] };
  return JSON.parse(fs.readFileSync(ARQ, 'utf8'));
}
function salvar(db) {
  fs.mkdirSync(path.dirname(ARQ), { recursive: true });
  fs.writeFileSync(ARQ, JSON.stringify(db, null, 2) + '\n');
}
const normalizar = c => c.trim().replace(/^tx/i, 'TX').replace(/tx$/i, 'tx');

async function consultar(codigos) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    // marca o aviso "Fique atento" como já visto hoje (mesma chave que a página grava ao fechar o modal)
    try { localStorage.setItem('modal_alert_date', new Date().toISOString().split('T')[0]); } catch {}
  });
  const page = await ctx.newPage();
  let api = {};
  page.on('response', async r => {
    const m = r.url().match(/\/mfe-rastreio\/api\/(basic|order-data)/);
    if (!m) return;
    try { api[m[1]] = await r.json(); } catch {}
  });

  const out = {};
  for (const codigo of codigos) {
    api = {};
    try {
      await page.goto(`https://totalconecta.totalexpress.com.br/rastreamento?codigo=${codigo}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000);
      await page.getByText('Sim, estou ciente').click({ timeout: 3000 }).catch(() => {});
      await page.locator('[data-testid="tracking-search-page-button"]').click({ timeout: 15000 });
      for (let i = 0; i < 20 && !api['order-data']; i++) await page.waitForTimeout(500);
      await page.waitForTimeout(1000);
      const titulo = await page.title();
      if (/429|erro/i.test(titulo)) throw new Error('portal bloqueou a consulta (muitas solicitações) — tentar mais tarde');
      out[codigo] = interpretar(api);
    } catch (e) {
      out[codigo] = { erro: e.message.split('\n')[0] };
    }
    await page.waitForTimeout(4000);
  }
  await browser.close();
  return out;
}

function interpretar(api) {
  const basico = api.basic?.data?.[0];
  const dados = api['order-data']?.data;
  if (!basico && !dados) return { erro: 'código não encontrado no rastreio da Total' };
  const enc = dados?.encomenda || {};
  const eventos = [];
  for (const l of dados?.layouts || []) for (const et of l.etapas || []) for (const s of et.listaStatus || [])
    eventos.push({ etapa: et.traducao?.nome, etapaOrdem: et.ordemNum, status: s.statusDescricao, data: s.data, hora: s.hora,
      insucesso: !!s.isInsucesso, mensagem: s.mensagemEvaTraducao?.mensagemEva || null });
  eventos.sort((a, b) => `${b.data} ${b.hora}`.localeCompare(`${a.data} ${a.hora}`));
  const ult = eventos[0];
  const entregue = eventos.some(e => e.etapaOrdem === 4 && !e.insucesso) || /ENTREGA REALIZADA/i.test(basico?.ultimoStatus?.statusDescricao || '');
  let situacao;
  if (entregue) situacao = 'entregue';
  else if (ult?.insucesso) situacao = 'atencao';
  else if (!ult) situacao = 'aguardando_coleta';
  else if (ult.etapaOrdem === 3) situacao = 'saiu_para_entrega';
  else situacao = 'em_transito';
  return {
    situacao,
    pedidoTotal: enc.pedido || null,
    previsao: enc.previsaoEntrega || null,
    ultimoStatus: ult ? `${ult.status}` : basico?.ultimoStatus?.statusDescricao || null,
    dataStatus: ult ? `${ult.data} ${ult.hora}` : basico?.ultimoStatus?.dataHora || null,
    etapa: ult?.etapa || null,
    mensagem: ult?.mensagem || null,
    eventos: eventos.slice(0, 8),
  };
}

const [cmd, ...resto] = process.argv.slice(2);
const db = carregar();

if (cmd === 'add') {
  const codigo = normalizar(resto[0] || '');
  if (!/^TX/i.test(codigo)) { console.error('código inválido'); process.exit(1); }
  const cliente = resto.slice(1).join(' ') || null;
  const ex = db.despachos.find(d => d.codigo.toLowerCase() === codigo.toLowerCase());
  if (ex) { if (cliente) ex.cliente = cliente; ex.arquivado = false; console.log(`já existia: ${codigo}${cliente ? ' (cliente atualizado)' : ''}`); }
  else { db.despachos.push({ codigo, cliente, adicionadoEm: hoje(), arquivado: false }); console.log(`adicionado: ${codigo}${cliente ? ' — ' + cliente : ''}`); }
  salvar(db);
} else if (cmd === 'cliente') {
  const d = db.despachos.find(x => x.codigo.toLowerCase() === normalizar(resto[0] || '').toLowerCase());
  if (!d) { console.error('código não está na lista'); process.exit(1); }
  d.cliente = resto.slice(1).join(' '); salvar(db); console.log(`${d.codigo} — ${d.cliente}`);
} else if (cmd === 'remove') {
  const antes = db.despachos.length;
  db.despachos = db.despachos.filter(x => x.codigo.toLowerCase() !== normalizar(resto[0] || '').toLowerCase());
  salvar(db); console.log(antes === db.despachos.length ? 'não encontrado' : 'removido');
} else if (cmd === 'list') {
  console.log(JSON.stringify(db.despachos.filter(d => !d.arquivado), null, 2));
} else if (cmd === 'status') {
  const ativos = db.despachos.filter(d => !d.arquivado);
  const res = ativos.length ? await consultar(ativos.map(d => d.codigo)) : {};
  const relatorio = [];
  for (const d of ativos) {
    const r = res[d.codigo];
    if (!r.erro) {
      Object.assign(d, { situacao: r.situacao, pedidoTotal: r.pedidoTotal, previsao: r.previsao, ultimoStatus: r.ultimoStatus,
        dataStatus: r.dataStatus, etapa: r.etapa, ultimaConsulta: hoje() });
      // entregue aparece uma vez no relatório e depois sai da lista ativa
      if (r.situacao === 'entregue') { d.entregueEm = d.entregueEm || (r.dataStatus || '').slice(0, 10); d.arquivado = true; }
    }
    relatorio.push({ codigo: d.codigo, cliente: d.cliente, adicionadoEm: d.adicionadoEm, ...r });
  }
  salvar(db);
  console.log(JSON.stringify({ consultadoEm: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }), hoje: hoje(), relatorio }, null, 2));
} else {
  console.log('comandos: add | cliente | remove | list | status');
}
