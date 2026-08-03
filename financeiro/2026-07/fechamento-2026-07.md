# Fechamento — Julho/2026

Julho fechou com **resultado do mês positivo de R$ 6.706,68**, mas com uma ressalva importante: 8 produtos vendidos (36 garrafas do Nebbiolo La Chiusa entre eles) ainda não têm custo cadastrado na planilha de preços e custos, então o CMV real é maior do que o calculado aqui — o resultado real tende a ser um pouco menor que esse número. O fluxo de caixa do mês, por outro lado, ficou negativo em R$ 4.436,62 — o caixa saiu do mês com menos dinheiro do que entrou, mesmo com a operação de vendas tendo dado lucro.

## Resultado do mês

*Receita das vendas de julho (por competência) menos custo dos produtos vendidos menos contas pagas no mês, excluindo "Compras de fornecedores" — esse valor já está embutido no CMV, então contá-lo de novo aqui contaria o custo do vinho duas vezes.*

| | Valor |
|---|---|
| Receita bruta (245 garrafas vendidas) | R$ 80.804,28 |
| (-) CMV | R$ 45.606,77 |
| = Margem bruta | R$ 35.197,51 |
| (-) Contas pagas no mês (exceto compras de fornecedores) | R$ 28.490,83 |
| = **Resultado do mês** | **R$ 6.706,68** |

**Contas pagas por categoria:**

| Categoria | Valor | Entra no Resultado do mês? |
|---|---|---|
| Compras de fornecedores | R$ 48.858,35 | Não — já está no CMV |
| Impostos | R$ 11.726,54 | Sim |
| Despesas com pessoal | R$ 6.829,04 | Sim |
| Transferências | R$ 3.390,90 | Sim |
| Despesas comerciais | R$ 2.151,43 | Sim |
| Compra de insumos e matéria prima | R$ 252,45 | Sim |
| **Total pago no mês** | **R$ 77.349,18** | — |

**Top 5 produtos por lucro no mês:**

| Produto | Qtd | Receita | Custo | Lucro |
|---|---|---|---|---|
| Vinho Tinto Langhe Nebbiolo 2024 - Mario Costa | 51 | R$ 10.691,00 | R$ 5.974,14 | R$ 4.716,86 |
| Vinho Tinto Langhe Nebbiolo La Chiusa 2023 - Chionetti | 28 | R$ 6.441,00 | R$ 4.021,08 | R$ 2.419,92 |
| Vinho Tinto 50th Anniversary Cabernet Sauvignon 2022 - Caymus | 4 | R$ 5.191,56 | R$ 3.761,40 | R$ 1.430,16 |
| Vinho Tinto Pommard 2022 - Albert Bichot | 4 | R$ 2.838,71 | R$ 1.939,08 | R$ 899,63 |
| Vinho Tinto Dairyman Pinot Noir 2022 - Belle Gloss | 3 | R$ 2.160,00 | R$ 1.400,58 | R$ 759,42 |

O Nebbiolo do Mario Costa sozinho respondeu por quase 30% do lucro do mês — vale olhar se dá pra sustentar esse volume (51 garrafas) em agosto.

Dois produtos venderam no prejuízo: Almaviva 2022 (-R$ 451,42 em 1 garrafa — margem apertada demais pro preço de venda praticado) e o ESP Baby Freixenet Ice (-R$ 1,23, irrelevante).

## Fluxo de caixa

*Total recebido e pago no mês, por data efetiva de movimentação — 100% caixa, sem relação com o que foi vendido ou seu custo.*

| | Valor |
|---|---|
| Total recebido | R$ 72.912,56 |
| Total pago | R$ 77.349,18 |
| = **Resultado de caixa** | **-R$ 4.436,62** |

## Resultado do mês vs. Fluxo de caixa

Resultado do mês: **R$ 6.706,68**
Fluxo de caixa: **-R$ 4.436,62**
Diferença: **R$ 11.143,30**

A diferença vem de dois lados. Do lado da receita: venda de julho foi R$ 80.804,28, mas só entraram R$ 72.912,56 no caixa — uma diferença de quase R$ 7.900 em vendas que ainda não viraram dinheiro em conta (parcelas, boleto em aberto, prazo de recebimento de cartão). Do lado da despesa: o fluxo de caixa inclui os R$ 48.858,35 de "Compras de fornecedores" (reposição de estoque), que o Resultado do mês não conta porque isso já está embutido no CMV. Ou seja: a operação de vender vinho deu lucro em julho, mas o mês também teve um desembolso grande com reposição de estoque — isso é normal em negócio com giro de mercadoria, mas é o tipo de coisa que aperta o caixa mesmo com a operação lucrativa.

## Avisos

- **8 produtos vendidos sem custo cadastrado** em `precos-custos.xlsx` — códigos 603 (36 un, R$ 6.480,00 em receita), 613, 612, 608, 609, 606, 610, 607. Juntos somam R$ 12.442,08 em receita (15,4% do total) sem CMV correspondente. O resultado do mês está usando custo zero pra esses produtos — o lucro real de julho é menor que R$ 6.706,68. Precisa atualizar a planilha de custos com esses códigos antes do fechamento de agosto.
- Os 3 relatórios de julho vieram em PDF do Bling (não Excel) — extraídos com `.claude/skills/fechamento-mensal/extrair_pdf.py`, conferidos contra os totais impressos em cada PDF (todos bateram).
