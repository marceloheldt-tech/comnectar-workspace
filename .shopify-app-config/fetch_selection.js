const https = require('https');
const fs = require('fs');

const envText = fs.readFileSync('../.env', 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const SHOP = process.env.SHOPIFY_SHOP_DOMAIN;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

const WANTED_HANDLES = [
  'vinho-tinto-poggio-badiola-2022-mazzei',
  'vinho-tinto-cotes-du-rhone-2022-e-guigal',
  'vinho-tinto-louis-jadot-beaujolais-villages-gamay-2023-louis-jadot',
  'vinho-tinto-langhe-dolcetto-2023-giuseppe-cortese',
  'vinho-tinto-langhe-nebbiolo-2023-mario-costa',
  'vinho-tinto-capisme-e-langhe-nebbiolo-2023-domenico-clerico',
  'vinho-tinto-mirea-primitivo-di-manduria-dop-2023-masseria-borgo-dei-trulli',
  'vinho-tinto-mirto-2018-ramon-bilbao',
  'vinho-tinto-crozes-hermitage-2021-e-guigal',
  'vinho-tinto-le-volte-dellornellaia-2022-ornellaia',
  'vinho-tinto-roquette-cazes-douro-2022-roquette-cazes',
  'vinho-tinto-chianti-classico-2021-perano',
];

function fetchPage(pageInfo) {
  return new Promise((resolve, reject) => {
    let path = `/admin/api/2024-10/products.json?limit=250&fields=id,title,handle,vendor,body_html,variants,images`;
    if (pageInfo) path += `&page_info=${pageInfo}`;
    const options = {
      hostname: SHOP,
      path,
      method: 'GET',
      headers: { 'X-Shopify-Access-Token': TOKEN },
      rejectUnauthorized: false,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const link = res.headers['link'];
        let next = null;
        if (link) {
          const m = link.match(/<[^>]*page_info=([^&>]*)[^>]*>;\s*rel="next"/);
          if (m) next = m[1];
        }
        resolve({ body: JSON.parse(data), next });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  let all = [];
  let pageInfo = null;
  do {
    const { body, next } = await fetchPage(pageInfo);
    all = all.concat(body.products || []);
    pageInfo = next;
  } while (pageInfo);

  const wanted = new Set(WANTED_HANDLES);
  const found = all.filter((p) => wanted.has(p.handle));

  const simplified = found.map((p) => ({
    title: p.title,
    handle: p.handle,
    vendor: p.vendor,
    body_html: p.body_html,
    price: p.variants[0]?.price,
    inventory_quantity: p.variants.reduce((s, v) => s + (v.inventory_quantity || 0), 0),
    image: p.images && p.images[0] ? p.images[0].src : null,
  }));

  fs.writeFileSync('selection.json', JSON.stringify(simplified, null, 2));
  console.log('Found:', found.length, 'of', WANTED_HANDLES.length);
  const foundHandles = new Set(found.map(p => p.handle));
  WANTED_HANDLES.forEach(h => { if (!foundHandles.has(h)) console.log('MISSING:', h); });
})();
