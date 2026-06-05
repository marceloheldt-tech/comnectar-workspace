# Regras de Design — Carrossel (Elaborado)

> Este arquivo controla como os slides do carrossel são criados visualmente.
> Tu pode editar qualquer regra aqui e o Claude vai seguir na próxima vez que criar um carrossel.

---

## Filosofia

Cada carrossel deve ter personalidade visual própria. Antes de criar qualquer slide, definir uma direção estética forte e executar com precisão. Nunca fazer o óbvio ou o genérico.

**Pensar antes de criar:**
- Qual é o tom do conteúdo? (provocativo, educativo, inspiracional, urgente)
- Qual é a sensação que cada slide deve provocar?
- O que torna esse carrossel memorável? Qual elemento visual alguém vai lembrar?

**NUNCA fazer:**
- Layout previsível e repetitivo (texto em cima, corpo embaixo, todos iguais)
- Cores e fontes genéricas sem personalidade
- Design que parece "template pronto de Canva"
- Fundo sólido chapado em todos os slides

---

## Dimensões

- **Instagram:** 1080x1350px (proporção 4:5)
- **TikTok:** 1080x1920px (proporção 9:16)
- **Safe area:** 56px nas laterais, 80px embaixo

---

## Composição espacial

Não centralizar tudo. Usar o espaço de forma intencional:

- **Assimetria:** texto alinhado à esquerda com respiro generoso à direita, ou o contrário
- **Terço inferior / superior:** concentrar conteúdo numa zona e deixar o resto respirar
- **Elementos que quebram o grid:** número enorme que vaza da safe area, bloco de cor que ocupa metade do slide, borda lateral grossa
- **Sobreposição:** texto por cima de blocos de cor, cards sobrepostos, camadas visuais
- **Densidade controlada:** ou muito ar (editorial) ou muita informação (impacto). Nunca meio-termo morno

---

## Ritmo visual

O carrossel é uma sequência narrativa, não uma coleção de slides iguais.

- Variar entre slides densos e slides com muito respiro
- Alternar fundos claros e escuros (ou variações da paleta)
- Nunca 3 slides seguidos com o mesmo layout
- O slide de CTA deve ser visualmente diferente de todos os outros

---

## Tipografia

Usar as fontes da comnéctar:

- **Títulos e destaques:** Geotipe (grande, confiante — 64-108px)
- **Corpo e subtítulos:** Rubik (legível e limpo — 30-38px, weight regular ou light)
- **Contraste tipográfico:** misturar pesos e tamanhos com propósito
- **Tratamento de palavras-chave:** highlight com cor de fundo, itálico com peso diferente, sublinhado estilizado. Não apenas trocar a cor

---

## Fundos e texturas

Criar atmosfera e profundidade com a paleta da comnéctar (#000000, #991356, #FFFFFF):

- **Gradientes sutis:** dois tons próximos da paleta, angulados (135deg, 160deg)
- **Noise/grain:** overlay de ruído leve (2-4% opacity) pra tirar o look "digital flat". Usar SVG filter inline:
  ```html
  <svg style="position:absolute;width:0;height:0">
    <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter>
  </svg>
  ```
  E no CSS do body: pseudo-element com `filter: url(#noise); opacity: 0.03`
- **Blocos de cor parciais:** retângulo de cor ocupando 30-40% do slide como elemento decorativo
- **Linhas e separadores:** linhas finas como composição (não como divisor genérico)
- **Sombras dramáticas:** text-shadow ou box-shadow com blur grande e cor da paleta

---

## Layouts obrigatórios (variar entre eles)

Usar pelo menos 3 layouts diferentes. Escolher os que fazem sentido pro conteúdo:

- **Editorial:** headline enorme no terço inferior, subtítulo pequeno, resto é respiro puro
- **Número em destaque:** stat gigante (120-200px) com contexto menor. O número É o slide
- **Card com borda:** texto em card com border-left grosso (5-8px) ou borda completa
- **Citação:** aspas decorativas gigantes (200px, opacity 0.08) no fundo, texto itálico por cima
- **Split:** metade do slide é bloco de cor sólida (com número/tag), metade é texto. Divisão vertical
- **Coluna lateral:** barra vertical de cor (40-80px) na esquerda com accent, conteúdo ao lado
- **Full bleed text:** texto enorme, 2-3 palavras por linha, impacto máximo
- **Badge + headline:** tag em badge colorido (background vinho #991356, texto branco) acima da headline

---

## Elementos decorativos

Usar com intenção pra criar profundidade:

- **Números de fundo:** tamanho 300-600px, opacity 3-8%, como textura. Pode vazar da safe area
- **Stripes/linhas diagonais:** linhas finas da cor de destaque cruzando o slide (opacity 0.1-0.3)
- **Glow:** radial-gradient sutil da cor de destaque (#991356) atrás do conteúdo principal (opacity 0.1)
- **Barra de progresso:** 2-3px no rodapé, fill proporcional. Cor vinho em fundos claros, branco em escuros
- **Tags/labels:** texto pequeno uppercase, letter-spacing 3-6px amplo
- **Bordas parciais:** border-left ou border-top apenas, não a caixa toda
- **Accent bar:** barra fina (6-8px) na lateral esquerda do slide inteiro como assinatura visual — usar vinho #991356

---

## Tratamento de imagens

Imagens em `conteudo/redes-sociais/carrosseis/[data]-[tema]/imagens/`, referência relativa no HTML.

- **Capa com foto:** full-bleed + gradiente escuro (0.7-0.9 opacity). Contraste 4.5:1
- **Slide escuro com foto:** overlay 80-90%. Legibilidade primeiro
- **Slide claro com foto:** image box (100% width, ~360px, border-radius 12-20px)
- **Todas as imagens fornecidas devem ser usadas**

---

## Design sem foto

O design brilha sozinho sem foto:

- Números gigantes como visual principal
- Split layouts com blocos de cor sólida
- Gradientes + noise pra profundidade
- Glow radial da cor de destaque vinho
- Stripes diagonais como textura de fundo
- O slide NÃO pode parecer que "faltou a foto"

---

## Logo no slide final

Logo da comnéctar no CTA: usar `dados/image.png` (versão clara) em fundos escuros ou `dados/image-1.png` (versão escura) em fundos claros. Tamanho 120-200px.

---

## HTML técnico

- 1080x1350px, inline CSS, Google Fonts via `<link>` (Rubik do Google Fonts — Geotipe via fallback sans-serif)
- SVG inline pra noise filter e formas decorativas
- Cor vinho #991356 com moderação: highlights, bordas, progress, badge. Nunca como fundo de texto corrido
- Pseudo-elements (::before, ::after) pra overlays e texturas

---

## O que ajustar

- **Muito caótico:** reduz elementos decorativos, aumenta respiro, remove stripes/glow
- **Pouca energia:** adiciona mais texturas, split layouts, números maiores
- **Layout repetitivo:** escolhe layouts diferentes da lista acima
- **Quer estilo específico:** descreve aqui (ex: "mais editorial", "mais impacto")

Qualquer mudança aqui vale pro próximo carrossel. Pede pro Claude: "muda a regra X no design do carrossel" e ele edita este arquivo.
