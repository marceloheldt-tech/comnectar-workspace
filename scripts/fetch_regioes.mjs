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
query getProducts($cursor: String) {
  products(first: 100, after: $cursor, query: "status:active") {
    edges {
      cursor
      node {
        id
        title
        metafields(first: 20, namespace: "custom") {
          edges { node { key value } }
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
    const body = JSON.stringify({ query, variables: { cursor } });
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
    all = all.concat(edges.map((e) => {
      const node = e.node;
      const mf = {};
      for (const mfe of node.metafields.edges) {
        mf[mfe.node.key] = mfe.node.value;
      }
      return { id: node.id, title: node.title, ...mf };
    }));
    hasNext = result.data.products.pageInfo.hasNextPage;
    if (hasNext) cursor = edges[edges.length - 1].cursor;
  }
  return all;
}

const products = await fetchAll();
console.log(`Encontrados ${products.length} produtos ativos`);
fs.writeFileSync(
  new URL('./produtos_regioes.json', import.meta.url),
  JSON.stringify(products, null, 2)
);
console.log('Salvo em scripts/produtos_regioes.json');
