#!/usr/bin/env python3
"""
Gera o relatorio HTML a partir da pasta de extracao.

  python3 scripts/gerar_relatorio.py <out_dir>

Le <out_dir>/conceitos.json (obrigatorio) e <out_dir>/sintese.json (opcional,
escrito pelo Claude com a leitura qualitativa). Escreve <out_dir>/index.html.
"""
import os, sys, json, html, re
from collections import Counter


def esc(s):
    return html.escape(str(s or ""))


def main():
    out = sys.argv[1]
    conceitos_data = json.load(open(os.path.join(out, "conceitos.json")))
    meta = conceitos_data["meta"]
    conceitos = conceitos_data["conceitos"]
    sintese = {}
    sp = os.path.join(out, "sintese.json")
    if os.path.exists(sp):
        sintese = json.load(open(sp))

    label = meta.get("label", "Concorrente")
    total = meta.get("total_ativos", 0)
    n_conc = meta.get("conceitos", len(conceitos))
    data = meta.get("data", "")

    # ---- stats (ponderadas por variacoes = nivel anuncio) ----
    def w(c):
        return c.get("variacoes", 1)
    n_video = sum(w(c) for c in conceitos if c["formato"] == "VIDEO")
    pct_video = round(100 * n_video / total) if total else 0
    dur = sorted([c["dias"] for c in conceitos if c["dias"] >= 0])
    mediana = dur[len(dur) // 2] if dur else 0
    campeoes = sum(1 for c in conceitos if c["dias"] >= 60)
    ofertas = Counter()
    for c in conceitos:
        if c["dominio"]:
            ofertas[c["dominio"]] += w(c)
    ctas = Counter()
    for c in conceitos:
        if c["cta"]:
            ctas[c["cta"]] += w(c)
    hooks = Counter()
    for c in conceitos:
        if c["hook"]:
            hooks[c["hook"]] += w(c)

    AM = "#F2E30C"

    def badge(dd):
        cor = "#16a34a" if dd >= 60 else ("#ca8a04" if dd >= 21 else "#6b7280")
        rot = "campeão" if dd >= 60 else ("aquecendo" if dd >= 21 else "novo")
        return f'<span class="dias" style="--c:{cor}">{dd}d · {rot}</span>'

    # ---- secao promessa (sintese) ----
    promessa_html = ""
    if sintese.get("resumo_oferta") or sintese.get("promessas"):
        proms = "".join(f"<li>{esc(p)}</li>" for p in sintese.get("promessas", []))
        angs = "".join(f'<span class="chip">{esc(x)}</span>' for x in sintese.get("angulos", []))
        pub = sintese.get("publico")
        promessa_html = f'''
        <section>
          <h2>O que ele está prometendo <em>· a oferta e a copy por trás</em></h2>
          <p class="lead">{esc(sintese.get("resumo_oferta"))}</p>
          <div class="cols">
            <div>
              <h3>Promessas que ele martela</h3>
              <ul class="prom">{proms}</ul>
            </div>
            <div>
              <h3>Ângulos e dores explorados</h3>
              <div class="chips">{angs}</div>
              {f'<h3 style="margin-top:20px">Público-alvo aparente</h3><p class="lead">{esc(pub)}</p>' if pub else ''}
            </div>
          </div>
        </section>'''

    # ---- secao analise de video ----
    video_html = ""
    if sintese.get("analise_video"):
        blocos = ""
        for v in sintese["analise_video"]:
            blocos += f'''<div class="vcard">
              <div class="vhead">{badge(v.get("dias", 0))}<b>{esc(v.get("titulo"))}</b></div>
              <p>{esc(v.get("leitura"))}</p></div>'''
        video_html = f'''
        <section>
          <h2>Anatomia dos vídeos campeões <em>· o que faz o hook segurar</em></h2>
          <p class="lead">Leitura frame a frame dos 3 vídeos que mais tempo rodam. É onde o dinheiro dele está.</p>
          <div class="vgrid">{blocos}</div>
        </section>'''

    # ---- ideias pra voce ----
    ideias_html = ""
    if sintese.get("ideias_pra_voce"):
        its = "".join(f"<li>{esc(x)}</li>" for x in sintese["ideias_pra_voce"])
        ideias_html = f'''
        <section class="ideias">
          <h2>Ideias pra você testar</h2>
          <p class="lead">Não copie. Pegue o que funciona pra ele e adapte pro seu ângulo.</p>
          <ol class="ideias-list">{its}</ol>
        </section>'''

    # ---- cards campeoes ----
    cards = []
    for c in conceitos[:15]:
        th = c.get("thumb")
        img = f'<img src="{esc(th)}" loading="lazy" alt="">' if th else '<div class="noimg">sem preview</div>'
        play = '<span class="play">▶</span>' if c["formato"] == "VIDEO" else ''
        cards.append(f'''
        <article class="card">
          <div class="thumb">{img}{play}</div>
          <div class="meta">{badge(c["dias"])}<span class="tag">{esc(c["formato"])}</span>
            <span class="tag">{c["variacoes"]} variações</span></div>
          <p class="hook">{esc(c["hook"])}</p>
          <p class="copy">{esc(c["copy"][:240])}…</p>
          <div class="foot"><span class="cta">{esc(c["cta"] or "—")}</span>
            <span class="dom">{esc(c["dominio"])}</span></div>
          {f'<a class="link" href="{esc(c["ad_url"])}" target="_blank">ver na Ad Library ↗</a>' if c["ad_url"] else ''}
        </article>''')

    of_cards = "".join(
        f'<div class="of"><span class="ofn">{n}</span><span class="ofd">{esc(dom)}</span>'
        f'<span class="ofp">{round(100*n/total) if total else 0}% do volume</span></div>'
        for dom, n in ofertas.most_common())
    hook_rows = "".join(f'<li><span class="hc">{n}×</span> {esc(h)}</li>' for h, n in hooks.most_common(10))
    maxc = max(ctas.values()) if ctas else 1
    cta_rows = "".join(
        f'<div class="bar"><span>{esc(c)}</span><i style="width:{round(100*n/maxc)}%"></i><b>{n}</b></div>'
        for c, n in ctas.most_common(6))
    gal = "".join(
        f'<a class="g" href="{esc(c.get("ad_url"))}" target="_blank">'
        f'{("<img src=%r loading=lazy>" % c["thumb"]) if c.get("thumb") else "<span>—</span>"}</a>'
        for c in conceitos[:30])

    HTML = f'''<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Radar de Anúncios · {esc(label)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
:root{{--am:{AM};--ink:#111;--mut:#6b7280;--line:#e5e7eb;--bg:#faf9f5}}
*{{box-sizing:border-box}}body{{margin:0;font-family:'Bricolage Grotesque',system-ui,sans-serif;color:var(--ink);background:var(--bg);line-height:1.5}}
.wrap{{max-width:1180px;margin:0 auto;padding:0 20px}}
header{{padding:56px 0 28px;border-bottom:2px solid var(--ink)}}
.kick{{font-family:'Instrument Serif',serif;font-style:italic;font-size:22px;color:var(--mut)}}
h1{{font-size:clamp(34px,5vw,58px);font-weight:800;letter-spacing:-.02em;margin:.1em 0 .2em}}
h1 mark{{background:var(--am);padding:0 .1em}}
.sub{{color:var(--mut);font-size:15px}}
h3{{font-size:16px;margin:0 0 8px}}
.kpis{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin:32px 0}}
.kpi{{border:1.5px dashed #cfcabc;border-radius:14px;padding:18px}}
.kpi b{{display:block;font-size:34px;font-weight:800;letter-spacing:-.02em}}
.kpi span{{color:var(--mut);font-size:13px}}
section{{padding:38px 0;border-bottom:1px solid var(--line)}}
h2{{font-size:27px;font-weight:800;letter-spacing:-.01em;margin:0 0 6px}}
h2 em{{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:var(--mut);font-size:.8em}}
.lead{{color:var(--mut);max-width:74ch;margin:0 0 22px}}
.cols{{display:grid;grid-template-columns:1fr 1fr;gap:34px}}
@media(max-width:720px){{.cols{{grid-template-columns:1fr}}}}
.prom{{margin:0;padding-left:18px}} .prom li{{margin:8px 0;font-weight:600}}
.chips{{display:flex;flex-wrap:wrap;gap:8px}}
.chip{{background:#f3f1ea;border-radius:20px;padding:5px 12px;font-size:13px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}}
.card{{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:#fff;display:flex;flex-direction:column}}
.thumb{{position:relative;aspect-ratio:1/1;background:#f0eee6;overflow:hidden}}
.thumb img{{width:100%;height:100%;object-fit:cover}}
.thumb .noimg{{display:flex;align-items:center;justify-content:center;height:100%;color:#aaa;font-size:13px}}
.thumb .play{{position:absolute;top:10px;right:10px;background:rgba(0,0,0,.6);color:#fff;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:12px}}
.meta{{display:flex;gap:6px;flex-wrap:wrap;padding:12px 14px 0}}
.dias{{font-size:12px;font-weight:700;color:#fff;background:var(--c);padding:3px 8px;border-radius:20px}}
.tag{{font-size:12px;color:var(--mut);background:#f3f1ea;padding:3px 8px;border-radius:20px}}
.hook{{font-weight:700;margin:10px 14px 4px;font-size:15px}}
.copy{{color:var(--mut);font-size:13px;margin:0 14px 10px;flex:1}}
.foot{{display:flex;justify-content:space-between;align-items:center;padding:0 14px 10px;gap:8px}}
.cta{{font-size:12px;font-weight:700;border:1.5px solid var(--ink);border-radius:20px;padding:3px 10px}}
.dom{{font-size:11px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px}}
.link{{display:block;padding:10px 14px;border-top:1px solid var(--line);font-size:12px;font-weight:700;color:var(--ink);text-decoration:none}}
.link:hover{{background:var(--am)}}
.ofs{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}}
.of{{border:1.5px dashed #cfcabc;border-radius:14px;padding:18px}}
.ofn{{font-size:30px;font-weight:800}} .ofd{{display:block;font-weight:700;margin:2px 0}} .ofp{{color:var(--mut);font-size:13px}}
.hooks{{list-style:none;padding:0;margin:0}}
.hooks li{{padding:9px 0;border-bottom:1px dashed var(--line);font-size:14px}}
.hc{{font-weight:800;background:var(--am);padding:1px 6px;border-radius:6px;margin-right:6px;font-size:12px}}
.bar{{display:flex;align-items:center;gap:10px;margin:9px 0;font-size:13px}}
.bar span{{width:110px;color:var(--mut)}} .bar i{{height:12px;background:var(--am);border-radius:6px;display:block}} .bar b{{font-weight:700}}
.vgrid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}}
.vcard{{border:1px solid var(--line);border-radius:14px;padding:18px;background:#fff}}
.vhead{{display:flex;align-items:center;gap:10px;margin-bottom:8px}} .vhead b{{font-size:15px}}
.vcard p{{color:var(--mut);font-size:14px;margin:0}}
.ideias{{background:#111;color:#fff;border-radius:20px;padding:34px;border:none;margin-top:20px}}
.ideias h2{{color:#fff}} .ideias .lead{{color:#bbb}}
.ideias-list{{margin:0;padding-left:22px}} .ideias-list li{{margin:10px 0;font-size:15px}}
.gal{{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}}
.g{{aspect-ratio:1/1;background:#f0eee6;border-radius:10px;overflow:hidden;display:grid;place-items:center;color:#bbb}}
.g img{{width:100%;height:100%;object-fit:cover}}
footer{{padding:40px 0 60px;color:var(--mut);font-size:13px}} footer b{{color:var(--ink)}}
footer a{{color:var(--ink)}}
</style></head><body>
<div class="wrap">
<header>
  <div class="kick">Radar de Anúncios · inteligência de concorrentes</div>
  <h1><mark>{esc(label)}</mark> no Meta Ads</h1>
  <p class="sub">Biblioteca de Anúncios da Meta · {data} · {total} anúncios ativos · {n_conc} conceitos únicos após dedupe</p>
</header>

<div class="kpis">
  <div class="kpi"><b>{total}</b><span>anúncios ativos</span></div>
  <div class="kpi"><b>{n_conc}</b><span>conceitos únicos</span></div>
  <div class="kpi"><b>{pct_video}%</b><span>são vídeo</span></div>
  <div class="kpi"><b>{mediana}d</b><span>longevidade mediana</span></div>
  <div class="kpi"><b>{campeoes}</b><span>campeões (60d+)</span></div>
  <div class="kpi"><b>{len(ofertas)}</b><span>ofertas ativas</span></div>
</div>

{promessa_html}

<section>
  <h2>Ofertas ativas <em>· pra onde ele manda o tráfego</em></h2>
  <p class="lead">Agrupando pelo domínio da landing dá pra ver o funil e qual oferta ele mais empurra.</p>
  <div class="ofs">{of_cards}</div>
</section>

<section>
  <h2>Anúncios campeões <em>· os que mais tempo rodam</em></h2>
  <p class="lead">Anúncio que fica meses no ar é dinheiro validado: se não convertesse, já teria sido pausado. Ordenado por longevidade, deduplicado por conceito.</p>
  <div class="grid">{''.join(cards)}</div>
</section>

{video_html}

<section>
  <div class="cols">
    <div><h2>Hooks que ele repete</h2>
      <p class="lead">Primeira linha de cada conceito. O que aparece muito é aposta consciente.</p>
      <ul class="hooks">{hook_rows}</ul></div>
    <div><h2>CTA e formato</h2>
      <p class="lead">Botões mais usados nos anúncios ativos.</p>
      {cta_rows}
      <div class="bar" style="margin-top:18px"><span>Vídeo</span><i style="width:{pct_video}%"></i><b>{pct_video}%</b></div>
      <div class="bar"><span>Imagem</span><i style="width:{100-pct_video}%"></i><b>{100-pct_video}%</b></div>
    </div>
  </div>
</section>

{ideias_html}

<section>
  <h2>Galeria de criativos</h2>
  <p class="lead">Amostra dos conceitos ativos. Clica pra abrir na Ad Library.</p>
  <div class="gal">{gal}</div>
</section>

<footer>
  <b>Radar de Anúncios</b> · skill <b>/espiar-ads-ratos</b> da DobraLabs. Use pra inspiração e leitura de mercado, nunca pra copiar criativo alheio.<br>
  Feito com Claude Code. Aprenda a construir skills assim nos cursos da <a href="https://ratosdeia.com.br" target="_blank">Ratos de IA</a>.
</footer>
</div></body></html>'''

    op = os.path.join(out, "index.html")
    open(op, "w").write(HTML)
    print(f"OK -> {op}")


if __name__ == "__main__":
    main()
