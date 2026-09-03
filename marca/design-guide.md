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

## Padrão de layout com imagem (carrosseis) — v2, set/2026

Padrão oficial a partir do post-modelo "Curadoria Prioridade" (`conteudo/carrosseis/2026-09-07-curadoria-prioridade/`). Substitui a v1 (fundo sempre branco). Vale pra todo carrossel novo, gerado pela skill `/carrossel` ou pela `/planejamento-conteudo`.

**Fundo:** foto real (nunca gerada por IA — já testamos, o Marcelo prefere fotografia de verdade) ocupando o slide inteiro (`object-fit: cover`), com gradiente escuro por cima (`linear-gradient(180deg, rgba(0,0,0,0.05-0.20) 0%, rgba(0,0,0,0.15-0.35) 35-45%, rgba(0,0,0,0.90-0.95) 100%)`) — mais escuro embaixo, onde o texto entra. Nunca fundo branco ou vinho sólido nos slides de conteúdo (só o slide de CTA final pode ser vinho sólido, ver abaixo).

**Logo:** só a gota (`dados/gota-transparente.png`), NUNCA o logotipo escrito por extenso, em todo e qualquer slide de carrossel. Tamanho fixo: 168px de largura, canto superior esquerdo (top: 72px, left: 56px em canvas 1080x1350), com leve drop-shadow pra legibilidade sobre foto clara.

**Tipografia:** uma fonte só pro texto principal de todos os slides — `'Geotipe','Palatino Linotype',Georgia,serif`, weight 400 (peso 600 só nos trechos em `<b>`). Nunca misturar com a sans-serif (Rubik) no corpo principal — Rubik fica reservado pra elementos pequenos de apoio (badge de CTA, por exemplo). Tamanhos maiores que a v1 pra leitura no celular: headline de capa ~90px, corpo de texto ~48-56px.

**Sem rótulo de pilar no slide:** não escrever "Educação", "Bastidores" etc. como tag visível em nenhum slide — some do slide 1 pra sempre.

**Slide de CTA final (fixo, reaproveitado em todo carrossel):** único slide sem foto — fundo vinho sólido (`#7A0F42`) com textura sutil (radial-gradient bem discreto), gota branca centralizada (168px), mesmo tratamento de fonte. É o card que fecha todo carrossel puxando pro quiz de perfil — precisa ser visualmente reconhecível e igual em todos os posts.

**Fonte das imagens:** sempre pedir foto real pro Marcelo (celular resolve, luz natural ou luminária quente lateral, nunca flash de frente, formato vertical 4:5 ou 9:16, deixar uma área mais escura/vazia pra encaixar o texto). Nunca gerar por IA como solução padrão — só como rascunho de direção, se pedido explicitamente.

### Mesclar slide escuro e slide claro (confirmado 03/set/2026)

Carrossel não pode ser só slide escuro do início ao fim — fica pesado demais na grade do feed. Todo carrossel de conteúdo (a partir do post "Vinho como parte do momento", 8/set — o de 7/set fica só escuro, não precisa refazer) mescla os dois tratamentos entre os slides de conteúdo. Padrão flexível, não fixo: pode ser escuro-claro-escuro-claro, ou dois escuros e um claro no meio, o que fizer mais sentido pro conteúdo daquele slide — só não pode ser tudo igual.

**Slide escuro:** o padrão já descrito acima (foto full-bleed + gradiente escuro + texto branco).

**Slide claro (novo, volta do padrão antigo de imagem):** fundo branco (`#FFFFFF`), foto entra como elemento com **máscara CSS clara** (`mask-image: linear-gradient(...)`) que funde a foto no branco — nunca overlay escuro num slide claro. Texto em preto (`#000000`) ou vinho (`#991356`) pro destaque, nunca branco. Mesma fonte (Geotipe/Palatino), mesmo tamanho, mesma posição de logo (gota 168px, canto superior esquerdo — na versão vinho sólida, já que não tem fundo escuro pra precisar do drop-shadow).

**De onde tiram as fotos dos slides claros:** fotos de produto (garrafa) do banco `dados/imagens-vinhos/` já funcionam direto nesse tratamento, sem precisar pedir nada novo pro Marcelo — a máscara clara foi desenhada originalmente pra esse tipo de foto. Só pedir foto nova pro Marcelo quando o slide claro precisar de uma cena específica (não só produto).

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
