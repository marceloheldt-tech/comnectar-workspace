# Fluxo de Automação — Ação de Fechamento 20% OFF (28/08 a 30/08)

Ação única do ano: 15% OFF em todo o site no cartão, 25% OFF no Pix, frete grátis acima de R$1.000, parcelamento em 5x sem juros no cartão.

## Regra geral
Em qualquer etapa, quem compra sai do fluxo de vendas (pode entrar num fluxo de agradecimento à parte, sem mais mensagens de urgência).

## Cronograma

| Quando | Mensagem | Público |
|---|---|---|
| Sexta 28/08, 10h30 | Mensagem 1 — Anúncio | Base completa |
| Sábado 29/08, 11h00 | Mensagem 1B — Reforço | Não abriu a Mensagem 1 |
| Sábado 29/08, 11h00 | Mensagem 2 — "Só até amanhã" | Abriu a Mensagem 1, não comprou |
| Domingo 30/08, 11h00 | Mensagem 3 — Último dia | Ainda não comprou (dos dois braços do sábado) |
| Domingo 30/08, 20h30 | Mensagem 4 — Últimas horas | Ainda não comprou depois da Mensagem 3 |

Copy completa: `texto-whatsapp-msg1.md` (Mensagem 1) e `texto-whatsapp-msg1b-a-4.md` (Mensagens 1B, 2, 3 e 4).

## Etapas

**1. Sexta 28/08, 10h30 — Mensagem 1 (Anúncio)**
Disparo pra base completa. Anuncia a ação, o prazo e as condições (20% OFF, frete grátis acima de R$1.000, 5x sem juros).

Checar ~24h depois (sábado de manhã, antes das 11h) quem abriu:

- **Abriu e não comprou** → passo 2 (Mensagem 2)
- **Não abriu** → passo 2B (Mensagem 1B)
- **Comprou** → sai do fluxo

**2. Sábado 29/08, 11h00 — Mensagem 2 (Lembrete "só até amanhã")**
Pra quem abriu a Mensagem 1 mas não comprou. Reforça a urgência: só até domingo, amanhã é o último dia.

**2B. Sábado 29/08, 11h00 — Mensagem 1B (Reforço pra quem não abriu)**
Pra quem não abriu a Mensagem 1. Ângulo diferente do anúncio original (entra pelas condições de pagamento, não repete a mesma abertura). Objetivo é recuperar atenção de quem não viu a primeira.

Checar de novo quem comprou até aqui — quem não comprou (dos dois braços) segue junto pro domingo.

**3. Domingo 30/08, 11h00 — Mensagem 3 (Último dia)**
Pra todo mundo que ainda não comprou. Comunica que hoje é o último dia da ação.

**4. Domingo 30/08, 20h30 — Mensagem 4 (Últimas horas)**
Urgência máxima: encerra à meia-noite. Janela de ~3h30 até o fechamento, pra quem ainda não comprou depois da Mensagem 3.

## Por que esses horários
Sexta e fim de semana de manhã (10h30–11h): fora do horário de trabalho, público decide com calma, sem concorrer com notificação de segunda-feira. Domingo à noite (20h30): urgência de última hora, mas com folga suficiente (3h30) pra decidir e finalizar a compra antes da meia-noite, sem ser tão em cima da hora que a pessoa perde o prazo.

## Link de destino
https://www.comnectar.com.br/collections/vinhos — usado em todas as 5 mensagens.

## Rastreamento
A ferramenta de disparo automatiza tanto "abriu a mensagem" quanto "clicou no link". O fluxo acima usa abertura como critério de ramificação (passo 1 → 2/2B), mas como o clique também é rastreado, dá pra refinar depois: por exemplo, tratar "abriu mas não clicou" e "clicou mas não comprou" como dois públicos diferentes, com mensagens mais direcionadas. Fica como evolução possível, não como bloqueio pro disparo de sexta.

## Mapa visual
Ver artifact publicado (mapa-fluxo-fechamento) para a versão em fluxograma, já com os horários.
