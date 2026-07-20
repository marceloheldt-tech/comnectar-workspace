const https = require('https');
const fs = require('fs');

const envText = fs.readFileSync('../.env', 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const SHOP = process.env.SHOPIFY_SHOP_DOMAIN;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

const handles = [
  'vinho-tinto-tempo-de-angelus-2023-angelus',
  'vinho-tinto-sul-vulcano-etna-2021-donnafugata',
  'vinho-tinto-private-selection-red-2021-robert-mondavi',
  'vinho-tinto-louis-jadot-beaujolais-villages-gamay-2023-louis-jadot',
];

function fetchProduct(handle) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SHOP,
      path: `/admin/api/2024-10/products.json?handle=${handle}&fields=id,title,handle,images`,
      method: 'GET',
      headers: { 'X-Shopify-Access-Token': TOKEN },
      rejectUnauthorized: false,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  const results = {};
  for (const h of handles) {
    const body = await fetchProduct(h);
    const p = body.products && body.products[0];
    results[h] = p ? (p.images[0] && p.images[0].src) : null;
    console.log(h, '->', results[h]);
  }
  fs.writeFileSync('kit3-images.json', JSON.stringify(results, null, 2));
})();
