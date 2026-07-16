#!/usr/bin/env python3
"""
Descoberta de quem espiar. Nao extrai anuncios (isso e o extrair.py), so resolve
o alvo e devolve JSON pro Claude decidir o proximo passo.

  python3 scripts/buscar.py conta "@perfil_concorrente"   # ou o nome exato da pagina
  python3 scripts/buscar.py url "https://www.facebook.com/ads/library/?view_all_page_id=..."
  python3 scripts/buscar.py termo "micro saas" [--pais BR]   # modo nicho (gasta mais credito)

Sempre imprime um bloco JSON entre marcadores <<<JSON e JSON>>>.
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib


def emit(obj):
    print("<<<JSON")
    print(json.dumps(obj, ensure_ascii=False, indent=2))
    print("JSON>>>")


def modo_conta(query_raw):
    query = query_raw.lstrip("@").strip()
    cands = lib.resolve_company(query)
    via_ig = None
    # se veio como @ (sem espaco) ou nao achou nada, tenta resolver pelo Instagram
    if not cands or (" " not in query and query_raw.strip().startswith("@")) or " " not in query:
        nome = lib.ig_to_name(query)
        if nome:
            via_ig = nome
            byname = lib.resolve_company(nome)
            # prioriza candidato cujo ig_username casa com o @ informado
            byname.sort(key=lambda c: (c.get("ig_username") or "").lower() != query.lower())
            # mescla sem duplicar page_id
            ids = {c["page_id"] for c in cands}
            cands = cands + [c for c in byname if c["page_id"] not in ids] if cands else byname
    emit({"modo": "conta", "query": query_raw, "resolvido_via_instagram": via_ig,
          "candidatos": cands, "creditos": lib.credits_remaining()})


def modo_url(url):
    parsed = lib.parse_page_id_from_url(url)
    emit({"modo": "url", "url": url, **parsed})


def modo_termo(termo, pais=None, paginas=2):
    """Puxa algumas paginas de busca por palavra-chave e agrega por anunciante,
    revelando os players do nicho. paginas=2 => ~60 ads => ~2 creditos."""
    from collections import defaultdict
    cursor = None
    por_anunciante = defaultdict(lambda: {"page_id": "", "page_name": "", "ads": 0, "exemplo": ""})
    total = None
    usadas = 0
    for _ in range(paginas):
        ads, cursor, total = lib.search_ads(termo, country=pais, cursor=cursor)
        usadas += 1
        for a in ads:
            pid = str(a.get("page_id") or "")
            if not pid:
                continue
            e = por_anunciante[pid]
            e["page_id"] = pid
            e["page_name"] = a.get("page_name") or e["page_name"]
            e["ads"] += 1
            if not e["exemplo"]:
                e["exemplo"] = lib.hook(a)[:90]
        if not cursor or not ads:
            break
    players = sorted(por_anunciante.values(), key=lambda x: x["ads"], reverse=True)
    emit({"modo": "termo", "termo": termo, "pais": pais,
          "total_estimado_na_meta": total, "paginas_lidas": usadas,
          "players": players[:40], "creditos": lib.credits_remaining()})


def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    modo, alvo = sys.argv[1], sys.argv[2]
    pais = None
    if "--pais" in sys.argv:
        pais = sys.argv[sys.argv.index("--pais") + 1]
    if modo == "conta":
        modo_conta(alvo.lstrip("@"))
    elif modo == "url":
        modo_url(alvo)
    elif modo == "termo":
        modo_termo(alvo, pais)
    else:
        print(f"modo desconhecido: {modo}"); sys.exit(1)


if __name__ == "__main__":
    main()
