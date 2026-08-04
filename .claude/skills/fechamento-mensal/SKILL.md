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
- **Dependências Python:** `openpyxl`, `pdfplumber`, `xlrd` — podem sumir entre sessões, ver memória `pdf-dependencias-nao-persistem`. Se `xlrd.open_workbook` reclamar de corrupção, usar `ignore_workbook_corruption=True` — os exports `.xls` do Bling abrem assim mesmo "corrompidos".

---

## O processo do Marcelo (confirmado em 2026-08-04, validado no fechamento real de julho/2026)

1. **Vendas do mês** — relatório do Bling por produto (código, quantidade, preço médio, valor total). Pode vir em Excel (`.xlsx`), Excel antigo (`.xls`) ou PDF — os três já apareceram. O custo de cada produto **não vem nesse relatório** — é cruzado automaticamente com uma tabela de custos mantida à parte (`precos-custos.xlsx`, por Código), não digitado à mão.
2. **Contas pagas do mês** — o Bling categoriza, mas em dois formatos diferentes já vistos: uma lista simples "Categoria → Valor", e um relatório hierárquico com categoria-mãe + subcategorias (Despesas administrativas → Aluguel, Energia, Software, etc.) mais um relatório detalhado item a item ("Contas a Pagar", com fornecedor/histórico/valor). **O arquivo `contas-pagas.xlsx` da skill deve conter TODAS as categorias, sem filtrar nada** — inclusive as que não entram no Resultado do mês (Compras de fornecedores, DIFAL, Transferências). Quem filtra é `mapeamento.json` → `categorias_ignoradas_no_resultado_do_mes`, não o arquivo de entrada. Isso importa porque o Fluxo de caixa precisa do total pago **completo**, e só bate se o arquivo tiver tudo.
3. **Resultado do mês** = Σ (receita − custo) de cada produto vendido − Σ contas pagas no mês (excluindo as categorias da lista de ignoradas).
4. **Fluxo de caixa** = total recebido − total pago no mês (**sem exclusão nenhuma** — é dinheiro real saindo da conta). Relatório **separado**, próprio arquivo, sem comparação textual com o Resultado do mês.

## Por que separar custo de produto de despesa operacional

O custo do vinho vendido (CMV) já sai da tabela de preços e custos, cruzada por produto. Categorias de despesa "puras" (administrativas, pessoal, comerciais, insumos de escritório) não têm esse problema. Mas duas categorias específicas já causaram duplicação de custo real, e ficam sempre em `categorias_ignoradas_no_resultado_do_mes`:

- **"Compras de fornecedores"** (ou nome equivalente) — é a compra de vinho, o mesmo custo que já está no CMV via `precos-custos.xlsx`.
- **DIFAL** — geralmente vem embutido dentro do total de "Impostos" no relatório de despesas (não aparece como linha própria) porque também já está no custo do produto. **Precisa ser separado manualmente**: pedir ao Marcelo o valor exato do DIFAL do mês, criar uma linha "DIFAL" própria em `contas-pagas.xlsx` com esse valor, subtrair do total de "Impostos", e colocar "DIFAL" na lista de ignoradas.
- **"Transferências"** — não é despesa operacional do mês (é movimentação financeira, tipo pagamento de fatura/empréstimo), então também fica de fora do Resultado do mês, mas conta no Fluxo de caixa normalmente.

Isso já causou um erro real: no primeiro fechamento (julho/2026, v1 da skill), "Compras de fornecedores" foi somada junto com o CMV, contando o custo do vinho duas vezes — deu um "prejuízo" de -R$42 mil que era artefato de cálculo. No fechamento real (v2, mesmo mês), o DIFAL escondido dentro de Impostos quase causou o mesmo problema de novo. Por isso o **checkpoint obrigatório no Passo 3** existe — nunca confiar de olhos fechados que a categorização de despesa não tem custo de mercadoria escondido.

## Por que não é "competência x caixa" no sentido contábil estrito

O Bling não tem data de vencimento separada da data de pagamento nas despesas — só a data em que a conta foi paga. Então o Resultado do mês é um híbrido: receita por competência (o que vendeu no mês) menos despesa por caixa (o que foi pago no mês). Não chamar isso de "resultado por competência" sem essa ressalva se o relatório for repassado pra fora (ex: contador).

---

## Arquivos esperados

