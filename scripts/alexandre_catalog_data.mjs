// Curated wine data extracted from alexandre_merged.json descriptions.
// Each entry: idx, displayName (Nome Safra — Produtor), pais, regiao, uva, teor, priceFull, priceFinal, imageUrl, slug, flag, guessed (array of field names that were guessed/fallback)

export const flags = {
  IT: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDkyNDYiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2NlMmIzNyIvPjwvc3ZnPg==',
  FR: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDIzOTUiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2VkMjkzOSIvPjwvc3ZnPg==',
  DE: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxyZWN0IHdpZHRoPSI1IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz48cmVjdCB5PSIxIiB3aWR0aD0iNSIgaGVpZ2h0PSIxIiBmaWxsPSIjREQwMDAwIi8+PHJlY3QgeT0iMiIgd2lkdGg9IjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGQ0UwMCIvPjwvc3ZnPg==',
  AR: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjAuNjY3IiBmaWxsPSIjNzRBQ0RGIi8+PHJlY3QgeT0iMC42NjciIHdpZHRoPSIzIiBoZWlnaHQ9IjAuNjY2IiBmaWxsPSIjZmZmIi8+PHJlY3QgeT0iMS4zMzMiIHdpZHRoPSIzIiBoZWlnaHQ9IjAuNjY3IiBmaWxsPSIjNzRBQ0RGIi8+PC9zdmc+',
  ES: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjAuNSIgZmlsbD0iI2M2MGIxZSIvPjxyZWN0IHk9IjAuNSIgd2lkdGg9IjMiIGhlaWdodD0iMSIgZmlsbD0iI2ZmYzQwMCIvPjxyZWN0IHk9IjEuNSIgd2lkdGg9IjMiIGhlaWdodD0iMC41IiBmaWxsPSIjYzYwYjFlIi8+PC9zdmc+',
  PT: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMiIGZpbGw9IiMwMDY2MDAiLz48cmVjdCB4PSIyIiB3aWR0aD0iMyIgaGVpZ2h0PSIzIiBmaWxsPSIjRkYwMDAwIi8+PC9zdmc+',
  CL: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIxIiB3aWR0aD0iMyIgaGVpZ2h0PSIxIiBmaWxsPSIjRDUyQjFFIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMzA4NyIvPjwvc3ZnPg==',
  UY: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIwLjIyMiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIwLjY2NiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIxLjExMSIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIxLjU1NiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48L3N2Zz4=',
  ZA: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDdBNEQiLz48cmVjdCB5PSIwLjY2NyIgd2lkdGg9IjMiIGhlaWdodD0iMC42NjYiIGZpbGw9IiNmZmYiLz48cG9seWdvbiBwb2ludHM9IjAsMCAxLDEgMCwyIiBmaWxsPSIjMDAwIi8+PHBvbHlnb24gcG9pbnRzPSIwLDAuMiAwLjgsMSAwLDEuOCIgZmlsbD0iI0ZGQjYxMiIvPjwvc3ZnPg==',
};

