# Gera adega-willian.html a partir da seleção.
# Preço da lista = preço cheio do site (Shopify). Para o Willian: cartão = site - 7%; PIX = cartão - 10%.
# Item com 5º campo (PIX manual) mantém o preço de cartão e PIX como estão, sem descontos.
import json
DESC_CLIENTE = 0.93
PIX = 0.90
sel = {
 "Piemonte": [
  ("Barbaresco Rabajá 2020", "Castello di Verduno", 1, 1149),
  ("Barbaresco 2021", "Massolino", 1, 1099),
  ("Barolo Silio Riserva 2018", "Rizieri", 1, 1049),
  ("Sito Moresco Langhe 2020", "Gaja", 1, 1049),
  ("Barbaresco Roncagliette 2021", "Olek Bondonio", 2, 999),
  ("Barbaresco Rabajá 2021", "Giuseppe Cortese", 1, 979),
  ("Barbaresco Rabajá-Bas 2020", "Castello di Verduno", 1, 979),
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
  ("Barolo 2021", "Fontanafredda", 2, 599),
  ("Langhe Nebbiolo Reggimento 2020", "Ratti", 4, 559),
 ],
 "Toscana": [
  ("Concerto di Fonterutoli 2020", "Mazzei", 1, 1399),
  ("Guidalberto 2022", "Tenuta San Guido", 2, 979),
  ("Promis 2021", "Gaja Ca' Marcanda", 1, 979),
  ("Brunello di Montalcino DOCG 2018", "Cupano", 1, 1499, 1349),
  ("Brunello di Montalcino CastelGiocondo 2020", "Frescobaldi", 3, 899),
  ("Brunello di Montalcino 2020", "Caprili", 1, 879),
  ("Le Difese 2019", "Tenuta San Guido", 2, 849),
  ("Fiorenzo 2022", "Bakkanali", 4, 779),
  ("Kani 2023", "Bakkanali", 2, 629),
  ("Lucente 2023", "Tenute Luce", 2, 579),
  ("Le Volte dell'Ornellaia 2022", "Ornellaia", 2, 529),
 ],
 "Sicília · Etna": [
  ("Idda Etna Rosso 2022", "Gaja", 1, 1099),
  ("Etna Rosso San Lorenzo 2021", "Tenuta delle Terre Nere", 2, 899),
  ("Etna Rosso Santo Spirito 2019", "Tenuta delle Terre Nere", 2, 719),
  ("Etna Rosso Vigneto Guardiola 2021", "Tenuta delle Terre Nere", 1, 719),
  ("Etna Rosso 2022", "Tenuta delle Terre Nere", 3, 579),
 ],
 "Vêneto · Amarone": [
  ("Amarone della Valpolicella Classico 2022", "Sensi", 3, 789),
  ("Amarone della Valpolicella Classico Corte Vaona 2018", "Novaia", 4, 639),
  ("Amarone Capitel 2016", "Montresor", 4, 599),
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

def brl(v):  # valores cheios, sem centavos
    s = f"{v:,.0f}".replace(",", ".")
    return "R$ " + s

def inteiro(v):  # arredonda pro real mais próximo (0,50 sobe)
    return int(v + 0.5)

def cartao(item):
    return item[3] if len(item) > 4 else inteiro(item[3] * DESC_CLIENTE)

def pix(item):
    return item[4] if len(item) > 4 else inteiro(cartao(item) * PIX)

def tot(grupos):
    itens = [i for g in grupos for i in sel[g]]
    return (sum(i[2] for i in itens), sum(i[2] * cartao(i) for i in itens),
            sum(i[2] * pix(i) for i in itens))

tintos = [g for g in sel if g != "Brancos"]
qT, vT, pT = tot(tintos); qB, vB, pB = tot(["Brancos"]); qA, vA, pA = qT + qB, vT + vB, pT + pB
qIT = qT - tot(["Espanha"])[0]

def tabela(grupos, total=None):
    h = ['<table><colgroup><col><col style="width:10mm"><col style="width:24mm"><col style="width:23mm"><col style="width:22mm"><col style="width:25mm"></colgroup><tr><th>Vinho</th><th class="n">Qtd</th><th class="n">Preço cheio</th><th class="n">Cartão</th><th class="n">PIX</th><th class="n">Subtotal PIX</th></tr>']
    for g in grupos:
        q, v, _ = tot([g])
        h.append(f'<tr class="grupo"><td colspan="5">{g}</td><td class="n">{q} gfs</td></tr>')
        for it in sel[g]:
            nome, prod, n, p = it[:4]
            h.append(f'<tr><td>{nome}<span class="prod">{prod}</span></td><td class="n">{n}</td><td class="n cheio">{brl(p)}</td>'
                     f'<td class="n">{brl(cartao(it))}</td><td class="n pix">{brl(pix(it))}</td><td class="n">{brl(n*pix(it))}</td></tr>')
    if total:
        label, gt = total
        q, v, pv = tot(gt)
        cheio = sum(i[2] * i[3] for g in gt for i in sel[g])
        h.append(f'<tr class="total"><td>{label}</td><td class="n">{q}</td><td class="n cheio">{brl(cheio)}</td><td class="n">{brl(v)}</td><td></td><td class="n">{brl(pv)}</td></tr>')
    h.append('</table>')
    return "\n".join(h)

def card_regiao(g):
    q, v, pv = tot([g])
    return f'<div><span class="r">{g}</span><span class="q">{q} gfs</span><span class="v">{brl(pv)}</span></div>'

html = open("modelo.html", encoding="utf-8").read()
for k, v in {
    "{{qT}}": str(qT), "{{qB}}": str(qB), "{{qA}}": str(qA), "{{qIT}}": str(qIT),
    "{{vA_cartao}}": brl(vA), "{{vA_pix}}": brl(pA), "{{economia}}": brl(vA - pA),
    "{{media_cartao}}": brl(vA / qA), "{{vA_cheio}}": brl(sum(i[2] * i[3] for g in sel for i in sel[g])), "{{eco_cheio}}": brl(sum(i[2] * i[3] for g in sel for i in sel[g]) - pA), "{{media_pix}}": brl(pA / qA),
    "{{vT_pix}}": brl(pT), "{{vB_pix}}": brl(pB),
    "{{regioes}}": "\n".join(card_regiao(g) for g in sel),
    "{{tab_p2}}": tabela(["Piemonte"]),
    "{{tab_p3}}": tabela(["Toscana", "Sicília · Etna", "Vêneto · Amarone"]),
    "{{tab_p4}}": tabela(["Espanha"], ("Total tintos", tintos)) + '<div style="height:5mm"></div>' + tabela(["Brancos"], ("Total brancos", ["Brancos"])),
    "{{rotulos}}": str(sum(len(sel[g]) for g in sel)),
}.items():
    html = html.replace(k, v)
open("adega-willian.html", "w", encoding="utf-8").write(html)
print(qA, qT, qB, brl(vA), brl(pA), brl(vA/qA), brl(pA/qA), brl(vT), brl(pT), brl(pB))
