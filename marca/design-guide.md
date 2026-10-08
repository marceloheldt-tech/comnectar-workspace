# Guia de Design — comnéctar

> Você pode editar esse arquivo a qualquer momento.
> As skills de carrossel, proposta e slide leem este arquivo antes de criar qualquer visual.

---

## Cores

- **Fundo principal:** Branco `#FFFFFF`
- **Cor de destaque / CTA:** Vinho `#991356`
- **Texto principal:** Preto `#000000`
- **Fundo alternativo / cards:** Preto `#000000` (versão escura) ou Vinho `#991356` (versão de destaque)
- **Cor proibida:** Tons de cinza médio que suavizam demais a identidade — a paleta é enxuta e contrastante

---

## Tipografia

- **Títulos e destaques:** Geotipe
- **Corpo, subtítulos e botões:** Rubik
- **Peso do título:** Regular a Medium — a fonte já tem personalidade, não precisa de bold pesado

---

## Estilo geral

Clean e minimalista com posicionamento premium. Muito espaço em branco, fotografia de produto como elemento central, pouco texto nos visuais. Elegante sem ser frio — a gota de vinho no logo dá um toque orgânico à identidade geométrica.

---

## Elementos-chave

- **Bordas:** Sem bordas ou bordas muito finas (1px) quando necessário
- **Border-radius dos cards:** Suave, entre 8-12px — evitar tanto o quadrado duro quanto o arredondado excessivo
- **Botões:** Fundo vinho `#991356` com texto branco, ou contorno preto com texto preto
- **Sombras:** Evitar. Quando usar, sombra muito sutil (opacity baixa)

---

## O que NUNCA fazer

- Usar gradientes — a paleta é plana e limpa
- Misturar muitas fontes
- Poluir o visual com muitos elementos decorativos
- Usar cores fora da paleta sem aprovação
- Distorcer ou recolorir o logo
- **Cobrir a garrafa (ou qualquer produto) com overlay ou máscara escura** — o produto deve aparecer 100% visível. Se houver painel escuro pra texto, o produto fica no lado direito limpo, fora de qualquer sobreposição

## Padrão de layout com imagem (carrosseis) — v3, out/2026 (atual)

Padrão oficial a partir do post "Como a comnéctar escolhe o que vende" (`conteudo/carrosseis/2026-10-11-como-escolhemos/`). Substitui o v2 (gradiente escuro/claro sobre a foto). Motivo da mudança (confirmado 08/out): o gradiente precisa de opacidade alta pra garantir leitura do texto, e isso apaga informação real da foto por baixo — no post de procedência, cobria o rótulo com o registro MAPA, que era exatamente o ponto do slide. Vale pra todo carrossel novo, gerado pela skill `/carrossel` ou pela `/planejamento-conteudo`.

**Estrutura: foto e texto em blocos sólidos separados, sem nenhuma sobreposição.** Cada slide de conteúdo é dividido em dois blocos empilhados, sem gradiente, sem máscara, sem overlay:
- **Bloco de foto** (topo, ~900px de altura em canvas 1080x1350): foto real ocupando a largura toda (`object-fit: cover`), **sem nenhum tratamento por cima** — a foto aparece 100% nítida e legível, inteira.
- **Bloco de texto** (embaixo, ~450px): painel sólido (preto `#000` nos slides escuros, branco `#FFFFFF` nos slides claros), sem gradiente, com o texto dentro. Separador sutil entre os blocos: `border-top: 1px solid rgba(255,255,255,0.08)` (escuro) ou `rgba(0,0,0,0.08)` (claro).

Isso garante contraste máximo pro texto (cor sólida, não foto) e preserva 100% da informação visual da foto (sem perda alguma, já que não há overlay). Ajustar a altura do bloco de foto via `object-position` por imagem, pra manter o elemento importante da cena (rótulo, produto, rosto) dentro do crop.

