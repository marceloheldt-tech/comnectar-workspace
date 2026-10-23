---
name: antecipacao-appmax
description: Calcula quanto dar de baixa no Bling (contas a receber) quando o Marcelo faz um saque antecipado na AppMax referente a um ou mais pedidos. Separa taxas do gateway, custo da antecipação e os 10% retidos, e diz exatamente o que lançar em "Tarifa" e "Valor recebido" em cada conta para a soma fechar com o saque e sobrar em aberto só a retenção. Use quando o usuário disser "cálculo de antecipação", "antecipação da AppMax", "saque da AppMax", "quanto dou de baixa", "baixa no Bling do saque", ou "/antecipacao-appmax".
---

# Cálculo de antecipação AppMax → baixa no Bling

## Regras do padrão (validadas em out/2026)

1. **No Bling, cada conta a receber está pelo valor cheio** que o cliente pagou (valor integral da compra).
2. **Taxas da AppMax por pedido** (aparecem no detalhe do pedido, "Total líquido"):
   - Taxa de parcelamento absorvido (só em vendas parceladas)
   - Taxa de processamento (3,49%)
   - Taxa de Gateway e Antifraude (R$ 0,99)
   Usar sempre os valores exatos do print, não recalcular pela porcentagem.
3. **Retenção: 10% do valor CHEIO** de cada pedido fica retido na AppMax por até 30 dias.
4. **Liberado** por pedido = valor cheio − taxas − 10% do valor cheio.
5. **Antecipação**: custo = soma do liberado − valor do saque (fica em ~1,1% do liberado). Calcular sempre pela diferença real, nunca presumir a %.
6. **Rateio da antecipação** entre os pedidos: proporcional ao liberado de cada um. Centavos de arredondamento vão pro maior pedido.
7. **Baixa parcial no Bling**, por conta:
   - **Tarifa** = taxas do gateway + parcela da antecipação
   - **Valor recebido** = liberado − parcela da antecipação
   - Juros, Desconto e Multa = 0,00
   - Fica em aberto = 10% do valor cheio (a retenção)
8. Usar o campo **Tarifa** (não Desconto) pra que a taxa entre como custo no fechamento mensal, e não como desconto dado ao cliente.
9. Ao preencher, digitar a Tarifa primeiro e conferir o Valor recebido depois (o Bling pode recalcular sozinho).
10. **Quando a retenção liberar**, baixar o saldo restante da mesma conta. Se houver taxa de antecipação nesse saque, ela também vai em Tarifa.

## O que pedir ao usuário

- Prints das contas a receber selecionadas no Bling (cliente, NF, valor cheio)
- Print do detalhe de cada pedido na AppMax (taxas e total líquido)
- Print do saque (valor e data)

Se algum dado faltar ou não bater (ex: líquido do print ≠ cheio − taxas), mostrar a divergência antes de fechar o número.

## Cálculo

Rodar o script (exato, com Decimal):

```bash
py -3 ".claude/skills/antecipacao-appmax/calcular.py" --saque 3540.71 \
  --pedido "Maigregor Baruffi;001437;2499.00;88.21" \
  --pedido "Michele Querino de Menezes;001448;239.00;14.11" \
  --pedido "Alexandre Marques de Souza;001449;1460.00;95.74"
```

`--pedido` = `cliente;NF;valor cheio;total de taxas do gateway`. `--retencao` padrão 0.10.

## Formato da resposta

1. Tabela de taxas por pedido (parcelamento, processamento, gateway, total, líquido) com a conferência cheio − taxas = líquido.
2. Resumo do saque: líquido → retenção (10% do cheio) → liberado → saque → custo da antecipação (R$ e %).
3. **Tabela final de baixa** (a que importa): Cliente | NF | Tarifa | Valor recebido | Fica em aberto, com totais.
4. Conferência: soma do Valor recebido = saque; soma do em aberto = 10% do total cheio.

## Exemplo de referência (saque 23/10/2026)

| Cliente | NF | Cheio | Taxas | Antecip. | **Tarifa** | **Valor recebido** | Em aberto |
|---|---|---|---|---|---|---|---|
| Maigregor Baruffi | 001437 | 2.499,00 | 88,21 | 23,80 | **112,01** | **2.137,09** | 249,90 |
| Michele Querino de Menezes | 001448 | 239,00 | 14,11 | 2,21 | **16,32** | **198,78** | 23,90 |
| Alexandre Marques de Souza | 001449 | 1.460,00 | 95,74 | 13,42 | **109,16** | **1.204,84** | 146,00 |
| **Total** | | 4.198,00 | 198,06 | 39,43 | **237,49** | **3.540,71** | 419,80 |

Liberado 3.580,14 − saque 3.540,71 = antecipação 39,43 (1,10%).
