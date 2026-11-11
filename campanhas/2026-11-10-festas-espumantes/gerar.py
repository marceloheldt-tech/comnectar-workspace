# Gera festas-espumantes.html
# Com preço "de" no site: cheio = preço "de", cartão = preço do site, Pix = cartão -10%
# Demais: cheio = preço do site, cartão = site -10%, Pix = cartão -10%
import json, math
def r(x): return int(math.floor(x + 0.5))
def brl(n): return f"{n:,}".replace(",", ".")
FR="PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDIzOTUiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2VkMjkzOSIvPjwvc3ZnPg=="
ES="PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjAuNSIgZmlsbD0iI2M2MGIxZSIvPjxyZWN0IHk9IjAuNSIgd2lkdGg9IjMiIGhlaWdodD0iMSIgZmlsbD0iI2ZmYzQwMCIvPjxyZWN0IHk9IjEuNSIgd2lkdGg9IjMiIGhlaWdodD0iMC41IiBmaWxsPSIjYzYwYjFlIi8+PC9zdmc+"
import base64
BR=base64.b64encode(b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 21"><rect width="30" height="21" fill="#009c3b"/><polygon points="15,2.5 27.5,10.5 15,18.5 2.5,10.5" fill="#ffdf00"/><circle cx="15" cy="10.5" r="4.6" fill="#002776"/></svg>').decode()
grupos = [
 ("Champagnes", "França · Champagne", [
  ("Taittinger Réserve Brut", "Taittinger", FR, "Reims", 599, "taittinger", 699),
  ("Veuve Clicquot Brut", "Veuve Clicquot", FR, "Reims", 669, "veuve"),
  ("Moët & Chandon Impérial Extra Brut", "Moët & Chandon", FR, "Épernay", 699, "moet"),
  ("Billecart-Salmon Brut Réserve", "Billecart-Salmon", FR, "Mareuil-sur-Aÿ", 1099, "billecart"),
 ]),
 ("Espumantes importados", "França · Espanha", [
  ("Blanc de Blancs Brut", "Veuve Ambal", FR, "França · Borgonha", 99, "ambal-bdb"),
  ("Crémant de Bourgogne Rosé Premières Fleurs", "Veuve Ambal", FR, "França · Borgonha", 249, "ambal-rose"),
  ("Cuvée Inédita Reserva Extra Brut", "Vivanco", ES, "Espanha · Rioja", 299, "vivanco"),
 ]),
 ("Espumantes brasileiros", "Serra Gaúcha · método tradicional", [
  ("Stravaganzza Brut", "Don Giovanni", BR, "Pinto Bandeira", 118, "stravaganzza", 139),
  ("Blanc de Noir Brut", "Don Giovanni", BR, "Pinto Bandeira", 152, "dg-bdn", 179),
  ("Nature", "Cave Geisse", BR, "Pinto Bandeira", 189, "geisse-nature"),
  ("Blanc de Blanc Brut", "Cave Geisse", BR, "Pinto Bandeira", 239, "geisse-bdb"),
  ("130 Brut Blanc de Blanc", "Casa Valduga", BR, "Vale dos Vinhedos", 239, "valduga-bdb"),
  ("130 Brut Blanc de Noir", "Casa Valduga", BR, "Vale dos Vinhedos", 239, "valduga-bdn"),
 ]),
]
tabela = []
secoes = ""
for titulo, sub, vinhos in grupos:
    cards = ""
    for nome, prod, flag, origem, site, img, *de in vinhos:
        if de:
            cheio, cartao = de[0], site
        else:
            cheio, cartao = site, r(site * 0.90)
        pix = r(cartao * 0.90)
        tabela.append((nome, prod, cheio, cartao, pix))
        cards += f'''
      <div class="card">
        <div class="photo"><img src="imagens/{img}.jpg" alt=""></div>
        <div class="line"></div>
        <p class="prod">{prod}</p>
        <p class="name">{nome}</p>
        <p class="orig"><img class="flag" src="data:image/svg+xml;base64,{flag}" alt=""> {origem}</p>
        <div class="prices">
          <p class="cheio">Preço cheio <span>R$ {brl(cheio)}</span></p>
          <p class="cartao">No cartão <span>R$ {brl(cartao)}</span></p>
          <p class="pix"><small>No Pix</small> R$ {brl(pix)}</p>
        </div>
      </div>'''
    secoes += f'''
  <section>
    <div class="ghead"><span class="t">{titulo}</span><span class="d">{sub}</span></div>
    <div class="grid n{len(vinhos)}">{cards}
    </div>
  </section>'''
html = open("template.html", encoding="utf-8").read().replace("{{SECOES}}", secoes)
open("festas-espumantes.html", "w", encoding="utf-8").write(html)
json.dump(tabela, open("precos.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for t in tabela: print(t)
