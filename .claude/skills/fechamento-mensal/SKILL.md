---
name: fechamento-mensal
description: >
  Faz o fechamento financeiro mensal da comnéctar a partir dos relatórios exportados do Bling.
  Calcula o Resultado do mês (lucro por produto vendido menos contas pagas por categoria) e o
  Fluxo de caixa (recebido menos pago), como dois relatórios separados.
  Use quando o usuário disser "fechamento do mês", "fechamento mensal", "fecha o mês passado",
  "resultado de [mês]", "quanto lucramos em [mês]", ou "/fechamento-mensal".
---

# /fechamento-mensal — Fechamento Financeiro Mensal

## Dependências

- **Contexto do negócio:** `_contexto/empresa.md`
- **Tom de voz:** `_contexto/preferencias.md`
- **Mapeamento de colunas:** `.claude/skills/fechamento-mensal/mapeamento.json`
- **Script de cálculo:** `.claude/skills/fechamento-mensal/calculadora.py`
- **Extrator de PDF:** `.claude/skills/fechamento-mensal/extrair_pdf.py` (o Bling costuma exportar em PDF, não Excel)

---

## O processo do Marcelo (confirmado em 2026-08-04, não presumir diferente disso)

1. **Vendas do mês** — relatório do Bling por produto (código, quantidade, preço médio, valor total). O custo de cada produto **não vem nesse relatório** — é cruzado automaticamente com uma tabela de custos mantida à parte (`precos-custos.xlsx`, por Código), não digitado à mão.
2. **Contas pagas do mês** — já vem categorizado do Bling como: **pró-labore, software, ferramentas, marketing, aluguel, contabilidade, outros custos**. Essa é a lista de categorias esperada — se aparecer uma categoria fora dessa lista (principalmente algo que pareça compra de mercadoria/estoque/fornecedor de vinho), **parar e perguntar ao Marcelo antes de somar** — pode ser custo de produto duplicado (ver "Por que separar" abaixo).
3. **Resultado do mês** = Σ (receita − custo) de cada produto vendido − Σ contas pagas no mês.
4. **Fluxo de caixa** = total recebido − total pago no mês. É um relatório **separado**, próprio arquivo, sem comparação textual com o Resultado do mês.

## Por que separar custo de produto de despesa operacional

O custo do vinho vendido (CMV) já sai da tabela de preços e custos, cruzada por produto. As categorias de despesa do Marcelo (pró-labore, software, ferramentas, marketing, aluguel, contabilidade, outros) são despesas operacionais puras — nenhuma delas é compra de mercadoria. Por isso, diferente da v1 dessa skill, normalmente **nenhuma categoria precisa ser excluída** do Resultado do mês.

Isso já causou um erro real uma vez: no primeiro fechamento (julho/2026), a categoria "Compras de fornecedores" apareceu no relatório de contas pagas e foi somada junto com o CMV, contando o custo do vinho duas vezes — deu um "prejuízo" de -R$42 mil que era artefato de cálculo, não realidade. Por isso existe o mecanismo `mapeamento.json` → `contas_pagas.categorias_ignoradas_no_resultado_do_mes` (hoje vazio) e o **checkpoint obrigatório no Passo 3** — não confiar de olhos fechados que a categorização de despesa nunca vai incluir custo de mercadoria.

## Por que não é "competência x caixa" no sentido contábil estrito

O Bling não tem data de vencimento separada da data de pagamento nas despesas — só a data em que a conta foi paga. Então o Resultado do mês é um híbrido: receita por competência (o que vendeu no mês) menos despesa por caixa (o que foi pago no mês). Não chamar isso de "resultado por competência" sem essa ressalva se o relatório for repassado pra fora (ex: contador).

---

## Arquivos esperados

Os relatórios do Bling ficam em `financeiro/[AAAA-MM]/` (ex: `financeiro/2026-07/`). Nomes padrão:

| Arquivo | Conteúdo | Pra quê serve |
|---|---|---|
| `precos-custos.xlsx` | Tabela de custos mantida à parte: Código, Produto, Custo (preço é opcional) | Cruzar com vendas pra achar o custo de cada produto vendido |
| `vendas.xlsx` | Relatório "por Produto" do mês: Código, Quantidade, Valor Total | Receita e lucro por produto |
| `contas-pagas.xlsx` | Contas pagas no mês, categorizado (pró-labore, software, ferramentas, marketing, aluguel, contabilidade, outros) | Despesa do Resultado do mês + lado pago do Fluxo de caixa |
| `contas-recebidas.xlsx` | Recebimentos do mês | Lado recebido do Fluxo de caixa |

**Se vierem em PDF** (nomes livres, ex: "vendas agosto.pdf"), converter primeiro com `extrair_pdf.py` — ver Passo 2.

**Casar produto por Código, não por nome.** Em PDF o nome do produto quebra em várias linhas e a extração de texto embaralha a ordem. `calculadora.py` já prioriza código e só cai pra nome normalizado como fallback.

---

## Workflow

### Passo 1 — Confirmar o mês e os arquivos

