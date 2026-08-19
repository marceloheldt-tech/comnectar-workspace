# /catalogo-novidades — Catálogo de Novidades comnéctar

Gera um catálogo em PDF (mesmo padrão visual do `/catalogo-vinhos`) a partir de um **filtro automático no Shopify** — não de uma lista de vinhos escolhida à mão. Usar quando o pedido for do tipo "pega os produtos cadastrados nos últimos X dias", "manda os lançamentos do mês", "catálogo com desconto de Y% em cima do cartão como Pix".

---

## Diferença pro `/catalogo-vinhos`

| | `/catalogo-vinhos` | `/catalogo-novidades` |
|---|---|---|
| Seleção dos vinhos | Usuário manda a lista | Query automática no Shopify (data de cadastro, faixa de preço, tag) |
| Desconto | Opcional, informado por vinho | Percentual único aplicado a todos, tipicamente apresentado como "Valor no Pix" |
| Design/PDF | Mesmo padrão visual | Mesmo padrão visual |

O design system (CSS, templates HTML, bandeiras SVG) é **idêntico** ao `/catalogo-vinhos` — ver esse SKILL.md pra referência completa de `_shared.css`, capa e card de produto. Não duplicar/alterar o design aqui.

---

## Workflow

### 1. Entender o filtro pedido

Perguntas comuns:
- **Por data:** "últimos 60 dias", "cadastrados esse mês" → filtrar por `createdAt`
- **Por preço:** "entre R$300 e R$700" → filtrar por `priceRangeV2`
- **Por desconto:** "aplica 20% e chama de Pix" → guardar o percentual e o rótulo (Pix, promoção, etc)

Se o usuário não especificar o desconto, perguntar se o catálogo vai com o preço cheio do Shopify ou com algum desconto.

### 2. Buscar no Shopify

**Primeiro, tentar as tools MCP nativas** (`search_products`, `graphql_query`) se estiverem conectadas nessa sessão — confirme com `ToolSearch`. Se não estiverem disponíveis (aconteceu em ago/2026), cair pro fallback abaixo.

**Fallback: Admin API direto via `.env`**

O projeto tem `SHOPIFY_SHOP_DOMAIN` e `SHOPIFY_ADMIN_TOKEN` no `.env` da raiz (scopes: `read_products,read_inventory,read_locations`). Ler manualmente (não tem `dotenv` instalado) e bater na Admin GraphQL API:

```js
import fs from 'fs';
import https from 'https';

const envRaw = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const env = {};
for (const line of envRaw.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const SHOP = env.SHOPIFY_SHOP_DOMAIN;
const TOKEN = env.SHOPIFY_ADMIN_TOKEN;

const query = `
query getProducts($query: String!, $cursor: String) {
  products(first: 50, query: $query, after: $cursor, sortKey: CREATED_AT, reverse: true) {
    edges {
      cursor
      node {
        id title createdAt description status
        featuredImage { url }
        images(first: 1) { edges { node { url } } }
        priceRangeV2 { minVariantPrice { amount currencyCode } }
        variants(first: 1) { edges { node { availableForSale price } } }
      }
    }
    pageInfo { hasNextPage }
  }
}`;

// exemplo de filtro por data: created_at:>='2026-06-20T00:00:00Z' AND status:active
// exemplo de filtro por preço: price:>=300 AND price:<=700 AND status:active
```

Paginar com `cursor` até `hasNextPage` ser `false`. Fazer o POST pra `https://${SHOP}/admin/api/2026-07/graphql.json` com header `X-Shopify-Access-Token`.

### 3. Filtrar e limpar os resultados

- **Remover Kits/combos** (títulos que começam com "Kit ") — eles não têm dados de país/região/uva por vinho e quebram o layout do card. Se o usuário quiser incluir, avisar que ficam sem essa informação.
- **Remover produtos sem estoque**, a menos que o usuário peça explicitamente pra incluir como "Sob Consulta" (confirmar com pergunta, não presumir).
- Se o resultado for grande (25+ itens), mostrar a contagem e perguntar se quer o catálogo completo ou um recorte antes de seguir — catálogos muito longos (10+ páginas) podem não ser o que o usuário queria.

