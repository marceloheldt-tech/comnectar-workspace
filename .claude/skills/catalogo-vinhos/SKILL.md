---
name: catalogo-vinhos
description: >
  Cria catálogos de vinhos da comnéctar em PNG + PDF para disparo via WhatsApp ou email.
  Busca foto e dados no Shopify (país, região, uva, teor alcoólico), aplica desconto se
  informado, e gera páginas visuais no padrão visual aprovado em junho/2026.
  Use quando o usuário disser "faz um catálogo", "catálogo de vinhos", "gera catálogo",
  "catálogo pra disparar", "catálogo com esses vinhos", ou "/catalogo-vinhos".
---

# /catalogo-vinhos — Catálogo de Vinhos comnéctar

## Dependências

- **Shopify MCP:** `search_products`, `graphql_query` — buscar dados e imagens
- **Logos:** `dados/comnectar-transparente.png` (logo comnéctar, fundo transparente) · `dados/gota-transparente.png` (gota, fundo transparente)
- **Playwright CLI:** `npx playwright screenshot --browser chromium`
- **Node.js:** `node gerar-pdf.mjs` (script na raiz do projeto)

---

## Workflow

### 1. Receber a lista de vinhos

O usuário manda a seleção de vinhos. Pode incluir:
- Nomes dos vinhos
- Preços cheios + percentual de desconto (ex: "20% de desconto")
- Faixa de preço a buscar (ex: "italianos e franceses entre R$ 500 e R$ 700")
- Restrição de tipo (ex: "só tintos")

Se o usuário não especificar desconto, confirmar: o preço vai ao catálogo como está no Shopify?

### 2. Buscar dados no Shopify

Usar `search_products` com os nomes ou filtros informados. Para busca por faixa de preço:
```
query: "price:>=500 AND price:<=700"
```

Para cada produto coletar:
- `title` — nome completo
- `images.edges[0].node.src` — URL da primeira imagem
- `description` — texto descritivo (extrair país, região, uva, teor)
- `priceRange.minVariantPrice.amount` — preço atual

**Extrair da description:**
| Campo | Como encontrar |
|-------|---------------|
| País | Menção explícita de país ou região geográfica |
| Região | DOC/IGT/AOC ou nome de sub-região |
| Uva(s) | Castas mencionadas |
| Teor | "X% vol." ou "teor de X%" — se não encontrar, usar valor típico do estilo |
| Estoque | `variants.edges[0].node.availableForSale` |

**Vinhos sem estoque:** incluir com tag "Sob Consulta" — são vinhos que podem ser repostos.

**Arredondar preços:** sem casas decimais (R$ 511, não R$ 511,20).

**Teor típico por estilo quando não encontrado no Shopify:**
- Amarone: 15% | Barolo/Barbaresco: 14% | Brunello: 14,5%
- Chianti Classico: 13,5% | Etna Rosso: 13% | Toscana IGT: 13,5%
- Bordeaux genérico: 13% | Pinot Noir Borgonha/Jura: 12,5%
- Malbec argentino: 14% | Cabernet Chileno: 13,5%

### 3. Baixar imagens

```bash
mkdir -p "conteudo/catalogos/[YYYY-MM-DD]-[nome]/imagens"
curl -L "[URL]" -o "conteudo/catalogos/[YYYY-MM-DD]-[nome]/imagens/[slug].jpg"
```

### 4. Mostrar resumo ao usuário

Antes de criar qualquer HTML, mostrar tabela resumida:
| Vinho | País | Região | Uva | Teor | Preço cheio | Preço c/ desconto |
|-------|------|--------|-----|------|-------------|-------------------|

Aguardar confirmação antes de continuar.

### 5. Montar HTMLs

**Distribuição:** 4 vinhos por página (grid 2×2). A última página pode ter 2 ou 3 vinhos.

**Estrutura de pastas:**
```
conteudo/catalogos/[YYYY-MM-DD]-[nome]/
  imagens/           ← fotos dos vinhos
  _shared.css        ← CSS compartilhado (copiar exatamente conforme template abaixo)
  catalog-capa.html
  catalog-p1.html
  catalog-p2.html    ← se houver mais de 4 vinhos
  ...
```

