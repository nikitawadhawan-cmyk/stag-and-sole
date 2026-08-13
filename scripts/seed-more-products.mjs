// Create the rest of the design's catalog: 10 more products with Color x Size
// matrices, color-accurate variant images (repo photos + local recolors),
// lifestyle media, inventory, and Online Store publication.
import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const RECOLORS = "/private/tmp/claude-501/-Users-nikita-Desktop-Claude-AI-Shopify-Themes/24223c71-fef2-476d-abe8-4abb8e16cfd7/scratchpad/recolors";
const IMG = "https://eclecticdigital.github.io/stag-and-sole/images";
const env = Object.fromEntries(
  readFileSync(join(root, ".env"), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const STORE = env.SHOPIFY_STORE;
const API = `https://${STORE}/admin/api/2025-07/graphql.json`;
const LOCATION = "gid://shopify/Location/89905135765";
const ONLINE_STORE = "gid://shopify/Publication/228662149269";
const SIZES = ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

// media entries: repo file (string) or { local } for a recolor upload.
// colors map color name -> media index in the media list.
const PRODUCTS = [
  {
    title: "The Marlow Derby", type: "Dress Shoes", price: "209.00", compareAt: "259.00", sku: "MAR-DER",
    tags: ["dummy-data", "dress shoes", "Bestseller"],
    description: "The derby you reach for five days a week. Full-grain calf leather that develops a patina instead of cracking, on a stitched rubber sole tuned for standing days.",
    media: ["p-1.jpg", { local: "derby-black.jpg" }, { local: "derby-green.jpg" }, "cat-formal.jpg", "hero.jpg", "v-1.jpg"],
    colors: { "Chestnut": 0, "Black": 1, "Green": 2 },
  },
  {
    title: "Halden Low Sneaker", type: "Sneakers", price: "149.00", compareAt: "179.00", sku: "HAL-SNK",
    tags: ["dummy-data", "sneakers"],
    description: "Milled leather on a rubber cup sole. Clean enough for the office, soft enough for the weekend.",
    media: ["p-2.jpg", { local: "sneaker-green.jpg" }, "cat-sneaker.jpg", "v-2.jpg"],
    colors: { "Ivory": 0, "Sage": 1 },
  },
  {
    title: "Ashe Penny Loafer", type: "Loafers", price: "165.00", compareAt: null, sku: "ASH-LOA",
    tags: ["dummy-data", "loafers", "Bestseller"],
    description: "Tobacco suede with a full leather lining. Made to be worn sockless with linen, or with a suit when the invitation says so.",
    media: ["p-3.jpg", { local: "loafer-black.jpg" }, { local: "loafer-green.jpg" }, "cat-loafer.jpg", "ugc-3.jpg", "v-3.jpg"],
    colors: { "Tobacco": 0, "Black": 1, "Green": 2 },
  },
  {
    title: "Fenn Chukka Boot", type: "Boots", price: "215.00", compareAt: "249.00", sku: "FEN-CHU",
    tags: ["dummy-data", "boots"],
    description: "Oiled leather on a crepe sole. Two eyelets, no fuss, and better looking at thirty days than on day one.",
    media: ["p-4.jpg", { local: "boot-black.jpg" }, { local: "boot-green.jpg" }, "ugc-5.jpg", "v-4.jpg"],
    colors: { "Oiled Brown": 0, "Black": 1, "Green": 2 },
  },
  {
    title: "The Ridge Monk", type: "Dress Shoes", price: "229.00", compareAt: null, sku: "RID-MON",
    tags: ["dummy-data", "dress shoes"],
    description: "Double strap, hand-burnished espresso leather. The wedding-season workhorse.",
    media: ["n-1.jpg", { local: "oxford-black.jpg" }, { local: "oxford-green.jpg" }, "ugc-4.jpg"],
    colors: { "Espresso": 0, "Black": 1, "Green": 2 },
  },
  {
    title: "Court 01 Sneaker", type: "Sneakers", price: "139.00", compareAt: null, sku: "COU-SNK",
    tags: ["dummy-data", "sneakers"],
    description: "Cream leather on a gum sole. The quiet one in the rotation that ends up worn the most.",
    media: ["n-2.jpg", { local: "runner-grey.jpg" }, { local: "runner-green.jpg" }, "ugc-2.jpg"],
    colors: { "Cream": 0, "Slate Grey": 1, "Green": 2 },
  },
  {
    title: "Sunday Slip-on", type: "Loafers", price: "99.00", compareAt: null, sku: "SUN-SLP",
    tags: ["dummy-data", "loafers"],
    description: "Unlined sand suede for days that start slow. Slips on, wears soft, asks nothing.",
    media: ["n-3.jpg", { local: "slipon-green.jpg" }, "craft.jpg"],
    colors: { "Sand": 0, "Green": 1 },
  },
  {
    title: "The Ashford Oxford", type: "Dress Shoes", price: "239.00", compareAt: "289.00", sku: "ASF-OXF",
    tags: ["dummy-data", "dress shoes"],
    description: "Closed lacing, burnished toe, full-grain calf. The formal pair that outlives the suit it was bought for.",
    media: ["n-1.jpg", { local: "oxford-black.jpg" }, { local: "oxford-green.jpg" }, "cat-formal.jpg"],
    colors: { "Burnished Brown": 0, "Black": 1, "Green": 2 },
  },
  {
    title: "The Camden Boot", type: "Boots", price: "269.00", compareAt: "319.00", sku: "CAM-BOO",
    tags: ["dummy-data", "boots"],
    description: "Full-grain leather boot on a stitched sole, built for winters that are mostly pavement.",
    media: ["p-4.jpg", { local: "boot-black.jpg" }, "ugc-5.jpg"],
    colors: { "Dark Brown": 0, "Black": 1 },
  },
  {
    title: "The Ryde Loafer", type: "Loafers", price: "189.00", compareAt: null, sku: "RYD-LOA",
    tags: ["dummy-data", "loafers"],
    description: "A slimmer last and a lower vamp — the loafer for tapered trousers and long dinners.",
    media: ["p-3.jpg", { local: "loafer-green.jpg" }, "cat-loafer.jpg"],
    colors: { "Suede Tan": 0, "Green": 1 },
  },
];

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
    { input: [{ filename: basename(filePath), mimeType: "image/jpeg", httpMethod: "POST", resource: "IMAGE" }] }
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

for (const p of PRODUCTS) {
  const colorNames = Object.keys(p.colors);

  // 1. Create the product with its full variant matrix.
  const variants = [];
  for (const color of colorNames) {
    for (const size of SIZES) {
      variants.push({
        optionValues: [
          { optionName: "Color", name: color },
          { optionName: "Size", name: size },
        ],
        price: p.price,
        compareAtPrice: p.compareAt,
        sku: `${p.sku}-${color.replace(/\s+/g, "").toUpperCase().slice(0, 3)}-${size.replace("UK ", "")}`,
        inventoryItem: { tracked: true },
        inventoryQuantities: [{ locationId: LOCATION, name: "available", quantity: 12 }],
      });
    }
  }

  const set = await gql(
    `mutation($input: ProductSetInput!) {
      productSet(input: $input, synchronous: true) {
        product { id title }
        userErrors { field message }
      }
    }`,
    {
      input: {
        title: p.title,
        status: "ACTIVE",
        vendor: "Stag and Sole",
        productType: p.type,
        tags: p.tags,
        descriptionHtml: `<p>${p.description}</p>`,
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
    console.error(`FAILED ${p.title}: ${JSON.stringify(setErrs)}`);
    continue;
  }
  const productId = set.productSet.product.id;

  // 2. Attach media in order (color shots first, then lifestyle).
  const mediaInputs = [];
  for (const [i, entry] of p.media.entries()) {
    const source = typeof entry === "string" ? `${IMG}/${entry}` : await stageUpload(join(RECOLORS, entry.local));
    const colorForIndex = colorNames.find((c) => p.colors[c] === i);
    mediaInputs.push({
      originalSource: source,
      alt: colorForIndex ? `${p.title} in ${colorForIndex}` : p.title,
      mediaContentType: "IMAGE",
    });
  }
  const created = await gql(
    `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id }
        mediaUserErrors { field message }
      }
    }`,
    { productId, media: mediaInputs }
  );
  const mediaErrs = created.productCreateMedia.mediaUserErrors;
  if (mediaErrs.length) {
    console.error(`  media errors ${p.title}: ${JSON.stringify(mediaErrs)}`);
    continue;
  }
  const mediaIds = created.productCreateMedia.media.map((m) => m.id);

  // 3. Point each color's variants at its image.
  const detail = await gql(
    `query($id: ID!) { product(id: $id) { variants(first: 30) { nodes { id selectedOptions { name value } } } } }`,
    { id: productId }
  );
  const updates = detail.product.variants.nodes
    .map((v) => {
      const color = v.selectedOptions.find((o) => o.name === "Color")?.value;
      const idx = p.colors[color];
      return idx !== undefined ? { id: v.id, mediaId: mediaIds[idx] } : null;
    })
    .filter(Boolean);
  const upd = await gql(
    `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { field message }
      }
    }`,
    { productId, variants: updates }
  );
  const updErrs = upd.productVariantsBulkUpdate.userErrors;
  if (updErrs.length) console.error(`  variant media errors ${p.title}: ${JSON.stringify(updErrs)}`);

  // 4. Publish to the Online Store.
  const pub = await gql(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) { userErrors { field message } }
    }`,
    { id: productId, input: [{ publicationId: ONLINE_STORE }] }
  );
  const pubErrs = pub.publishablePublish.userErrors;

  console.log(`OK ${p.title}: ${colorNames.length} colors × ${SIZES.length} sizes, ${mediaIds.length} images${pubErrs.length ? " PUBLISH ERRORS: " + JSON.stringify(pubErrs) : ", published"}`);
}
console.log("Done.");
