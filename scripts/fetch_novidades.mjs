import fs from 'fs';
import https from 'https';

// Load .env manually
const envRaw = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const env = {};
for (const line of envRaw.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const SHOP = env.SHOPIFY_SHOP_DOMAIN;
const TOKEN = env.SHOPIFY_ADMIN_TOKEN;

if (!SHOP || !TOKEN) {
  console.error('Missing SHOPIFY_SHOP_DOMAIN or SHOPIFY_ADMIN_TOKEN');
  process.exit(1);
}

const sinceDate = new Date();
sinceDate.setDate(sinceDate.getDate() - 60);
const sinceISO = sinceDate.toISOString();

const query = `
query getNewProducts($query: String!, $cursor: String) {
  products(first: 50, query: $query, after: $cursor, sortKey: CREATED_AT, reverse: true) {
    edges {
      cursor
      node {
        id
        title
        createdAt
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

async function fetchAll() {
  let cursor = null;
  let all = [];
  let hasNext = true;
  while (hasNext) {
    const body = JSON.stringify({
      query,
      variables: { query: `created_at:>='${sinceISO}' AND status:active`, cursor }
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

const products = await fetchAll();
console.log(`Encontrados ${products.length} produtos criados desde ${sinceISO.slice(0, 10)}`);
fs.writeFileSync(
  new URL('./novidades_60dias.json', import.meta.url),
  JSON.stringify(products, null, 2)
);
console.log('Salvo em scripts/novidades_60dias.json');