### 4. Extrair dados por vinho

Mesma lógica do `/catalogo-vinhos`: país, região, uva(s) e teor alcoólico a partir da `description`. Ler a descrição **completa** (não truncar) — o teor costuma aparecer no meio do texto, não no início. Quando não encontrado, usar os valores típicos por estilo já documentados no `/catalogo-vinhos`.

Bandeiras: usar a tabela SVG base64 do `/catalogo-vinhos`. Países que não estão nessa tabela (ex: Brasil, Estados Unidos) precisam de SVG novo — gerar um simplificado (retângulos/formas básicas) e converter pra base64 com Node, não usar emoji.

### 5. Calcular o preço com desconto

```js
const precoPix = Math.round(precoCheio * (1 - desconto)); // ex: desconto = 0.20
```

Sempre arredondar sem casas decimais. No card, mostrar:
- Preço cheio (cor `#bbb`, sem risco — nunca `text-decoration: line-through`)
- Um rótulo curto acima do preço com desconto, indicando o que ele representa (ex: "VALOR NO PIX"), em `#991356`, uppercase, letter-spacing — classe extra `.price-pix-label` (não faz parte do `_shared.css` original do `/catalogo-vinhos`, pode ser adicionada localmente nesse catálogo)
- Preço com desconto em destaque (`.price-discount`)

### 6. Mostrar tabela resumida e confirmar

Antes de gerar qualquer HTML: tabela com nome, produtor, país, teor, preço cheio e preço com desconto pra todos os itens. Esperar confirmação do usuário — é o ponto certo pra ele pedir remoção de algum item (ex: tirar os sem estoque).

### 7. Baixar imagens, montar HTML, renderizar, gerar PDF

Seguir exatamente o processo do `/catalogo-vinhos`: 4 vinhos por página, mesmo `_shared.css`, capa com `dados/comnectar-transparente.png`. Renderizar a capa primeiro pra aprovação antes das páginas de produto.

**Gerar o PDF com Playwright direto (mais confiável que abrir screenshot por screenshot):**

```js
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';

const browser = await chromium.launch();
const context = await browser.newContext();
const pdfBuffers = [];
for (const name of pages) { // ['catalog-capa', 'catalog-p1', ...]
  const page = await context.newPage();
  await page.goto(`file:///${dir}/${name}.html`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1000); // dá tempo da fonte do Google Fonts carregar
  pdfBuffers.push(await page.pdf({ width: '1080px', height: '1350px', printBackground: true }));
  await page.close();
}
await browser.close();

const merged = await PDFDocument.create();
for (const buf of pdfBuffers) {
  const doc = await PDFDocument.load(buf);
  (await merged.copyPages(doc, doc.getPageIndices())).forEach(p => merged.addPage(p));
}
writeFileSync(`${dir}/[Nome do Catálogo].pdf`, await merged.save());
```

**Não usar `waitUntil: 'networkidle'`** — em ago/2026 isso deu timeout de 30s consistentemente (provavelmente por causa do fetch do Google Fonts). `'load'` + um `waitForTimeout(1000)` funcionou.

**Cuidado com o sistema ficando sobrecarregado:** cada `playwright screenshot` via CLI abre um Chromium novo que às vezes não fecha limpo, acumulando processos e deixando a máquina lenta. Se isso acontecer, **nunca rodar `Stop-Process` em massa sobre `chrome.exe`** — não dá pra diferenciar processos do Chromium do Playwright do Chrome de verdade do usuário pelo nome, e isso pode fechar as abas dele sem aviso. Preferir esperar o processo terminar sozinho, ou usar `taskkill /PID` num PID específico do Playwright se identificável.

---

## Nomenclatura de pasta e arquivo

```
conteudo/catalogos/[YYYY-MM-DD]-[nome-curto]/
```

Nome do PDF = título pedido pelo usuário (ex: "Novidades comnéctar.pdf").