**Logo:** só a gota (`dados/gota-transparente.png`), NUNCA o logotipo escrito por extenso, em todo e qualquer slide de carrossel. Tamanho fixo: 168px de largura, canto superior esquerdo (top: 72px, left: 56px em canvas 1080x1350), sempre com leve drop-shadow (`filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5))`) já que fica sobre a foto, não sobre o painel.

**Tipografia:** headline/corpo em `'Geotipe','Palatino Linotype',Georgia,serif`, weight 400 (peso 600 só nos trechos em `<b>`). Kicker (label pequeno tipo "Procedência", "Curadoria") em Rubik, uppercase, letter-spacing largo, 27px, cor vinho `#991356` nos slides claros ou branco 80% opacidade nos escuros. Corpo do texto no painel: ~42-44px.

**Sem rótulo de pilar no slide:** não escrever "Educação", "Bastidores" etc. como tag visível em nenhum slide — some do slide 1 pra sempre.

**Slide de CTA final (fixo, reaproveitado em todo carrossel):** único slide sem foto — fundo vinho sólido (`#7A0F42`) com textura sutil (radial-gradient bem discreto), gota branca centralizada (168px), mesmo tratamento de fonte. É o card que fecha todo carrossel puxando pro quiz de perfil — precisa ser visualmente reconhecível e igual em todos os posts.

**Fonte das imagens:** sempre pedir foto real pro Marcelo (celular resolve, luz natural ou luminária quente lateral, nunca flash de frente, formato vertical 4:5 ou 9:16). Nunca gerar por IA como solução padrão — só como rascunho de direção, se pedido explicitamente. Como não há mais máscara, não precisa mais reservar área escura/vazia na foto pro texto — o texto agora vive no painel, não na foto.

### Mesclar cores de painel (confirmado 03/set/2026, expandido 08/out/2026)

Carrossel não pode ser só slide escuro do início ao fim — fica pesado demais na grade do feed. Todo carrossel de conteúdo mescla os tratamentos de painel entre os slides, na ordem que fizer mais sentido pro conteúdo daquele slide — só não pode ser tudo igual.

**Três cores de painel disponíveis** (texto do bloco de foto nunca muda — só o painel sólido embaixo):
- **Preto `#000`:** texto branco, kicker branco 80% opacidade, separador `rgba(255,255,255,0.08)`
- **Branco `#FFFFFF`:** texto preto `#1a1a1a`, kicker vinho `#991356`, separador `rgba(0,0,0,0.08)`
- **Vinho sólido `#7A0F42`** (mesma cor do CTA final): texto branco, kicker branco 80% opacidade, separador `rgba(255,255,255,0.12)`. Usar com moderação — 1 slide no máximo por carrossel, pra não concorrer visualmente com o CTA final que também é vinho sólido.

Variar entre as três ao longo do carrossel (ex: preto, branco, vinho, branco) em vez de alternar só preto/branco.

**CTA final continua igual sempre:** vinho sólido, fora da lógica claro/escuro — é o card fixo, não entra na mescla.

---

## Logo

- **Logo principal (fundo transparente):** `dados/comnectar-transparente.png` ← USAR SEMPRE
- **Símbolo gota (fundo transparente):** `dados/gota-transparente.png` ← USAR SEMPRE
- **Versões antigas com fundo:** `dados/image.png`, `dados/image-1.png` — NÃO usar mais
- **Onde usar:** todo e qualquer material visual — slides, carrosseis, catálogos, emails, posts
- **Tamanho sugerido:** largura entre 120-180px nos HTMLs
- **Em fundos escuros:** aplicar `filter: brightness(0) invert(1)` no CSS para tornar o logo branco
- **Em fundos claros:** usar direto, sem filtro

---

## Perfil do autor

> Usado no estilo "tweet" do carrossel.

- **Nome:** comnéctar
- **Handle:** @comnectar
- **Foto:** *(adicionar quando tiver foto de perfil salva em marca/)*
- **Badge verificado:** não

---

## Observações adicionais

Paleta intencional de apenas 3 cores (preto, vinho, branco). Resistir à tentação de adicionar uma quarta cor "só pra variar" — a força da identidade está na contenção.
