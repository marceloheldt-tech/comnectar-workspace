"""Puxa cadastro completo de produtos (custo, preco, estoque, fornecedor) e as
contas a pagar/receber em aberto. Salva em dados/bling/produtos/produtos.json e
dados/bling/financeiro/abertas.json.

Uso: py sync_cadastros.py
"""
import json

from bling_api import RAIZ, get, listar

# produtos: todos (ativos e inativos), com detalhe pra pegar fornecedor
lista = listar("produtos", {"criterio": 5})
print(f"{len(lista)} produtos", flush=True)
prods = []
for i, p in enumerate(lista, 1):
    d = get(f"produtos/{p['id']}")["data"]
    forn = d.get("fornecedor") or {}
    prods.append({
        "id": d["id"], "codigo": str(d.get("codigo") or "").strip(), "nome": d.get("nome"),
        "situacao": d.get("situacao"), "preco": d.get("preco") or 0,
        "custo": forn.get("precoCusto") or p.get("precoCusto") or 0,
        "estoque": (d.get("estoque") or {}).get("saldoVirtualTotal", 0) or 0,
        "fornecedor": ((forn.get("contato") or {}).get("nome") or "").strip(),
        "marca": d.get("marca") or "",
    })
    if i % 100 == 0:
        print(f"  {i}/{len(lista)}", flush=True)
dest = RAIZ / "dados" / "bling" / "produtos"
dest.mkdir(parents=True, exist_ok=True)
(dest / "produtos.json").write_text(json.dumps(prods, ensure_ascii=False, indent=1), encoding="utf-8")

# contas em aberto (1) e parcialmente pagas/recebidas (3)
abertas = {}
for tipo in ("pagar", "receber"):
    itens = []
    for sit in (1, 3):
        for c in listar(f"contas/{tipo}", {"situacoes": [sit]} if tipo == "receber" else {"situacao": sit}):
            d = get(f"contas/{tipo}/{c['id']}")["data"]
            itens.append(d)
    abertas[tipo] = itens
    print(f"contas a {tipo} em aberto: {len(itens)}", flush=True)
fin = RAIZ / "dados" / "bling" / "financeiro"
fin.mkdir(parents=True, exist_ok=True)
(fin / "abertas.json").write_text(json.dumps(abertas, ensure_ascii=False, indent=1), encoding="utf-8")
print("Pronto")
