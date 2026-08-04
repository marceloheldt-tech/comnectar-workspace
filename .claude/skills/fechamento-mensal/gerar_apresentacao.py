"""
Gera o HTML da apresentação mensal (pra virar PDF) pros sócios — comnéctar
Uso: python gerar_apresentacao.py --mes 2026-07 [--mes-nome "Julho/2026"]

Lê financeiro/[AAAA-MM]/resultado.json (gerado por calculadora.py) e monta um HTML
de 2 páginas (Resultado do mês + Fluxo de caixa) no padrão visual da marca
(marca/design-guide.md): preto/vinho/branco, Rubik, sem gradiente.

Depois de gerar o HTML, renderizar em PDF com:
  node ".claude/skills/fechamento-mensal/gerar-pdf-apresentacao.mjs" --mes 2026-07
"""
import argparse
import json
import locale
import os
from datetime import datetime

BASE = os.path.dirname(os.path.abspath(__file__))
WORKSPACE = os.path.abspath(os.path.join(BASE, "..", "..", ".."))

VINHO = "#991356"
VINHO_CLARO = "#c9629a"  # tint do vinho, só pra segunda série (recebido vs pago)
PRETO = "#000000"
BRANCO = "#FFFFFF"

MESES = {
    "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
    "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
    "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro",
}


def fmt_moeda(v):
    neg = v < 0
    v = abs(v)
    s = f"{v:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")
    return f"-R$ {s}" if neg else f"R$ {s}"


