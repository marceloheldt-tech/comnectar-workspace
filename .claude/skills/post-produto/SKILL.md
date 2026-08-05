---
name: post-produto
description: >
  Cria posts comerciais de produto para o feed do Instagram da comnéctar — carrossel de 2 imagens
  (chamada + ficha técnica com preço), a partir de fotos já prontas do produto (não geradas nem
  baixadas do Shopify). Aplica textos, fonte Rubik e elementos de marca por cima das fotos,
  seguindo o padrão visual aprovado em agosto/2026. Diferente da skill `carrossel`, que é pra
  carrossel informativo/narrativo — essa é pro post comercial de produto, mais curto e direto.
  Use quando o usuário disser "post de produto", "post comercial do [vinho]", "carrossel de
  produto", ou "/post-produto".
---

# /post-produto — Post Comercial de Produto comnéctar

## Dependências

- **Shopify:** buscar dados do produto (link fornecido pelo usuário ou MCP)
- **Identidade visual:** `marca/design-guide.md` (cores, fonte Rubik)
- **Logo:** `dados/gota-transparente.png` (símbolo gota)
- **Playwright CLI:** `npx playwright screenshot`
- **Fotos do produto:** fornecidas prontas pelo usuário (não são geradas nem editadas em composição — só recebem texto por cima)

---

## Diferença pra skill `carrossel`

`carrossel` é pra conteúdo narrativo/educacional (8-10 slides, hook, tensão, virada).
`post-produto` é pra post comercial direto: 2 imagens, sem narrativa — chamada + ficha técnica/preço.
Nunca misturar os dois workflows.

---

## Input

O usuário fornece:
- Link do produto na Shopify (pra coletar uva, safra, região, teor, preço)
- 2 fotos prontas do produto (uma pra cada slide)

Imagens vão em `conteudo/redes-sociais/posts-produto/[YYYY-MM-DD]-[slug-do-produto]/slide-01-bg.[ext]` e `slide-02-bg.[ext]`.

## Workflow

### 1. Coletar dados do produto

Usar o link da Shopify (WebFetch ou Shopify MCP) pra extrair: nome, produtor, uva(s), safra, região, país, teor alcoólico, preço original, preço pix (se houver desconto).

### 2. Confirmar dados com o usuário

Mostrar os dados extraídos e o texto que será usado nos dois slides antes de renderizar (mesmo checkpoint da skill `post-vinho`). Nunca inventar preço ou dado que não veio do Shopify — perguntar se faltar algo.

### 3. Escrever o texto do slide 1 (chamada)

Frase curta (1 linha, ~10-16 palavras), tom comnéctar (ver `_contexto/preferencias.md`), com **uma frase em bold** destacando a principal qualidade do vinho (textura, final, aroma, acidez). Nunca genérico — puxar de uma característica real da descrição do produto. Sem travessão, sem clichê.

### 4. Escrever a legenda do Instagram

Legenda curta, gancho nos primeiros 125 caracteres, 1-2 parágrafos, CTA (link na bio), 5-8 hashtags. Salvar em `post-text.md` na pasta do post.

### 5. Criar os HTMLs (1080x1350, feed)

Ver regras de design abaixo. Salvar em `conteudo/redes-sociais/posts-produto/[data]-[produto]/slide-01.html` e `slide-02.html`.

### 6. Renderizar

```bash
npx playwright screenshot --viewport-size=1080,1350 --full-page "file:///[caminho-absoluto]/slide-01.html" "slide-01.png"
npx playwright screenshot --viewport-size=1080,1350 --full-page "file:///[caminho-absoluto]/slide-02.html" "slide-02.png"
```

**CHECKPOINT:** mostrar `slide-01.png` primeiro. Se aprovado, renderizar `slide-02.png`. Ajuste pedido → editar só o HTML daquele slide e re-renderizar.

---

## Regras de design (padrão fixado em agosto/2026)