---

## Design System — Padrão Aprovado

> **Este design foi aprovado em junho/2026 e deve ser reproduzido exatamente. Não inventar variações.**

### Dimensões e estrutura

- **Formato:** 1080×1350px por página (feed Instagram / WhatsApp)
- **Fundo:** branco `#fff` em todas as páginas
- **Paleta:** preto `#000` · vinho `#991356` · cinza claro `#aaa` / `#bbb` / `#ccc` / `#f0f0f0`
- **Fonte corpo:** Rubik (Google Fonts) — pesos 300, 400, 500, 700
- **Fonte títulos de vinho:** Geotipe (fallback: Palatino Linotype, Georgia, serif)

### CSS compartilhado — `_shared.css`

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px; height: 1350px;
  overflow: hidden; background: #fff;
  font-family: 'Rubik', sans-serif; position: relative;
}
.page {
  width: 1080px; height: 1350px;
  padding: 40px 44px 68px;
  position: relative; display: flex; flex-direction: column;
}
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 18px; border-bottom: 1px solid #f0f0f0;
  margin-bottom: 22px; flex-shrink: 0;
}
.header-label {
  font-size: 12px; color: #bbb; letter-spacing: 3px;
  text-transform: uppercase; font-weight: 400;
  display: flex; align-items: center; gap: 6px;
}
.flag-img {
  height: 14px; width: auto; display: inline-block;
  vertical-align: middle; box-shadow: 0 0 0 0.5px #ddd;
}
.grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 20px; flex: 1; min-height: 0;
}
.card { display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
.card-photo {
  flex-shrink: 0; height: 400px;
  display: flex; align-items: center; justify-content: center;
  background: #fff; padding: 4px 6px;
}
.card-photo img { max-height: 390px; max-width: 96%; object-fit: contain; }
.card-line { width: 100%; height: 1.5px; background: #991356; flex-shrink: 0; }
.card-info {
  padding: 8px 14px 8px; flex: 1;
  display: flex; flex-direction: column; min-height: 0;
}
.wine-name {
  font-family: 'Geotipe', 'Palatino Linotype', Georgia, serif;
  font-size: 19px; color: #000; font-weight: 400;
  line-height: 1.3; margin-bottom: 4px;
}
.wine-location {
  font-size: 14px; color: #991356; font-weight: 500;
  letter-spacing: 0.3px; margin-bottom: 2px;
  display: flex; align-items: center; gap: 5px;
}
.wine-grape { font-size: 14px; color: #555; margin-bottom: 2px; line-height: 1.35; }
.wine-alcohol { font-size: 13px; color: #aaa; margin-bottom: 1px; }
.spacer { flex: 0; height: 0; }
.price-block { margin-top: 0; }
.price-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.sob-consulta {
  display: inline-block; font-size: 9px; color: #991356;
  border: 1px solid #991356; padding: 2px 8px;
  letter-spacing: 1.5px; text-transform: uppercase;
  font-weight: 500; white-space: nowrap;
}
.price-original {
  font-size: 12px; color: #ccc; text-decoration: line-through;
  font-weight: 400; margin-bottom: 1px;
}
.price-discount { font-size: 30px; color: #991356; font-weight: 700; line-height: 1; }
.footer { position: absolute; bottom: 24px; right: 44px; }
.footer img { width: 80px; opacity: 0.65; }
```

### Template da Capa — `catalog-capa.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1350px; overflow: hidden; background: #fff; font-family: 'Rubik', sans-serif; position: relative; }
</style>
</head>
<body>
  <!-- Linhas laterais decorativas -->
  <div style="position:absolute; left:52px; top:200px; bottom:120px; width:1.5px; background:#bbb;"></div>
  <div style="position:absolute; right:52px; top:200px; bottom:120px; width:1.5px; background:#bbb;"></div>

  <!-- Conteúdo central -->
  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-52%); text-align:center; width:720px;">
    <img src="../../../dados/comnectar-transparente.png" alt="comnéctar" style="width:540px; display:block; margin:0 auto 44px;">
    <div style="width:52px; height:1.5px; background:#991356; margin:0 auto 40px;"></div>
    <h1 style="font-family:'Geotipe','Palatino Linotype',Georgia,serif; font-size:52px; color:#000; font-weight:400; letter-spacing:6px; text-transform:uppercase; margin-bottom:20px; line-height:1.25;">[TÍTULO DA SELEÇÃO]</h1>
    <p style="font-size:13px; color:#991356; font-weight:500; letter-spacing:6px; text-transform:uppercase; margin-bottom:36px;">[SUBTÍTULO — ex: Tintos · Itália & França]</p>
    <p style="font-size:12px; color:#666; font-weight:500; letter-spacing:4px; text-transform:uppercase;">[MÊS ANO — ex: Junho 2026]</p>
  </div>

  <!-- Gota rodapé -->
  <div style="position:absolute; bottom:28px; right:44px;">
    <img src="../../../dados/gota-transparente.png" alt="" style="width:88px; opacity:0.75;">
  </div>
</body>
</html>
```

> **Atenção ao caminho das imagens:** o catálogo fica em `conteudo/catalogos/[data]-[nome]/`, que são **3 níveis** abaixo da raiz. Use `../../../dados/comnectar-transparente.png`.

### Template de Página de Produto — `catalog-p1.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./_shared.css">
</head>
<body>
<div class="page">

  <div class="header">
    <span class="header-label">
      <img class="flag-img" src="[FLAG_SVG_BASE64]" alt="[PAÍS]">
      [LABEL — ex: Vinhos Italianos]
    </span>
  </div>

  <div class="grid">
    <!-- CARD DE VINHO (repetir 4x por página) -->
    <div class="card">
      <div class="card-photo">
        <img src="./imagens/[slug-vinho].jpg" alt="">
      </div>
      <div class="card-line"></div>
      <div class="card-info">
        <p class="wine-name">[Nome do Vinho Safra] — [Produtor]</p>
        <p class="wine-location"><img class="flag-img" src="[FLAG_SVG_BASE64]" alt="[PAÍS]"> [País] · [Região] · [Sub-região]</p>
        <p class="wine-grape">[Uva 1] · [Uva 2]</p>
        <p class="wine-alcohol">[XX]% vol.</p>
        <div class="spacer"></div>
        <div class="price-block">
          <p class="price-original">De R$ [PREÇO CHEIO]</p>
          <!-- Se tiver sob consulta: -->
          <div class="price-row">
            <p class="price-discount">R$ [PREÇO COM DESCONTO]</p>
            <span class="sob-consulta">Sob Consulta</span>  <!-- só se sem estoque -->
          </div>
          <!-- Se tiver estoque normal: -->
          <p class="price-discount">R$ [PREÇO COM DESCONTO]</p>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <img src="../../../dados/gota-transparente.png" alt="">
  </div>

</div>
</body>
</html>
```

### Página com 2 vinhos (última página quando sobram 2)

Adicionar `<style>` extra no head:

```html
<style>
  .grid-2 {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 20px; flex: 1; min-height: 0;
  }
  .grid-2 .card-photo { height: 850px; }
  .grid-2 .card-photo img { max-height: 834px; max-width: 94%; }
</style>
```

Usar `<div class="grid-2">` no lugar de `<div class="grid">`.

---

## Bandeiras — SVG Base64

Usar `<img class="flag-img" src="data:image/svg+xml;base64,[BASE64]" alt="[SIGLA]">` no `wine-location` e no `header-label`.

| País | Sigla | Base64 |
|------|-------|--------|
| Itália | IT | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDkyNDYiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2NlMmIzNyIvPjwvc3ZnPg==` |
| França | FR | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDIzOTUiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2VkMjkzOSIvPjwvc3ZnPg==` |
| Alemanha | DE | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxyZWN0IHdpZHRoPSI1IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz48cmVjdCB5PSIxIiB3aWR0aD0iNSIgaGVpZ2h0PSIxIiBmaWxsPSIjREQwMDAwIi8+PHJlY3QgeT0iMiIgd2lkdGg9IjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGQ0UwMCIvPjwvc3ZnPg==` |
| Argentina | AR | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjAuNjY3IiBmaWxsPSIjNzRBQ0RGIi8+PHJlY3QgeT0iMC42NjciIHdpZHRoPSIzIiBoZWlnaHQ9IjAuNjY2IiBmaWxsPSIjZmZmIi8+PHJlY3QgeT0iMS4zMzMiIHdpZHRoPSIzIiBoZWlnaHQ9IjAuNjY3IiBmaWxsPSIjNzRBQ0RGIi8+PC9zdmc+` |
| Espanha | ES | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjAuNSIgZmlsbD0iI2M2MGIxZSIvPjxyZWN0IHk9IjAuNSIgd2lkdGg9IjMiIGhlaWdodD0iMSIgZmlsbD0iI2ZmYzQwMCIvPjxyZWN0IHk9IjEuNSIgd2lkdGg9IjMiIGhlaWdodD0iMC41IiBmaWxsPSIjYzYwYjFlIi8+PC9zdmc+` |
| Portugal | PT | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMiIGZpbGw9IiMwMDY2MDAiLz48cmVjdCB4PSIyIiB3aWR0aD0iMyIgaGVpZ2h0PSIzIiBmaWxsPSIjRkYwMDAwIi8+PC9zdmc+` |
| Chile | CL | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIxIiB3aWR0aD0iMyIgaGVpZ2h0PSIxIiBmaWxsPSIjRDUyQjFFIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMzA4NyIvPjwvc3ZnPg==` |
| Uruguai | UY | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIwLjIyMiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIwLjY2NiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIxLjExMSIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIxLjU1NiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48L3N2Zz4=` |
| África do Sul | ZA | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDdBNEQiLz48cmVjdCB5PSIwLjY2NyIgd2lkdGg9IjMiIGhlaWdodD0iMC42NjYiIGZpbGw9IiNmZmYiLz48cG9seWdvbiBwb2ludHM9IjAsMCAxLDEgMCwyIiBmaWxsPSIjMDAwIi8+PHBvbHlnb24gcG9pbnRzPSIwLDAuMiAwLjgsMSAwLDEuOCIgZmlsbD0iI0ZGQjYxMiIvPjwvc3ZnPg==` |

---

## Renderização das páginas

```bash
CATALOG="C:/Users/marce/Desktop/claude comnéctar/conteudo/catalogos/[PASTA]"

npx playwright screenshot --browser chromium --viewport-size=1080,1350 --full-page \
  "file:///$CATALOG/catalog-capa.html" "$CATALOG/catalog-capa.png"

npx playwright screenshot --browser chromium --viewport-size=1080,1350 --full-page \
  "file:///$CATALOG/catalog-p1.html" "$CATALOG/catalog-p1.png"
# repetir para cada página
```

**Mostrar a capa primeiro para aprovação. Só renderizar as demais após OK.**

---

## Geração do PDF

Script `gerar-pdf.mjs` salvo na raiz do projeto. Para usar, ajustar o `dir` e rodar:

```bash
node gerar-pdf.mjs
```

O script abre cada HTML no Playwright, gera PDF individual por página e mescla tudo com `pdf-lib`. Dependências já instaladas: `playwright` e `pdf-lib` em `node_modules/`.

Para um novo catálogo, atualizar o `dir` e a lista de `pages` no script.

---

## Regras

- **Não alterar o design system** — cores, fontes, dimensões e estrutura estão aprovadas
- **Preço arredondado** — sem casas decimais (R$ 511, não R$ 511,20)
- **Vinhos sem estoque** → incluir com "Sob Consulta" inline ao lado do preço
- **Teor alcoólico** → colocar em todos os vinhos; usar valores típicos se não constar no Shopify
- **Bandeiras** → usar SVG base64 da tabela, nunca emoji (não renderiza corretamente no Playwright/Windows)
- **Caminhos de imagem** → 3 níveis acima da raiz: `../../../dados/comnectar-transparente.png`
- **Última página com 2 vinhos** → usar layout `grid-2` com photos de 850px
- **Confirmar dados antes de criar HTMLs** — mostrar tabela resumida e esperar aprovação
