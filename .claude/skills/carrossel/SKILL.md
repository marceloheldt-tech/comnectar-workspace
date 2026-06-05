---
name: carrossel
description: >
  Cria carrosséis completos de conteúdo editorial para Instagram e TikTok da comnéctar.
  Pesquisa o tema (vinhos, produtores, regiões, notícias do mundo do vinho), escreve o texto
  slide a slide com arco narrativo que deixa curiosidade pro próximo slide, cria os layouts
  em HTML com a identidade visual da comnéctar e renderiza em PNG via Playwright.
  Salva em conteudo/redes-sociais/carrosseis/[data]-[tema]/.
  Use quando o usuário mencionar "carrossel", "faz um carrossel", "slides instagram",
  "conteúdo sobre [tema de vinho]", ou pedir pra transformar um tema em carrossel.
---

# /carrossel — Criação de Carrossel comnéctar

## Setup (primeira vez)

Antes de criar qualquer carrossel, checar 3 coisas. Se tudo estiver OK, pular direto pro workflow.

### 1. Design guide e identidade visual

Ler `marca/design-guide.md`. O design já está configurado:
- Cor de destaque: Vinho `#991356`
- Texto: Preto `#000000`
- Fundo: Branco `#FFFFFF` ou Preto `#000000`
- Títulos: Geotipe / Corpo: Rubik
- Logos em `dados/image.png` (clara) e `dados/image-1.png` (escura)
- Estilo: Elaborado (já definido)

Se algo estiver desatualizado, perguntar antes de continuar.

### 2. Tom de voz

Ler `_contexto/preferencias.md`. Tom já configurado: informal, leve, educado, polido. Sem travessões, sem construções de contraste, sem frases curtas dramáticas.

### 3. Playwright

Verificar se Playwright tá instalado:

```bash
npx playwright screenshot --help 2>/dev/null && echo "OK" || echo "INSTALAR"
```

Se precisar instalar:

```bash
npx playwright install chromium
```

Avisar que tá instalando (demora uns 30s na primeira vez).

---

## Dependências

- **Identidade visual:** `marca/design-guide.md`
- **Regras de design:** `.claude/skills/carrossel/references/design-carrossel.md`
- **Contexto:** `_contexto/empresa.md`
- **Tom de voz:** `_contexto/preferencias.md`
- **Playwright CLI:** `npx playwright screenshot`

## Input

O usuário fornece:
- Tema, ideia, texto livre, link ou arquivo de referência
- Imagens (opcional): se anexar fotos de vinhos, usar nos slides
- Número de slides desejado (padrão: 6-7 slides conforme padrão da comnéctar)

---

## Workflow em 3 Fases

### Fase 1 — Texto

1. Ler `_contexto/preferencias.md` pra calibrar tom
2. Ler `_contexto/empresa.md` pra entender contexto e público (amantes de vinho premium)
3. Se o input for um link, buscar o conteúdo:
   - **Links normais (artigos, blogs):** tentar WebFetch direto. Se falhar, usar Jina Reader: `https://r.jina.ai/[URL]`
   - **Links do Instagram:** WebFetch não funciona. Pedir pro usuário copiar o texto e colar
   - **Links do YouTube:** usar `/yt-transcript` se disponível, senão tentar WebFetch
4. **Se mencionar algo desconhecido** (produtor, região, uva, evento): pesquisar com WebSearch antes de escrever. Nunca chutar
5. Definir o ângulo: educacional, oportunidade de compra, bastidores do vinho, curiosidade histórica, contrário ao senso comum

6. **Briefing rápido** — perguntar numa mensagem só:
   > "Antes de escrever, me confirma:
   > - Quantos slides? (padrão comnéctar: 6-7)
   > - Tem imagem pra usar? Se sim, joga em `conteudo/redes-sociais/carrosseis/[data]-[tema]/imagens/` e me diz o nome
   > - CTA do último slide? (ex: 'link na bio', 'comenta aqui', 'vem conferir no site')
   > - Tipo: curiosidade histórica, análise de produtor, notícia do mundo do vinho, dica de harmonização, ou outro?"

   Se o usuário responder tudo junto, não perguntar mais. Usar bom senso pros campos que faltaram.

7. **Planejar a espinha dorsal e mostrar pro usuário:**

   > **Espinha dorsal do carrossel:**
   >
   > **Ângulo:** [a tese sobre o tema]
   >
   > **Tensão central:** [a fricção, dado surpreendente ou curiosidade que prende]
   >
   > **Mecanismo:** [o porquê, a causa real]
   >
   > **Provas:** [2-3 evidências concretas — dados, história, produtor específico]
   >
   > **Virada:** [o que muda pra quem tá lendo]
   >
   > **5 opções de capa:**
   > A: [título] / [subtítulo]
   > B: [título] / [subtítulo]
   > C: [título] / [subtítulo]
   > D: [título] / [subtítulo]
   > E: [título] / [subtítulo]
   >
   > Qual capa tu prefere? E a narrativa tá no caminho certo ou quer ajustar?

   **CHECKPOINT 1:** Esperar aprovação da capa e da direção narrativa antes de escrever.

   Cada opção de capa: título (max 8 palavras) + subtítulo próprio. Criar tensão ou curiosidade sobre vinho. Nunca descritivo ("5 curiosidades sobre Barolo"), sempre com ângulo ("por que o Barolo passa décadas esperando pra ser bebido").

