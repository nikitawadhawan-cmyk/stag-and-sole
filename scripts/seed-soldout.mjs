// Zero out inventory on a few color/size combinations so sold-out states
// are visible in the size pills and size chart.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env"), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const STORE = env.SHOPIFY_STORE;
const API = `https://${STORE}/admin/api/2025-07/graphql.json`;
const LOCATION = "gid://shopify/Location/89905135765";

const SOLD_OUT = {
  "Antler Derby Shoe": [["Black", "UK 7"], ["Black", "UK 11"], ["Green", "UK 10"]],
  "Monarch Leather Loafer": [["Black", "UK 11"]],
  "Highland Chelsea Boot": [["Black", "UK 9"], ["Dark Brown", "UK 11"]],
  "Stag Classic Oxford": [["Green", "UK 11"]],
  "Summit Runner": [["Slate Grey", "UK 7"]],
};

const tokenRes = await fetch(`https://${STORE}/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grant_type: "client_credentials",
    client_id: env.SHOPIFY_CLIENT_ID,
    client_secret: env.SHOPIFY_CLIENT_SECRET,
  }),
});
const { access_token: token } = await tokenRes.json();
if (!token) throw new Error("Token exchange failed");

async function gql(query, variables) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const { products } = await gql(
  `{ products(first: 20, query: "tag:dummy-data") {
    nodes { id title variants(first: 30) { nodes { id inventoryItem { id } selectedOptions { name value } } } }
  } }`
);

const quantities = [];
for (const product of products.nodes) {
  const combos = SOLD_OUT[product.title];
  if (!combos) continue;
  for (const variant of product.variants.nodes) {
    const color = variant.selectedOptions.find((o) => o.name === "Color")?.value;
    const size = variant.selectedOptions.find((o) => o.name === "Size")?.value;
    if (combos.some(([c, s]) => c === color && s === size)) {
      quantities.push({ inventoryItemId: variant.inventoryItem.id, locationId: LOCATION, quantity: 0 });
      console.log(`Sold out: ${product.title} — ${color} / ${size}`);
    }
  }
}

const result = await gql(
  `mutation($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      userErrors { field message }
    }
  }`,
  { input: { reason: "correction", name: "available", ignoreCompareQuantity: true, quantities } }
);
const errs = result.inventorySetQuantities.userErrors;
console.log(errs.length ? "ERRORS: " + JSON.stringify(errs) : `Done — ${quantities.length} variants set to 0.`);
