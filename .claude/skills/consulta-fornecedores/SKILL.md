---
name: consulta-fornecedores
description: >
  Consulta e filtra vinhos nos catálogos de fornecedores locais (Excel e PDF).
  Aplica markup sobre o custo com impostos e apresenta tabela de resultados.
  Suporta filtros por tipo, país, uva, região, faixa de preço e busca livre.
  Use quando o usuário disser "seleciona vinhos da [fornecedor]", "quero Malbecs da Mistral",
  "filtra tintos abaixo de R$X", "me mostra o que tem de Chardonnay", ou qualquer consulta
  que envolva buscar vinhos nos catálogos de fornecedores.
---

# /consulta-fornecedores

## Arquivos locais

Todos os catálogos ficam em:
```
dados/fornecedores/tabelas fornecedores para claude/
```

Mapeamento completo de colunas e configurações em:
```
.claude/skills/consulta-fornecedores/mapeamento.json
```

Script de leitura:
```
.claude/skills/consulta-fornecedores/leitor.py
```

---

## Fornecedores disponíveis

| Nome (usar exato) | Arquivo | Custo = |
|---|---|---|
| `boisse` | BOISSE.xlsx | Col E (F.COM IPI) |
| `ceconello` | ceconello.xlsx | Col D × 0.65 (desconto 35%) |
| `decanter` | decanter.xlsx | Col G (Valor Total c ipi) |
| `del maipo` | del maipo.xlsx | Col I (IPI) |
| `epice` | epice.xlsx | Col F (PREÇO) |
| `interfood` | interfood.xlsx | Col K (valor final) |
| `mistral` | mistral.xlsx | Col P (PREÇO FINAL C/ IPI) |
| `world wine` | world wine.xlsx | Col S (Preço Com Desconto Com IPI) |
| `cantu` | cantu.pdf | Coluna PREÇO UNIT. FINAL |
| `adega alentejana` | adega alentejana.pdf | Coluna PREÇO FINAL (só vinhos/espumantes) |
| `vila porto` | vila porto.pdf | Coluna Lojas Especializadas |

---

## Como executar

```bash
cd "C:/Users/marce/Desktop/claude comnéctar"
python ".claude/skills/consulta-fornecedores/leitor.py" \
  --fornecedor "mistral" \
  --markup 2.5 \
  [--tipo tinto|branco|rosado|espumante] \
  [--pais Chile|Argentina|França|...] \
  [--uva Malbec|Chardonnay|...] \
  [--regiao Mendoza|Bordeaux|...] \
  [--busca "palavra livre"] \
  [--min 50] \
  [--max 300] \
  [--json]
```

### Exemplos

```bash
# Tintos argentinos da Mistral com markup 2.5x
python ".claude/skills/consulta-fornecedores/leitor.py" --fornecedor mistral --tipo tinto --pais Argentina --markup 2.5

# Chardonnay de qualquer custo até R$150 na World Wine
python ".claude/skills/consulta-fornecedores/leitor.py" --fornecedor "world wine" --uva Chardonnay --max 150 --markup 2.3

# Busca livre por "Barolo" na Ceconello
python ".claude/skills/consulta-fornecedores/leitor.py" --fornecedor ceconello --busca "Barolo" --markup 2.8

# Todos os espumantes da Cantu com markup 2.2x
python ".claude/skills/consulta-fornecedores/leitor.py" --fornecedor cantu --tipo espumante --markup 2.2

# Saída JSON para usar em outro processo (ex: gerar catálogo)
python ".claude/skills/consulta-fornecedores/leitor.py" --fornecedor decanter --tipo tinto --markup 2.4 --json
```

---

## Workflow padrão

### 1. Interpretar o pedido do usuário

Extrair do pedido:
- **Fornecedor(es)** — obrigatório. Se o usuário não especificar, perguntar antes de executar.
- **Markup** — se não informado, perguntar. Não aplicar default silencioso.
- **Filtros** — tipo, país, uva, região, faixa de preço, busca livre.

### 2. Executar o leitor

Rodar o leitor.py com os parâmetros extraídos. Para múltiplos fornecedores, rodar uma vez para cada um.

### 3. Apresentar resultados

Mostrar a tabela completa formatada no chat. Para mais de 20 itens, mostrar os primeiros 20 e perguntar se quer ver todos.

Formato da tabela:
```
# | Nome                                        | Tipo   | País        | Safra | Custo     | Venda
1 | CARMEN INSIGNE CABERNET SAUVIGNON 2024      | Tinto  | Chile       | 2024  | R$  22,29 | R$  55,73
```

### 4. Perguntar o que fazer com os resultados

Após mostrar os resultados, perguntar:
> "Quer gerar um catálogo com esses vinhos ou selecionar alguns?"

Se sim → usar a skill `catalogo-vinhos` com os dados selecionados.

---

## Atualizar planilha de fornecedor

Quando o usuário avisar que atualizou um arquivo no Drive:

```bash
cd "C:/Users/marce/Desktop/claude comnéctar/dados/fornecedores/tabelas fornecedores para claude"
python -m gdown [DRIVE_ID] -O "[nome_do_arquivo]"
```

Os Drive IDs estão em `mapeamento.json` → campo `drive_id` de cada fornecedor.

Exemplo para atualizar a Mistral:
```bash
python -m gdown 1U8CRldeMlnXosvgvqOSFg_4_7lSAreZS -O "mistral.xlsx"
```

---

## Regras

- **Nunca aplicar markup default** sem confirmar com o usuário.
- **Custo sempre com impostos** — as colunas já estão mapeadas para isso.
- **Ceconello é exceção** — o custo é calculado como Col D × 0.65 (desconto de 35%).
- **Adega Alentejana** — filtrar só vinhos e espumantes (grupos de vinho no PDF).
- **Epice** — ignorar linhas com "Sem Estoque" na coluna de preço.
- **Se o arquivo não existir localmente** → baixar do Drive usando o drive_id do mapeamento.
