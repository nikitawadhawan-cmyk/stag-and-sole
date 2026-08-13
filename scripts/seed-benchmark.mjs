// Seed the Lighthouse benchmark store (benchmark.env) with Shopify's
// official theme-store testing dataset CSV, plus one "Shop all" collection.
// Variants are untracked (no read_locations scope needed); images come from
// Shopify's public CDN URLs in the CSV.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV_PATH = process.argv[2];
if (!CSV_PATH) throw new Error("usage: node seed-benchmark.mjs <csv path>");

const env = Object.fromEntries(
  readFileSync(join(root, "benchmark.env"), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const STORE = env.SHOPIFY_STORE;
const API = `https://${STORE}/admin/api/2025-07/graphql.json`;

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

// --- minimal CSV parser (handles quoted fields with commas/newlines) ---
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); if (row.some((f) => f !== "")) rows.push(row); }
  const header = rows.shift();
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const rows = parseCsv(readFileSync(CSV_PATH, "utf8"));

// --- group by handle ---
const products = new Map();
for (const r of rows) {
  const handle = r["Handle"];
  if (!products.has(handle)) products.set(handle, { first: r, variants: [], images: [] });
  const p = products.get(handle);
  if (r["Option1 Value"]) p.variants.push(r);
  if (r["Image Src"]) p.images.push(r);
}

const pubs = await gql(`{ publications(first: 10) { nodes { id name } } }`);
const onlineStore = pubs.publications.nodes.find((p) => /online store/i.test(p.name))?.id;
console.log("Online Store publication:", onlineStore);

const created = [];
for (const [handle, p] of products) {
  const f = p.first;
  const optionNames = ["Option1 Name", "Option2 Name", "Option3 Name"]
    .map((k) => f[k]).filter((n) => n && n !== "Title");
  const hasRealOptions = optionNames.length > 0;

  const seenCombos = new Set();
  const variants = [];
  for (const v of p.variants) {
    const values = ["Option1 Value", "Option2 Value", "Option3 Value"].slice(0, hasRealOptions ? optionNames.length : 1).map((k) => v[k]);
    const key = values.join("||");
    if (seenCombos.has(key)) continue;
    seenCombos.add(key);
    variants.push({
      optionValues: hasRealOptions
        ? optionNames.map((name, i) => ({ optionName: name, name: values[i] || "Default" }))
        : [{ optionName: "Title", name: "Default Title" }],
      price: v["Variant Price"] || "0",
      compareAtPrice: v["Variant Compare At Price"] || null,
      sku: v["Variant SKU"] || null,
      inventoryItem: { tracked: false },
      inventoryPolicy: "CONTINUE",
    });
  }
  if (variants.length === 0) {
    variants.push({
      optionValues: [{ optionName: "Title", name: "Default Title" }],
      price: "0",
      inventoryItem: { tracked: false },
      inventoryPolicy: "CONTINUE",
    });
  }

  const optionValuesByName = hasRealOptions
    ? optionNames.map((name, idx) => ({
        name,
        position: idx + 1,
        values: [...new Set(variants.map((v) => v.optionValues[idx].name))].map((n) => ({ name: n })),
      }))
    : [{ name: "Title", position: 1, values: [{ name: "Default Title" }] }];

  const set = await gql(
    `mutation($input: ProductSetInput!) {
      productSet(input: $input, synchronous: true) {
        product { id handle }
        userErrors { field message }
      }
    }`,
    {
      input: {
        handle,
        title: f["Title"] || handle,
        status: "ACTIVE",
        vendor: f["Vendor"] || null,
        productType: f["Custom Product Type"] || null,
        tags: (f["Tags"] || "").split(",").map((t) => t.trim()).filter(Boolean),
        descriptionHtml: f["Body (HTML)"] || "",
        giftCard: /true/i.test(f["Gift Card"] || ""),
        productOptions: optionValuesByName,
        variants,
      },
    }
  );
  if (set.productSet.userErrors.length) {
    console.error(`FAILED ${handle}:`, JSON.stringify(set.productSet.userErrors).slice(0, 300));
    continue;
  }
  const productId = set.productSet.product.id;

  const media = p.images
    .sort((a, b) => Number(a["Image Position"] || 0) - Number(b["Image Position"] || 0))
    .map((r) => ({
      originalSource: r["Image Src"],
      alt: r["Image Alt Text"] || f["Title"],
      mediaContentType: "IMAGE",
    }));
  if (media.length) {
    const m = await gql(
      `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media { id }
          mediaUserErrors { field message }
        }
      }`,
      { productId, media }
    );
    if (m.productCreateMedia.mediaUserErrors.length)
      console.error(`  media errors ${handle}:`, JSON.stringify(m.productCreateMedia.mediaUserErrors).slice(0, 200));
  }

  if (onlineStore) {
    await gql(
      `mutation($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) { userErrors { field message } }
      }`,
      { id: productId, input: [{ publicationId: onlineStore }] }
    );
  }
  created.push(productId);
  console.log(`OK ${handle}: ${variants.length} variants, ${media.length} images`);
}

// --- one collection holding everything, for the collection-page test ---
const col = await gql(
  `mutation($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }`,
  { input: { title: "Shop all", products: created } }
);
if (col.collectionCreate.userErrors.length) {
  console.error("collection errors:", JSON.stringify(col.collectionCreate.userErrors));
} else if (onlineStore) {
  await gql(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) { userErrors { field message } }
    }`,
    { id: col.collectionCreate.collection.id, input: [{ publicationId: onlineStore }] }
  );
  console.log("Collection shop-all created + published");
}
console.log(`Done: ${created.length}/${products.size} products.`);
