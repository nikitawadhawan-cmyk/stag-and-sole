// Replace the picsum placeholder images on the seeded products with the
// brand's leather-shoe photography from the design repo (GitHub Pages).
// Adds 2-3 angles per product (gallery + hover), then removes old media.
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

const PLAN = {
  "Antler Derby Shoe": [
    { file: "p-1.jpg", alt: "Antler Derby Shoe — side profile in full-grain calf leather" },
    { file: "cat-formal.jpg", alt: "Antler Derby Shoe worn with tailored charcoal trousers" },
    { file: "ugc-1.jpg", alt: "Antler Derby Shoe under a cafe table" },
  ],
  "Fawn Suede Sneaker": [
    { file: "p-2.jpg", alt: "Fawn Suede Sneaker — side profile on rubber cup sole" },
    { file: "cat-sneaker.jpg", alt: "Fawn Suede Sneaker worn with cuffed chinos" },
    { file: "ugc-2.jpg", alt: "Fawn Suede Sneaker resting on a scooter footboard" },
  ],
  "Monarch Leather Loafer": [
    { file: "p-3.jpg", alt: "Monarch Leather Loafer — tobacco suede side profile" },
    { file: "cat-loafer.jpg", alt: "Monarch Leather Loafer worn sockless with linen trousers" },
    { file: "ugc-3.jpg", alt: "Monarch Leather Loafer with rolled chinos on a park bench" },
  ],
  "Highland Chelsea Boot": [
    { file: "p-4.jpg", alt: "Highland Chelsea Boot — oiled leather side profile" },
    { file: "ugc-5.jpg", alt: "Highland Chelsea Boot by the front door" },
  ],
  "Stag Classic Oxford": [
    { file: "n-1.jpg", alt: "Stag Classic Oxford — hand-burnished leather" },
    { file: "ugc-4.jpg", alt: "Stag Classic Oxford in an open shoebox" },
  ],
  "Trailhead Hiker Boot": [
    { file: "ugc-5.jpg", alt: "Trailhead Hiker Boot by the front door" },
    { file: "p-4.jpg", alt: "Trailhead Hiker Boot — oiled leather on crepe sole" },
  ],
  "Meadow Canvas Slip-On": [
    { file: "n-3.jpg", alt: "Meadow Canvas Slip-On — unlined sand suede" },
    { file: "craft.jpg", alt: "Meadow Canvas Slip-On — stitched by hand in the workshop" },
  ],
  "Summit Runner": [
    { file: "n-2.jpg", alt: "Summit Runner — cream leather on gum sole" },
    { file: "cat-sneaker.jpg", alt: "Summit Runner on a sunlit sidewalk" },
  ],
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
  `{ products(first: 20, query: "tag:dummy-data") { nodes { id title media(first: 10) { nodes { id } } } } }`
);

for (const product of products.nodes) {
  const plan = PLAN[product.title];
  if (!plan) {
    console.log(`SKIP ${product.title} (no plan)`);
    continue;
  }

  const created = await gql(
    `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id }
        mediaUserErrors { field message }
      }
    }`,
    {
      productId: product.id,
      media: plan.map((m) => ({
        originalSource: `${IMG}/${m.file}`,
        alt: m.alt,
        mediaContentType: "IMAGE",
      })),
    }
  );
  const errs = created.productCreateMedia.mediaUserErrors;
  if (errs.length) {
    console.error(`FAILED ${product.title}: ${JSON.stringify(errs)}`);
    continue;
  }

  const oldIds = product.media.nodes.map((m) => m.id);
  if (oldIds.length) {
    const del = await gql(
      `mutation($productId: ID!, $mediaIds: [ID!]!) {
        productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
          deletedMediaIds
          mediaUserErrors { field message }
        }
      }`,
      { productId: product.id, mediaIds: oldIds }
    );
    const delErrs = del.productDeleteMedia.mediaUserErrors;
    if (delErrs.length) console.error(`  delete old: ${JSON.stringify(delErrs)}`);
  }

  console.log(`OK ${product.title}: +${plan.length} images, -${oldIds.length} old`);
}
console.log("Done.");
