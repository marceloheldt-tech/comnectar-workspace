#!/usr/bin/env python3
"""
Extrai os anuncios de um concorrente (por page_id), deduplica por conceito,
baixa criativos de forma economica e salva tudo numa pasta datada.

  python3 scripts/extrair.py --page-id <PAGE_ID> --label "Nome do Concorrente" \
      [--pais BR] [--status ACTIVE|ALL] [--max-paginas 40] [--baixar-videos] [--out <dir>]

Por padrao baixa imagens + thumbnails de TODOS os conceitos e o VIDEO dos 3
campeoes (pra analise de IA). --baixar-videos baixa o video de todos (pesado).
Cada pagina da API custa ~1 credito (~10 anuncios).
"""
import os, sys, json, argparse, datetime, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", (s or "concorrente").lower()).strip("-")[:40]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--page-id", required=True)
    ap.add_argument("--label", default="concorrente")
    ap.add_argument("--pais", default=None)
    ap.add_argument("--status", default="ACTIVE")
    ap.add_argument("--max-paginas", type=int, default=40)
    ap.add_argument("--baixar-videos", action="store_true")
    ap.add_argument("--out", default=None)
    a = ap.parse_args()

    hoje = datetime.date.today().isoformat()
    out = a.out or os.path.join(SKILL_DIR, "output", f"{slug(a.label)}-{hoje}")
    os.makedirs(os.path.join(out, "thumbs"), exist_ok=True)
    os.makedirs(os.path.join(out, "videos"), exist_ok=True)
    os.makedirs(os.path.join(out, "imagens"), exist_ok=True)

    # -------- puxar (paginado) --------
    ads, cursor, pags, seen = [], None, 0, set()
    while pags < a.max_paginas:
        page, cursor = lib.page_ads(a.page_id, country=a.pais, status=a.status, cursor=cursor)
        pags += 1
        novos = 0
        for x in page:
            k = x.get("ad_archive_id")
            if k in seen:
                continue
            seen.add(k); ads.append(x); novos += 1
        print(f"  pagina {pags}: +{novos} (total {len(ads)})", file=sys.stderr)
        if not cursor or novos == 0:
            break

    ativos = [x for x in ads if x.get("is_active", True)]
    json.dump(ativos, open(os.path.join(out, "dados.json"), "w"), ensure_ascii=False)

    # -------- dedupe em conceitos --------
    conceitos = lib.dedupe_conceitos(ativos)

    # -------- baixar criativos --------
    top3_video = []
    resumo_conceitos = []
    for i, c in enumerate(conceitos):
        rep = c["rep"]
        th = lib.thumb_url(rep)
        thumb_path = ""
        if th:
            p = os.path.join(out, "thumbs", f"c{i}.jpg")
            if lib.download(th, p):
                thumb_path = os.path.relpath(p, out)
        img_path = ""
        if lib.formato(rep) == "IMAGE":
            imgs = lib.snap(rep).get("images") or []
            u = imgs[0].get("original_image_url") if imgs else ""
            if u:
                p = os.path.join(out, "imagens", f"c{i}.jpg")
                if lib.download(u, p):
                    img_path = os.path.relpath(p, out)
        vid_path = ""
        is_video = lib.formato(rep) == "VIDEO"
        baixar_este_video = a.baixar_videos or (is_video and len(top3_video) < 3)
        if is_video and baixar_este_video:
            vu = lib.video_url(rep)
            if vu:
                p = os.path.join(out, "videos", f"c{i}.mp4")
                if lib.download(vu, p):
                    vid_path = os.path.relpath(p, out)
                    if len(top3_video) < 3:
                        top3_video.append({"i": i, "video": vid_path, "dias": c["dias"],
                                           "hook": lib.hook(rep), "copy": lib.copy_text(rep)})
        resumo_conceitos.append({
            "i": i, "dias": c["dias"], "variacoes": c["n"], "formato": lib.formato(rep),
            "hook": lib.hook(rep), "cta": lib.cta(rep), "landing": lib.landing(rep),
            "dominio": lib.dominio(lib.landing(rep)), "copy": lib.copy_text(rep),
            "ad_url": lib.ad_url(rep), "thumb": thumb_path, "imagem": img_path, "video": vid_path,
        })

    meta = {
        "label": a.label, "page_id": a.page_id, "pais": a.pais, "status": a.status,
        "data": hoje, "total_ativos": len(ativos), "conceitos": len(conceitos),
        "paginas_lidas": pags, "creditos_restantes": lib.credits_remaining(),
        "top3_video": top3_video,
    }
    json.dump({"meta": meta, "conceitos": resumo_conceitos},
              open(os.path.join(out, "conceitos.json"), "w"), ensure_ascii=False, indent=2)

    print(json.dumps({
        "out": out, "total_ativos": len(ativos), "conceitos": len(conceitos),
        "paginas_lidas": pags, "creditos_restantes": lib.credits_remaining(),
        "top3_video_paths": [os.path.join(out, v["video"]) for v in top3_video],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
