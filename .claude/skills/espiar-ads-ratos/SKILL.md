---
name: espiar-ads-ratos
description: Espiona os anúncios que um concorrente está rodando no Meta Ads (Facebook e Instagram) direto da Biblioteca de Anúncios da Meta, e gera um relatório HTML com padrões de copy, criativo, oferta e vídeo. Use quando o usuário quiser ver o que um concorrente anuncia, pesquisar anúncios de uma conta/@, descobrir os players de um nicho por palavra-chave, analisar criativos de concorrentes, achar hooks e ofertas que estão funcionando, ou pedir inspiração de criativo baseada em quem já anuncia. Também dispara com /espiar-ads-ratos.
---

# Espiar Ads (Ratos de IA)

Puxa os anúncios ativos de qualquer concorrente na Biblioteca de Anúncios da Meta, deduplica por conceito, baixa os criativos, analisa os vídeos campeões com IA e monta um relatório HTML navegável com os padrões que estão funcionando. Serve pra inspiração e leitura de mercado, nunca pra copiar.

Usa a API da **ScrapeCreators** (tem free tier de 1.000 créditos). Cada página de anúncios custa ~1 crédito (~10 anúncios). Sem dependências além de `python3` e `ffmpeg` (só pra análise de vídeo).

## Fluxo

Todos os comandos rodam a partir da pasta da skill. Antes de qualquer coisa, exporte nada: os scripts leem a chave do `.env` da skill sozinhos.

### 1. Setup (primeira vez)

Rode `python3 scripts/setup.py --check`.

- Se responder **OK**, a chave já está configurada. Siga pro passo 2.
- Se der erro de chave, faça o **onboarding conversando com o usuário**:
  1. Explique em uma frase: "Essa skill usa a ScrapeCreators pra ler a Biblioteca de Anúncios da Meta. Tem 1.000 créditos grátis, sem cartão."
  2. Peça pra ele: criar conta em **https://app.scrapecreators.com**, ir em API Keys, copiar a chave, e colar aqui.
  3. Quando ele colar, rode `python3 scripts/setup.py <CHAVE_DELE>`. Isso valida com uma chamada real e salva no `.env`. Confirme os créditos restantes que o script imprime.

### 2. Descobrir o alvo

Pergunte o que ele quer espiar e escolha o modo:

**a) Conta específica (o mais comum)** — peça o **@ do Instagram** ou o **nome exato da página** no Meta.
```
python3 scripts/buscar.py conta "@perfil_do_concorrente"
```
- Isso resolve o @ pelo Instagram e devolve candidatos com `page_id`, seguidores e categoria. Escolha o que casa (confira o `ig_username`). Se vier mais de um, mostre as opções pro usuário decidir.
- Se voltar vazio: tente o nome real dele em vez do @, ou peça pra ele colar o **link da Biblioteca de Anúncios** da página (modo `url`).

**b) Link da Ad Library** — se ele já tem o link:
```
python3 scripts/buscar.py url "https://www.facebook.com/ads/library/?...view_all_page_id=123..."
```
Extrai o `page_id` (ou a keyword, se for busca).

**c) Palavra-chave / nicho** — quando ele nem sabe quem são os concorrentes:
> ⚠️ AVISE ANTES: "Esse modo lê a busca geral da Meta e gasta mais crédito que espiar uma conta. Posso seguir?" Só rode depois de confirmar.
```
python3 scripts/buscar.py termo "micro saas" --pais BR
```
Devolve os `players` (anunciantes) ranqueados por volume de anúncios naquele termo. Aí escolham juntos uma ou mais contas pra extrair de fato.

### 3. Extrair os anúncios

Com o `page_id` e um label (nome do concorrente):
```
python3 scripts/extrair.py --page-id <PAGE_ID> --label "Nome do Concorrente"
```
Opções: `--pais BR` (default: todos os países), `--status ALL` (default ACTIVE, só os no ar), `--baixar-videos` (baixa o vídeo de TODOS os conceitos, pesado; por padrão só os 3 campeões), `--max-paginas N`.

- Se o concorrente tiver MUITOS anúncios, avise sobre o custo em créditos (≈ nº de páginas) antes de puxar tudo.
- O script imprime a pasta de saída (`output/<slug>-<data>/`), o total, os conceitos e os caminhos dos **3 vídeos campeões** (`top3_video_paths`).

### 4. Analisar os vídeos campeões (sempre nos top 3)

Pra cada caminho em `top3_video_paths`:
```
python3 scripts/analisar_video.py <caminho_do_video.mp4>
```
Isso extrai frames (foco no hook dos primeiros segundos). **Leia os frames** com a ferramenta de leitura de imagem (você enxerga o criativo, não só a legenda) e entenda o hook, a estrutura e as legendas queimadas.

### 5. Escrever a síntese

Com base na copy dos conceitos (está em `output/.../conceitos.json`) e no que você viu nos vídeos, escreva o arquivo `output/<pasta>/sintese.json` com este schema:
```json
{
  "resumo_oferta": "2-4 frases: o que ele vende, quais ofertas, como se posiciona",
  "promessas": ["promessa que ele martela", "..."],
  "angulos": ["ângulo/dor explorada", "..."],
  "publico": "quem ele parece mirar",
  "analise_video": [
    {"titulo": "hook do vídeo", "dias": 122, "leitura": "o que o vídeo faz nos primeiros segundos e por que segura"}
  ],
  "ideias_pra_voce": ["ideia acionável e adaptável (nunca copiar)", "..."]
}
```
Sempre preencha `analise_video` com os 3 campeões. Tom: direto, português BR, sem travessões, sem clichê, sem dicotomia "não é X, é Y".

### 6. Gerar o relatório
```
python3 scripts/gerar_relatorio.py output/<pasta>
```
Gera `index.html` na pasta. Diga ao usuário onde ficou e ofereça abrir no navegador. Informe os créditos restantes.

## Regras

- **Economia de crédito**: sempre avise antes de puxões grandes (nicho, concorrente com centenas de anúncios). Reporte os créditos restantes ao fim.
- **Ética**: o relatório é pra inspiração e leitura de mercado. Nunca sugira copiar copy ou criativo, só adaptar ângulos.
- **Você enxerga as mídias**: as imagens e os frames de vídeo baixados podem ser lidos com visão. Use isso pra descrever o criativo de verdade.
- **Sem `--pais`** a Meta traz anúncios de todos os países; pra concorrente BR, `--pais BR` deixa mais limpo (mas alguns anunciantes só aparecem sem filtro).
