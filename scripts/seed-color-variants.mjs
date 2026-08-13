// Expand each seeded product to a Color × Size variant matrix, add extra
// lifestyle images, and assign a variant image per color so color selection
// switches the gallery.
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
const IMG = "https://eclecticdigital.github.io/stag-and-sole/images";
const LOCATION = "gid://shopify/Location/89905135765";
const SIZES = ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

// colors: [name, mediaIndex] — mediaIndex refers to the product's media order
// AFTER extraImages are appended.
const PLAN = {
  "Monarch Leather Loafer": {
    price: "189.00", compareAt: "229.00", sku: "MON-LOA",
    colors: [["Cognac", 0], ["Black", 1]],
    extraImages: [{ file: "v-3.jpg", alt: "Monarch Leather Loafer styled with linen, no socks" }],
  },
  "Highland Chelsea Boot": {
    price: "249.00", compareAt: "299.00", sku: "HIG-CHE",
    colors: [["Dark Brown", 0], ["Black", 1]],
    extraImages: [{ file: "v-4.jpg", alt: "Highland Chelsea Boot after 30 days of wear" }],
  },
  "Fawn Suede Sneaker": {
    price: "159.00", compareAt: null, sku: "FAW-SNK",
    colors: [["Off-White", 0], ["Sage", 1]],
    extraImages: [{ file: "v-2.jpg", alt: "Fawn Suede Sneaker unboxing, day one" }],
  },
  "Antler Derby Shoe": {
    price: "199.00", compareAt: "239.00", sku: "ANT-DER",
    colors: [["Black", 0], ["Chestnut", 1]],
    extraImages: [
      { file: "v-1.jpg", alt: "Antler Derby Shoe styled three ways on a street corner" },
      { file: "hero.jpg", alt: "Antler Derby Shoe mid-stride on a city street" },
    ],
  },
  "Trailhead Hiker Boot": {
    price: "279.00", compareAt: null, sku: "TRA-HIK",
    colors: [["Walnut", 0], ["Black", 1]],
    extraImages: [],
  },
  "Stag Classic Oxford": {
    price: "219.00", compareAt: "259.00", sku: "STA-OXF",
    colors: [["Oxblood", 0], ["Black", 1]],
    extraImages: [],
  },
  "Meadow Canvas Slip-On": {
    price: "89.00", compareAt: null, sku: "MEA-SLP",
    colors: [["Sage", 0], ["Sand", 1]],
    extraImages: [],
  },
  "Summit Runner": {
    price: "139.00", compareAt: "169.00", sku: "SUM-RUN",
    colors: [["Slate Grey", 0], ["Cream", 1]],
    extraImages: [],
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

const { products } = await gql(`{ products(first: 20, query: "tag:dummy-data") { nodes { id title } } }`);

for (const product of products.nodes) {
  const plan = PLAN[product.title];
  if (!plan) continue;

  // 1. Append extra lifestyle images
  if (plan.extraImages.length) {
    const created = await gql(
      `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media { id }
          mediaUserErrors { field message }
        }
      }`,
      {
        productId: product.id,
        media: plan.extraImages.map((m) => ({
          originalSource: `${IMG}/${m.file}`,
          alt: m.alt,
          mediaContentType: "IMAGE",
        })),
      }
    );
    const errs = created.productCreateMedia.mediaUserErrors;
    if (errs.length) console.error(`  media errors ${product.title}: ${JSON.stringify(errs)}`);
  }

  // 2. Rebuild the variant matrix: Color x Size
  const variants = [];
  for (const [color] of plan.colors) {
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
        product { id }
        userErrors { field message }
      }
    }`,
    {
      input: {
        id: product.id,
        productOptions: [
          { name: "Color", position: 1, values: plan.colors.map(([name]) => ({ name })) },
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

  // 3. Assign a variant image per color
  const detail = await gql(
    `query($id: ID!) {
      product(id: $id) {
        media(first: 12) { nodes { id } }
        variants(first: 30) { nodes { id selectedOptions { name value } } }
      }
    }`,
    { id: product.id }
  );
  const mediaIds = detail.product.media.nodes.map((m) => m.id);
  const colorToMedia = Object.fromEntries(
    plan.colors.map(([name, mediaIndex]) => [name, mediaIds[Math.min(mediaIndex, mediaIds.length - 1)]])
  );
  const updates = detail.product.variants.nodes
    .map((v) => {
      const color = v.selectedOptions.find((o) => o.name === "Color")?.value;
      const mediaId = colorToMedia[color];
      return mediaId ? { id: v.id, mediaId } : null;
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

  console.log(`OK ${product.title}: ${plan.colors.length} colors × ${SIZES.length} sizes = ${variants.length} variants, ${mediaIds.length} images`);
}
console.log("Done.");
