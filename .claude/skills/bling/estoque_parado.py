"""Cruza estoque atual x historico de vendas e calcula ha quanto tempo cada
produto esta parado. Salva dados/bling/estoque/estoque-parado-AAAA-MM-DD.json.

Dias parado = hoje - ultima venda. Produto que nunca vendeu: conta desde o
cadastro (data estimada pelo ID do Bling, que e sequencial no tempo: interpola
com os IDs/datas dos pedidos).

Uso: py estoque_parado.py   (rodar sync_pedidos.py antes)
"""
import bisect
import json
from datetime import date, timedelta

from bling_api import RAIZ, listar

hoje = date.today()
pedidos = json.loads((RAIZ / "dados/bling/vendas/pedidos.json").read_text(encoding="utf-8"))
validos = [p for p in pedidos if p["situacao"]["id"] != 12]  # 12 = cancelado

# relogio ID -> data, a partir dos pedidos
rel = sorted((p["id"], p["data"]) for p in pedidos if p["data"] > "2000")
ids = [r[0] for r in rel]


def data_por_id(i):
    k = bisect.bisect_left(ids, i)
    return rel[min(k, len(rel) - 1)][1] if k else rel[0][1]


vendas = {}
for p in validos:
    for it in p.get("itens", []):
        cod = str(it.get("codigo") or "").strip()
        v = vendas.setdefault(cod, {"ultima": "", "primeira": "9999", "total": 0, "q90": 0, "q180": 0, "q365": 0})
        v["ultima"] = max(v["ultima"], p["data"])
        v["primeira"] = min(v["primeira"], p["data"])
        q = it["quantidade"]
        v["total"] += q
        for dias in (90, 180, 365):
            if p["data"] >= (hoje - timedelta(days=dias)).isoformat():
                v[f"q{dias}"] += q

saida = []
for pr in listar("produtos", {"criterio": 2}):
    est = (pr.get("estoque") or {}).get("saldoVirtualTotal", 0) or 0
    if est <= 0:
        continue
    cod = str(pr.get("codigo") or "").strip()
    v = vendas.get(cod)
    cadastro = data_por_id(pr["id"])
    ref = v["ultima"] if v else cadastro
    saida.append({
        "codigo": cod, "nome": pr["nome"], "estoque": est,
        "custo": pr.get("precoCusto") or 0, "preco": pr.get("preco") or 0,
        "capital": round(est * (pr.get("precoCusto") or 0), 2),
        "ultima_venda": v["ultima"] if v else None, "cadastro_aprox": cadastro,
        "dias_parado": (hoje - date.fromisoformat(ref)).days,
        "vendidos_total": v["total"] if v else 0,
        "vendidos_90d": v["q90"] if v else 0, "vendidos_180d": v["q180"] if v else 0,
        "vendidos_365d": v["q365"] if v else 0,
    })

dest = RAIZ / "dados" / "bling" / "estoque"
dest.mkdir(parents=True, exist_ok=True)
arq = dest / f"estoque-parado-{hoje.isoformat()}.json"
arq.write_text(json.dumps(saida, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(saida)} produtos com estoque -> {arq}")
