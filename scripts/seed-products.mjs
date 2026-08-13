// Seed dummy products into the Shopify store using the Admin GraphQL API.
// Reads credentials from ../.env and exchanges them for a fresh access token
// (client-credentials tokens expire every 24h, so we never store the token).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const STORE = env.SHOPIFY_STORE;
const API = `https://${STORE}/admin/api/2025-07/graphql.json`;
const ONLINE_STORE_PUBLICATION = "gid://shopify/Publication/228662149269";
const LOCATION = "gid://shopify/Location/89905135765";
const SIZES = ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

const PRODUCTS = [
  { title: "Monarch Leather Loafer", type: "Loafers", color: "Cognac", price: "189.00", compareAt: "229.00", sku: "MON-LOA", seed: "monarch" },
  { title: "Highland Chelsea Boot", type: "Boots", color: "Dark Brown", price: "249.00", compareAt: "299.00", sku: "HIG-CHE", seed: "highland" },
  { title: "Fawn Suede Sneaker", type: "Sneakers", color: "Off-White", price: "159.00", compareAt: null, sku: "FAW-SNK", seed: "fawn" },
  { title: "Antler Derby Shoe", type: "Dress Shoes", color: "Black", price: "199.00", compareAt: "239.00", sku: "ANT-DER", seed: "antler" },
  { title: "Trailhead Hiker Boot", type: "Boots", color: "Walnut", price: "279.00", compareAt: null, sku: "TRA-HIK", seed: "trailhead" },
  { title: "Stag Classic Oxford", type: "Dress Shoes", color: "Oxblood", price: "219.00", compareAt: "259.00", sku: "STA-OXF", seed: "oxford" },
  { title: "Meadow Canvas Slip-On", type: "Sneakers", color: "Sage", price: "89.00", compareAt: null, sku: "MEA-SLP", seed: "meadow" },
  { title: "Summit Runner", type: "Sneakers", color: "Slate Grey", price: "139.00", compareAt: "169.00", sku: "SUM-RUN", seed: "summit" },
];

async function getToken() {
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function gql(token, query, variables) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const PRODUCT_SET = `
mutation productSet($input: ProductSetInput!) {
  productSet(input: $input, synchronous: true) {
    product { id handle title }
    userErrors { field message }
  }
}`;

const PUBLISH = `
mutation publish($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    userErrors { field message }
  }
}`;

const token = await getToken();
console.log("Token acquired.");

for (const p of PRODUCTS) {
  const input = {
    title: p.title,
    status: "ACTIVE",
    vendor: "Stag and Sole",
    productType: p.type,
    tags: ["dummy-data", p.type.toLowerCase()],
    descriptionHtml: `<p>The ${p.title} in ${p.color}. Placeholder product for theme development — crafted from full-grain nonsense and artisan lorem ipsum.</p>`,
    productOptions: [{ name: "Size", position: 1, values: SIZES.map((s) => ({ name: s })) }],
    files: [{
      originalSource: `https://picsum.photos/seed/${p.seed}/1000/1000.jpg`,
      alt: `${p.title} — ${p.color}`,
      contentType: "IMAGE",
    }],
    variants: SIZES.map((size, i) => ({
      optionValues: [{ optionName: "Size", name: size }],
      price: p.price,
      compareAtPrice: p.compareAt,
      sku: `${p.sku}-${size.replace("UK ", "")}`,
      inventoryItem: { tracked: true },
      inventoryQuantities: [{ locationId: LOCATION, name: "available", quantity: 20 - i * 2 }],
    })),
  };

  const data = await gql(token, PRODUCT_SET, { input });
  const { product, userErrors } = data.productSet;
  if (userErrors.length) {
    console.error(`FAILED ${p.title}:`, JSON.stringify(userErrors));
    continue;
  }

  const pub = await gql(token, PUBLISH, {
    id: product.id,
    input: [{ publicationId: ONLINE_STORE_PUBLICATION }],
  });
  const pubErrors = pub.publishablePublish.userErrors;
  console.log(`OK ${product.title} (${product.handle})${pubErrors.length ? " — publish errors: " + JSON.stringify(pubErrors) : " — published"}`);
}
console.log("Done.");
