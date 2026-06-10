---
name: catalogo-tanyno
description: >
  Cria catálogos de vinhos da Tanyno (Autoral e Signature) em PNG + PDF para envio via
  WhatsApp ou email. Filtra vinhos do JSON local, busca imagens das garrafas nos PDFs do
  Google Drive e gera páginas no padrão visual aprovado da comnéctar.
  Use quando o usuário disser "catálogo tanyno", "catálogo autoral", "catálogo signature",
  "vinhos tanyno", "seleciona da Tanyno" ou "/catalogo-tanyno".
---

# /catalogo-tanyno — Catálogo Tanyno comnéctar

## Dados disponíveis

| Arquivo | Conteúdo |
|---------|----------|
| `dados/tanyno-catalogo.json` | 469 vinhos (Autoral + Signature) com preços |
| `dados/tanyno-drive-autoral.json` | Links Drive PDF por produtor (Autoral) |
| `dados/tanyno-drive-signature.json` | Links Drive PDF por produtor (Signature) |

**Estrutura de cada vinho no JSON:**
```json
{
  "linha":      "Tanyno Autoral",
  "regiao":     "ALENTEJO",
  "pais":       "PRT",
  "produtor":   "OUTEIROS ALTOS",
  "nome":       "CONSTANÇA VAI À VINHA - BRANCO",
  "apelacao":   "ALENTEJO",
  "safra":      "2023",
  "volume":     0.75,
  "estoque":    12,
  "preco_a37":  172.19,
  "preco_venda": 267
}
```

`preco_venda` = preço A37 × 1.55 (markup já calculado — usar sempre esse valor).

---

## Workflow

### 1. Receber filtros do usuário

Aceitar qualquer combinação de:
- **Nome do vinho** — busca parcial, case-insensitive (ex: "Barolo", "Constança")
- **Faixa de preço** — ex: "até R$ 400", "entre R$ 200 e R$ 500"
- **Linha** — "Autoral" ou "Signature"
- **País** — usar código do JSON: PRT, ITA, FRA, ESP, DEU, USA, CHL, etc.
- **Região** — ex: "PIEMONTE", "BORGONHA", "ALENTEJO"
- **Produtor** — nome do produtor no JSON
- **Safra** — ex: "2020", "2021"

### 2. Filtrar vinhos do JSON

Ler `dados/tanyno-catalogo.json` e aplicar os filtros recebidos.

```javascript
// Exemplos de filtro:
wines.filter(w => w.preco_venda <= 400)
wines.filter(w => w.pais === 'ITA' && w.preco_venda >= 300 && w.preco_venda <= 600)
wines.filter(w => w.nome.toUpperCase().includes('BAROLO'))
wines.filter(w => w.linha === 'Tanyno Signature')
wines.filter(w => w.regiao === 'PIEMONTE')
```

### 3. Mostrar resumo ao usuário

Antes de qualquer HTML, mostrar tabela resumida e aguardar confirmação:

| # | Vinho | Produtor | Região | País | Safra | Preço |
|---|-------|----------|--------|------|-------|-------|
| 1 | NOME  | PRODUTOR | REGIÃO | PRT  | 2023  | R$ 267 |

> "Encontrei X vinhos. Confirma para gerar o catálogo?"

### 4. Preparar pasta e buscar imagens

**Criar a estrutura de pastas:**
```bash
mkdir -p "conteudo/catalogos/[YYYY-MM-DD]-tanyno-[titulo]/imagens"
```

**Passar os vinhos selecionados para o script de imagens:**
```bash
cd "C:/Users/marce/Desktop/claude comnéctar"
node ".claude/skills/catalogo-tanyno/fetch-tanyno-images.mjs" \
  '[JSON_ARRAY_DOS_VINHOS_SELECIONADOS]' \
  'conteudo/catalogos/[YYYY-MM-DD]-tanyno-[titulo]/imagens'
```

O JSON passado é o array de objetos vinho exatamente como saiu do filtro.

O script:
- Abre os PDFs no Google Drive usando Chrome com sessão do usuário
- Identifica a página correta de cada vinho no PDF do produtor
- Recorta a região da garrafa (metade direita da página, área central)
- Salva PNG por vinho em `imagens/[slug].png`
- Salva `imagens/_wines.json` com os objetos atualizados (campo `_imageSlug`)

**Após o script,** ler `imagens/_wines.json` para ter os slugs de imagem de cada vinho.

### 5. Montar os HTMLs

**Distribuição:** 4 vinhos por página (grid 2×2). Última página pode ter 2 ou 3.

