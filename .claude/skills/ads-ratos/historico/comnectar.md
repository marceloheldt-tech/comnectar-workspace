# Histórico de Otimizações — comnéctar

> Última atualização: 2026-06-10
> Total de ações: 8
> ✅ Confirmadas: 0 | ❌ Refutadas: 0 | ⏳ Pendentes: 8

---

### 2026-06-10 — Diagnóstico + Auditoria mensal (Health Score 40/100)

**Ação:** Rodou diagnóstico completo e auditoria de infraestrutura (Meta Ads + GA4) referente ao período 11/05–09/06/2026.
**Resultado:** Health Score 40/100, Nota D. Identificados 8 problemas distribuídos em 4 categorias. Dois relatórios HTML gerados em `reports/`.
**Snapshot de métricas (referência para próxima auditoria):**
- Gasto 30 dias: R$905,80
- CTR: 2,12% (benchmark 1,2–1,8% → EXCELENTE)
- CPC: R$0,26 (benchmark R$0,60–1,20 → EXCELENTE)
- CPM: R$5,46 (EXCELENTE)
- Alcance: 117.724
- Frequência: 1,41 (EXCELENTE — máx. da conta)
- LP Views: 1.371
- Conversões purchase: 0 (pixel não configurado)
- Sessões GA4: 2.161
- Bounce rate: 83,4%

**Status:** ✅ Análise concluída — plano de ação abaixo

---

### 2026-06-10 — Instalar evento purchase no pixel Meta (via Shopify)

**Ação:** A executar — ativar eventos de conversão no pixel Meta pelo painel Shopify (Preferências → Pixel do Meta → Eventos de conversão: purchase, add_to_cart, initiate_checkout).
**Motivo:** R$905,80 gastos em 30 dias com 0 conversões rastreadas. Impossível calcular ROAS, CPA ou escalar com base em dados reais. Pré-requisito para tudo mais.
**Hipótese:** Com purchase ativo, a conta passa a ter ROAS visível e o algoritmo do Meta tem sinal para otimizar para compras (hoje otimiza só para cliques).
**Métricas antes:**
- Conversões purchase: 0
- ROAS: não mensurável
- Gasto mensal: R$905,80
- Objetivo campanhas: OUTCOME_TRAFFIC

**Esforço estimado:** 30 min
**Status:** ⏳ Aguardando execução

---

### 2026-06-10 — Configurar CAPI (server-side) via integração nativa Shopify

**Ação:** A executar — Shopify → Apps → Meta → Conversions API → ativar integração server-side.
**Motivo:** Sem CAPI, todos os eventos bloqueados por iOS 14+/Android opt-out são perdidos. Estimativa: 20–40% dos eventos não chegam ao Meta só via pixel client-side.
**Hipótese:** Taxa de match de eventos sobe para ≥90% (hoje não mensurável). Atribuição de conversões aumenta 20–40% sem mudar nada nas campanhas.
**Métricas antes:**
- CAPI configurado: Não
- Taxa de deduplicação pixel/CAPI: 0%
- EMQ Score: não avaliável (0 purchases)

**Esforço estimado:** 20 min
**Status:** ⏳ Aguardando execução

---

### 2026-06-10 — Avaliar ROI da campanha "Crescimento Instagram" (7 meses ativos)

**Ação:** A executar — exportar crescimento de seguidores de nov/2025 até jun/2026. Calcular CPF = gasto total ÷ novos seguidores. Decidir se pausa ou mantém.
**Motivo:** Campanha rodando desde nov/2025 com objetivo PROFILE_VISIT. No período de 30 dias, gerou apenas 3 LP views com custo de R$100,41/visita. A campanha "Visita Novo Site" faz a mesma visita por R$0,44 — diferença de 228x.
**Hipótese:** CPF provável acima de R$2,50 (threshold de pausa). Se confirmado, pausar e realocar R$300/mês para campanha de conversões.
**Métricas antes (30 dias):**
- Gasto: R$301,23
- LP Views: 3
- CTR: 1,71%
- CPC: R$0,235
- Frequência: 1,41
- LP Views da campanha concorrente: 1.368 com R$604,57 (R$0,44/visita)

**Esforço estimado:** 15 min
**Economia potencial:** R$301/mês (R$3.612/ano)
**Status:** ⏳ Aguardando avaliação

---

