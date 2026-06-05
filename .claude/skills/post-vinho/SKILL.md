---
name: post-vinho
description: >
  Cria posts estáticos de vinhos para Instagram da comnéctar.
  Busca os dados do produto direto no Shopify (nome, uva, safra, teor alcoólico, preço, foto),
  monta um layout elaborado com a foto do vinho ambientado, logo (gota), bandeirinha do país,
  dados e preço, e renderiza em PNG nos formatos feed (1080x1350) e stories (1080x1920).
  Salva em conteudo/redes-sociais/posts-estaticos/[data]-[nome-do-vinho]/.
  Use quando o usuário disser "post do [vinho]", "faz um post do [vinho]",
  "cria o post estático do [vinho]", "post pra instagram do [vinho]".
---

# /post-vinho — Post Estático de Vinho comnéctar

## Dependências

- **Shopify MCP:** buscar dados e imagem do produto
- **Identidade visual:** `marca/design-guide.md`
- **Logos:** `dados/image-2.png` (gota vinho, fundo branco) e `dados/image-3.png` (gota branca, fundo vinho)
- **Playwright CLI:** `npx playwright screenshot`

---

## Workflow

### 1. Buscar dados no Shopify

Usar o Shopify MCP pra buscar o produto pelo nome que o usuário informou:
- Usar `search_products` com o nome do vinho
- Se encontrar mais de um resultado, mostrar a lista e pedir pro usuário escolher
- Extrair: nome completo, uva(s), safra, teor alcoólico, preço, URL da imagem principal, país de origem

Se algum dado não estiver no Shopify (ex: país, safra), perguntar ao usuário antes de continuar.

### 2. Baixar a imagem do produto

```bash
curl -L "[URL_DA_IMAGEM_SHOPIFY]" -o "conteudo/redes-sociais/posts-estaticos/[YYYY-MM-DD]-[slug-do-vinho]/vinho.jpg"
```

Criar a pasta antes:
```bash
mkdir -p "conteudo/redes-sociais/posts-estaticos/[YYYY-MM-DD]-[slug-do-vinho]"
```

### 3. Confirmar dados antes de criar

Mostrar pro usuário:
> "Vou usar esses dados no post:
> - **Vinho:** [nome]
> - **País:** [país] [emoji da bandeira]
> - **Uva:** [uva(s)]
> - **Safra:** [ano]
> - **Teor:** [%] vol.
> - **Preço:** R$ [valor]
>
> Está correto? Quer ajustar algo?"

Aguardar confirmação antes de criar os layouts.

### 4. Criar HTMLs

Criar dois arquivos HTML:
- `feed.html` — 1080x1350px
- `stories.html` — 1080x1920px

**Princípios do layout:**

- Foto do vinho como background full-bleed
- Gradiente escuro progressivo: transparente no topo, ~85% opacity preto no rodapé
- Accent bar lateral: barra fina vinho #991356 (6px) na lateral esquerda
- Logo gota da comnéctar no topo direito: usar `../../../../dados/image-3.png` (gota branca) — tamanho 70x70px
- Bandeira do país: usar emoji unicode da bandeira do país (ex: 🇮🇹 🇫🇷 🇦🇷 🇵🇹 🇪🇸 🇨🇱 🇺🇸 🇿🇦 🇩🇪 🇦🇺) renderizado em fonte grande (48px) + nome do país em uppercase pequeno ao lado
- Nome do vinho: Geotipe (via Google Fonts fallback sans-serif), bold, 64-80px, branco, shadow sutil
- Dados do vinho em linha ou coluna: uva | safra | teor — Rubik, 28px, branco com opacity 0.85
- Preço: Rubik bold, 52px, cor vinho #991356 com fundo branco semitransparente (rounded 8px, padding)
- Badge "comnéctar" discreto no rodapé ou junto ao preço

**Para o feed (1080x1350):** composição mais equilibrada, preço no terço inferior, dados no meio
**Para os stories (1080x1920):** mais espaço vertical — distribuir elementos ao longo da altura, zona inferior 230px livre pra UI do TikTok/Stories

**HTML técnico:**
- Dimensões exatas: `width: 1080px; height: 1350px` (feed) ou `1920px` (stories)
- `overflow: hidden` no body
- Imagem de fundo: `background-image: url('./vinho.jpg'); background-size: cover; background-position: center`
- Google Fonts: `<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">`
- Todos os caminhos de imagem relativos ao arquivo HTML

### 5. Verificar Playwright

```bash
npx playwright screenshot --help 2>/dev/null && echo "OK" || echo "INSTALAR"
```

Se precisar instalar: `npx playwright install chromium`

### 6. Renderizar

```bash
npx playwright screenshot --viewport-size=1080,1350 --full-page "file:///[caminho-absoluto]/feed.html" "feed.png"
npx playwright screenshot --viewport-size=1080,1920 --full-page "file:///[caminho-absoluto]/stories.html" "stories.png"
```

**CHECKPOINT:** Mostrar o `feed.png` primeiro. Se aprovado, mostrar o `stories.png`. Se pedir ajuste, editar o HTML e re-renderizar só aquele formato.

### 7. Gerar legenda

Escrever uma legenda curta pro Instagram:
- Tom informal, leve e polido (sem travessões, sem "não é X, é Y")
- Gancho nos primeiros 125 caracteres
- Destaque pra um detalhe marcante do vinho (não só listar os dados)
- CTA direto: link na bio ou "vem conferir"
- 5-8 hashtags relevantes (#vinho, #vinhos, #vinoteca + hashtags da uva/região)

Salvar legenda em `post-text.md` na mesma pasta.

---

## Output final

```
conteudo/redes-sociais/posts-estaticos/[YYYY-MM-DD]-[nome-do-vinho]/
  vinho.jpg          ← imagem baixada do Shopify
  feed.html          ← layout feed
  feed.png           ← PNG pronto pra publicar (1080x1350)
  stories.html       ← layout stories
  stories.png        ← PNG pronto pra publicar (1080x1920)
  post-text.md       ← legenda + hashtags
```

---

## Regras

- Sempre confirmar os dados com o usuário antes de criar os layouts
- Mostrar feed.png antes de renderizar stories
- Se ajuste for pedido, editar só o HTML necessário e re-renderizar apenas aquele formato
- Sem travessões na legenda
- Se a imagem do Shopify for de baixa qualidade ou não existir, avisar o usuário e pedir uma foto alternativa
- Emojis de bandeira: usar unicode diretamente no HTML (renderizam bem no Chromium via Playwright)
