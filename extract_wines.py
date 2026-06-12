import json

files = [
    "C:/Users/marce/.claude/projects/c--Users-marce-Desktop-claude-comn-ctar/e16117c7-9cc0-49b9-9bfb-b766f84239ba/tool-results/mcp-claude_ai_Shopify-graphql_query-1781261091818.txt",
    "C:/Users/marce/.claude/projects/c--Users-marce-Desktop-claude-comn-ctar/e16117c7-9cc0-49b9-9bfb-b766f84239ba/tool-results/mcp-claude_ai_Shopify-graphql_query-1781261132100.txt",
    "C:/Users/marce/.claude/projects/c--Users-marce-Desktop-claude-comn-ctar/e16117c7-9cc0-49b9-9bfb-b766f84239ba/tool-results/mcp-claude_ai_Shopify-graphql_query-1781261152340.txt",
]

# Ordered list: (handle, country, region, grape, alc)
WINE_ORDER = [
    ("vinho-tinto-vik-2021-vina-vik", "Chile", "Colchagua Valley", "Cab. Sauvignon, Carmenere", "14.5"),
    ("vinho-tinto-barolo-monvigliero-2018-castello-di-verduno", "Italia", "Barolo DOCG, Verduno", "Nebbiolo", "14.5"),
    ("vinho-tinto-promis-2021-camarcanda-gaja", "Italia", "Toscana IGT, Bolgheri", "Merlot, Syrah, Montepulciano", "14.5"),
    ("vinho-tinto-barbaresco-rabaja-2021-giuseppe-cortese", "Italia", "Barbaresco DOCG, Rabaja", "Nebbiolo", "14.5"),
    ("vinho-tinto-pommard-2022-albert-bichot", "Franca", "Borgonha, Pommard AOC", "Pinot Noir", "13"),
    ("vinho-tinto-brunello-di-montalcino-2020-caprili", "Italia", "Brunello di Montalcino DOCG", "Sangiovese Grosso", "14.5"),
    ("vinho-tinto-amarone-della-valpoliccella-classico-docg-2022-sensi", "Italia", "Amarone della Valpolicella DOCG", "Corvina, Corvinone, Rondinella", "15"),
    ("vinho-tinto-chateauneuf-du-pape-2021-urbain-v", "Franca", "Chateauneuf-du-Pape AOC, Rhone", "Grenache, Syrah, Mourvedre", "15"),
    ("vinho-tinto-barbaresco-2021-castello-di-verduno", "Italia", "Barbaresco DOCG, Piemonte", "Nebbiolo", "14.5"),
    ("vinho-tinto-la-piu-belle-2021-vina-vik", "Chile", "Colchagua Valley", "Cab. Sauvignon, Carmenere", "14"),
    ("vinho-tinto-cartuxa-reserva-2018-cartuxa", "Portugal", "Alentejo, Evora", "Aragonez, Alicante Bouschet", "14"),
    ("vinho-tinto-le-volte-dellornellaia-2022-ornellaia", "Italia", "Toscana IGT, Bolgheri", "Merlot, Sangiovese, Cab. Sauvignon", "13.5"),
    ("vinho-tinto-mirto-2018-ramon-bilbao", "Espanha", "Rioja DOCa", "Tempranillo", "14.5"),
    ("vinho-tinto-marques-de-murrieta-reserva-2021-marques-de-murrieta", "Espanha", "Rioja DOCa, Ygay", "Tempranillo, Garnacha, Mazuelo", "13.5"),
    ("vinho-tinto-tempo-de-angelus-2023-angelus", "Franca", "Saint-Emilion, Bordeaux", "Merlot, Cabernet Franc", "13.5"),
    ("vinho-tinto-aamarone-satinato-2021-montresor", "Italia", "Amarone della Valpolicella DOC", "Corvina, Corvinone, Rondinella", "15"),
    ("vinho-tinto-barolo-2021-silvio-grasso", "Italia", "Barolo DOCG, La Morra", "Nebbiolo", "14"),
    ("vinho-tinto-il-gentile-di-casanova-igt-prugnolo-2016-la-spinetta", "Italia", "Toscana IGT, Montepulciano", "Prugnolo Gentile (Sangiovese)", "14"),
    ("vinho-tinto-extreme-vineyard-suelo-invertido-tannat-2021-familia-deicas", "Uruguai", "Canelones, Atlantico", "Tannat", "14"),
    ("vinho-tinto-basadone-2023-castello-di-verduno", "Italia", "Langhe DOC, Piemonte", "Pelaverga Piccolo", "13.5"),
    ("vinho-tinto-chianti-classico-2021-perano", "Italia", "Chianti Classico DOCG, Toscana", "Sangiovese", "13.5"),
    ("vinho-tinto-villa-pattono-monferrato-2016-ratti", "Italia", "Monferrato DOC, Piemonte", "Barbera, Cab. Sauvignon, Merlot", "14.5"),
    ("vinho-tinto-barbera-dasti-battaglione-2023-ratti", "Italia", "Barbera d'Asti DOCG, Piemonte", "Barbera", "13.5"),
    ("vinho-tinto-capisme-e-langhe-nebbiolo-2023-domenico-clerico", "Italia", "Langhe Nebbiolo DOC, Barolo", "Nebbiolo", "13.5"),
]

all_products = []
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    all_products.extend(data['data']['products']['edges'])

handle_map = {}
for p in all_products:
    node = p['node']
    handle_map[node['handle']] = node

# page 4 inline (villa pattono monferrato 2016)
handle_map['vinho-tinto-villa-pattono-monferrato-2016-ratti'] = {
    'handle': 'vinho-tinto-villa-pattono-monferrato-2016-ratti',
    'title': 'Vinho Tinto Villa Pattono Monferrato 2016 - Ratti',
    'priceRangeV2': {'maxVariantPrice': {'amount': '369.0'}},
    'totalInventory': 12,
    'featuredMedia': {'preview': {'image': {'url': 'https://cdn.shopify.com/s/files/1/0802/2114/3297/files/d9b24b8166731d95d4a66e17324bd9ab.jpg'}}},
}

wines_data = []
for (handle, country, region, grape, alc) in WINE_ORDER:
    if handle not in handle_map:
        print(f"NOT FOUND: {handle}")
        continue
    node = handle_map[handle]
    max_price = float(node['priceRangeV2']['maxVariantPrice']['amount'])
    discounted = round(max_price * 0.8)
    img_url = ''
    if node.get('featuredMedia') and node['featuredMedia'].get('preview'):
        img_url = node['featuredMedia']['preview']['image']['url']
    wines_data.append({
        'handle': handle,
        'title': node['title'],
        'max_price': int(max_price),
        'discounted': discounted,
        'stock': node['totalInventory'],
        'img_url': img_url,
        'country': country,
        'region': region,
        'grape': grape,
        'alc': alc,
    })
    print(f"  OK {node['title'][:50]:50} {country:10} R${discounted}")

out_path = "C:/Users/marce/Desktop/claude comnéctar/wines_catalog.json"
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(wines_data, f, ensure_ascii=False, indent=2)
print(f"\nTotal: {len(wines_data)} vinhos salvos.")
