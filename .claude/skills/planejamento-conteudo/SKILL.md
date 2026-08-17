---
name: planejamento-conteudo
description: >
  Transforma um período estratégico (trimestre, campanha, lançamento) em um fluxo de conteúdo
  completo pros 3 canais da comnéctar — Instagram, WhatsApp e Email. Gera a pauta temática
  semana a semana cruzando com datas reais do calendário (datas comerciais, sazonalidade,
  eventos do setor de vinho) e depois a copy de cada peça, tudo organizado num Excel claro
  com aba de guia de imagens. Use quando o usuário disser "fluxo de conteúdo", "pauta do
  trimestre", "planejamento de conteúdo pro T[n]", "programa os conteúdos de [período]",
  "monta o calendário de conteúdo", ou "/planejamento-conteudo".
---

# /planejamento-conteudo — Fluxo de Conteúdo por Período

## Dependências

- **Tom de voz:** `_contexto/preferencias.md`
- **Contexto do negócio:** `_contexto/empresa.md`
- **Estratégia atual:** `_contexto/estrategia.md`
- **Gerador de Excel:** `.claude/skills/planejamento-conteudo/gerar_excel.py` — módulo reutilizável, importar `build_workbook` e `GUIA_IMAGENS_PADRAO`
- **Dependência Python:** `openpyxl` — pode sumir entre sessões (ver memória `pdf-dependencias-nao-persistem`), testar com `py -3 -c "import openpyxl"` antes de rodar

---

## O processo (confirmado com o Marcelo em agosto/2026, primeira execução: T1 2026-2027)

1. O ponto de partida é sempre um período com objetivo estratégico claro (ex: T1 de um plano de crescimento, uma campanha sazonal). Se o usuário só mandar um PDF/documento de estratégia, ler ele inteiro antes de propor qualquer pauta.
2. A pauta editorial roda em **3 canais fixos**: Instagram (Seg/Qua/Sex), WhatsApp (Seg/Qua/Sex), Email (1x/semana, sugestão quinta). Se o período tiver uma automação own (tipo régua pós-cadastro/pós-compra), ela é documentada à parte como fluxo "evergreen", não amarrada a uma semana específica do calendário.
3. Cada semana do período recebe um **tema-guarda-chuva** que amarra os 3 canais — evita que Instagram, WhatsApp e email pareçam desconectados. Datas comerciais e sazonalidade real (equinócios, feriados temáticos, tradições do setor de vinho como Beaujolais Nouveau, Black Friday) **sempre têm prioridade** sobre o tema genérico da semana — checar o calendário do período inteiro antes de distribuir os temas.
4. **Nunca inventar dado específico de produto ou produtor.** Quando uma peça depende de um vinho ou produtor específico (ex: "sugestão de fim de semana", "história de um produtor"), escrever a peça inteira mas deixar `[placeholders]` claros nos pontos que dependem do catálogo atual — a skill não tem acesso a qual vinho está em estoque naquela semana.
5. O Excel final agrupa por aba: **"Guia de imagens"** (fixa, sempre usar `GUIA_IMAGENS_PADRAO` do módulo salvo que não muda de trimestre pra trimestre) + **uma aba por semana** do período.

---

## Workflow

### Passo 1 — Confirmar o período e o input estratégico

Perguntar (se não tiver sido dito): qual documento/plano de origem, data de início, duração (trimestre = ~13 semanas / 90 dias), e o objetivo principal desse período (ex: captação de leads, lançamento de produto, campanha sazonal).

### Passo 2 — Montar a pauta temática (só temas, sem copy ainda)

Distribuir os temas semana a semana, cruzando com:
- A estrutura fixa de canais (Seg/Qua/Sex Instagram e WhatsApp, 1x semana email)
- Datas comerciais e sazonalidade reais do período (verificar o calendário, não assumir — equinócios, feriados, Black Friday, tradições do vinho)
- Os marcos do próprio período estratégico (ex: lançamento de produto/ferramenta no meio do trimestre)

Salvar essa pauta em markdown: `campanhas/[nome-do-periodo]/pauta-conteudo-[duracao].md` — serve de referência e é mais fácil de revisar rápido que abrir o Excel.

### Passo 3 — Checkpoint obrigatório antes de escrever a copy

Mostrar a pauta (só os temas, tabela por semana) pro Marcelo e perguntar se o rumo temático faz sentido antes de escrever as ~90 peças de copy. Reescrever a copy inteira porque o tema mudou é o retrabalho mais caro dessa skill — não pular esse passo.

### Passo 4 — Escrever a copy de todas as peças

Depois de validado, escrever o texto completo de cada peça (Instagram, WhatsApp, Email) de todas as semanas do período de uma vez, seguindo o tom de `_contexto/preferencias.md`. Pra cada peça, além do texto, definir a **imagem sugerida** específica (não só o tipo genérico da aba "Guia de imagens" — dizer *qual* tipo se aplica àquela peça e o que precisa aparecer nela).

### Passo 5 — Gerar o Excel

Script Python que importa o módulo e monta os dados por semana:

```python
import sys
sys.path.insert(0, r"c:\Users\marce\Desktop\claude comnéctar\.claude\skills\planejamento-conteudo")
from gerar_excel import build_workbook

semanas = {
    "Semana 1": [
        ["Seg 7/set", "Instagram", "Diário da comnéctar", "Tema da peça", "Texto completo da peça...", "Imagem sugerida específica"],
        # ... 3 Instagram + 3 WhatsApp + 1 Email por semana, nessa ordem de colunas
    ],
    # ... uma entrada por semana do período
}

build_workbook(
    out_path=r"c:\Users\marce\Desktop\claude comnéctar\campanhas\[nome-do-periodo]\conteudos-[slug].xlsx",
    semanas=semanas,
)
```

Rodar com `py -3 nome_do_script.py` (o launcher `python` puro pode não estar no PATH nesse ambiente, ver nota em `financeiro`/outras skills).

### Passo 6 — Entregar e apontar próximos passos

Confirmar que o arquivo foi salvo, resumir o que tem em cada aba, e perguntar se o Marcelo quer ajustar tom/temas antes de começar a produção das artes (fotos, PNGs) — essa skill entrega só a copy e a orientação de imagem, não gera os PNGs finais.

---

## Regras

- **Checkpoint do Passo 3 não é opcional** — pauta temática valida antes da copy, sempre.
- **Nunca inventar vinho, produtor, prêmio ou dado de catálogo específico.** Usar `[placeholder]` e avisar no resumo final quais peças dependem de escolha manual do Marcelo.
- **Datas comerciais e sazonalidade real têm prioridade** sobre o tema genérico da semana — sempre checar o calendário do período, não assumir estação/feriados de cabeça.
- Layout do Excel sempre: aba "Guia de imagens" (usar `GUIA_IMAGENS_PADRAO`, só editar se o Marcelo pedir mudança nesse trimestre) + uma aba por semana, colunas `Data | Canal | Formato/Série | Tema | Texto | Imagem sugerida`, cor de linha por canal (Instagram rosa, WhatsApp verde, Email azul — já definido no módulo).
- Tom conforme `_contexto/preferencias.md` — mesmo padrão de qualquer texto da marca, isso vale pra copy dentro do Excel também.
- O output fica em `campanhas/[nome-do-periodo]/`, nunca solto na raiz do projeto.