**Estrutura de pastas:**
```
conteudo/catalogos/[YYYY-MM-DD]-tanyno-[titulo]/
  imagens/            ← fotos das garrafas
  _shared.css         ← CSS padrão (copiar do template abaixo)
  catalog-capa.html
  catalog-p1.html
  catalog-p2.html     ← se houver mais de 4 vinhos
  ...
```

---

## Design System

> **Mesmo padrão da skill `catalogo-vinhos` aprovado em junho/2026. Não inventar variações.**

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
  background: #fff; padding: 4px 6px; overflow: hidden;
}
.card-photo img { max-height: 390px; max-width: 96%; object-fit: contain; }
.card-line { width: 100%; height: 1.5px; background: #991356; flex-shrink: 0; }
.card-info {
  padding: 8px 14px 8px; flex: 1;
  display: flex; flex-direction: column; min-height: 0;
}
.wine-name {
  font-family: 'Geotipe', 'Palatino Linotype', Georgia, serif;
  font-size: 16px; color: #000; font-weight: 400;
  line-height: 1.3; margin-bottom: 4px;
}
.wine-producer {
  font-size: 11px; color: #aaa; font-weight: 400;
  letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px;
}
.wine-location {
  font-size: 14px; color: #991356; font-weight: 500;
  letter-spacing: 0.3px; margin-bottom: 2px;
  display: flex; align-items: center; gap: 5px;
}
.spacer { flex: 1; }
.price-block { margin-top: 6px; }
.price-value { font-size: 30px; color: #991356; font-weight: 700; line-height: 1; }
.footer { position: absolute; bottom: 24px; right: 44px; }
.footer img { width: 80px; opacity: 0.65; }
.no-image {
  width: 100%; height: 390px; background: #f9f9f9;
  display: flex; align-items: center; justify-content: center;
  color: #ccc; font-size: 12px; letter-spacing: 1px;
}
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
  body { width: 1080px; height: 1350px; overflow: hidden; background: #fff; font-family: 'Rubik', sans-serif; }
</style>
</head>
<body>
  <div style="position:absolute;left:52px;top:200px;bottom:120px;width:1.5px;background:#bbb;"></div>
  <div style="position:absolute;right:52px;top:200px;bottom:120px;width:1.5px;background:#bbb;"></div>

  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-52%);text-align:center;width:720px;">
    <img src="../../../dados/image.png" alt="comnéctar" style="width:540px;display:block;margin:0 auto 44px;">
    <div style="width:52px;height:1.5px;background:#991356;margin:0 auto 40px;"></div>
    <h1 style="font-family:'Geotipe','Palatino Linotype',Georgia,serif;font-size:52px;color:#000;font-weight:400;letter-spacing:6px;text-transform:uppercase;margin-bottom:20px;line-height:1.25;">[TÍTULO — ex: Seleção Tanyno]</h1>
    <p style="font-size:13px;color:#991356;font-weight:500;letter-spacing:6px;text-transform:uppercase;margin-bottom:36px;">[SUBTÍTULO — ex: Autoral · Itália & Portugal]</p>
    <p style="font-size:12px;color:#666;font-weight:500;letter-spacing:4px;text-transform:uppercase;">[MÊS ANO — ex: Junho 2026]</p>
  </div>

  <div style="position:absolute;bottom:28px;right:44px;">
    <img src="../../../dados/image-2.png" alt="" style="width:88px;opacity:0.75;">
  </div>
</body>
</html>
```

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
      <!-- Flags dos países presentes nesta página, ex: -->
      <img class="flag-img" src="[FLAG_SVG]" alt="[PAIS]">
      [LABEL — ex: Vinhos Italianos · Tanyno Autoral]
    </span>
    <span class="header-label">[MÊS ANO]</span>
  </div>

  <div class="grid">

    <!-- CARD (repetir até 4x por página) -->
    <div class="card">
      <div class="card-photo">
        <!-- Se tem imagem: -->
        <img src="./imagens/[_imageSlug].png" alt="">
        <!-- Se não tem imagem: -->
        <!-- <div class="no-image">SEM IMAGEM</div> -->
      </div>
      <div class="card-line"></div>
      <div class="card-info">
        <p class="wine-name">[nome] [safra]</p>
        <p class="wine-producer">[produtor]</p>
        <p class="wine-location">
          <img class="flag-img" src="[FLAG_SVG]" alt="[pais]">
          [regiao][apelacao ? ' · ' + apelacao : '']
        </p>
        <div class="spacer"></div>
        <div class="price-block">
          <p class="price-value">R$ [preco_venda]</p>
        </div>
      </div>
    </div>

  </div>

  <div class="footer">
    <img src="../../../dados/image-2.png" alt="">
  </div>

</div>
</body>
</html>
```

### Página com 2 vinhos (quando sobram 2 na última página)

Substituir `.grid` por `.grid-2` e adicionar no `<head>`:
```html
<style>
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; flex:1; min-height:0; }
  .grid-2 .card-photo { height: 840px; }
  .grid-2 .card-photo img { max-height: 824px; max-width: 94%; }
</style>
```

---

## Bandeiras SVG Base64

Usar `<img class="flag-img" src="data:image/svg+xml;base64,[BASE64]">` — nunca emoji.

| País | Código | Base64 |
|------|--------|--------|
| Portugal | PRT | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMiIGZpbGw9IiMwMDY2MDAiLz48cmVjdCB4PSIyIiB3aWR0aD0iMyIgaGVpZ2h0PSIzIiBmaWxsPSIjRkYwMDAwIi8+PC9zdmc+` |
| Itália | ITA | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDkyNDYiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2NlMmIzNyIvPjwvc3ZnPg==` |
| França | FRA | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDIzOTUiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2VkMjkzOSIvPjwvc3ZnPg==` |
| Espanha | ESP | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjAuNSIgZmlsbD0iI2M2MGIxZSIvPjxyZWN0IHk9IjAuNSIgd2lkdGg9IjMiIGhlaWdodD0iMSIgZmlsbD0iI2ZmYzQwMCIvPjxyZWN0IHk9IjEuNSIgd2lkdGg9IjMiIGhlaWdodD0iMC41IiBmaWxsPSIjYzYwYjFlIi8+PC9zdmc+` |
| Alemanha | DEU | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxyZWN0IHdpZHRoPSI1IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz48cmVjdCB5PSIxIiB3aWR0aD0iNSIgaGVpZ2h0PSIxIiBmaWxsPSIjREQwMDAwIi8+PHJlY3QgeT0iMiIgd2lkdGg9IjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGQ0UwMCIvPjwvc3ZnPg==` |
| Chile | CHL | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIxIiB3aWR0aD0iMyIgaGVpZ2h0PSIxIiBmaWxsPSIjRDUyQjFFIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMzA4NyIvPjwvc3ZnPg==` |
| EUA | USA | `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3NjAgNDAwIj48cmVjdCB3aWR0aD0iNzYwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0JDMjAyMyIvPjxnIGZpbGw9IiNmZmYiPjxyZWN0IHk9IjMwLjgiIHdpZHRoPSI3NjAiIGhlaWdodD0iMzAuOCIvPjxyZWN0IHk9IjkyLjMiIHdpZHRoPSI3NjAiIGhlaWdodD0iMzAuOCIvPjxyZWN0IHk9IjE1My44IiB3aWR0aD0iNzYwIiBoZWlnaHQ9IjMwLjgiLz48cmVjdCB5PSIyMTUuNCIgd2lkdGg9Ijc2MCIgaGVpZ2h0PSIzMC44Ii8+PHJlY3QgeT0iMjc2LjkiIHdpZHRoPSI3NjAiIGhlaWdodD0iMzAuOCIvPjxyZWN0IHk9IjMzOC41IiB3aWR0aD0iNzYwIiBoZWlnaHQ9IjMwLjgiLz48L2c+PHJlY3Qgd2lkdGg9IjMwNCIgaGVpZ2h0PSIyMTUuNCIgZmlsbD0iIzNDM0I2RSIvPjwvc3ZnPg==` |

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

**Mostrar a capa primeiro para aprovação antes de renderizar as demais.**

---

## Geração do PDF

```bash
node gerar-pdf.mjs
```

Atualizar o `dir` e a lista de `pages` no script antes de rodar.

---

## Regras

- **Preço:** sempre `preco_venda` do JSON, sem casas decimais. Não exibir o preço A37.
- **Bandeiras:** sempre SVG base64 da tabela — nunca emoji (não renderiza no Playwright/Windows)
- **Caminhos:** catálogo fica 3 níveis abaixo da raiz → `../../../dados/image.png`
- **Sem teor ou uva:** o JSON não tem esses campos — omitir, não inventar
- **Estoque:** campo `estoque` no JSON indica unidades disponíveis. Se `estoque = 0`, adicionar tag "Sob Consulta" inline ao lado do preço (usar `.sob-consulta` do CSS padrão)
- **Script de imagens:** usa Chrome com perfil do usuário para acessar Drive — precisa estar logado no Google no Chrome
- **Ordem das páginas do PDF:** capa=0, índice=1, vinhos a partir da página 2. Se a imagem vier errada, o índice pode ser off-by-1 — testar com um vinho antes de rodar em lote
- **Confirmar antes de gerar:** sempre mostrar tabela resumida e aguardar OK antes de criar HTMLs
