"""Sincroniza todos os pedidos de venda do Bling (com itens) em
dados/bling/vendas/pedidos.json. Incremental: so busca detalhe de pedido novo
ou de pedido dos ultimos 30 dias (que ainda pode mudar de situacao).

Uso: py sync_pedidos.py
"""
import json
from datetime import date, timedelta

from bling_api import RAIZ, get, listar

ARQ = RAIZ / "dados" / "bling" / "vendas" / "pedidos.json"
ARQ.parent.mkdir(parents=True, exist_ok=True)
cache = {str(p["id"]): p for p in json.loads(ARQ.read_text(encoding="utf-8"))} if ARQ.exists() else {}
recente = (date.today() - timedelta(days=30)).isoformat()

lista = listar("pedidos/vendas")
print(f"{len(lista)} pedidos no Bling, {len(cache)} em cache", flush=True)
novos = 0
for i, p in enumerate(lista, 1):
    pid = str(p["id"])
    if pid in cache and p["data"] < recente and cache[pid]["situacao"] == p["situacao"]:
        continue
    cache[pid] = get(f"pedidos/vendas/{pid}")["data"]
    novos += 1
    if novos % 100 == 0:
        ARQ.write_text(json.dumps(list(cache.values()), ensure_ascii=False), encoding="utf-8")
        print(f"  {i}/{len(lista)}", flush=True)
ARQ.write_text(json.dumps(list(cache.values()), ensure_ascii=False), encoding="utf-8")
print(f"Pronto: {novos} atualizados, {len(cache)} pedidos salvos em {ARQ}")