Baseado em 3 referências: Amarone Satinato (Montresor), Bourgogne Couvent des Jacobins (Louis Jadot), Capisme-e Langhe Nebbiolo (Domenico Clerico). Arquivos originais em `referencias/`.

**Fonte:** Rubik em tudo (títulos, specs, preço) — pesos 400/500/700/900 conforme hierarquia.

**Cores:** só as 3 da marca — branco `#FFFFFF`, preto `#000000`, vinho `#991356`. Nunca adicionar uma quarta cor.

**Legibilidade:** aplicar um painel/gradiente escuro localizado atrás do texto (nunca full-slide). O produto (garrafa) nunca fica atrás de máscara — sempre 100% visível, do lado limpo da foto.

**Gota colorida (vinho):** `dados/gota-transparente.png` já é vinho `#991356` (não precisa tingir), mas o arquivo é um canvas 8001x4500 com a gota ocupando só uma fatia central (bbox aproximado: 34%-65% da largura, 20%-88% da altura). Usar `background-color`/`mask-image` deixa a gota minúscula dentro do elemento. Em vez disso, recortar via `overflow: hidden` + `<img>` posicionado (não usar mask):
```css
.gota { width: 52px; height: 65px; overflow: hidden; position: relative; }
.gota img { position: absolute; top: -19.36px; left: -59.03px; width: 172.16px; height: 96.82px; }
```
```html
<div class="gota"><img src="../../../../dados/gota-transparente.png"></div>
```
Pra outro tamanho W (px): `height = W*1.2586`, `scale = W/2417`, `full-width = 8001*scale`, `full-height = 4500*scale`, `offset-left = -2744*scale`, `offset-top = -900*scale`.

**Atenção Chromium/file://:** o HTML do slide só consegue carregar imagens locais (background, gota) que estejam dentro da própria árvore do projeto via caminho relativo. Um HTML de teste fora da pasta do projeto (ex: em temp/scratchpad) não consegue carregar `dados/gota-transparente.png` por caminho absoluto — sempre testar/renderizar HTMLs de dentro da pasta do post.

### Regra mais importante: nada em cima da garrafa

A garrafa é o elemento principal do post — nunca posicionar texto, caixa ou painel por cima dela. Antes de posicionar qualquer bloco, olhar a foto e identificar onde a garrafa está (geralmente centro ou centro-esquerda) e colocar o conteúdo **ao lado dela** (coluna direita ou esquerda, o que estiver livre), nunca espremido num cantinho pequeno. Depois de renderizar, sempre checar visualmente se algum texto ficou sobre o vidro/rótulo — se ficou, mover o bloco, não diminuir a fonte.

**Layout de referência (validado ago/2026):** um painel de leitura ocupa uma faixa vertical inteira de um dos lados (não uma caixinha arredondada isolada) — gradiente `linear-gradient(to left/right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)` cobrindo ~42-48% da largura, do topo à base do slide. O conteúdo (texto, specs, preço) fica dentro dessa faixa. Isso lê como "editorial", não como uma tarja colada no canto.

**Empilhar blocos de altura variável com flexbox, nunca com `top` fixo em px.** Specs + gota + preço têm alturas diferentes conforme o texto (nome do produtor, tamanho da região etc.) — se cada bloco usa um `top` absoluto calculado à mão, qualquer mudança de conteúdo desalinha tudo e pode sobrepor blocos (já aconteceu: preço sobrepondo a gota). Usar um container pai com `position: absolute` + `display: flex; flex-direction: column; align-items: flex-end` (ou `flex-start`) e deixar os filhos em fluxo normal com `margin-bottom`.

### Slide 1 — Chamada (nome + frase)

- Foto do produto como background full-bleed (`background-size: cover; background-position: center`)
- Caixa de nome: fundo branco, texto preto bold (Rubik 900, ~56-60px), padding ~24px 36px, canto superior esquerdo (~64px de margem)
- Caixa de subtítulo: colada embaixo da caixa de nome, **sem espaço entre elas**, fundo vinho `#991356`, texto branco uppercase (Rubik 500, ~24px, letter-spacing ~2px), padding ~13px 36px
  - A caixa de nome leva o identificador mais reconhecível do vinho (apelação ou nome de linha/cuvée, o que for mais forte pra marca). A caixa de subtítulo leva o complemento (produtor ou apelação, o que sobrou)
