---
name: entregas
description: >
  Acompanha os despachos da comnéctar pela Total Express. Mantém uma lista de códigos de rastreio
  (TXAQ...tx), consulta o rastreio público do Total Conecta e dá um update de cada pedido:
  aguardando coleta, em trânsito, saiu pra entrega, entregue ou com problema.
  Use quando o usuário disser "como tão as entregas", "status das entregas", "update dos despachos",
  "rastreia esses códigos", "despachei hoje, segue o código", colar códigos TXAQ...tx, ou "/entregas".
---

# /entregas

Acompanhamento diário dos despachos via Total Express.

## Arquivos

- Script: `scripts/entregas/entregas.mjs` (rodar sempre da raiz do projeto)
- Lista de despachos: `dados/entregas/despachos.json` (fonte da verdade, não editar à mão, usar o script)

## Como funciona

A consulta usa a página **pública** de rastreio do Total Conecta (`/rastreamento?codigo=...`), sem login e sem captcha.
O script abre o Chrome em modo invisível, clica em "Buscar encomenda" e lê a resposta da API interna da página
(`/mfe-rastreio/api/basic` e `/order-data`). Faz uma consulta por vez, com pausa de ~4s entre elas.

**Não usar o login do portal** (credenciais `TOTAL_*` no `.env`): a Akamai bloqueia login automatizado.
Ver memória `project_entregas_skill.md`.

## Fluxos

### 1. Usuário manda código(s) novo(s)
Para cada código (aceita com ou sem nome do cliente):
```bash
node scripts/entregas/entregas.mjs add TXAQ581563442tx Maria Silva
```
Confirmar que entrou na lista ("Adicionei 3 despachos. Quer que eu já consulte?").
Só rodar o `status` se o usuário pedir.

Se o usuário passar o nome do cliente depois:
```bash
node scripts/entregas/entregas.mjs cliente TXAQ581563442tx Maria Silva
```

### 2. Usuário pede o update ("como tão as entregas?")
```bash
node scripts/entregas/entregas.mjs status
```
Demora ~15s por código. O script atualiza o `despachos.json` sozinho e devolve um JSON com `relatorio[]`.
Entregues aparecem **uma vez** no relatório e são arquivados automaticamente.

### 3. Outros
- `node scripts/entregas/entregas.mjs list`: lista os ativos sem consultar
- `node scripts/entregas/entregas.mjs remove <CODIGO>`: tira da lista (ex.: código digitado errado)

## Formato do update

Em português, curto, problemas primeiro. Identificar cada despacho pelo **cliente** (se tiver) + código.
Se não tiver cliente, usar o `pedidoTotal` (número que a Total associa) e, no fim, perguntar o nome.

```
🚚 Entregas Total Express, [data]

⚠️ Atenção
- [Cliente] (TXAQ...): [o que aconteceu], [data]. Sugestão: [ação]

🛵 Saiu pra entrega hoje
- [Cliente] (TXAQ...)

✅ Entregues
- [Cliente] (TXAQ...): entregue em [dd/mm]

📦 Em trânsito
- [Cliente] (TXAQ...): [status em linguagem simples], previsão [dd/mm]

📄 Aguardando coleta
- [Cliente] (TXAQ...): etiqueta emitida em [dd/mm], ainda sem coleta
```

Omitir seções vazias. Traduzir o status técnico da Total pra linguagem simples
(ex.: "TRANSFERENCIA PARA: - SAO" → "a caminho da unidade de São Paulo"; "ARQUIVO RECEBIDO" → "etiqueta emitida, ainda não coletado").

## O que vira "Atenção"

Mover pra seção ⚠️ quando:
- `situacao = "atencao"` (evento com `insucesso`: cliente ausente, endereço não encontrado, recusa, avaria etc.)
- `previsao` já passou e não está entregue
- `aguardando_coleta` há mais de 1 dia útil desde `dataStatus` (coleta pode ter falhado)
- `erro` na consulta (código não encontrado ou portal bloqueou)

## Problemas conhecidos

- **"portal bloqueou a consulta"**: limite da Akamai. Esperar uns minutos e tentar de novo, sem repetir em loop.
- **Chrome não encontrado**: o script usa `channel: 'chrome'` (Chrome instalado no Windows). Se falhar, `npx playwright install chromium` e trocar pra Chromium.
- **Mudou o layout do portal**: o botão é localizado por `data-testid="tracking-search-page-button"`. Se a Total trocar, inspecionar a página de novo.