def barra(label, valor, valor_max, cor=VINHO, sufixo=""):
    largura = max(2, round((abs(valor) / valor_max) * 100)) if valor_max else 0
    return f"""
    <div class="linha-barra">
      <div class="rotulo-barra">{label}</div>
      <div class="trilho-barra">
        <div class="barra" style="width:{largura}%; background:{cor};"></div>
      </div>
      <div class="valor-barra">{fmt_moeda(valor)}{sufixo}</div>
    </div>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mes", required=True)
    ap.add_argument("--mes-nome", default=None, help='Ex: "Julho/2026" — se não passar, deriva de --mes')
    args = ap.parse_args()

    pasta = os.path.join(WORKSPACE, "financeiro", args.mes)
    with open(os.path.join(pasta, "resultado.json"), encoding="utf-8") as f:
        d = json.load(f)

    ano, mes_num = args.mes.split("-")
    mes_nome = args.mes_nome or f"{MESES.get(mes_num, mes_num)}/{ano}"

    r = d["resultado_do_mes"]
    c = d["fluxo_de_caixa"]

    resultado_mes = r["resultado"]
    status_mes = "LUCRO" if resultado_mes >= 0 else "PREJUÍZO"
    cor_status_mes = PRETO if resultado_mes >= 0 else VINHO

    resultado_caixa = c["resultado"]
    status_caixa = "SOBROU CAIXA" if resultado_caixa >= 0 else "CAIXA NEGATIVO"

    # barras da composição do resultado
    max_valor_resultado = max(r["receita_bruta"], r["cmv"], r["margem_bruta"], r["total_pago_operacional"], abs(resultado_mes)) or 1
    barras_resultado = "".join([
        barra("Receita bruta", r["receita_bruta"], max_valor_resultado),
        barra("(–) CMV", -r["cmv"], max_valor_resultado),
        barra("= Margem bruta", r["margem_bruta"], max_valor_resultado),
        barra("(–) Contas pagas", -r["total_pago_operacional"], max_valor_resultado),
    ])

    # top 5 produtos por lucro
    produtos = sorted(r["vendas_por_produto"].items(), key=lambda kv: kv[1]["lucro"], reverse=True)[:5]
    max_lucro = max((p["lucro"] for _, p in produtos), default=1) or 1
    def truncar(nome, limite=46):
        if len(nome) <= limite:
            return nome
        corte = nome[:limite].rsplit(" ", 1)[0]
        return corte + "…"

    linhas_produtos = "".join([
        barra(truncar(nome), p["lucro"], max_lucro)
        for nome, p in produtos
    ])

    # recebido vs pago
    max_caixa = max(c["total_recebido"], c["total_pago"]) or 1
    barras_caixa = "".join([
        barra("Total recebido", c["total_recebido"], max_caixa),
        barra("Total pago", c["total_pago"], max_caixa, cor=VINHO_CLARO),
    ])

    logo = os.path.relpath(os.path.join(WORKSPACE, "dados", "comnectar-transparente.png"), pasta).replace("\\", "/")
    gerado_em = datetime.now().strftime("%d/%m/%Y")

    html = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Fechamento {mes_nome}</title>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700;900&display=swap" rel="stylesheet">
<style>
  @page {{ size: A4; margin: 0; }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: 'Rubik', sans-serif; color: {PRETO}; background: {BRANCO}; }}
  .pagina {{ width: 210mm; height: 297mm; padding: 16mm 18mm; position: relative; page-break-after: always; }}
  .pagina:last-child {{ page-break-after: auto; }}

  .cabecalho {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 10mm; }}
  .cabecalho img {{ height: 64px; }}
  .cabecalho .titulo-mes {{ text-align: right; }}
  .cabecalho .titulo-mes .rotulo {{ font-size: 11px; letter-spacing: 1.5px; color: #666; text-transform: uppercase; }}
  .cabecalho .titulo-mes .mes {{ font-size: 20px; font-weight: 700; }}

  h1.secao {{ font-size: 15px; letter-spacing: 1px; text-transform: uppercase; color: #666; font-weight: 500; margin-bottom: 2mm; }}

  .badge {{ display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 1px; color: {BRANCO}; margin-bottom: 3mm; }}

  .numero-hero {{ font-size: 52px; font-weight: 900; line-height: 1; margin-bottom: 3mm; }}
  .subtexto-hero {{ font-size: 13px; color: #555; max-width: 130mm; margin-bottom: 10mm; line-height: 1.5; }}

  .kpis {{ display: flex; gap: 6mm; margin-bottom: 10mm; }}
  .kpi {{ flex: 1; border: 1px solid #eee; border-radius: 10px; padding: 4mm; }}
  .kpi .rotulo {{ font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1.5mm; }}
  .kpi .valor {{ font-size: 17px; font-weight: 700; }}

  .bloco-barras {{ margin-bottom: 10mm; }}
  .linha-barra {{ display: flex; align-items: center; gap: 4mm; margin-bottom: 4mm; }}
  .rotulo-barra {{ width: 46mm; font-size: 11.5px; color: #333; flex-shrink: 0; line-height: 1.3; }}
  .trilho-barra {{ flex: 1; height: 8px; background: #f2f2f2; border-radius: 4px; overflow: hidden; }}
  .barra {{ height: 100%; border-radius: 4px; }}
  .valor-barra {{ width: 30mm; text-align: right; font-size: 12px; font-weight: 700; flex-shrink: 0; }}

  .rodape {{ position: absolute; bottom: 12mm; left: 18mm; right: 18mm; display: flex; justify-content: space-between; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 3mm; }}

  .nota {{ font-size: 11px; color: #666; line-height: 1.6; background: #fafafa; border-left: 3px solid {VINHO}; padding: 4mm 5mm; margin-top: 4mm; }}
</style>
</head>
<body>

<div class="pagina">
  <div class="cabecalho">
    <img src="{logo}" alt="comnéctar">
    <div class="titulo-mes">
      <div class="rotulo">Fechamento mensal</div>
      <div class="mes">{mes_nome}</div>
    </div>
  </div>

  <h1 class="secao">Resultado do mês</h1>
  <div class="badge" style="background:{cor_status_mes};">{status_mes}</div>
  <div class="numero-hero" style="color:{cor_status_mes};">{fmt_moeda(resultado_mes)}</div>
  <div class="subtexto-hero">Receita das vendas de {mes_nome.split('/')[0].lower()} menos o custo dos produtos vendidos menos as contas pagas no mês. Não inclui compra de mercadoria (já contada no custo dos produtos) nem movimentações financeiras.</div>

  <div class="kpis">
    <div class="kpi"><div class="rotulo">Garrafas vendidas</div><div class="valor">{int(r['quantidade_vendida'])}</div></div>
    <div class="kpi"><div class="rotulo">Receita bruta</div><div class="valor">{fmt_moeda(r['receita_bruta'])}</div></div>
    <div class="kpi"><div class="rotulo">Margem bruta</div><div class="valor">{fmt_moeda(r['margem_bruta'])}</div></div>
    <div class="kpi"><div class="rotulo">Contas pagas</div><div class="valor">{fmt_moeda(r['total_pago_operacional'])}</div></div>
  </div>

  <h1 class="secao">Composição do resultado</h1>
  <div class="bloco-barras">{barras_resultado}</div>

  <h1 class="secao">Top 5 produtos por lucro</h1>
  <div class="bloco-barras">{linhas_produtos}</div>

  <div class="rodape">
    <span>comnéctar · relatório interno</span>
    <span>Gerado em {gerado_em} · Página 1/2</span>
  </div>
</div>

<div class="pagina">
  <div class="cabecalho">
    <img src="{logo}" alt="comnéctar">
    <div class="titulo-mes">
      <div class="rotulo">Fechamento mensal</div>
      <div class="mes">{mes_nome}</div>
    </div>
  </div>

  <h1 class="secao">Fluxo de caixa</h1>
  <div class="badge" style="background:{PRETO};">{status_caixa}</div>
  <div class="numero-hero" style="color:{PRETO};">{fmt_moeda(resultado_caixa)}</div>
  <div class="subtexto-hero">Total que efetivamente entrou e saiu da conta em {mes_nome.split('/')[0].lower()} — diferente do Resultado do mês, aqui entra tudo (compra de mercadoria, impostos, transferências), sem nenhum filtro. É dinheiro real, não lucro contábil.</div>

  <h1 class="secao">Recebido x Pago</h1>
  <div class="bloco-barras">{barras_caixa}</div>

  <div class="nota">
    O Resultado do mês e o Fluxo de caixa costumam ser diferentes, e os dois estão certos ao mesmo tempo: um mostra o que a operação de vendas rendeu descontando as despesas do mês; o outro mostra o dinheiro que realmente entrou e saiu da conta, incluindo compra de estoque e outras movimentações que não são despesa do mês.
  </div>

  <div class="rodape">
    <span>comnéctar · relatório interno</span>
    <span>Gerado em {gerado_em} · Página 2/2</span>
  </div>
</div>

</body>
</html>
"""

    destino = os.path.join(pasta, "apresentacao.html")
    with open(destino, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"HTML gerado em: {destino}")


if __name__ == "__main__":
    main()
