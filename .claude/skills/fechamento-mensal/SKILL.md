---
name: fechamento-mensal
description: >
  Faz o fechamento financeiro mensal da comnéctar a partir dos relatórios exportados do Bling.
  Calcula o resultado por competência (receita, CMV, margem bruta, despesas por categoria) e o
  resultado de caixa (contas pagas e recebidas no mês), e monta um relatório comparando os dois.
  Use quando o usuário disser "fechamento do mês", "fechamento mensal", "fecha o mês passado",
  "resultado de [mês]", "DRE do mês", "quanto lucramos em [mês]", ou "/fechamento-mensal".
---

# /fechamento-mensal — Fechamento Financeiro Mensal

## Dependências

- **Contexto do negócio:** `_contexto/empresa.md`
- **Tom de voz:** `_contexto/preferencias.md`
- **Mapeamento de colunas:** `.claude/skills/fechamento-mensal/mapeamento.json`
- **Script de cálculo:** `.claude/skills/fechamento-mensal/calculadora.py`

---

## Arquivos esperados

Os relatórios do Bling ficam em `financeiro/[AAAA-MM]/` (ex: `financeiro/2026-07/`). Nomes padrão:

| Arquivo | Conteúdo | Pra quê serve |
|---|---|---|
| `precos-custos.xlsx` | Todos os produtos, com preço e custo unitário | Base pra calcular CMV |
| `vendas.xlsx` | Cada venda do mês: produto, quantidade, preço de venda efetivo, data | Receita bruta |
| `despesas-competencia.xlsx` | Todas as despesas do mês por competência, já categorizadas (impostos, folha, marketing, etc.) | Despesas operacionais |
| `contas-pagas.xlsx` | Contas efetivamente pagas no mês (data de pagamento) | Fechamento de caixa |
| `contas-recebidas.xlsx` | Contas efetivamente recebidas no mês (data de recebimento) | Fechamento de caixa |

Se o Marcelo mandar os arquivos com nomes diferentes, renomear/copiar pra esses nomes padrão dentro da pasta do mês, ou ajustar `cfg["arquivo"]` no `mapeamento.json`.

---

## Workflow

### Passo 1 — Confirmar o mês e os arquivos

Se o usuário não especificar o mês, perguntar. Assumir o mês anterior ao atual como padrão mais provável (fechamento roda no início do mês seguinte).

Verificar se a pasta `financeiro/[AAAA-MM]/` existe e quais dos 5 arquivos estão presentes. Se faltar algum, avisar quais e perguntar se o usuário quer prosseguir com um fechamento parcial ou esperar o arquivo.

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

## Resultado por competência

| | Valor |
|---|---|
| Receita bruta | R$ X |
| (-) CMV | R$ X |
| = Margem bruta | R$ X |
| (-) Despesas operacionais | R$ X |
| = **Resultado do mês (competência)** | **R$ X** |

**Despesas por categoria:**
| Categoria | Valor | % da receita |
|---|---|---|
| ... | ... | ... |

## Fechamento de caixa

| | Valor |
|---|---|
| Total recebido | R$ X |
| Total pago | R$ X |
| = **Resultado de caixa** | **R$ X** |

## Competência vs. Caixa

Resultado por competência: R$ X
Resultado de caixa: R$ X
Diferença: R$ X — [explicar a causa: parcelamentos, contas em aberto, despesas de meses anteriores pagas agora, etc — usar os dados de categoria pra dar pistas, não inventar motivo]

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
- **Competência ≠ Caixa.** Nunca misturar os dois números como se fossem a mesma coisa no texto do relatório. A diferença entre eles é informação relevante, não ruído.
- **Categorias de despesa são as que já vêm do Bling** — não reclassificar nem inventar categoria nova sem o usuário pedir.
- Tom conforme `_contexto/preferencias.md` — direto, sem "é importante ressaltar que" antes de cada número.
