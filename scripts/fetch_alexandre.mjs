import fs from 'fs';
import https from 'https';

const envRaw = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const env = {};
for (const line of envRaw.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const SHOP = env.SHOPIFY_SHOP_DOMAIN;
const TOKEN = env.SHOPIFY_ADMIN_TOKEN;

const query = `
query getWines($query: String!, $cursor: String) {
  products(first: 50, query: $query, after: $cursor) {
    edges {
      cursor
      node {
        id
        title
        productType
        tags
        description
        status
        featuredImage { url }
        images(first: 1) { edges { node { url } } }
        priceRangeV2 { minVariantPrice { amount currencyCode } }
        variants(first: 1) {
          edges { node { availableForSale price } }
        }
      }
    }
    pageInfo { hasNextPage }
  }
}`;

async function fetchAll(queryString) {
  let cursor = null;
  let all = [];
  let hasNext = true;
  while (hasNext) {
    const body = JSON.stringify({
      query,
      variables: { query: queryString, cursor }
    });

    const result = await new Promise((resolve, reject) => {
      const req = https.request(
        `https://${SHOP}/admin/api/2026-07/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': TOKEN,
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error('Parse error: ' + data));
            }
          });
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    if (result.errors) {
      console.error(JSON.stringify(result.errors, null, 2));
      process.exit(1);
    }

    const edges = result.data.products.edges;
    all = all.concat(edges.map((e) => e.node));
    hasNext = result.data.products.pageInfo.hasNextPage;
    if (hasNext) cursor = edges[edges.length - 1].cursor;
  }
  return all;
}

// Preço final Pix (80% do cheio) entre 200 e 500 -> preço cheio entre 250 e 625
const products = await fetchAll("status:active AND price:>=250 AND price:<=625");
console.log(`Encontrados ${products.length} produtos no range de preço cheio 250-625`);
fs.writeFileSync(
  new URL('./alexandre_range.json', import.meta.url),
  JSON.stringify(products, null, 2)
);
console.log('Salvo em scripts/alexandre_range.json');
