# Meta Ads API — Referência Rápida

## Objetivos de campanha
- `OUTCOME_LEADS` — geração de leads
- `OUTCOME_TRAFFIC` — tráfego para site ou perfil
- `OUTCOME_SALES` — vendas / conversões
- `OUTCOME_AWARENESS` — reconhecimento de marca
- `OUTCOME_ENGAGEMENT` — engajamento
- `OUTCOME_APP_PROMOTION` — instalação de app

## Goals de otimização
- `LINK_CLICKS` — cliques no link
- `LANDING_PAGE_VIEWS` — visualizações de landing page
- `IMPRESSIONS` — impressões
- `REACH` — alcance
- `LEAD_GENERATION` — formulários de lead
- `OFFSITE_CONVERSIONS` — conversões no site
- `VISIT_INSTAGRAM_PROFILE` — visitas ao perfil Instagram
- `VALUE` — valor de conversão

## Estratégias de lance
- `LOWEST_COST_WITHOUT_CAP` — menor custo sem limite
- `LOWEST_COST_WITH_BID_CAP` — menor custo com teto de lance
- `COST_CAP` — custo alvo

## Status possíveis
- `ACTIVE`, `PAUSED`, `DELETED`, `ARCHIVED`

## Tipos de CTA
- `LEARN_MORE` — saiba mais (padrão para tráfego)
- `SHOP_NOW` — comprar agora (padrão para vendas)
- `SIGN_UP` — cadastrar (padrão para leads)
- `DOWNLOAD` — baixar
- `GET_OFFER` — ver oferta
- `SUBSCRIBE` — assinar

## Estrutura de targeting
```json
{
  "age_min": 18,
  "age_max": 65,
  "genders": [1, 2],
  "geo_locations": {
    "countries": ["BR"],
    "regions": [{"key": "1009"}],
    "cities": [{"key": "12345", "radius": 25, "distance_unit": "kilometer"}]
  },
  "interests": [{"id": "6003161134422", "name": "Vinho"}],
  "behaviors": [{"id": "123", "name": "Compradores online"}],
  "targeting_automation": {"advantage_audience": 1}
}
```

## Formatos de criativo
- **Imagem simples**: `object_story_spec` com `link_data` e `image_hash`
- **Carrossel**: `link_data` com `child_attachments` (array de slides)
- **Vídeo**: `video_data` com `video_id`

## Orçamentos (em centavos)
- `R$ 20/dia` = `--daily-budget 2000`
- `R$ 50/dia` = `--daily-budget 5000`
- `R$ 100/dia` = `--daily-budget 10000`

## Métricas de insights (padrão)
`impressions, clicks, spend, cpc, cpm, ctr, actions, cost_per_action_type, reach, frequency`

## Date presets
`today, yesterday, this_month, last_month, last_7d, last_14d, last_28d, last_30d, last_90d, maximum`

## Audiências semelhantes (lookalike)
```json
{"country": "BR", "ratio": 0.01}
```
- ratio: 0.01 = top 1% (mais parecido), 0.10 = top 10%

## Schemas para custom audience
`EMAIL, PHONE, FN (first name), LN (last name), ZIP, CT (city), ST (state), COUNTRY`
- Dados devem ser hashed em SHA256
