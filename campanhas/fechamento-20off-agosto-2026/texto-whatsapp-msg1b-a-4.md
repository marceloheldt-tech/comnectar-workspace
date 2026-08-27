# Textos WhatsApp — Ação de Fechamento 20% OFF (Mensagens 1B, 2, 3 e 4)

Sequência da automação depois do anúncio (Mensagem 1, em `texto-whatsapp-msg1.md`). Ver `fluxo-automacao.md` pra lógica completa de ramificação.

---

## Mensagem 1B — Reforço (pra quem não abriu a Mensagem 1)

**Disparo:** sábado, 29/08, às 11h00
**Público:** quem não abriu a Mensagem 1

> Ângulo diferente do anúncio original: entra pelas condições de pagamento em vez de reapresentar a ação, pra não soar repetido pra quem já ignorou a primeira.

Oi, {{nome}}! Compra acima de R$1.000 na comnéctar essa semana sai com frete grátis e parcelamento em até 5x sem juros, e ainda tem 15% OFF em cima do preço da loja inteira (25% se pagar no Pix). É a Ação de Fechamento, vale até domingo. Separa os rótulos que você quer garantir: https://www.comnectar.com.br/collections/vinhos

---

## Mensagem 2 — Lembrete "só até amanhã" (pra quem abriu a Mensagem 1 e não comprou)

**Disparo:** sábado, 29/08, às 11h00
**Público:** abriu a Mensagem 1, não comprou

Oi, {{nome}}! A Ação de Fechamento vai só até amanhã. 15% OFF em todo o site (25% no Pix), frete grátis acima de R$1.000 e parcelamento em 5x sem juros. Se tinha algum vinho na mira, essa é a deixa pra garantir antes que feche: https://www.comnectar.com.br/collections/vinhos

---

## Mensagem 3 — Último dia (pra quem ainda não comprou)

**Disparo:** domingo, 30/08, às 11h00
**Público:** quem não comprou até aqui (dos dois braços do sábado)

Oi, {{nome}}! Hoje é o último dia da Ação de Fechamento. 15% OFF em todo o site até a meia-noite (25% no Pix), frete grátis acima de R$1.000 e 5x sem juros no cartão. Não deixa pra depois, amanhã volta ao preço normal: https://www.comnectar.com.br/collections/vinhos

---

## Mensagem 4 — Últimas horas (urgência máxima)

**Disparo:** domingo, 30/08, às 20h30
**Público:** quem ainda não comprou depois da Mensagem 3

Oi, {{nome}}! Faltam poucas horas pra Ação de Fechamento encerrar. Até a meia-noite ainda dá pra garantir 15% OFF em todo o site (25% no Pix), com frete grátis acima de R$1.000 e parcelamento em 5x. Depois de hoje, sem desconto: https://www.comnectar.com.br/collections/vinhos

---

> Notas de envio:
> - O asterisco (*) formata como negrito no WhatsApp (usado quando quiser destacar "15% OFF" / "25% no Pix" nas mensagens acima — ficou em texto corrido de propósito, mas dá pra envolver com `*` na hora do disparo)
> - Condições: 15% OFF em todo o site no cartão, 25% OFF no Pix (não é 15% + 10% acumulado, é o desconto final já calculado)
> - `{{nome}}` é a variável de personalização — confirmar merge tag na ferramenta de disparo
> - Link de destino: https://www.comnectar.com.br/collections/vinhos (mesmo de todas as mensagens)
> - Horários pensados pra manhã de sexta e sábado/domingo (público adulto, decide com calma, não é hora de trabalho) e noite de domingo (janela de ~3h30 antes do encerramento, tempo suficiente pra decidir sem ser em cima da hora)
> - Quem compra em qualquer etapa sai do fluxo e não recebe a mensagem seguinte
