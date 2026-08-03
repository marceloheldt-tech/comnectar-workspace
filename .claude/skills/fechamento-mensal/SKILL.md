---
name: fechamento-mensal
description: >
  Faz o fechamento financeiro mensal da comnéctar a partir dos relatórios exportados do Bling.
  Calcula o resultado do mês (margem das vendas menos contas pagas) e o fluxo de caixa puro
  (recebido menos pago), e monta um relatório comparando os dois.
  Use quando o usuário disser "fechamento do mês", "fechamento mensal", "fecha o mês passado",
  "resultado de [mês]", "quanto lucramos em [mês]", ou "/fechamento-mensal".
---

# /fechamento-mensal — Fechamento Financeiro Mensal

## Dependências

- **Contexto do negócio:** `_contexto/empresa.md`
- **Tom de voz:** `_contexto/preferencias.md`
- **Mapeamento de colunas:** `.claude/skills/fechamento-mensal/mapeamento.json`
- **Script de cálculo:** `.claude/skills/fechamento-mensal/calculadora.py`

---

## Por que não é "competência x caixa" no sentido contábil estrito

O Bling do Marcelo não tem data de vencimento separada da data de pagamento nas despesas — só existe a data em que a conta foi paga. Então não dá pra isolar "despesa que pertence a julho" de "despesa paga em julho". Por causa disso, a skill calcula dois números com nomes que refletem o que eles realmente são:

- **Resultado do mês** — receita de vendas por competência (o que vendeu em julho) menos CMV menos o total de contas pagas em julho. É um híbrido: receita por competência, despesa por caixa. Não chamar isso de "resultado por competência" em relatórios pro Marcelo ou terceiros (contador, por exemplo) sem deixar essa ressalva clara.
- **Fluxo de caixa** — total recebido menos total pago no mês, os dois por data efetiva de movimentação. Esse sim é 100% caixa.

---

## Arquivos esperados

Os relatórios do Bling ficam em `financeiro/[AAAA-MM]/` (ex: `financeiro/2026-07/`). Nomes padrão:

| Arquivo | Conteúdo | Pra quê serve |
|---|---|---|
| `precos-custos.xlsx` | Todos os produtos, com custo unitário (preço de venda é opcional aqui — vem de `vendas.xlsx`) | Base pra calcular CMV |
| `vendas.xlsx` | Cada venda do mês: produto, quantidade, preço de venda efetivo, data | Receita bruta e margem por produto |
| `contas-pagas.xlsx` | Contas efetivamente pagas no mês (data de pagamento), com categoria se o Bling trouxer | Despesa do "Resultado do mês" + lado pago do fluxo de caixa |
| `contas-recebidas.xlsx` | Contas efetivamente recebidas no mês (data de recebimento) | Lado recebido do fluxo de caixa |

Se o Marcelo mandar os arquivos com nomes diferentes, renomear/copiar pra esses nomes padrão dentro da pasta do mês, ou ajustar `cfg["arquivo"]` no `mapeamento.json`.

---

## Workflow

### Passo 1 — Confirmar o mês e os arquivos

Se o usuário não especificar o mês, perguntar. Assumir o mês anterior ao atual como padrão mais provável (fechamento roda no início do mês seguinte).

Verificar se a pasta `financeiro/[AAAA-MM]/` existe e quais dos 4 arquivos estão presentes. Se faltar algum, avisar quais e perguntar se o usuário quer prosseguir com um fechamento parcial ou esperar o arquivo.

### Passo 2 — Rodar a calculadora

```bash
cd "C:/Users/marce/Desktop/claude comnéctar"
python ".claude/skills/fechamento-mensal/calculadora.py" --mes 2026-07
```

O script já tenta identificar as colunas de cada planilha automaticamente pelo cabeçalho (produto, quantidade, valor, categoria, etc). Ele devolve um JSON com todos os números prontos.

### Passo 3 — Calibrar mapeamento (só na primeira vez ou se der aviso)

Se o JSON retornar avisos do tipo "não identifiquei a coluna X", abrir o arquivo em questão, ver o nome exato do cabeçalho da coluna certa, e preencher o campo correspondente em `mapeamento.json` (dentro de `colunas`, com o nome exato do cabeçalho). Rodar de novo.

Uma vez calibrado pra um tipo de relatório, o Bling costuma manter o mesmo layout todo mês — não precisa recalibrar depois, só se o Marcelo mudar o formato de exportação.

### Passo 4 — Montar o relatório

Gerar `financeiro/[AAAA-MM]/fechamento-[AAAA-MM].md` nesse formato:

```markdown
# Fechamento — [Mês/Ano]

## Resultado do mês

*Receita das vendas de [mês] menos custo dos produtos vendidos menos contas pagas em [mês]. A despesa aqui é por caixa, não por competência — ver nota no fim.*

| | Valor |
|---|---|
| Receita bruta ([qtd] garrafas vendidas) | R$ X |
| (-) CMV | R$ X |
| = Margem bruta | R$ X |
| (-) Contas pagas no mês | R$ X |
| = **Resultado do mês** | **R$ X** |

**Contas pagas por categoria** (se o arquivo trouxer categoria):
| Categoria | Valor | % do total pago |
|---|---|---|

**Produtos com maior margem no mês** (top 5 por lucro, de `vendas_por_produto` no JSON):
| Produto | Qtd | Receita | Custo | Lucro |
|---|---|---|---|---|

## Fluxo de caixa

| | Valor |
|---|---|
| Total recebido | R$ X |
| Total pago | R$ X |
| = **Resultado de caixa** | **R$ X** |

## Resultado do mês vs. Fluxo de caixa

Resultado do mês: R$ X
Fluxo de caixa: R$ X
Diferença: R$ X — [a diferença aqui vem só do lado da receita: vendas do mês que ainda não foram recebidas (parceladas, boleto em aberto) vs. o que já entrou de fato. Usar os dados disponíveis pra dar pistas, não inventar motivo.]

## Avisos
[listar os avisos do script, ex: produtos sem custo encontrado, arquivos faltando]
```

Comentar os números em prosa curta antes ou depois da tabela — não deixar só tabela seca. Comparar com o mês anterior se o arquivo `fechamento-[mês anterior].md` existir na pasta `financeiro/`.

### Passo 5 — Perguntar próximos passos

Perguntar se quer:
- Ver o detalhe de algum produto/categoria específica
- Exportar o relatório em HTML/artifact pra apresentação
- Já deixar a pasta do próximo mês pronta pra receber os arquivos

---

## Regras

- **Nunca inventar número.** Se um relatório não veio ou uma coluna não foi identificada, isso vira aviso no relatório final — não estimar ou completar com suposição.
- **CMV vem sempre do cruzamento vendas × precos-custos por nome do produto.** Se o produto vendido não aparecer na tabela de custos, listar como "sem custo" e avisar — não assumir custo zero nem médio.
- **"Resultado do mês" não é sinônimo de competência contábil** — deixar isso explícito sempre que o relatório for usado fora dessa conversa (ex: se o Marcelo repassar pro contador). É receita por competência menos despesa por caixa, um híbrido definido assim porque o Bling não separa vencimento de pagamento.
- **Resultado do mês ≠ Fluxo de caixa.** Nunca misturar os dois números como se fossem a mesma coisa no texto do relatório. A diferença entre eles é informação relevante, não ruído.
- **Categorias de despesa são as que já vêm do Bling** — não reclassificar nem inventar categoria nova sem o usuário pedir.
- Tom conforme `_contexto/preferencias.md` — direto, sem "é importante ressaltar que" antes de cada número.
