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

**Gota colorida (vinho, não branca):** como o fundo é sempre uma foto (não um bloco de cor sólida), a gota não usa o filtro `invert` de `post-vinho`. Usar `mask-image` com `dados/gota-transparente.png` e `background-color: #991356` pra pintar a gota sólida em vinho, ex.:
```css
.gota {
  width: 56px; height: 56px;
  background-color: #991356;
  -webkit-mask-image: url('../../../../dados/gota-transparente.png');
  mask-image: url('../../../../dados/gota-transparente.png');
  -webkit-mask-size: contain; mask-size: contain;
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
}
```

### Slide 1 — Chamada (nome + frase)

- Foto do produto como background full-bleed (`background-size: cover; background-position: center`)
- Caixa de nome: fundo branco, texto preto bold (Rubik 700-900, ~48-56px), padding ~20px 32px, canto superior esquerdo (~48px de margem)
- Caixa de subtítulo: colada embaixo da caixa de nome, **sem espaço entre elas**, fundo vinho `#991356`, texto branco uppercase (Rubik 500, ~22-26px, letter-spacing ~1px), padding ~10px 32px
  - A caixa de nome leva o identificador mais reconhecível do vinho (apelação ou nome de linha/cuvée, o que for mais forte pra marca). A caixa de subtítulo leva o complemento (produtor ou apelação, o que sobrou)
- Texto descritivo: bloco de 1 frase (~2-3 linhas), branco, Rubik 400/700 (frase de destaque em bold), ~28-32px, line-height 1.4, com leve text-shadow pra legibilidade. Termina com seta `→` branca
- Posição do texto descritivo e da gota: adaptar conforme a composição da foto (onde tem área "limpa"), mas sempre longe da garrafa. Gota vinho (~56px) fica perto do bloco de texto
- Painel escuro atrás do texto descritivo se a foto for clara na área de texto (gradiente radial ou linear sutil, opacity baixa o suficiente pra não ficar pesado)

### Slide 2 — Ficha técnica + preço

- Foto do produto como background full-bleed, geralmente mais escura/moody (ambientada)
- Topo esquerdo: emoji de bandeira do país (~40px) + bloco de texto ao lado: linha 1 "Tinto/Branco [uva ou estilo]" (Rubik 400, ~24px, branco), linha 2 bold "[safra] | [Produtor]" (Rubik 700, ~26-28px, branco)
- Bloco de specs, alinhado à direita, ~60-65% da largura pra direita: 3 linhas (REGIÃO, TEOR ALC., UVAS), cada uma com ícone branco pequeno + label uppercase bold (Rubik 700, ~15px) + valor (Rubik 400, ~19px), todos brancos
- Gota vinho (~48px) abaixo do bloco de specs, mesmo alinhamento à direita
- Bloco de preço, alinhado à direita, abaixo da gota: "De: R$ [preço original]" riscado (Rubik 400, ~18px, branco opacity 0.8) · "No pix por:" (mesma linha de cima ou embaixo) · pílula branca arredondada (border-radius ~24px) com o preço pix em vinho bold (Rubik 700, ~34-38px)
- Rodapé direito: "LINK DO SITE NA BIO." (Rubik 500 uppercase, ~16px, branco) + ícone de globo/link pequeno
- Painel escuro atrás do bloco de specs/preço (gradiente lateral, mais forte do lado direito onde fica o texto, transparente do lado da garrafa)

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
