// Create the collections the homepage needs: category collections by product
// type, a tag-driven Bestsellers collection, and a manual "New in" collection.
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

const token = await getToken();

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

// 1. Find seeded products
const { products } = await gql(`{ products(first: 20, query: "tag:dummy-data") { nodes { id title productType tags } } }`);
const byTitle = Object.fromEntries(products.nodes.map((p) => [p.title, p]));
console.log(`Found ${products.nodes.length} products.`);

// 2. Tag bestsellers
const BESTSELLERS = ["Monarch Leather Loafer", "Highland Chelsea Boot", "Fawn Suede Sneaker", "Stag Classic Oxford"];
for (const title of BESTSELLERS) {
  const p = byTitle[title];
  if (!p || p.tags.includes("Bestseller")) continue;
  const tags = [...p.tags, "Bestseller"];
  const d = await gql(
    `mutation($input: ProductUpdateInput!) { productUpdate(product: $input) { userErrors { field message } } }`,
    { input: { id: p.id, tags } }
  );
  const errs = d.productUpdate.userErrors;
  console.log(`Tagged ${title}${errs.length ? " ERRORS: " + JSON.stringify(errs) : ""}`);
}

// 3. Create collections
const COLLECTION_CREATE = `
mutation($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection { id handle title }
    userErrors { field message }
  }
}`;

const smart = (title, column, condition, sortOrder) => ({
  title,
  sortOrder: sortOrder || "BEST_SELLING",
  ruleSet: { appliedDisjunctively: false, rules: [{ column, relation: "EQUALS", condition }] },
});

const NEW_IN = ["Meadow Canvas Slip-On", "Summit Runner", "Fawn Suede Sneaker"];

const specs = [
  smart("Sneakers", "TYPE", "Sneakers"),
  smart("Boots", "TYPE", "Boots"),
  smart("Loafers", "TYPE", "Loafers"),
  smart("Formal shoes", "TYPE", "Dress Shoes"),
  smart("Bestsellers", "TAG", "Bestseller"),
  {
    title: "New in",
    sortOrder: "MANUAL",
    products: NEW_IN.map((t) => byTitle[t]?.id).filter(Boolean),
  },
];

for (const spec of specs) {
  const d = await gql(COLLECTION_CREATE, { input: spec });
  const { collection, userErrors } = d.collectionCreate;
  if (userErrors.length) {
    console.log(`FAILED ${spec.title}: ${JSON.stringify(userErrors)}`);
    continue;
  }
  const pub = await gql(
    `mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
    { id: collection.id, input: [{ publicationId: ONLINE_STORE_PUBLICATION }] }
  );
  const pubErrs = pub.publishablePublish.userErrors;
  console.log(`OK ${collection.title} (${collection.handle})${pubErrs.length ? " publish errors: " + JSON.stringify(pubErrs) : " — published"}`);
}
console.log("Done.");
