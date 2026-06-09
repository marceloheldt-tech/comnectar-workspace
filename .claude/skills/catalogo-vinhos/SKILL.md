---
name: catalogo-vinhos
description: >
  Cria catálogos de vinhos da comnéctar para disparo via WhatsApp ou email.
  Busca foto e dados no Shopify (país, região, uva, teor alcoólico), usa os preços
  fornecidos pelo usuário (ou do Shopify no catálogo completo), e gera páginas visuais
  em PNG prontas pra enviar. Dois modos: catálogo completo (todos os produtos ativos)
  ou catálogo de seleção (usuário define quais vinhos e preços da ação).
  Use quando o usuário disser "faz um catálogo", "catálogo de vinhos", "gera catálogo",
  "catálogo pra disparar", "catálogo com esses vinhos", ou "/catalogo-vinhos".
---

# /catalogo-vinhos — Catálogo de Vinhos comnéctar

## Dependências

- **Shopify MCP:** buscar dados, imagens e preços dos produtos
- **Identidade visual:** `marca/design-guide.md`
- **Logos:** `dados/image.png` (logo completa, fundo branco) · `dados/image-2.png` (gota vinho)
- **Playwright CLI:** `npx playwright screenshot`

---

## Dois modos de uso

### Modo 1 — Catálogo Completo
O usuário pede "catálogo completo" ou "todos os produtos".
Busca todos os produtos ativos no Shopify e usa os preços cadastrados.

### Modo 2 — Catálogo de Seleção (Campanha)
O usuário manda uma lista de vinhos com preços especiais da ação. Exemplo:

```
Chandon Brut - R$ 89,90
Gran Reserva Malbec 2020 - R$ 129,90
Casillero del Diablo Reserva - R$ 59,90
```

Os preços fornecidos pelo usuário têm sempre prioridade sobre o preço do Shopify.

---

## Workflow

### 1. Identificar o modo

Se o usuário não especificou quais vinhos, perguntar:
> "Quer o catálogo completo da loja ou uma seleção específica? Se for seleção, me manda os nomes dos vinhos e os preços pra essa ação."

Se o usuário quiser um título ou tema pra campanha (ex: "Dia dos Namorados"), registrar pra usar na capa.

### 2. Buscar dados no Shopify

**Catálogo completo:**
- Usar `graphql_query` pra buscar todos os produtos ativos
- Campos necessários: `title`, `images { edges { node { src } } }`, `tags`, `description`, `priceRange { minVariantPrice { amount } }`

Exemplo de query:
```graphql
{
  products(first: 250, query: "status:active") {
    edges {
      node {
        title
        tags
        description
        priceRange { minVariantPrice { amount } }
        images(first: 1) { edges { node { src } } }
      }
    }
  }
}
```

**Catálogo de seleção:**
- Para cada vinho na lista do usuário, usar `search_products` com o nome
- Se retornar mais de um resultado, mostrar as opções e pedir confirmação
- Registrar o preço informado pelo usuário junto ao produto encontrado

### 3. Extrair informações de cada vinho

Para cada produto, extrair:

| Campo | Onde buscar |
|-------|-------------|
| **Nome** | Título do produto |
| **Foto** | Primeira imagem (`images.edges[0].node.src`) |
| **País** | Tags ou description (ex: "França", "Itália", "Argentina") |
| **Região** | Tags ou description (ex: "Mendoza", "Bordeaux", "Toscana") |
| **Uva(s)** | Tags ou description (ex: "Malbec", "Cabernet Sauvignon") |
| **Teor alcoólico** | Tags ou description (ex: "13%", "13,5% vol") |
| **Preço** | Informado pelo usuário (seleção) ou Shopify (completo) |

Se algum campo não for encontrado, deixar em branco no card — não bloquear o fluxo nem inventar dados.

### 4. Baixar imagens dos produtos

Criar a pasta de saída:
```bash
mkdir -p "conteudo/catalogos/[YYYY-MM-DD]-[nome]/imagens"
```