### 2026-06-10 — Adicionar 2 criativos por ad set (de 1 para 3)

**Ação:** A executar — criar variações de copy/gancho para os 2 ad sets da campanha "Visita Novo Site": "Vídeo Novo Site" e "Carrossel". Cada ad set passa de 1 para 3 criativos.
**Motivo:** Todos os 3 ad sets têm 1 criativo cada. Sem variação não há aprendizado criativo — o algoritmo não consegue identificar vencedores nem testar abordagens diferentes. Benchmark mínimo: 3 criativos/ad set.
**Hipótese:** Com 3 criativos por ad set, CTR atual (2,12%) mantém ou melhora em +5–15% em 14 dias com o algoritmo escolhendo o melhor. Menor risco de fadiga futura.
**Métricas antes:**
- Criativos por ad set: 1
- CTR conta: 2,12%
- CTR Vídeo: 2,59%
- CTR Carrossel: 2,36%
- Fadiga atual: inexistente (CTR subindo +10,8% na 2ª quinzena)

**Esforço estimado:** 2h (produção de 4 variações)
**Status:** ⏳ Aguardando execução

---

### 2026-06-10 — Testar CBO na campanha "Visita Novo Site"

**Ação:** A executar — duplicar campanha "Visita Novo Site" → mudar de ABO (R$10/dia por ad set) para CBO (R$20/dia total) → rodar paralelo por 7 dias → pausar o pior.
**Motivo:** "Vídeo Novo Site" tem CTR 2,59% e mais LP views com mesmo orçamento que "Carrossel" (CTR 2,36%). Com ABO o algoritmo não realoca automaticamente. CBO permite distribuição dinâmica para o que converte mais.
**Hipótese:** CBO melhora eficiência de verba em 10–20% com mesmo gasto total (R$20/dia em vez de R$20 divididos manualmente).
**Métricas antes:**
- Estrutura: ABO — R$10/dia por ad set
- Vídeo: 710 LP views, R$0,43/visita
- Carrossel: 658 LP views, R$0,46/visita

**Esforço estimado:** 10 min
**Status:** ⏳ Aguardando execução

---

### 2026-06-10 — Criar campanha de retargeting (após pixel ativo)

**Ação:** A executar após pixel purchase estar ativo por ≥7 dias — criar campanha de retargeting para visitantes do site nos últimos 30 dias, excluindo compradores. Budget inicial: R$15/dia.
**Motivo:** ~233 visitantes/mês sem nenhum reimpacto. Bounce rate de 83,4% indica que a maioria saiu sem comprar. Retargeting tem CPL 40–60% menor que prospecção em e-commerce.
**Hipótese:** CPL do retargeting entre R$8–25 (vs benchmark de prospecção R$15–50). 15–20 conversões/mês adicionais com R$15/dia (~R$450/mês).
**Métricas antes:**
- Campanhas de retargeting ativas: 0
- Visitantes 30 dias (GA4): 2.161 sessões
- Bounce rate: 83,4%
- Audiência de compradores: não disponível (aguarda pixel purchase)

**Dependência:** pixel purchase configurado e com ≥500 eventos
**Esforço estimado:** 30 min
**Status:** ⏳ Bloqueado — aguarda pixel purchase

---

### 2026-06-10 — Criar campanha CONVERSÕES (após 50+ purchases no pixel)

**Ação:** A executar após pixel ter ≥50 eventos purchase — criar campanha com objetivo CONVERSIONS substituindo gradualmente as campanhas de TRAFFIC.
**Motivo:** Campanhas de tráfego (OUTCOME_TRAFFIC) otimizam para cliques, não compras. O algoritmo está aprendendo a gerar tráfego barato — não compradores. É a causa-raiz do Health Score 40/100.
**Hipótese:** Com objetivo CONVERSIONS e pixel treinado, ROAS ≥3x em 30 dias. CPA entre R$25–60 (benchmark e-commerce vinhos premium).
**Métricas antes:**
- Objetivo atual: OUTCOME_TRAFFIC
- Conversões purchase: 0
- CPA: não mensurável
- ROAS: não mensurável

**Dependência:** pixel purchase com ≥50 eventos (estimativa: 3–6 semanas após configuração)
**Esforço estimado:** 1h (setup + copy + criativos de conversão)
**Status:** ⏳ Bloqueado — aguarda pixel purchase treinado

---
