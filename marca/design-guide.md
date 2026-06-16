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

## Padrão de layout com imagem (carrosseis)
Fundo padrão dos slides é SEMPRE branco (#FFFFFF). Imagens entram como elemento visual com máscara CSS gradiente, nunca cobrindo o fundo inteiro com overlay escuro.

**Regras obrigatórias:**
1. Usar sempre `dados/image.png` (logo fundo branco) em slides com fundo claro
2. Imagens recebem máscara CSS (`mask-image: linear-gradient(...)`) que funde a foto no fundo branco, garantindo que os produtos (garrafas) fiquem visíveis
3. Fotos de produto: máscara horizontal (fade da esquerda pro direito), produto aparece no lado direito
4. Fotos de paisagem/vinhedo: máscara vertical (fade de cima pra baixo), área de texto fica no branco inferior
5. Nunca usar overlay escuro full-slide — o produto deve ser sempre 100% visível no lado sem máscara

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
