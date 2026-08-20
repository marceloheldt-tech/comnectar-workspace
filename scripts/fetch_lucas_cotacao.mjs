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

if (!SHOP || !TOKEN) {
  console.error('Missing SHOPIFY_SHOP_DOMAIN or SHOPIFY_ADMIN_TOKEN');
  process.exit(1);
}

const query = `
query getProducts($query: String!, $cursor: String) {
  products(first: 100, query: $query, after: $cursor) {
    edges {
      cursor
      node {
        id
        title
        description
        status
        images(first: 1) { edges { node { url } } }
        priceRangeV2 { minVariantPrice { amount currencyCode } }
        variants(first: 1) {
          edges { node { availableForSale price inventoryQuantity } }
        }
      }
    }
    pageInfo { hasNextPage }
  }
}`;

async function fetchPage(searchQuery, cursor) {
  const body = JSON.stringify({ query, variables: { query: searchQuery, cursor } });
  return new Promise((resolve, reject) => {
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
}

async function fetchAll(searchQuery) {
  let cursor = null;
  let all = [];
  let hasNext = true;
  while (hasNext) {
    const result = await fetchPage(searchQuery, cursor);
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

// Tintos, status ativo, faixa de preço R$199-R$957
const searchQuery = "status:active AND price:>=190 AND price:<=970";
const products = await fetchAll(searchQuery);
console.log(`Encontrados ${products.length} produtos tintos na faixa de preço`);
fs.writeFileSync(
  new URL('./lucas_cotacao_raw.json', import.meta.url),
  JSON.stringify(products, null, 2)
);
console.log('Salvo em scripts/lucas_cotacao_raw.json');
