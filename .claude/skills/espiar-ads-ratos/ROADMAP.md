# Roadmap

Ideias pra próximas versões da skill. Nada aqui é promessa de data, é backlog.

## v2

- **Motor Apify opcional.** Hoje a skill usa só a ScrapeCreators. Adicionar uma flag `--motor apify` (e o setup guiado perguntando qual usar). A Apify entrega o mesmo dado (as duas raspam a mesma fonte GraphQL da Biblioteca de Anúncios da Meta), então é troca de motor, não de resultado. Quando faz sentido: a Apify tem free tier **recorrente** de US$5/mês e custa ~US$0,75 por 1.000 anúncios, o que sai melhor pra quem roda coleta pesada e contínua (dezenas de concorrentes, toda semana). Actor de referência: `curious_coder/facebook-ads-library-scraper`. Tem MCP oficial (`mcp.apify.com`) também.
- **Snapshot datado pra acompanhar no tempo.** Rodar o mesmo concorrente todo mês e mostrar o diff: o que entrou (aposta nova), o que saiu (não converteu), o que escalou (ganhou variações). É onde mora o insight de verdade sobre a estratégia do concorrente.
- **Comparar vários concorrentes lado a lado.** Benchmark de nicho: puxar 3 a 5 players e cruzar ofertas, hooks e formatos num relatório só.
- **Export CSV/planilha** dos conceitos, pra quem quer fatiar os dados na mão.

## Ideias soltas

- Detecção de criativo feito por IA (a Meta marca `contains_digital_created_media`).
- Alerta quando um concorrente sobe um criativo novo (via snapshot + notificação).
