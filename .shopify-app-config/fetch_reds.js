const https = require('https');
const fs = require('fs');

const envText = fs.readFileSync('../.env', 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const SHOP = process.env.SHOPIFY_SHOP_DOMAIN;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

function fetchPage(pageInfo) {
  return new Promise((resolve, reject) => {
    let path = `/admin/api/2024-10/products.json?limit=250&fields=id,title,handle,vendor,tags,variants,images`;
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

  const reds = all.filter((p) => /tinto/i.test(p.title));
  const simplified = reds.map((p) => ({
    title: p.title,
    handle: p.handle,
    vendor: p.vendor,
    tags: p.tags,
    price: p.variants[0]?.price,
    inventory_quantity: p.variants.reduce((s, v) => s + (v.inventory_quantity || 0), 0),
  }));
  fs.writeFileSync('reds.json', JSON.stringify(simplified, null, 2));
  console.log('Total products:', all.length, '| Reds:', reds.length);
})();