Baixar cada imagem:
```bash
curl -L "[URL_DA_IMAGEM]" -o "conteudo/catalogos/[YYYY-MM-DD]-[nome]/imagens/[slug-vinho].jpg"
```

### 5. Confirmar dados com o usuário

Mostrar tabela resumida antes de criar qualquer visual:
> "Encontrei esses dados. Confirma pra eu montar o catálogo?"
>
> | Vinho | País | Região | Uva | Teor | Preço |
> |-------|------|--------|-----|------|-------|
> | ... | ... | ... | ... | ... | ... |

Se algum dado estiver errado ou faltando, o usuário pode corrigir antes de continuar.

### 6. Criar HTMLs do catálogo

**Estrutura:**
- Um HTML de capa
- Um HTML por página de produtos (4 vinhos por página, grid 2×2)
- Dimensões: 1080×1350px por página (formato feed Instagram, bom pra WhatsApp)

---

#### Layout da capa

- **Fundo branco** (`#FFFFFF`) — coerência com o fundo das fotos de garrafa
- **Logo comnéctar completa** (`dados/image.png`) centralizada verticalmente, tamanho ~280px de largura
- **Linha fina vinho** `#991356` abaixo do logo (80px largura, 2px altura)
- **Título da seleção** em Geotipe, ~44px, preto, centralizado (ex: "Seleção de Vinhos", "Especial Dia dos Pais")
- **Subtítulo ou data** em Rubik, 14px, `#999`, letra-espaçada (opcional, só se o usuário informar)
- **Rodapé fixo** (mesma estrutura de todas as páginas — ver abaixo)

---

#### Rodapé padrão — presente em TODAS as páginas (capa + páginas de produto)

Posicionado no canto inferior direito, a ~32px da borda:

```html
<!-- Rodapé canto inferior direito -->
<div style="position:absolute; bottom:32px; right:40px; display:flex; align-items:center; gap:10px;">
  <span style="font-family:'Rubik',sans-serif; font-size:11px; color:#bbb; letter-spacing:2px; text-transform:uppercase;">comnéctar</span>
  <img src="../../../../dados/image-2.png" style="width:22px; opacity:0.4;">
</div>
```

Usar `position:relative` no container da página pra o rodapé funcionar com `position:absolute`.

---

#### Layout de cada card de vinho

Cada card ocupa metade da largura (~480px). Fundo branco, sem bordas pesadas.

Elementos do card (de cima pra baixo):
1. **Foto do produto** — height: 260px, `object-fit: contain`, sem cortar a garrafa, fundo branco
2. **Bloco de dados** com fundo discreto — padding 16px, sem bordas externas no card
3. **Nome do vinho** — Geotipe, 20-22px, preto, peso regular
4. **Linha fina vinho** `#991356` — 100% largura do bloco, 1.5px, margem 8px vertical
5. **País + Região** — `[emoji bandeira] [País] · [Região]`, Rubik 500, 13px, cor vinho `#991356`
6. **Uva(s)** — label "Uva" em Rubik 400 12px `#999` + valor em Rubik 500 13px `#000`
7. **Teor alcoólico** — label "Teor" em Rubik 400 12px `#999` + valor em Rubik 500 13px `#000`
8. **Preço** — Rubik bold, 30px, cor vinho `#991356`, margem top 12px

País, Região, Uva e Teor devem usar a cor da marca `#991356` como acento — seja no label, no ícone ou no destaque do valor. Omitir campos sem dado.

---

#### Estrutura HTML das páginas de produto