Se o usuário não especificar o mês, perguntar. Verificar se `financeiro/[AAAA-MM]/` existe e quais dos 4 arquivos estão presentes (xlsx ou PDF equivalente). Se faltar algum, avisar e perguntar se segue parcial ou espera.

### Passo 2 — Converter PDF pra xlsx (se necessário) e rodar a calculadora

```bash
cd "C:/Users/marce/Desktop/claude comnéctar"
py ".claude/skills/fechamento-mensal/extrair_pdf.py" --tipo vendas       --arquivo "financeiro/2026-07/vendas agosto.pdf"       --saida "financeiro/2026-07/vendas.xlsx"
py ".claude/skills/fechamento-mensal/extrair_pdf.py" --tipo pagamentos   --arquivo "financeiro/2026-07/pagamentos agosto.pdf"   --saida "financeiro/2026-07/contas-pagas.xlsx"
py ".claude/skills/fechamento-mensal/extrair_pdf.py" --tipo recebimentos --arquivo "financeiro/2026-07/recebimentos agosto.pdf" --saida "financeiro/2026-07/contas-recebidas.xlsx"
```

Cada chamada imprime o total extraído — conferir contra a linha "Total"/"Totais" do PDF. Se não bater, não seguir — revisar manualmente antes de confiar no número.

Rodar a calculadora (usar `PYTHONIOENCODING=utf-8` antes — sem isso acentos corrompem ao salvar em arquivo):

```bash
PYTHONIOENCODING=utf-8 py ".claude/skills/fechamento-mensal/calculadora.py" --mes 2026-07
```

Se o JSON trouxer avisos de coluna não identificada, calibrar em `mapeamento.json` (campo `colunas`, com o nome exato do cabeçalho) e rodar de novo.

### Passo 3 — Checkpoint obrigatório (não pular, mesmo que os números pareçam óbvios)

Antes de escrever qualquer relatório final, mostrar pro Marcelo no chat (não só gerar o arquivo direto):

- Totais extraídos de cada PDF/planilha vs. o total impresso no original — bateram?
- **Todas** as categorias encontradas em `pago_por_categoria`, com valor de cada uma — perguntar explicitamente se alguma foge das 7 categorias esperadas (pró-labore, software, ferramentas, marketing, aluguel, contabilidade, outros) ou parece compra de mercadoria/estoque. Se aparecer categoria estranha, **não somar sem perguntar** — pode precisar entrar em `categorias_ignoradas_no_resultado_do_mes`.
- Produtos vendidos sem custo encontrado em `precos-custos.xlsx` (campo `produtos_sem_custo`) — o CMV está subestimado nesses casos.

Só gerar os arquivos finais depois do Marcelo confirmar que os números fazem sentido.

### Passo 4 — Gerar os dois relatórios (arquivos separados)

`financeiro/[AAAA-MM]/resultado-[AAAA-MM].md`:

```markdown
# Resultado do mês — [Mês/Ano]

*Lucro de cada produto vendido (receita − custo) menos contas pagas no mês.*

| | Valor |
|---|---|
| Receita bruta ([qtd] garrafas vendidas) | R$ X |
| (-) CMV | R$ X |
| = Margem bruta | R$ X |
| (-) Contas pagas no mês | R$ X |
| = **Resultado do mês** | **R$ X** |

**Contas pagas por categoria:**
| Categoria | Valor |
|---|---|

**Top 5 produtos por lucro:**
| Produto | Qtd | Receita | Custo | Lucro |
|---|---|---|---|---|

## Avisos
[produtos sem custo, arquivos faltando, categorias fora do esperado — o que sobrou do checkpoint do Passo 3]
```

`financeiro/[AAAA-MM]/fluxo-caixa-[AAAA-MM].md`:

```markdown
# Fluxo de caixa — [Mês/Ano]

| | Valor |
|---|---|
| Total recebido | R$ X |
| Total pago | R$ X |
| = **Resultado de caixa** | **R$ X** |
```

Comentar os números em prosa curta, não deixar só tabela seca. Comparar com o mês anterior se o arquivo existir. **Não** criar uma seção comparando os dois relatórios entre si — são dois documentos independentes.

### Passo 5 — Perguntar próximos passos

Perguntar se quer ver detalhe de produto/categoria específica, exportar em HTML/artifact, ou deixar a pasta do próximo mês pronta.

---

## Regras

- **Nunca inventar número.** Relatório não veio ou coluna não identificada → vira aviso, não suposição.
- **CMV sempre do cruzamento vendas × precos-custos por Código.** Produto sem custo → listar como "sem custo", nunca assumir custo zero ou médio.
- **O checkpoint do Passo 3 não é opcional.** Foi pulado uma vez e gerou um número de resultado errado por -R$48 mil de diferença. Sempre mostrar as categorias de despesa encontradas antes de somar, mesmo que pareçam bater com o esperado.
- **Resultado do mês e Fluxo de caixa são relatórios independentes**, arquivos separados, sem seção comparando um com o outro.
- Tom conforme `_contexto/preferencias.md` — direto, sem "é importante ressaltar que" antes de cada número.
