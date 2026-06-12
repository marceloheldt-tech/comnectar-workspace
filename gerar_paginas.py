import json, os

with open("C:/Users/marce/Desktop/claude comnéctar/wines_catalog.json", "r", encoding="utf-8") as f:
    wines = json.load(f)

OUT = "C:/Users/marce/Desktop/claude comnéctar/conteudo/catalogos/2026-06-12-dia-dos-namorados"

FLAGS = {
    "Italia":   "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDkyNDYiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2NlMmIzNyIvPjwvc3ZnPg==",
    "Franca":   "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDIzOTUiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2VkMjkzOSIvPjwvc3ZnPg==",
    "Espanha":  "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjAuNSIgZmlsbD0iI2M2MGIxZSIvPjxyZWN0IHk9IjAuNSIgd2lkdGg9IjMiIGhlaWdodD0iMSIgZmlsbD0iI2ZmYzQwMCIvPjxyZWN0IHk9IjEuNSIgd2lkdGg9IjMiIGhlaWdodD0iMC41IiBmaWxsPSIjYzYwYjFlIi8+PC9zdmc+",
    "Portugal": "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMiIGZpbGw9IiMwMDY2MDAiLz48cmVjdCB4PSIyIiB3aWR0aD0iMyIgaGVpZ2h0PSIzIiBmaWxsPSIjRkYwMDAwIi8+PC9zdmc+",
    "Chile":    "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIxIiB3aWR0aD0iMyIgaGVpZ2h0PSIxIiBmaWxsPSIjRDUyQjFFIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMzA4NyIvPjwvc3ZnPg==",
    "Uruguai":  "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIwLjIyMiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIwLjY2NiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIxLjExMSIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIxLjU1NiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48L3N2Zz4=",
}

PAGE_HEADERS = [
    ("Chile & Itália · Grandes Tintos", "Chile"),
    ("França & Itália · Borgonha e Brunello", "Franca"),
    ("Itália · Chile · Portugal", "Italia"),
    ("Espanha · França · Itália", "Espanha"),
    ("Itália · Barolo & Toscana", "Italia"),
    ("Itália · Piemonte & Toscana", "Italia"),
]

def flag_img(country):
    b64 = FLAGS.get(country, FLAGS["Italia"])
    return f'<img class="flag-img" src="data:image/svg+xml;base64,{b64}" alt="{country}">'

def clean_title(raw_title):
    title = raw_title.replace("Vinho Tinto ", "")
    if " - " in title:
        parts = title.split(" - ", 1)
        return parts[0].strip(), parts[1].strip()
    return title, ""

def card_html(w):
    name, producer = clean_title(w["title"])
    fi = flag_img(w["country"])
    location = f'{w["country"]} · {w["region"]}'
    grape = w["grape"]
    alc = w["alc"]
    max_p = w["max_price"]
    disc_p = w["discounted"]
    img_src = f'./imagens/{w["img_file"]}'

    return f"""    <div class="card">
      <div class="card-photo">
        <img src="{img_src}" alt="">
      </div>
      <div class="card-line"></div>
      <div class="card-info">
        <p class="wine-name">{name}</p>
        <p class="wine-location">{fi} {location}</p>
        <p class="wine-grape">{grape}</p>
        <p class="wine-alcohol">{alc}% vol.</p>
        <div class="spacer"></div>
        <div class="price-block">
          <p class="price-original">De R$ {max_p}</p>
          <p class="price-discount">R$ {disc_p}</p>
        </div>
      </div>
    </div>"""

def page_html(page_num, wines_slice, header_label, header_country):
    fi = flag_img(header_country)
    cards = "\n".join(card_html(w) for w in wines_slice)
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./_shared.css">
</head>
<body>
<div class="page">

  <div class="header">
    <span class="header-label">
      {fi}
      {header_label}
    </span>
    <span class="header-label" style="font-size:11px; color:#ddd; letter-spacing:2px;">{page_num} / 6</span>
  </div>

  <div class="grid">
{cards}
  </div>

  <div class="footer">
    <img src="../../../dados/image-2.png" alt="">
  </div>

</div>
</body>
</html>"""

pages = [wines[i:i+4] for i in range(0, 24, 4)]

for i, (wine_slice, (label, country)) in enumerate(zip(pages, PAGE_HEADERS), 1):
    html = page_html(i, wine_slice, label, country)
    path = os.path.join(OUT, f"catalog-p{i}.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  Criado catalog-p{i}.html ({len(wine_slice)} vinhos)")

print("\nTodas as páginas geradas.")