```html
<div class="page" style="position:relative; width:1080px; height:1350px; overflow:hidden; background:#fff; font-family:'Rubik',sans-serif; box-sizing:border-box; padding:48px 40px 80px;">

  <!-- Header discreto da página -->
  <div style="display:flex; justify-content:flex-start; align-items:center; margin-bottom:36px; padding-bottom:16px; border-bottom:1px solid #f0f0f0;">
    <span style="font-size:11px; color:#ccc; letter-spacing:3px; text-transform:uppercase;">Seleção de Vinhos</span>
  </div>

  <!-- Grid 2x2 -->
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:36px;">
    <!-- card de vinho × 4 -->
  </div>

  <!-- Rodapé canto inferior direito (em toda página) -->
  <div style="position:absolute; bottom:32px; right:40px; display:flex; align-items:center; gap:10px;">
    <span style="font-size:11px; color:#bbb; letter-spacing:2px; text-transform:uppercase;">comnéctar</span>
    <img src="../../../../dados/image-2.png" style="width:22px; opacity:0.4;">
  </div>

</div>
```

**Observações técnicas:**
- Google Fonts no `<head>`: `https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap`
- Geotipe: `font-family: 'Geotipe', Georgia, serif` — se existir em `dados/`, importar com `@font-face`
- `overflow: hidden` em cada página
- Caminhos de imagem relativos: `./imagens/[slug-vinho].jpg`
- Emojis de bandeira por país: 🇧🇷 🇫🇷 🇮🇹 🇦🇷 🇵🇹 🇪🇸 🇨🇱 🇺🇸 🇩🇪 🇦🇺 🇿🇦 🇺🇾 🇳🇿

### 7. Renderizar páginas em PNG

Verificar Playwright:
```bash
npx playwright screenshot --help 2>/dev/null && echo "OK" || echo "INSTALAR"
```

Se precisar instalar: `npx playwright install chromium`

Renderizar cada HTML:
```bash
npx playwright screenshot --viewport-size=1080,1350 "file:///[caminho-absoluto]/catalog-capa.html" "catalog-capa.png"
npx playwright screenshot --viewport-size=1080,1350 "file:///[caminho-absoluto]/catalog-p1.html" "catalog-p1.png"
# repetir para cada página
```

**CHECKPOINT:** Mostrar a capa primeiro. Se aprovada, renderizar as demais. Se pedir ajuste, editar o HTML e re-renderizar só a página afetada.

### 8. Exibir resultado final

Mostrar todas as páginas na conversa. Informar onde foram salvas.

---

## Output final

```
conteudo/catalogos/[YYYY-MM-DD]-[nome-ou-acao]/
  imagens/
    [slug-vinho-1].jpg
    [slug-vinho-2].jpg
    ...
  catalog-capa.html
  catalog-capa.png       ← PNG da capa (1080×1350)
  catalog-p1.html
  catalog-p1.png         ← Página 1 — 4 vinhos (1080×1350)
  catalog-p2.html
  catalog-p2.png         ← Página 2 se houver mais vinhos
  ...
```

Nome padrão da pasta: `catalogo-[YYYY-MM-DD]`
Se o usuário informar nome da ação (ex: "Dia dos Pais"), usar: `catalogo-dia-dos-pais`

---

## Regras

- Sempre confirmar os dados com o usuário antes de criar os layouts
- Nunca cobrir a garrafa com overlay ou máscara — produto 100% visível no card
- Preço do usuário tem sempre prioridade sobre o preço do Shopify
- Se algum dado não for encontrado (região, teor), omitir o campo — nunca inventar
- Se a imagem do Shopify não existir, mostrar placeholder elegante com o nome do vinho
- Mostrar a capa para aprovação antes de renderizar as demais páginas
- **Fundo sempre branco** — as fotos de garrafa têm fundo branco, não criar contraste desnecessário
- **Logo comnéctar na capa** (centralizada) + **rodapé discreto em todas as páginas** (canto inferior direito: texto "comnéctar" + gota)
- **Cor da marca como acento** nos campos de país, região, uva e teor — não apenas no preço
- Design clean: muito espaço em branco, sem gradientes, sem sombras, sem elementos decorativos extras
- Paleta restrita: preto `#000`, vinho `#991356`, branco `#FFF` — nada fora disso