- Painel de leitura na lateral **oposta à garrafa** (ver regra acima), largura ~42% do slide, altura total
- Dentro do painel: gota vinho (~50px) → texto descritivo (Rubik 300 com a frase de destaque em 700, ~28-30px, line-height 1.5, largura ~320-340px, text-shadow sutil) → seta `→` branca. Verticalmente centralizado ou no terço médio do slide — nunca colado no topo nem na base

### Slide 2 — Ficha técnica + preço

- Foto do produto como background full-bleed, geralmente mais escura/moody (ambientada)
- Topo esquerdo: bandeira do país (~56px de largura) + bloco de texto ao lado: linha 1 "Tinto/Branco [uva ou estilo]" (Rubik 300, ~28px, branco), linha 2 bold "[safra] | [Produtor]" (Rubik 700, ~32px, branco)
  - **Bandeira: nunca usar emoji** (não renderiza no Chromium/Playwright/Windows, vira caixa "IT" em vez da imagem). Usar `<img>` com SVG base64, mesma tabela da skill `catalogo-vinhos` (`.claude/skills/catalogo-vinhos/SKILL.md`, seção "Bandeiras — SVG Base64"). Se o país não estiver na tabela, gerar um SVG simples de 3 faixas com as cores da bandeira
- Painel de leitura no lado direito (ver regra acima), ~48% do slide
- Dentro do painel (container flex-column, `align-items: flex-end`, ver regra acima), nessa ordem:
  1. 3 linhas de specs (REGIÃO, TEOR ALC., UVAS), cada uma com **ícone SVG inline branco** (~32px, nunca emoji colorido — foge da paleta de 3 cores) acima do texto, label uppercase bold (Rubik 700, ~20px, letter-spacing 1.5px) e valor (Rubik 300, ~27px). `margin-bottom` ~36px entre specs
  2. Gota vinho (~54px)
  3. Preço: "De: R$ [x]" riscado (Rubik 300, ~21px, opacity 0.8) · "No pix por:" (Rubik 300, ~21px) · pílula branca arredondada (border-radius ~30px, padding ~16px 38px) com o preço pix em vinho bold (Rubik 700, ~48px)
  - Ícones prontos (inline SVG, stroke/fill `#FFFFFF`, viewBox `0 0 24 24`, ~32px): globo (região), círculo com barra + 2 pontos (teor alcoólico), cacho de círculos (uvas). Copiar do último `slide-02.html` renderizado ou gerar variação equivalente
- Rodapé direito: "LINK DO SITE NA BIO." (Rubik 500 uppercase, ~18px, branco) + ícone de globo pequeno (emoji 🌐 funciona bem aqui, não é bandeira)

---

## Output final

```
conteudo/redes-sociais/posts-produto/[YYYY-MM-DD]-[slug-do-produto]/
  slide-01-bg.[ext]   ← foto fornecida pelo usuário
  slide-02-bg.[ext]   ← foto fornecida pelo usuário
  slide-01.html / slide-01.png
  slide-02.html / slide-02.png
  post-text.md        ← legenda + hashtags
```

## Regras

- Nunca inventar preço, safra ou dado técnico — sempre puxar do Shopify ou perguntar
- Sempre confirmar dados e texto antes de renderizar
- Mostrar slide-01.png antes de renderizar slide-02.png
- Sem travessão, sem clichê de IA (ver `_contexto/preferencias.md`)
- Produto nunca coberto por painel escuro — sempre 100% visível
- Só as 3 cores da marca (branco, preto, vinho). Nunca uma quarta cor
- Se o usuário pedir ajuste visual, editar o HTML e re-renderizar só o slide alterado