Os relatórios do Bling ficam em `financeiro/[AAAA-MM]/` (ex: `financeiro/2026-07/`). Nomes padrão:

| Arquivo | Conteúdo | Pra quê serve |
|---|---|---|
| `precos-custos.xlsx` | Tabela de custos mantida à parte: Código, Produto, Custo (preço é opcional) | Cruzar com vendas pra achar o custo de cada produto vendido |
| `vendas.xlsx` | Relatório "por Produto" do mês: Código, Quantidade, Valor Total | Receita e lucro por produto |
| `contas-pagas.xlsx` | **Todas** as contas pagas no mês, por categoria, sem filtrar nada (nem Compras de fornecedores, nem DIFAL, nem Transferências) | Despesa do Resultado do mês (com exclusões via `mapeamento.json`) + total completo do Fluxo de caixa |
| `contas-recebidas.xlsx` | Recebimentos do mês | Lado recebido do Fluxo de caixa |

**Se vierem em PDF**, converter com `extrair_pdf.py` — ver Passo 2. **Se vierem em `.xls`** (formato binário antigo do Excel), usar `xlrd` com `ignore_workbook_corruption=True` — não tem script pronto na skill ainda, ler direto com um script pontual (ver exemplo no Passo 2).

**Casar produto por Código, não por nome.** Em PDF o nome do produto quebra em várias linhas e a extração de texto embaralha a ordem. `calculadora.py` já prioriza código e só cai pra nome normalizado como fallback.

**Produtos fora do catálogo principal de vinhos** (itens avulsos, kits, consignação) podem não ter linha em `precos-custos.xlsx`. Regra combinada com o Marcelo pra esses casos: **perguntar item por item** antes de estimar —
- Se for o mesmo vinho de outro código já cadastrado (ex: kit/caixa do mesmo rótulo vendido avulso), usar o custo unitário do código irmão.
- Se for item realmente sem custo conhecido, perguntar se aplica a regra **custo = valor de venda ÷ 1,08** (margem fina, ~7,4% de lucro) — só depois de confirmar que essa regra vale pro item específico, não aplicar em lote sem perguntar.

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

- Totais extraídos de cada PDF/planilha vs. o total impresso no original — bateram? (soma de `contas-pagas.xlsx` deve bater com o total do relatório "Contas a Pagar" do Bling, não com um subtotal filtrado.)
- **Todas** as categorias encontradas em `pago_por_categoria`, com valor de cada uma. Perguntar: alguma categoria nova (fora de Compras de fornecedores/DIFAL/Transferências, que já sabemos excluir) parece compra de mercadoria/estoque? Se sim, **não somar no Resultado do mês sem perguntar** — adicionar em `categorias_ignoradas_no_resultado_do_mes`.
- **O total de "Impostos" inclui DIFAL escondido?** Perguntar o valor exato do DIFAL do mês ao Marcelo, mesmo que o relatório de despesas não separe isso — não presumir que é zero nem estimar.
- Produtos vendidos sem custo encontrado em `precos-custos.xlsx` (campo `produtos_sem_custo`) — pra cada um, perguntar se é duplicata de outro código já cadastrado (usar custo dele) ou se aplica a regra do 1,08 (ver seção de arquivos esperados).
- Quantidades e valores de vendas que parecerem estranhos (muito acima do padrão do produto, por exemplo) — confirmar com o Marcelo antes de aceitar como está.

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
- **O checkpoint do Passo 3 não é opcional.** Já pegou dois erros reais de duplicação de custo (Compras de fornecedores, depois DIFAL escondido em Impostos) que juntos mudariam o resultado em dezenas de milhares de reais. Sempre mostrar as categorias de despesa encontradas antes de somar, mesmo que pareçam bater com o esperado.
- **`contas-pagas.xlsx` nunca vem pré-filtrado.** Todas as categorias entram no arquivo; quem decide o que não conta no Resultado do mês é `categorias_ignoradas_no_resultado_do_mes` em `mapeamento.json`. Filtrar no arquivo de entrada quebra o Fluxo de caixa (que precisa do total completo).
- **Resultado do mês e Fluxo de caixa são relatórios independentes**, arquivos separados, sem seção comparando um com o outro.
- Tom conforme `_contexto/preferencias.md` — direto, sem "é importante ressaltar que" antes de cada número.
