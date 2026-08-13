// Upload recolored shoe images (black/green/grey versions), rebuild each
// product's Color x Size matrix, and point every color variant at a
// color-accurate image.
import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const RECOLORS = "/private/tmp/claude-501/-Users-nikita-Desktop-Claude-AI-Shopify-Themes/24223c71-fef2-476d-abe8-4abb8e16cfd7/scratchpad/recolors";
const env = Object.fromEntries(
  readFileSync(join(root, ".env"), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const STORE = env.SHOPIFY_STORE;
const API = `https://${STORE}/admin/api/2025-07/graphql.json`;
const LOCATION = "gid://shopify/Location/89905135765";
const SIZES = ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

// colors: name -> { file } for a new recolored image, or { existing: 0 } for
// the product's current first media.
const PLAN = {
  "Antler Derby Shoe": {
    price: "199.00", compareAt: "239.00", sku: "ANT-DER",
    colors: {
      "Black": { file: "derby-black.jpg" },
      "Chestnut": { existing: 0 },
      "Green": { file: "derby-green.jpg" },
    },
  },
  "Monarch Leather Loafer": {
    price: "189.00", compareAt: "229.00", sku: "MON-LOA",
    colors: {
      "Cognac": { existing: 0 },
      "Black": { file: "loafer-black.jpg" },
      "Green": { file: "loafer-green.jpg" },
    },
  },
  "Highland Chelsea Boot": {
    price: "249.00", compareAt: "299.00", sku: "HIG-CHE",
    colors: {
      "Dark Brown": { existing: 0 },
      "Black": { file: "boot-black.jpg" },
      "Green": { file: "boot-green.jpg" },
    },
  },
  "Stag Classic Oxford": {
    price: "219.00", compareAt: "259.00", sku: "STA-OXF",
    colors: {
      "Oxblood": { existing: 0 },
      "Black": { file: "oxford-black.jpg" },
      "Green": { file: "oxford-green.jpg" },
    },
  },
  "Trailhead Hiker Boot": {
    price: "279.00", compareAt: null, sku: "TRA-HIK",
    colors: {
      "Walnut": { existing: 0 },
      "Black": { file: "boot-black.jpg" },
      "Green": { file: "boot-green.jpg" },
    },
  },
  "Meadow Canvas Slip-On": {
    price: "89.00", compareAt: null, sku: "MEA-SLP",
    colors: {
      "Sand": { existing: 0 },
      "Green": { file: "slipon-green.jpg" },
    },
  },
  "Summit Runner": {
    price: "139.00", compareAt: "169.00", sku: "SUM-RUN",
    colors: {
      "Cream": { existing: 0 },
      "Slate Grey": { file: "runner-grey.jpg" },
      "Green": { file: "runner-green.jpg" },
    },
  },
  "Fawn Suede Sneaker": {
    price: "159.00", compareAt: null, sku: "FAW-SNK",
    colors: {
      "Off-White": { existing: 0 },
      "Sage": { file: "sneaker-green.jpg" },
    },
  },
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

async function stageUpload(filePath) {
  const staged = await gql(
    `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {
      input: [{ filename: basename(filePath), mimeType: "image/jpeg", httpMethod: "POST", resource: "IMAGE" }],
    }
  );
  const errs = staged.stagedUploadsCreate.userErrors;
  if (errs.length) throw new Error("stagedUploadsCreate: " + JSON.stringify(errs));
  const target = staged.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append("file", new Blob([readFileSync(filePath)], { type: "image/jpeg" }), basename(filePath));
  const res = await fetch(target.url, { method: "POST", body: form });
  if (!res.ok && res.status !== 201) throw new Error(`upload failed: ${res.status}`);
  return target.resourceUrl;
}

const { products } = await gql(
  `{ products(first: 20, query: "tag:dummy-data") { nodes { id title media(first: 12) { nodes { id } } } } }`
);

for (const product of products.nodes) {
  const plan = PLAN[product.title];
  if (!plan) continue;
  const colorNames = Object.keys(plan.colors);

  // 1. Upload and attach new color images; record media id per color.
  const colorMedia = {};
  for (const [color, spec] of Object.entries(plan.colors)) {
    if (spec.existing !== undefined) {
      colorMedia[color] = product.media.nodes[spec.existing].id;
      continue;
    }
    const resourceUrl = await stageUpload(join(RECOLORS, spec.file));
    const created = await gql(
      `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media { id }
          mediaUserErrors { field message }
        }
      }`,
      {
        productId: product.id,
        media: [{ originalSource: resourceUrl, alt: `${product.title} in ${color}`, mediaContentType: "IMAGE" }],
      }
    );
    const errs = created.productCreateMedia.mediaUserErrors;
    if (errs.length) {
      console.error(`  media error ${product.title}/${color}: ${JSON.stringify(errs)}`);
      continue;
    }
    colorMedia[color] = created.productCreateMedia.media[0].id;
  }

  // 2. Rebuild variant matrix with the (possibly new) color list.
  const variants = [];
  for (const color of colorNames) {
    for (const size of SIZES) {
      variants.push({
        optionValues: [
          { optionName: "Color", name: color },
          { optionName: "Size", name: size },
        ],
        price: plan.price,
        compareAtPrice: plan.compareAt,
        sku: `${plan.sku}-${color.replace(/\s+/g, "").toUpperCase().slice(0, 3)}-${size.replace("UK ", "")}`,
        inventoryItem: { tracked: true },
        inventoryQuantities: [{ locationId: LOCATION, name: "available", quantity: 10 }],
      });
    }
  }
  const set = await gql(
    `mutation($input: ProductSetInput!) {
      productSet(input: $input, synchronous: true) {
        userErrors { field message }
      }
    }`,
    {
      input: {
        id: product.id,
        productOptions: [
          { name: "Color", position: 1, values: colorNames.map((name) => ({ name })) },
          { name: "Size", position: 2, values: SIZES.map((name) => ({ name })) },
        ],
        variants,
      },
    }
  );
  const setErrs = set.productSet.userErrors;
  if (setErrs.length) {
    console.error(`FAILED variants ${product.title}: ${JSON.stringify(setErrs)}`);
    continue;
  }

  // 3. Point each color's variants at its image.
  const detail = await gql(
    `query($id: ID!) {
      product(id: $id) { variants(first: 30) { nodes { id selectedOptions { name value } } } }
    }`,
    { id: product.id }
  );
  const updates = detail.product.variants.nodes
    .map((v) => {
      const color = v.selectedOptions.find((o) => o.name === "Color")?.value;
      return colorMedia[color] ? { id: v.id, mediaId: colorMedia[color] } : null;
    })
    .filter(Boolean);
  const upd = await gql(
    `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { field message }
      }
    }`,
    { productId: product.id, variants: updates }
  );
  const updErrs = upd.productVariantsBulkUpdate.userErrors;
  if (updErrs.length) console.error(`  variant media errors ${product.title}: ${JSON.stringify(updErrs)}`);

  console.log(`OK ${product.title}: colors [${colorNames.join(", ")}] — ${variants.length} variants, color images linked`);
}
console.log("Done.");
