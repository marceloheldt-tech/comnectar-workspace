# meta-ads-ratos

Skill completa para gerenciar Meta Ads (Facebook/Instagram) via SDK oficial `facebook-business`.
Substitui o fb-ads-mcp-server com capacidades ampliadas: duplicação de campanhas, swap de url_tags e acesso completo à API.

## Quando usar

Sempre que o usuário mencionar:
- "cria campanha", "cria anúncio", "cria ad set", "cria criativo"
- "duplica campanha/adset/ad", "clona campanha"
- "troca url_tags", "corrige tracking"
- "insights", "performance", "métricas", "resultados"
- "pausar", "ativar", "atualizar budget", "alterar targeting"
- "pixel", "dataset", "diagnóstico do pixel"
- "meta ads", "facebook ads", "instagram ads"

## Setup inicial

Ao primeiro uso ou quando o usuário pedir configuração:

```bash
python3 ~/.claude/skills/meta-ads-ratos/scripts/setup.py
```

Criar arquivo `.env` em `~/.claude/skills/meta-ads-ratos/.env`:
```
META_ADS_TOKEN="token-do-graph-api-explorer"
META_APP_ID="id-do-app"
META_AD_ACCOUNT_ID="act_XXXXXXXXX"  # opcional
```

Preencher `contas.yaml` com contas, páginas e IDs do Instagram de cada cliente.

O app Meta deve estar em **Live mode** (não Development) para criar dark posts e criativos via API.

## Scripts disponíveis

Todos os scripts ficam em `scripts/` e aceitam subcomandos:

| Script | Operações |
|--------|-----------|
| `setup.py` | Verificação de dependências, token e conectividade |
| `read.py` | Contas, campanhas, adsets, ads, criativos, audiências, atividades, preview |
| `create.py` | Campanhas, adsets, ads, criativos, imagens, vídeos, audiências |
| `update.py` | Campanhas, adsets, ads, usuários de audiência |
| `delete.py` | Objetos (arquivo soft delete), audiências |
| `insights.py` | Performance por conta, campanha, adset, ad, async |
| `targeting.py` | Busca de interesses, comportamentos, geolocalizações, validação, alcance |
| `advanced.py` | Swap de url_tags, duplicação de ad/adset/campanha |
| `dataset.py` | Pixels: listar, detalhes, stats, eventos, diagnostics, share |

## Regras críticas de segurança

- Sempre criar objetos como **PAUSED** — nunca ativar sem confirmação
- Confirmar antes de deletar qualquer objeto
- Ativar toda a hierarquia ao ativar: campanha → adsets → ads
- Orçamentos em centavos: `5000 = R$50,00`
- Respeitar rate limits com delays de 60s se necessário
- Nunca hardcodear tokens de autenticação

## Aprendizados persistentes

Ler `aprendizados.md` ANTES de criar qualquer objeto — contém regras aprendidas em campo.
Registrar novos aprendizados após correções do usuário.

## Fluxo obrigatório para criar campanha

1. **Diagnóstico** — ler campanhas similares existentes com `read.py campaigns`
2. **Inspecionar template** — ler adsets, ads e criativos da campanha similar
3. **Consultar padrões** em `references/padroes-campanha.md`
4. **Criar sequencialmente**: campanha → adset → criativo → ad
5. **Validar** com `read.py ad --id XXX` e `read.py preview --creative XXX`
6. **Reportar sucesso** só após validação sem erros

## URL tags

Criativos Meta são **imutáveis** após criação. Para corrigir url_tags:
- Usar `advanced.py swap-url-tags --ad ID --url-tags "novos_tags"`
- Ou criar novo criativo manualmente e atualizar o ad

## Contas dos clientes

Ver `contas.yaml` — consultar automaticamente ao mencionar nome do cliente.
