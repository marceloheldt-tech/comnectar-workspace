---
name: email-semanal
description: >
  Cria a copy completa do email semanal de vinho da comnéctar.
  Busca dados do produto no Shopify, pesquisa produtor/região/premiações na web,
  e escreve o email no formato editorial da comnéctar, pronto pra colar no MESSAGING.
  Use quando o usuário disser "faz o email da semana", "escreve o email do [vinho]",
  "email semanal do [vinho]", "/email-semanal [nome do vinho]".
---

# /email-semanal — Email Semanal de Vinho

## Dependências

- **Tom de voz:** `_contexto/preferencias.md`
- **Contexto do negócio:** `_contexto/empresa.md`
- **Shopify MCP:** buscar dados do produto

---

## Workflow

### Passo 1 — Identificar o vinho

Se o usuário não informou o nome do vinho, perguntar:
> "Qual vinho vai ser destaque essa semana?"

Se informou, seguir direto.

### Passo 2 — Buscar dados no Shopify

Usar o Shopify MCP para buscar o produto pelo nome. Extrair:
- Nome completo do produto
- Uva(s)
- País e região
- Safra
- Preço
- URL do produto na loja
- Premiações cadastradas (se houver)

Se o produto não for encontrado, avisar o usuário e pedir confirmação do nome.

### Passo 3 — Pesquisar o vinho na web

Usar WebSearch para pesquisar o vinho e o produtor. Coletar:
- História e filosofia do produtor
- Contexto da região/appellation
- Características da uva no terroir
- Premiações e pontuações de críticos (Robert Parker, James Suckling, Wine Spectator, Decanter)
- Qualquer fato curioso, histórico ou narrativo que possa virar gancho editorial

Priorizar fontes confiáveis: site oficial do produtor, Wine Advocate, Wine Spectator, Decanter, Vivino.

### Passo 4 — Escolher o ângulo editorial

Com base na pesquisa, escolher **um ângulo** que vai conduzir o email inteiro. O ângulo precisa ser uma ideia interessante, não uma descrição do produto.

Exemplos de ângulos:
- Uma conquista ou premiação recente do produtor ou vinhedo
- Um fato histórico sobre a região ou uva
- O contraste entre o que as pessoas esperam e o que esse vinho entrega
- A filosofia do produtor que se reflete no vinho
- Um dado ou insight que muda como o leitor enxerga esse estilo de vinho

O ângulo deve funcionar como assunto do email E como fio condutor de todo o texto.

### Passo 5 — Escrever o email

Escrever a copy completa seguindo esta estrutura:

---

**ASSUNTO**
Uma frase curta que captura o ângulo editorial. Nunca usar o nome do produto. Provocar curiosidade sem clickbait forçado. Exemplo: "A base da Borgonha não está nos vinhos mais caros"

**TÍTULO INTERNO (H1)**
Diferente do assunto. Mais conceitual, expande o ângulo. Exemplo: "O Pinot Noir que explica a Borgonha"

**BLOCO INTRODUTÓRIO**
2-3 parágrafos curtos que desenvolvem o ângulo. Contextualizar o leitor no mundo do vinho sem ainda falar do produto. Criar tensão narrativa que leva ao produto naturalmente.

**SEÇÃO 1 — A UVA / REGIÃO / CONTEXTO** *(subheading bold)*
2-3 parágrafos sobre a uva, a região ou o conceito central que explica esse vinho. Educativo, mas acessível.

**SEÇÃO 2 — O PRODUTOR** *(subheading bold)*
2-3 parágrafos sobre quem faz esse vinho. História, filosofia, o que os torna relevantes. Nunca marketing vazio.

**SEÇÃO 3 — CONTEXTO ADICIONAL** *(subheading bold, opcional)*
Se houver um terceiro ângulo relevante (appellation, técnica de vinificação, prêmio específico), incluir aqui. Senão, pular.

---
**O vinho da semana** *(subheading bold — linha separadora visual)*

*(imagem do produto — inserida pelo usuário no MESSAGING)*

**Parágrafo descritivo do produto**
1-2 frases contextualizando o rótulo específico dentro do que foi dito.

**Notas sensoriais** *(lista com bullet simples)*
- [nota 1]
- [nota 2]
- [nota 3]
- [nota 4]

Se tiver premiação: mencionar em negrito no corpo do texto.
Exemplo: "Esse rótulo recebeu **92 pontos de Robert Parker**, reforçando sua consistência dentro da categoria."

**Destaques do rótulo** *(subheading bold)*
- [País, região]
- Uva [nome da uva]
- Produzido por [nome do produtor]
- [Premiação/pontuação, se houver]
- [Estilo em uma frase]

**Parágrafo de fechamento**
1-2 parágrafos que amarram o ângulo editorial ao produto. Soft sell. Nunca forçar. A conclusão deve fazer o leitor querer conhecer o produto por curiosidade, não por pressão.

**Linha de CTA**
"Conheça o [nome completo do produto] na comnéctar."

*(botão CONHECER e rodapé de benefícios são inseridos automaticamente pelo MESSAGING)*

---

### Passo 6 — Revisar antes de entregar

Antes de mostrar o resultado, checar:
- O assunto não contém o nome do produto
- Nenhum travessão foi usado
- Sem construções "não é X, é Y"
- Sem sequência de frases curtas dramáticas
- Tom informal e polido, sem entusiasmo exagerado
- O ângulo editorial está presente do assunto até o fechamento
- As seções fluem naturalmente, sem parecer um briefing de produto

### Passo 7 — Salvar e entregar

Salvar a copy em:
```
conteudo/email-marketing/[YYYY-MM-DD]-[slug-do-vinho]/email.md
```

Onde `[slug-do-vinho]` é o nome do produto em kebab-case sem acentos.
Exemplo: `2026-06-06-vik-2021`

Mostrar o email completo para o usuário e confirmar que foi salvo.

Perguntar ao final:
> "Quer ajustar alguma coisa antes de colar no MESSAGING?"

---

## Tom e estilo

- Informal com elegância. Como alguém que entende de vinho e fala com naturalidade
- Parágrafos curtos (1-3 frases)
- Linguagem acessível, sem termos técnicos sem explicação
- Sem travessão, sem "não é X, é Y", sem sequências dramáticas de frases curtas
- Premiações sempre contextualizadas, nunca jogadas como número solto
- O produto aparece naturalmente, nunca como interrupção do texto editorial

## Regras

- Nunca mencionar o nome do produto no assunto
- Cada email deve ter um ângulo diferente das semanas anteriores (variar: produtor, uva, região, prêmio, notícia, história)
- Se não encontrar informações suficientes na web, avisar o usuário antes de escrever
- Sempre salvar antes de mostrar o resultado
