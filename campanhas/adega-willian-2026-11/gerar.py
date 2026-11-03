# Gera adega-willian.html a partir da seleção (preço cartão; PIX = -10%)
import json
PIX = 0.90
sel = {
 "Piemonte": [
  ("Barbaresco Rabajá 2020", "Castello di Verduno", 2, 1149),
  ("Barbaresco 2021", "Massolino", 1, 1099),
  ("Barolo Silio Riserva 2018", "Rizieri", 1, 1049),
  ("Sito Moresco Langhe 2020", "Gaja", 1, 1049),
  ("Barbaresco Roncagliette 2021", "Olek Bondonio", 4, 999),
  ("Barbaresco Rabajá 2021", "Giuseppe Cortese", 2, 979),
  ("Barbaresco Rabajá-Bas 2020", "Castello di Verduno", 2, 979),
  ("Barolo Sorano 2021", "Claudio Alario", 1, 959),
  ("Barolo Gattera 2020", "Bovio", 2, 949),
  ("Barolo del Comune di Serralunga d'Alba 2021", "Rivetto", 2, 899),
  ("Barolo Marcenasco 2020", "Ratti", 2, 899),
  ("Barolo del Comune di La Morra 2021", "Bovio", 2, 719),
  ("Barbaresco 2021", "Castello di Verduno", 2, 699),
  ("Barbaresco 2022", "Bovio", 2, 689),
  ("Nebbiolo d'Alba Vigna Lirano 2023", "Rivetto", 1, 679),
  ("Barolo 2020", "Bovio", 2, 669),
  ("Langhe Rosso Monprà 2022", "Conterno Fantino", 2, 599),
  ("Barbaresco 2021", "Giuseppe Cortese", 2, 589),
  ("Langhe Nebbiolo Reggimento 2020", "Ratti", 4, 559),
 ],
 "Toscana": [
  ("Concerto di Fonterutoli 2020", "Mazzei", 1, 1399),
  ("Guidalberto 2022", "Tenuta San Guido", 4, 979),
  ("Promis 2021", "Gaja Ca' Marcanda", 1, 979),
  ("Brunello di Montalcino CastelGiocondo 2020", "Frescobaldi", 6, 899),
  ("Brunello di Montalcino 2020", "Caprili", 1, 879),
  ("Le Difese 2019", "Tenuta San Guido", 2, 849),
  ("Fiorenzo 2022", "Bakkanali", 4, 779),
  ("Kani 2023", "Bakkanali", 2, 629),
 ],
 "Sicília · Etna": [
  ("Idda Etna Rosso 2022", "Gaja", 1, 1099),
  ("Etna Rosso San Lorenzo 2021", "Tenuta delle Terre Nere", 2, 899),
  ("Etna Rosso Santo Spirito 2019", "Tenuta delle Terre Nere", 2, 719),
  ("Etna Rosso Vigneto Guardiola 2021", "Tenuta delle Terre Nere", 1, 719),
 ],
 "Vêneto · Amarone": [
  ("Amarone della Valpolicella Classico 2022", "Sensi", 4, 789),
  ("Amarone della Valpolicella Classico Corte Vaona 2018", "Novaia", 4, 639),
  ("Amarone Capitel 2016", "Montresor", 3, 599),
 ],
 "Espanha": [
  ("Pintia 2019", "Vega Sicilia · Toro", 1, 1569),
  ("Macán Clásico 2020", "Vega Sicilia & Rothschild · Rioja", 1, 1049),
  ("Ensamblaje 2024", "Bodegas Viñátigo · Canárias", 3, 699),
 ],
 "Brancos": [
  ("Greco di Tufo 2024", "Mastroberardino · Campânia", 4, 459),
  ("L'Altro Chardonnay 2024", "Pio Cesare · Piemonte", 6, 439),
  ("Etna Bianco Superiore 2023", "Barone di Villagrande · Sicília", 2, 389),
  ("Scapulin 2023", "Giuseppe Cortese · Piemonte", 5, 379),
  ("Listán de Canarias 2025", "Bodegas Viñátigo · Canárias", 3, 369),
 ],
}

def brl(v):
    s = f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return "R$ " + s

def tot(grupos):
    q = sum(n for g in grupos for *_, n, p in sel[g])
    v = sum(n * p for g in grupos for *_, n, p in sel[g])
    return q, v

tintos = [g for g in sel if g != "Brancos"]
qT, vT = tot(tintos); qB, vB = tot(["Brancos"]); qA, vA = qT + qB, vT + vB
assert (qT, qB) == (80, 20)
qIT = qT - tot(["Espanha"])[0]

def tabela(grupos, total=None):
    h = ['<table><colgroup><col><col style="width:12mm"><col style="width:27mm"><col style="width:27mm"><col style="width:30mm"></colgroup><tr><th>Vinho</th><th class="n">Qtd</th><th class="n">Cartão</th><th class="n">PIX</th><th class="n">Subtotal PIX</th></tr>']
    for g in grupos:
        q, v = tot([g])
        h.append(f'<tr class="grupo"><td colspan="4">{g}</td><td class="n">{q} gfs</td></tr>')
        for nome, prod, n, p in sel[g]:
            h.append(f'<tr><td>{nome}<span class="prod">{prod}</span></td><td class="n">{n}</td>'
                     f'<td class="n">{brl(p)}</td><td class="n pix">{brl(p*PIX)}</td><td class="n">{brl(n*p*PIX)}</td></tr>')
    if total:
        label, gt = total
        q, v = tot(gt)
        h.append(f'<tr class="total"><td>{label}<span class="prod">{brl(v)} no cartão</span></td><td class="n">{q}</td><td></td><td></td><td class="n">{brl(v*PIX)}</td></tr>')
    h.append('</table>')
    return "\n".join(h)

def card_regiao(g):
    q, v = tot([g])
    return f'<div><span class="r">{g}</span><span class="q">{q} gfs</span><span class="v">{brl(v*PIX)}</span></div>'

html = open("modelo.html", encoding="utf-8").read()
for k, v in {
    "{{qT}}": str(qT), "{{qB}}": str(qB), "{{qA}}": str(qA), "{{qIT}}": str(qIT),
    "{{vA_cartao}}": brl(vA), "{{vA_pix}}": brl(vA * PIX), "{{economia}}": brl(vA * (1 - PIX)),
    "{{media_cartao}}": brl(vA / qA), "{{media_pix}}": brl(vA * PIX / qA),
    "{{vT_pix}}": brl(vT * PIX), "{{vB_pix}}": brl(vB * PIX),
    "{{regioes}}": "\n".join(card_regiao(g) for g in sel),
    "{{tab_p2}}": tabela(["Piemonte"]),
    "{{tab_p3}}": tabela(["Toscana", "Sicília · Etna", "Vêneto · Amarone", "Espanha"], ("Total tintos", tintos)),
    "{{tab_p4}}": tabela(["Brancos"], ("Total brancos", ["Brancos"])),
    "{{rotulos}}": str(sum(len(sel[g]) for g in sel)),
}.items():
    html = html.replace(k, v)
open("adega-willian.html", "w", encoding="utf-8").write(html)
print(qA, brl(vA), brl(vA*PIX), brl(vA/qA), brl(vA*PIX/qA), brl(vT*PIX), brl(vB*PIX))
