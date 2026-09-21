---
name: anuncio-vinho
description: >
  Cria a arte de anúncio patrocinado (Instagram Stories 1080x1920 e feed 1080x1350) de um vinho da comnéctar,
  no estilo clean: fundo off-white liso, gota da marca como marca d'água, garrafa recortada em destaque,
  gancho, nome do vinho, cupom e preço de/por no pix. Sem o botão de compra (o botão é inserido no Instagram).
  Use quando o usuário disser "anúncio do [vinho]", "arte de anúncio", "post patrocinado do [vinho]",
  "criativo de tráfego pago do [vinho]", "/anuncio-vinho".
---

# /anuncio-vinho — Arte de anúncio de vinho

Diferente da `/post-vinho` (post orgânico, foto ambientada, muita informação). Aqui é uma peça de venda direta:
poucos elementos, preço como protagonista, layout limpo.

## Dados necessários (perguntar o que faltar)

- Vinho (produtor, nome, safra, tipo)
- Preço de e preço por (no pix) e cupom, se houver
- Gancho (frase curta no topo). Sugestão padrão: "Do **[região]** pra sua mesa." Sem travessão, sem "não é X, é Y"

## Workflow

1. Criar a pasta `conteudo/anuncios/[YYYY-MM-DD]-[slug-do-vinho]/`
2. Colocar nela `foto.jpg` (garrafa em fundo branco, de `dados/imagens-vinhos/` ou do Shopify) e `dados.json`:
   ```json
   { "gancho": "Do <b>Piemonte</b> pra sua mesa.", "produtor": "Mario Costa", "nome": "Langhe Nebbiolo",
     "detalhe": "Tinto · Safra 2024", "cupom": "PRIMEIRACOMPRA5", "preco_de": "299", "preco_por": "210" }
   ```
3. Rodar: `node .claude/skills/anuncio-vinho/scripts/gerar.js conteudo/anuncios/[pasta]`
   (recorta a garrafa, recolore a gota, preenche `template.html` e renderiza `stories.png` e `feed.png`)
4. Mostrar os PNGs pro Marcelo. Ajustes de posição e tamanho ficam no `template.html` (variáveis CSS por formato)

## Regras do layout

- Fundo `#F5F2ED` liso, sem gradiente. Gota `#991356` a ~8,5% de opacidade como marca d'água, reconhecível (nunca ampliada ao ponto de virar mancha)
- Garrafa 100% visível, sem overlay, sombra bem sutil. Nunca gerada por IA
- Stories: topo 250px e base 340px livres pra interface do Instagram. Botão "Comprar agora" NÃO entra na arte
- Preço novo é o maior texto da peça. Serifada (Geotipe, cai pra Palatino se não instalada) nos títulos e valores, Rubik no apoio (precisa de internet pra carregar)
- Só 5 blocos: gancho, produtor + nome, cupom, preço de/por, "no pix". Não adicionar mais que isso
- Se o percentual de desconto for citado, arredondar pra baixo (299 por 210 = 29,8%, então "quase 30%")

## Requisitos

`node_modules` com `canvas` e `playwright` (+ Chromium). Se sumirem entre sessões: `npm i canvas playwright` e `npx playwright install chromium`.