8. **Escrever os slides** com base na espinha dorsal aprovada. Arco narrativo:

   **Slide 1 (Capa):** usar a capa escolhida.

   **Slide 2 (Hook):** abre com fato, dado ou situação sobre o tema que cria tensão. Termina preparando o próximo sem precisar dizer "swipe pra ver mais".

   **Slides 3-4 (Mecanismo):** explica POR QUE. Dados concretos: número + fonte + ano. Se não tiver dado, usar exemplo real e específico (nome do produtor, safra, região). Nunca genérico.

   **Slides 5-6 (Aprofundamento):** um ponto por slide, cada um adicionando uma camada nova. Se o slide 5 apresenta um dado, o slide 6 contradiz ou expande.

   **Slide final (CTA):** chamada pra ação + logo comnéctar. Uma frase-ponte que conecta o conteúdo com a ação. Curto.

**Regras de escrita:**
- Cada slide é um parágrafo que flui com conectivos naturais (porque, só que, por isso, enquanto, mas, então)
- Artigos sempre presentes: "um produtor", "a região", "os taninos"
- Preferir 2 frases curtas com ponto a 1 frase longa com vírgula
- Cada slide termina preparando o próximo pela tensão narrativa, não por aviso
- Toda afirmação factual precisa de especificidade. Se não tiver dado verificável, não inventar

**Padrões proibidos:**
- Sem travessões (—)
- Sem "não é X, é Y" ou construções de contraste
- Sem frases curtas dramáticas em sequência
- Sem "e isso muda tudo", "no fim das contas", "simplesmente", "basicamente"
- Sem aberturas genéricas: "hoje vamos falar sobre", "neste carrossel tu vai"
- Sem fechamentos fracos: "continue no próximo", "swipe pra ver mais"

9. Gerar legenda Instagram:
   - Gancho nos primeiros 125 caracteres
   - 2-3 parágrafos curtos
   - CTA no final
   - 5-10 hashtags relevantes (vinho, mercado premium, tema específico)

10. Mostrar o texto completo de todos os slides + legenda no chat

11. Salvar em `conteudo/redes-sociais/carrosseis/[YYYY-MM-DD]-[tema]/carousel-text.md`

**CHECKPOINT 2:** Mostrar texto + legenda. Esperar aprovação antes de ir pro visual.

---

### Fase 2 — Visual (HTMLs + PNGs)

1. Ler `marca/design-guide.md` pra identidade visual (cores, fontes, logos)
2. Ler `.claude/skills/carrossel/references/design-carrossel.md` pra regras de layout
3. Criar HTMLs com estilo elaborado seguindo as regras do arquivo de design
4. Salvar HTMLs em `conteudo/redes-sociais/carrosseis/[YYYY-MM-DD]-[tema]/instagram/`
5. Renderizar o slide 1 primeiro:
   ```bash
   npx playwright screenshot --viewport-size=1080,1350 --full-page "file:///caminho/absoluto/slide-01.html" "slide-01.png"
   ```

**CHECKPOINT:** Mostrar slide 1 renderizado. Se aprovado, renderizar os demais. Se pedir ajuste, editar o HTML e re-renderizar só aquele slide.

Salvar PNGs em `conteudo/redes-sociais/carrosseis/[YYYY-MM-DD]-[tema]/instagram/`.

---

### Fase 3 — Versão TikTok (opcional)

Após finalizar Instagram, perguntar:
> "Quer a versão TikTok também? (1080x1920, formato vertical)"

Se sim:
- Adaptar os HTMLs: height 1920px, aumentar padding, ajustar espaçamento
- **Bottom safe zone:** deixar 230px livres embaixo (UI do TikTok sobrepõe)
- Renderizar:
  ```bash
  npx playwright screenshot --viewport-size=1080,1920 --full-page "file:///caminho/absoluto/slide-01.html" "slide-01.png"
  ```
- Salvar em `conteudo/redes-sociais/carrosseis/[YYYY-MM-DD]-[tema]/tiktok/`

---

## Output final

```
conteudo/redes-sociais/carrosseis/[YYYY-MM-DD]-[tema]/
  carousel-text.md          ← texto aprovado + legenda
  imagens/                  ← fotos do usuário (se houver)
  instagram/
    slide-01.html → slide-01.png
    slide-02.html → slide-02.png
    ...
  tiktok/ (se solicitado)
    slide-01.html → slide-01.png
    ...
```

## Geração de imagens (opcional)

Se o usuário quiser imagem mas não tiver nenhuma, oferecer via Pollinations.ai (gratuito, sem cadastro):

```bash
curl -L "https://image.pollinations.ai/prompt/[prompt]?width=1080&height=720&nologo=true" -o imagens/foto-01.jpg
```

Pra vinhos: usar prompts específicos — "wine bottle [nome] on rustic table, moody lighting, professional photography, no text" — pra resultado mais realista.

Se a qualidade não servir, sugerir que o usuário busque a imagem no Canva ou no site do produtor e jogue na pasta `imagens/`.

---

## Regras

- Texto aprovado no Checkpoint 2 não muda na Fase 2
- Sempre mostrar slide 1 antes de renderizar os demais
- Se pedir ajuste no visual, editar o HTML e re-renderizar apenas o slide alterado
- Sem travessões no texto
- Se o setup já foi feito antes, não repetir as perguntas. Ir direto pro workflow
- Regras de design vivem em `.claude/skills/carrossel/references/design-carrossel.md`
