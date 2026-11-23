"""Cruza estoque atual x historico de vendas e calcula ha quanto tempo cada
produto esta parado. Salva dados/bling/estoque/estoque-parado-AAAA-MM-DD.json.

Dias parado = hoje - ultima venda. Produto que nunca vendeu: conta desde a
ultima entrada (NF de compra) ou, sem ela, desde o cadastro estimado. O ID de
produto e sequencial no tempo (sequencia propria, diferente da de pedidos):
cadastro <= primeira atividade (venda/entrada) de qualquer produto com ID maior.
Vendas cruzadas por produto.id (o Bling reaproveita codigos).

Uso: py estoque_parado.py   (rodar sync_pedidos.py antes)
"""
import json
from datetime import date, timedelta

from bling_api import RAIZ, listar

hoje = date.today()
pedidos = json.loads((RAIZ / "dados/bling/vendas/pedidos.json").read_text(encoding="utf-8"))
validos = [p for p in pedidos if p["situacao"]["id"] != 12]  # 12 = cancelado

# chave = produto.id (o Bling reaproveita codigos entre produtos diferentes);
# fallback pro codigo so quando o item nao tem produto vinculado
vendas = {}
for p in validos:
    for it in p.get("itens", []):
        pid = (it.get("produto") or {}).get("id") or 0
        chave = pid if pid else "cod:" + str(it.get("codigo") or "").strip()
        v = vendas.setdefault(chave, {"ultima": "", "primeira": "9999", "total": 0, "q90": 0, "q180": 0, "q365": 0})
        v["ultima"] = max(v["ultima"], p["data"])
        v["primeira"] = min(v["primeira"], p["data"])
        q = it["quantidade"]
        v["total"] += q
        for dias in (90, 180, 365):
            if p["data"] >= (hoje - timedelta(days=dias)).isoformat():
                v[f"q{dias}"] += q

arq_ent = RAIZ / "dados/bling/estoque/match-entrada.json"
entradas = json.loads(arq_ent.read_text(encoding="utf-8")) if arq_ent.exists() else {}

produtos = listar("produtos", {"criterio": 2})
# primeira atividade conhecida de cada produto (venda ou entrada)
ativ = {}
for pr in produtos:
    v = vendas.get(pr["id"])
    ent = entradas.get(str(pr.get("codigo") or "").strip()) or []
    datas = ([v["primeira"]] if v else []) + [e[0] for e in ent]
    if datas:
        ativ[pr["id"]] = min(datas)
cad_max = {}  # cadastro <= min(atividade de IDs maiores)
corrente = hoje.isoformat()
for pid in sorted({p["id"] for p in produtos}, reverse=True):
    cad_max[pid] = min(corrente, ativ.get(pid, corrente))
    corrente = cad_max[pid]

saida = []
for pr in produtos:
    est = (pr.get("estoque") or {}).get("saldoVirtualTotal", 0) or 0
    if est <= 0:
        continue
    cod = str(pr.get("codigo") or "").strip()
    v = vendas.get(pr["id"]) or vendas.get("cod:" + cod)
    ent = entradas.get(cod) or []
    cadastro = cad_max[pr["id"]]
    ult_ent = max((e[0] for e in ent), default=None)
    ref = v["ultima"] if v else (ult_ent or cadastro)
    saida.append({
        "codigo": cod, "nome": pr["nome"], "estoque": est,
        "custo": pr.get("precoCusto") or 0, "preco": pr.get("preco") or 0,
        "capital": round(est * (pr.get("precoCusto") or 0), 2),
        "ultima_venda": v["ultima"] if v else None, "cadastro_aprox": cadastro,
        "dias_parado": (hoje - date.fromisoformat(ref)).days,
        "vendidos_total": v["total"] if v else 0,
        "vendidos_90d": v["q90"] if v else 0, "vendidos_180d": v["q180"] if v else 0,
        "vendidos_365d": v["q365"] if v else 0,
        "ultima_entrada": ult_ent,
        "fornecedor": (max(ent, key=lambda e: e[0])[4] if ent else None),
    })

dest = RAIZ / "dados" / "bling" / "estoque"
dest.mkdir(parents=True, exist_ok=True)
arq = dest / f"estoque-parado-{hoje.isoformat()}.json"
arq.write_text(json.dumps(saida, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(saida)} produtos com estoque -> {arq}")
