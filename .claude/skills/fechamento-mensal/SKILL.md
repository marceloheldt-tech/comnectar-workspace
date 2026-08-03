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
- **Extrator de PDF:** `.claude/skills/fechamento-mensal/extrair_pdf.py` (o Bling exporta esses 3 relatórios em PDF, não Excel — ver Passo 2)

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
| `precos-custos.xlsx` | Todos os produtos, com **Código** e custo unitário (preço de venda é opcional — vem de `vendas.xlsx`) | Base pra calcular CMV |
| `vendas.xlsx` | Relatório "por Produto" de julho: Código, Quantidade, Valor Total | Receita bruta e margem por produto |
| `contas-pagas.xlsx` | Contas pagas no mês, por categoria (relatório "por Categoria" do Bling) | Despesa do "Resultado do mês" + lado pago do fluxo de caixa |
| `contas-recebidas.xlsx` | Recebimentos do mês (relatório por cliente do Bling) | Lado recebido do fluxo de caixa |

**O Marcelo exporta esses relatórios do Bling em PDF, não Excel.** Se ele colocar arquivos `.pdf` na pasta do mês (nomes livres, ex: "vendas julho.pdf", "pagamentos julho.pdf", "recebimentos julho.pdf"), converter pra xlsx antes de rodar a calculadora — ver Passo 2.

**Casar produto por Código, não por nome.** Nos PDFs do Bling o nome do produto quebra em várias linhas e a extração de texto embaralha a ordem — o Código não quebra e é a chave confiável entre `precos-custos.xlsx` e `vendas.xlsx`. `calculadora.py` já prioriza código e só cai pra nome normalizado como fallback.

**"Compras de fornecedores" (ou categoria equivalente) nunca entra no "Resultado do mês".** Essa categoria em `contas-pagas.xlsx` é a compra de vinho pros fornecedores — o mesmo custo que já está no CMV via `precos-custos.xlsx`. Contar os dois é dobrar o custo do vinho. A lista de categorias excluídas fica em `mapeamento.json` → `contas_pagas.categorias_ignoradas_no_resultado_do_mes`. Elas continuam entrando no Fluxo de caixa normalmente (que é dinheiro puro, sem relação com CMV). Se aparecer uma categoria nova de compra de mercadoria com nome diferente, adicionar nessa lista antes de calcular — não deixar passar batido, senão o Resultado do mês vem artificialmente baixo (ou negativo).

---

## Workflow

### Passo 1 — Confirmar o mês e os arquivos

Se o usuário não especificar o mês, perguntar. Assumir o mês anterior ao atual como padrão mais provável (fechamento roda no início do mês seguinte).

Verificar se a pasta `financeiro/[AAAA-MM]/` existe e quais dos 4 arquivos estão presentes (`precos-custos.xlsx`, `vendas.xlsx`, `contas-pagas.xlsx`, `contas-recebidas.xlsx` — ou os PDFs equivalentes, ver Passo 2). Se faltar algum, avisar quais e perguntar se o usuário quer prosseguir com um fechamento parcial ou esperar o arquivo.

### Passo 2 — Converter PDF pra xlsx (se necessário) e rodar a calculadora

Se `vendas.xlsx`, `contas-pagas.xlsx` ou `contas-recebidas.xlsx` não existirem mas houver um `.pdf` correspondente na pasta, converter primeiro:

```bash
cd "C:/Users/marce/Desktop/claude comnéctar"
py ".claude/skills/fechamento-mensal/extrair_pdf.py" --tipo vendas       --arquivo "financeiro/2026-07/vendas julho.pdf"       --saida "financeiro/2026-07/vendas.xlsx"
py ".claude/skills/fechamento-mensal/extrair_pdf.py" --tipo pagamentos   --arquivo "financeiro/2026-07/pagamentos julho.pdf"   --saida "financeiro/2026-07/contas-pagas.xlsx"
py ".claude/skills/fechamento-mensal/extrair_pdf.py" --tipo recebimentos --arquivo "financeiro/2026-07/recebimentos julho.pdf" --saida "financeiro/2026-07/contas-recebidas.xlsx"
```

Cada chamada imprime o total somado dos dados extraídos — conferir contra a linha "Totais"/"Total" impressa no PDF antes de seguir. Se não bater, não seguir em frente — o PDF pode ter um layout diferente do esperado (produto por página, colunas deslocadas, etc.) e precisa de um olhar manual antes de confiar no número.

Depois, rodar a calculadora (usar `PYTHONIOENCODING=utf-8` antes do comando — sem isso, acentos podem corromper ao salvar o JSON em arquivo):

```bash
PYTHONIOENCODING=utf-8 py ".claude/skills/fechamento-mensal/calculadora.py" --mes 2026-07
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
