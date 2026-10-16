"""Puxa do Bling tudo que foi efetivamente pago e recebido num mes, com o valor
real de cada baixa (borderos: juros, desconto, tarifa) e nomes de categoria,
contato e forma de pagamento. Salva em dados/bling/financeiro/AAAA-MM/caixa.json.

Uso: py puxar_caixa.py 2026-09
"""
import calendar
import json
import sys

from bling_api import RAIZ, get, listar

mes = sys.argv[1]
ano, m = map(int, mes.split("-"))
ini, fim = f"{mes}-01", f"{mes}-{calendar.monthrange(ano, m)[1]:02d}"

categorias = {c["id"]: c.get("descricao", "") for c in listar("categorias/receitas-despesas")}
formas = {f["id"]: f.get("descricao", "") for f in listar("formas-pagamentos")}
contatos, borderos = {}, {}


def nome_contato(cid):
    if cid and cid not in contatos:
        try:
            contatos[cid] = get(f"contatos/{cid}")["data"].get("nome", "")
        except RuntimeError:
            contatos[cid] = ""
    return contatos.get(cid, "")


def bordero(bid):
    if bid not in borderos:
        borderos[bid] = get(f"borderos/{bid}")["data"]
    return borderos[bid]


def montar(tipo, lista):
    linhas = []
    for item in lista:
        d = get(f"contas/{tipo}/{item['id']}")["data"]
        for bid in d.get("borderos") or []:
            b = bordero(bid)
            if not (ini <= b["data"] <= fim):
                continue
            for p in b.get("pagamentos", []):
                if p["contato"]["id"] != d["contato"]["id"] and len(b["pagamentos"]) > 1:
                    continue
                linhas.append({
                    "conta_id": d["id"],
                    "data": b["data"],
                    "vencimento": d.get("vencimento"),
                    "valor_titulo": d.get("valor"),
                    "valor_pago": p.get("valorPago", 0),
                    "juros": p.get("juros", 0), "desconto": p.get("desconto", 0),
                    "acrescimo": p.get("acrescimo", 0), "tarifa": p.get("tarifa", 0),
                    "contato": d["contato"].get("nome") or nome_contato(d["contato"]["id"]),
                    "categoria": categorias.get(d.get("categoria", {}).get("id"), "(sem categoria)"),
                    "forma": formas.get(d.get("formaPagamento", {}).get("id"), ""),
                    "historico": d.get("historico", ""),
                    "origem": (d.get("origem") or {}).get("tipoOrigem", ""),
                    "situacao": d.get("situacao"),
                })
    return linhas


pagar = listar("contas/pagar", {"dataPagamentoInicial": ini, "dataPagamentoFinal": fim})
receber = listar("contas/receber", {"tipoFiltroData": "R", "dataInicial": ini, "dataFinal": fim})
saida = {"mes": mes, "pagos": montar("pagar", pagar), "recebidos": montar("receber", receber)}

destino = RAIZ / "dados" / "bling" / "financeiro" / mes
destino.mkdir(parents=True, exist_ok=True)
(destino / "caixa.json").write_text(json.dumps(saida, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(pagar)} contas pagas -> {len(saida['pagos'])} baixas; "
      f"{len(receber)} recebidas -> {len(saida['recebidos'])} baixas. Salvo em {destino}")