function slugify(s) {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['"´`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// raw: [displayName, producer-name-for-slug-source(title), pais, regiao, uva, teor, guessed[], imageUrl, priceFull, priceFinal]
const raw = [
["Col Di Bacche Morellino Di Scansano DOCG 2023 — Col Di Bacche","IT","Toscana (Maremma) · Morellino di Scansano DOCG","Sangiovese (Morellino)","13,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/09d0250d34b82da930f0380f08441707.jpg?v=1772474417",259,207],
["Rosso Di Caparsa IGT 2020 — Caparsa","IT","Toscana (Radda in Chianti) · IGT","Sangiovese","13,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/300da48d49a4f185c905605d5a22685e.jpg?v=1772475234",259,207],
["Beaujolais Villages Gamay 2024 — Louis Jadot","FR","Beaujolais · Beaujolais-Villages AOC","Gamay","13%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/0617b39c79b8b3dd6ab02ca94e7cf474.jpg?v=1772475420",259,207],
["Dolcetto D'Alba Campot 2023 — Castello di Verduno","IT","Piemonte (Barbaresco) · Dolcetto d'Alba DOC","Dolcetto","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/81825d405079a52c1ca0a5cfc1b3cd00.jpg?v=1784921282",269,215],
["Prugnolo Rosso Di Montepulciano 2023 — Boscarelli","IT","Toscana (Montepulciano) · DOC","90% Sangiovese (Prugnolo Gentile), 10% Mammolo","13%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/adbe786bcda3a768433947944289ca46.jpg?v=1772474674",279,223],
["Langhe Nebbiolo 2021 — Fontanafredda","IT","Piemonte (Langhe) · DOC","Nebbiolo","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/ae5a4230b6e2194c182a4c196f9f72cd.jpg?v=1784922390",279,223],
["Langhe Nebbiolo 2023 — Castello Di Verduno","IT","Piemonte (Verduno, Langhe) · DOC","Nebbiolo","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/3dadf911bc29dd2e604f5f245121666a.jpg?v=1772474249",289,231],
["Langhe Nebbiolo 2024 — Mario Costa","IT","Piemonte (Roero, Langhe) · DOC","Nebbiolo","14,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/a454d590739502c93f53c3c34c7ae4cc.jpg?v=1772474759",289,231],
["Colombe Langhe Dolcetto 2023 — Ratti","IT","Piemonte (Colombé, Langhe) · DOC","Dolcetto","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/98cc2ff88f46fa358ee0f8034a05894c.jpg?v=1772475106",299,239],
["Etna 2023 — Alta Mora","IT","Sicília (Etna) · DOC","Nerello Mascalese","13%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/b9735f88673f9e6184056eb80efe10e7.jpg?v=1780689324",299,239],
["Campo Sassi Rosso 2023 — Frescobaldi","IT","Toscana (Montalcino) · Rosso di Montalcino DOC","Sangiovese","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/be49e95d2faa8bb77a19443fdc798ab6.jpg?v=1785763903",299,239],
["Pequeñas Producciones Malbec 2021 — Escorihuela Gascón","AR","Mendoza (Luján de Cuyo e Valle de Uco)","Malbec","14%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/cf2f8ae5f9a05fc92472991daf77551a.jpg?v=1772475680",309,247],
["Barbera D'Alba DOC Vignota 2022 — Conterno Fantino","IT","Piemonte (Monforte d'Alba) · DOC","Barbera","14,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/cfb835922bb70ac7e792efc8f5a92500.jpg?v=1772475192",319,255],
["Capisme-e Langhe Nebbiolo 2023 — Domenico Clerico","IT","Piemonte (Monforte d'Alba, Langhe) · DOC","Nebbiolo","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/68bc4d7ac3dc2a221d66e5df0f6e7b05.jpg?v=1772475302",319,255],
["Milla Cala 2021 — Viña Vik","CL","Valle de Millahue (Cachapoal)","60% Cabernet Sauvignon, 25% Carménère, 10% Merlot, 5% Cabernet Franc","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/112026a0f2089b2dd96f533224e5f05a.jpg?v=1772475725",339,271],
["Milla Cala 2022 — Viña Vik","CL","Valle de Millahue (Cachapoal)","60% Cabernet Sauvignon, 25% Carménère, 10% Merlot, 5% Cabernet Franc","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/112026a0f2089b2dd96f533224e5f05a_3c3a4d2d-e9e3-4532-806f-1a38ce6c25ff.jpg?v=1784916086",339,271],
["Bakkanali K 2023 — Bakkanali","IT","Toscana (Monte Amiata, Poggioferro) · IGT","Sangiovese","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/396946aed72851c558309202e630be68.jpg?v=1784921683",339,271],
["Barolo 2020 — Roversi","IT","Piemonte (Langhe) · Barolo DOCG","Nebbiolo","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/0331db51f7e33d1d0556aab1a7d7c7f7.jpg?v=1772474316",349,279],
["Origines Pinot Noir 2023 — Albert Bichot","FR","Borgonha (Côte de Beaune/Nuits) · Bourgogne AOC","Pinot Noir","13%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/e49fe0190bcb9ea9f64e5b4b828aea58.jpg?v=1772474350",349,279],
["Langhe DOC Nebbiolo Angelo 2022 — Mauro Veglio","IT","Piemonte (La Morra, Langhe) · DOC","Nebbiolo","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/be3ccf65a24d0ffad2b3a16e0c96da5f.jpg?v=1772475209",349,279],
["Rosso \"Attenti Al Lupo\" IGT Sangiovese 2022 — Podere Le Ripi","IT","Toscana (Montalcino) · IGT","Sangiovese","13%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/fbaad16b45c914c7304dc420c30326ff.jpg?v=1772475285",349,279],
["Langhe Nebbiolo 2023 — Elio Altare","IT","Piemonte (La Morra, Monforte) · DOC","Nebbiolo","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/7395abe96a4ded85cade7fe6823cb32a.jpg?v=1772474588",359,287],
["Barbera Dasti Battaglione 2023 — Ratti","IT","Piemonte · Barbera d'Asti DOC","Barbera","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/9cfb5c262d96b2d133c3fbe8e2447471.jpg?v=1772474895",359,287],
["Barbera Dasti Battaglione 2019 — Ratti","IT","Piemonte · Barbera d'Asti DOC","Barbera","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/a5745ef833237cadef636d4128827fa3.jpg?v=1772475156",359,287],
["Barbera D'Alba Punta 2020 — Azelia","IT","Piemonte (Castiglione Falletto, Barolo) · DOC","Barbera","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/157e23808f45d23968e44f2ff6e6721e.jpg?v=1772475217",359,287],
["Garzon Single Vineyard Tannat 2023 — Bodega Garzón","UY","Maldonado","Tannat","14%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/354479ea33afcb333e871786f6cb1946.jpg?v=1780006202",359,287],
["Chianti Classico 2021 — Perano","IT","Toscana (Gaiole in Chianti) · Chianti Classico DOCG","Sangiovese","13,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/090e3bd43adf2595993625878814f4a3.jpg?v=1772474341",369,295],
["Barbera D'Alba Zio Nando 2021 — Rivetto","IT","Piemonte · Barbera d'Alba DOC","Barbera","14,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/264fd39ffb815d1f3239f4ea95b22fa9.jpg?v=1772475183",369,295],
["Barbera D'Alba DOC Superiore 2021 — Scarzello","IT","Piemonte (Barolo — Sarmassa/Vigna Merenda) · DOC","Barbera","14,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/86e6d28609c62201df9d8f550f6d58ce.jpg?v=1772475243",369,295],
["Villa Pattono Monferrato 2016 — Ratti","IT","Piemonte (Costigliole d'Asti) · Monferrato DOC","Barbera, Cabernet Sauvignon e Merlot","14,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/d9b24b8166731d95d4a66e17324bd9ab.jpg?v=1773075804",369,295],
["Beaune 2023 — Albert Bichot","FR","Borgonha (Côte de Beaune) · Beaune AOC","Pinot Noir","12,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/7b933b262dd13ba97c0253de075c5e36.jpg?v=1785764566",369,295],
["Esprit de Pavie 2018 — Chateau Pavie","FR","Bordeaux (Saint-Émilion/Castillon-Côtes de Bordeaux) · AOC","65% Merlot, 20% Cabernet Franc, 15% Cabernet Sauvignon","14,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/ed0e874bd7c0223138af3caa3908a396.jpg?v=1772474615",389,311],
["Chianti Classico DOCG Sangiovese 2020 — Caparsa","IT","Toscana (Radda in Chianti) · Chianti Classico DOCG","Sangiovese","13,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/3b9b19c09a33c19591bb79b2aa98e3fc.jpg?v=1772475327",389,311],
["Marquesa Alorna 2019 — Quinta da Alorna","PT","Tejo","Touriga Nacional, Tinta Roriz/Aragonez e Cabernet Sauvignon","13,5%",["teor","uva-composicao"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/6c6963896ebec054466dc5b7928cebfb.jpg?v=1772474409",399,319],
["Bourgogne Couvent Des Jacobins Pinot Noir 2022 — Louis Jadot","FR","Borgonha (Côte de Nuits e Hautes Côtes) · Bourgogne AOC","Pinot Noir","12,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/36e12900a654cf8417ce6b557b448597.jpg?v=1772475445",399,319],
["Basadone 2023 — Castello Di Verduno","IT","Piemonte (Verduno) · Verduno Pelaverga Piccolo DOC","Pelaverga Piccolo","13,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/650a699b995d28f169b96362aa188a23.jpg?v=1773247726",399,319],
["Extreme Vineyard Suelo Invertido Tannat 2021 — Familia Deicas","UY","Canelones (Progreso)","Tannat","14%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/4acdac020d1400f0c8fdda4c9882ffdd.jpg?v=1780939016",399,319],
["Langhe Nebbiolo Fralu 2023 — Bruno Rocca","IT","Piemonte (Barbaresco/Neive) · DOC","Nebbiolo","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/aede04837f68b158cc260f187bcffd43.jpg?v=1786731025",399,319],
["Firagnetti Langhe Nebbiolo 2023 — Bovio","IT","Piemonte (La Morra) · DOC","Nebbiolo","15%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/450a2dfd657d00952bf5462c8adace81.jpg?v=1787054657",399,319],
["Il Gentile Di Casanova IGT Prugnolo 2016 — La Spinetta","IT","Toscana (Montepulciano) · IGT","Prugnolo Gentile (Sangiovese)","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/dc23d272a540f3f93dc1e2cf5cc994a7.jpg?v=1772475148",419,335],
["Nebbiolo D'Alba DOC Bernardina Nebbiolo 2021 — Ceretto","IT","Piemonte (Alba) · DOC","Nebbiolo","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/de410877117211d570983d2dd3c81748.jpg?v=1772475335",419,335],
["Barolo 2021 — Silvio Grasso","IT","Piemonte (La Morra, Langhe) · Barolo DOCG","Nebbiolo","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/7650eeaaf38fb35c0201130c5a6440c1.jpg?v=1772474258",429,343],
["Tempo de Angelus 2023 — Angelus","FR","Bordeaux (Saint-Émilion) · AOC","90% Merlot, 10% Cabernet Franc","13%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/9307af1d45a7b94d5b8c5f7d32991554.jpg?v=1772474921",429,343],
["Pinot Nero 2021 — Franz Haas","IT","Trentino-Alto Ádige","Pinot Nero","13,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/104830b625bb54e0ea3550029f4e3b92.jpg?v=1772475268",429,343],
["Ginestrino Langhe Nebbiolo 2023 — Conterno Fantino","IT","Piemonte (Monforte d'Alba) · DOC","Nebbiolo","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/8b555a28a637dc12f2506d28926f1ab9.jpg?v=1772474474",439,351],
["Roquette & Cazes Douro 2022 — Roquette & Cazes","PT","Douro · DOC","Touriga Nacional, Touriga Franca e Tinta Roriz","14,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/a14d82cbe22f9d8e990443a3dee4fa65.jpg?v=1772474579",439,351],
["Preludio Barrel Select 2019 — Familia Deicas","UY","Canelones","Blend: Merlot, Tannat, Cabernet Sauvignon e outras","13,5%",["teor","regiao"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/2d787859628820781a419e7875a1485f.jpg?v=1772475623",439,351],
["Crozes Hermitage 2021 — E. Guigal","FR","Vale do Ródano (Norte) · Crozes-Hermitage AOC","Syrah","13,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/c8ba2b6eee71454a463b1f87c45aa0f5.jpg?v=1773749255",439,351],
["Lucente 2023 — Tenute Luce","IT","Toscana (Montalcino) · IGT","Sangiovese e Merlot","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/cdbea8ab4fedb5ce8ca260ac3b74443e.jpg?v=1772474333",459,367],
["Sul Vulcano Etna 2021 — Donnafugata","IT","Sicília (Etna) · DOC","Nerello Mascalese","13%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/92c1573aab5f0096afa543ae76171f5e.jpg?v=1780690330",459,367],
["Vino Nobile Di Montepulciano DOCG 2021 — Boscarelli","IT","Toscana (Montepulciano) · DOCG","85% Sangiovese (Prugnolo Gentile), 15% Canaiolo, Colorino e Mammolo","13,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/095ceb4befc8344e084195b7c83d0719.jpg?v=1772474666",469,375],
["Cascinotto D'Alba Nebbiolo 2022 — Claudio Alario","IT","Piemonte (Diano d'Alba) · DOC","Nebbiolo","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/5d058846a7fec877b420f3fec0101160_1a922394-0cea-44e1-9a63-177a702d7bc4.jpg?v=1776103964",479,383],
["Le Haut Medoc 2018 — Chateau Giscours","FR","Bordeaux (Haut-Médoc) · AOC","50% Cabernet Sauvignon, 50% Merlot","13%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/0bc938513963f321551799b9e4311b14.jpg?v=1779736019",479,383],
["Giuletta Langhe Rosso 2023 — Olek Bondonio","IT","Piemonte (Barbaresco) · Langhe Rosso DOC","Pelaverga","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/22d6d8459858305648bed35bcd2c7148.jpg?v=1781618717",479,383],
["Villa Pattono Barbera D'Asti 2022 — Ratti","IT","Piemonte (Costigliole d'Asti) · Barbera d'Asti DOC","Barbera","14%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/bca72db631175cce991ea704f2804902.jpg?v=1772475090",489,391],
["Mirea Primitivo di Manduria DOP 2023 — Masseria Borgo dei Trulli","IT","Puglia (Manduria) · DOP","Primitivo","14,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/a0cd480eaa55e3dc39479a4c37573632.jpg?v=1772475489",489,391],
["Mercurey 2022 — Albert Bichot","FR","Borgonha (Côte Chalonnaise) · Mercurey AOC","Pinot Noir","12,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/cf0dfeaf3a1b8a04dc4e97ac299f25b8.jpg?v=1785764218",489,391],
["Amarone Satinato 2021 — Montresor","IT","Vêneto (Valpolicella) · Amarone DOCG","70% Corvina, 20% Rondinella, 10% Molinara","15%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/4ce4aee0977aeed122e6ba69ec7632e4.jpg?v=1772474325",499,399],
["Marqués de Murrieta Reserva 2021 — Marqués de Murrieta","ES","Rioja (Finca Ygay) · DOCa","Tempranillo, Graciano, Mazuelo e Garnacha","14%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/7fd8ce0b9f3e8f05e3f0750fda007843.jpg?v=1772474562",499,399],
["Mirto 2018 — Ramon Bilbao","ES","Rioja Alta (Alavesa) · DOCa","Tempranillo","14,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/c2890ccaa3552e54fa4c9736f917d1e0.jpg?v=1775570994",499,399],
["Chapelle 2016 — Potensac","FR","Bordeaux (Médoc) · AOC","Merlot, Cabernet Sauvignon e Cabernet Franc","13%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/fotoprodutoshopifynovo_05a6015d-a5a6-4d7c-bb00-16b2dc62c203.jpg?v=1786716887",499,399],
["Delon Médoc 2014 — Chateau Potensac","FR","Bordeaux (Médoc, Saint-Germain-d'Estèuil) · AOC","Merlot, Cabernet Sauvignon, Cabernet Franc e Petit Verdot","13%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/52b498b98b238d828e32a9b26a4472fb.jpg?v=1782850143",499,399],
["Aloxe Corton 2022 — Albert Bichot","FR","Borgonha (Côte de Beaune) · Aloxe-Corton AOC","Pinot Noir","12,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/305d48454cd18ddbdcd3eca607a7892b.jpg?v=1785764861",499,399],
["Rosso 2023 — Bakkanali","IT","Toscana (Seggiano, Monte Amiata) · IGT","Sangiovese","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/7860a7628f62a4179546290602143169.jpg?v=1777052588",519,415],
["Le Volte Dell'Ornellaia 2022 — Ornellaia","IT","Toscana · IGT","Merlot, Cabernet Sauvignon e Sangiovese","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/86f77ae7ed30e95de3a213314141ef3b.jpg?v=1772475699",529,423],
["Sierra de Las Palmas Pinot Noir 2021 — Vinos de Mar","UY","Maldonado","Pinot Noir","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/96281dc009caab9d037d8b345318ad14.jpg?v=1772475663",549,439],
["Langhe Nebbiolo DOC Reggimento 2020 — Ratti","IT","Piemonte (La Morra, Langhe) · DOC","Nebbiolo","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/0716ad4dcf4824ed032167be966e5fb1.jpg?v=1772475174",559,447],
["La Piu Belle 2022 — Viña Vik","CL","Valle de Millahue","68% Carménère, 23% Cabernet Sauvignon, 9% Cabernet Franc","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/ead3eda40a76f4a392fde2f009f5943a.jpg?v=1772474274",579,463],
["Etna Rosso 2022 — Tenuta Delle Terre Nere","IT","Sicília (Etna) · DOC","Nerello Mascalese e Nerello Cappuccio","13%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/303a24a16996a6a0bad266ab42fc17ba.jpg?v=1776276682",579,463],
["Barbaresco 2021 — Giuseppe Cortese","IT","Piemonte (Rabajà, Barbaresco) · DOCG","Nebbiolo","14,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/3dc62d5727e8d1b4103c5f5ff9ac4423.jpg?v=1773319885",589,471],
["Petit Clos Block 487 Marselan 2020 — Bodega Garzón","UY","Maldonado","Marselan","14%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/5d1325d2bd480f58ed852c7fcc2d0a68.jpg?v=1780010340",589,471],
["Cartuxa Reserva 2018 — Cartuxa","PT","Alentejo (Évora) · DOP","Touriga Nacional, Aragonez e outras castas","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/d60394f4c0dac94b202abd378643ee16.jpg?v=1772474266",599,479],
["Capitel Amarone 2016 — Montresor","IT","Vêneto (Valpolicella) · Amarone DOCG","60% Corvina, 30% Rondinella, 5% Molinara, 5% Oseleta","15,5%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/5c9327b15154c776f641f3578857b643.jpg?v=1772474308",599,479],
["Alto do Joa 2017 — Casa do Joa","PT","Trás-os-Montes","Blend raro de +20 castas portuguesas antigas","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/0d836276fe973f87da2c4c33f6c05570.jpg?v=1772475377",599,479],
["Petit Clos Pinot Noir 2023 — Bodega Garzón","UY","Maldonado","Pinot Noir","13,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/79c6280efcd8adfa6adf4b126ae51520.jpg?v=1783968092",599,479],
["Langhe Rosso Monprá 2022 — Conterno Fantino","IT","Piemonte (Monforte d'Alba) · Langhe Rosso DOC","Nebbiolo e Barbera","14%",[], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/5491f2177ce7f88222c2e51f03c7a9b9.jpg?v=1787051077",599,479],
["Protos Reserva 5º Año Tempranillo 2018 — Protos","ES","Ribera del Duero (Peñafiel) · DO","Tempranillo","14,5%",["teor"], "https://cdn.shopify.com/s/files/1/0802/2114/3297/files/5eeb846dd644634da994b40531d17152_6731fc97-ba95-48df-b43b-6f4622ae94b8.jpg?v=1772475629",619,495],
];

export const paisNome = { IT: 'Itália', FR: 'França', DE: 'Alemanha', AR: 'Argentina', ES: 'Espanha', PT: 'Portugal', CL: 'Chile', UY: 'Uruguai', ZA: 'África do Sul' };

export const wines = raw.map((r, i) => {
  const [displayName, paisSigla, regiao, uva, teor, guessed, imageUrl, priceFull, priceFinal] = r;
  const slug = slugify(displayName.replace('—', '-'));
  return {
    idx: i + 1,
    displayName,
    pais: paisNome[paisSigla],
    paisSigla,
    regiao,
    uva,
    teor,
    guessed,
    imageUrl,
    priceFull,
    priceFinal,
    slug,
  };
});
