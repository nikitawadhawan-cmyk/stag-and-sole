// Expand the catalog: +10 products per category page (Sneakers, Boots,
// Loafers, Dress Shoes). Reuses imagery already on the Shopify CDN (the
// GitHub Pages source is gone), keyed by base filename via cdn-pool.json
// harvested from the existing dummy-data products. Some products get
// compare-at pricing (feeds the Sale collection) and Bestseller tags; the
// first two of each type are added to the manual New in collection.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const POOL = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "cdn-pool.json"), "utf8")
);
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
const NEW_IN = "gid://shopify/Collection/667442938133"; // resolved at runtime if missing
const SIZES = ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

// media: base filenames resolved through POOL. colors: color -> media index.
const PRODUCTS = [
  // ——— Sneakers (10) ———
  { title: "Ledger Court Sneaker", type: "Sneakers", price: "155.00", compareAt: "185.00", sku: "LED-SNK", tags: ["dummy-data", "sneakers", "Bestseller"], description: "A court profile in milled leather with a wrapped gum sole. Breaks in inside a week and looks better for it.", media: ["p-2.jpg", "sneaker-green.jpg", "cat-sneaker.jpg", "ugc-2.jpg"], colors: { "Ivory": 0, "Sage": 1 } },
  { title: "Milefield Runner", type: "Sneakers", price: "169.00", compareAt: null, sku: "MIL-RUN", tags: ["dummy-data", "sneakers"], description: "A retro runner built on modern cushioning. Suede overlays, mesh underlays, and a midsole that forgives long days.", media: ["runner-grey.jpg", "runner-green.jpg", "n-2.jpg", "v-2.jpg"], colors: { "Slate Grey": 0, "Green": 1, "Cream": 2 } },
  { title: "Alder Low-top", type: "Sneakers", price: "139.00", compareAt: null, sku: "ALD-LOW", tags: ["dummy-data", "sneakers"], description: "The plain white sneaker, done properly: full-grain leather, stitched cupsole, no logos shouting.", media: ["n-2.jpg", "sneaker-green.jpg", "cat-sneaker.jpg"], colors: { "Cream": 0, "Sage": 1 } },
  { title: "Foundry Trainer", type: "Sneakers", price: "149.00", compareAt: "179.00", sku: "FOU-TRN", tags: ["dummy-data", "sneakers"], description: "Workshop-grade leather on a rubber waffle sole. Built like our boots, weighs like a sneaker.", media: ["p-2.jpg", "runner-grey.jpg", "ugc-2.jpg", "v-2.jpg"], colors: { "Ivory": 0, "Slate Grey": 1 } },
  { title: "Vale Slip-on Sneaker", type: "Sneakers", price: "119.00", compareAt: null, sku: "VAL-SLP", tags: ["dummy-data", "sneakers"], description: "Elastic gores, one-piece leather upper, zero laces. The airport shoe that doesn't look like one.", media: ["n-2.jpg", "runner-green.jpg", "cat-sneaker.jpg"], colors: { "Cream": 0, "Green": 1 } },
  { title: "Harrier GT Runner", type: "Sneakers", price: "179.00", compareAt: "209.00", sku: "HAR-RUN", tags: ["dummy-data", "sneakers", "Bestseller"], description: "Our most cushioned last, wrapped in nubuck and recycled mesh. Made for pavement miles.", media: ["runner-green.jpg", "runner-grey.jpg", "v-2.jpg", "ugc-2.jpg"], colors: { "Green": 0, "Slate Grey": 1 } },
  { title: "Beacon Canvas Sneaker", type: "Sneakers", price: "99.00", compareAt: null, sku: "BEA-CNV", tags: ["dummy-data", "sneakers"], description: "Dry-waxed canvas on a vulcanized sole. The summer beater you retire every September and rebuy every May.", media: ["p-2.jpg", "sneaker-green.jpg", "ugc-2.jpg"], colors: { "Ivory": 0, "Sage": 1 } },
  { title: "Kestrel Court Low", type: "Sneakers", price: "159.00", compareAt: null, sku: "KES-CRT", tags: ["dummy-data", "sneakers"], description: "Tennis-court DNA with a tumbled leather upper and a heel tab in contrast suede.", media: ["cat-sneaker.jpg", "sneaker-green.jpg", "n-2.jpg"], colors: { "Ivory": 0, "Green": 1 } },
  { title: "Marsh Trail Runner", type: "Sneakers", price: "189.00", compareAt: "219.00", sku: "MAR-TRL", tags: ["dummy-data", "sneakers"], description: "A lugged outsole and water-resistant suede for towpaths and wet pavements. City-legal, trail-capable.", media: ["runner-grey.jpg", "runner-green.jpg", "ugc-2.jpg"], colors: { "Slate Grey": 0, "Green": 1 } },
  { title: "Pennon Retro Sneaker", type: "Sneakers", price: "129.00", compareAt: null, sku: "PEN-RET", tags: ["dummy-data", "sneakers"], description: "A seventies silhouette in soft nappa with a toothed rubber sole. Wears in, never out.", media: ["v-2.jpg", "sneaker-green.jpg", "p-2.jpg"], colors: { "Cream": 0, "Sage": 1 } },

  // ——— Boots (10) ———
  { title: "Garrick Chelsea Boot", type: "Boots", price: "249.00", compareAt: "289.00", sku: "GAR-CHE", tags: ["dummy-data", "boots", "Bestseller"], description: "Elastic-sided and sharp-toed, in polished calf on a stacked heel. The boot for suits and everything after.", media: ["p-4.jpg", "boot-black.jpg", "boot-green.jpg", "ugc-5.jpg"], colors: { "Oiled Brown": 0, "Black": 1, "Green": 2 } },
  { title: "Tor Hiker Boot", type: "Boots", price: "279.00", compareAt: null, sku: "TOR-HIK", tags: ["dummy-data", "boots"], description: "Padded collar, brass eyelets, commando sole. A proper hiker that doesn't apologize indoors.", media: ["v-4.jpg", "boot-green.jpg", "p-4.jpg"], colors: { "Tan": 0, "Green": 1 } },
  { title: "Winslow Zip Boot", type: "Boots", price: "259.00", compareAt: null, sku: "WIN-ZIP", tags: ["dummy-data", "boots"], description: "Side-zip entry, clean shaft, almond toe. For the days when laces feel like admin.", media: ["boot-black.jpg", "p-4.jpg", "ugc-5.jpg"], colors: { "Black": 0, "Oiled Brown": 1 } },
  { title: "Fell Country Boot", type: "Boots", price: "289.00", compareAt: "339.00", sku: "FEL-CNT", tags: ["dummy-data", "boots"], description: "Waxed grain leather, storm welt, Dainite-style studded sole. Built for weather that has opinions.", media: ["p-4.jpg", "boot-green.jpg", "v-4.jpg"], colors: { "Oiled Brown": 0, "Green": 1 } },
  { title: "Bram Work Boot", type: "Boots", price: "229.00", compareAt: null, sku: "BRA-WRK", tags: ["dummy-data", "boots"], description: "Moc-toe, triple-stitched, on a wedge sole. The workwear boot that actually gets worked in.", media: ["ugc-5.jpg", "boot-black.jpg", "p-4.jpg"], colors: { "Tan": 0, "Black": 1 } },
  { title: "Hollis Lace-up Boot", type: "Boots", price: "245.00", compareAt: "279.00", sku: "HOL-LCE", tags: ["dummy-data", "boots", "Bestseller"], description: "Seven eyelets, cap toe, cushioned insole. The everyday boot that carries autumn through spring.", media: ["v-4.jpg", "boot-black.jpg", "boot-green.jpg", "ugc-5.jpg"], colors: { "Dark Brown": 0, "Black": 1, "Green": 2 } },
  { title: "Cobble Desert Boot", type: "Boots", price: "189.00", compareAt: null, sku: "COB-DES", tags: ["dummy-data", "boots"], description: "Two-eyelet sand suede on natural crepe. The original off-duty boot, unchanged because it was right.", media: ["p-4.jpg", "boot-green.jpg", "ugc-5.jpg"], colors: { "Sand": 0, "Green": 1 } },
  { title: "Norse Shearling Boot", type: "Boots", price: "299.00", compareAt: null, sku: "NOR-SHE", tags: ["dummy-data", "boots"], description: "Shearling-lined, waxed upper, grippy winter sole. December, handled.", media: ["boot-black.jpg", "p-4.jpg", "v-4.jpg"], colors: { "Black": 0, "Oiled Brown": 1 } },
  { title: "Quarry Balmoral Boot", type: "Boots", price: "269.00", compareAt: "309.00", sku: "QUA-BAL", tags: ["dummy-data", "boots"], description: "A dress boot with balmoral lacing and a closed throat. Tailoring's answer to bad weather.", media: ["v-4.jpg", "boot-black.jpg", "ugc-5.jpg"], colors: { "Dark Brown": 0, "Black": 1 } },
  { title: "Heath Jodhpur Boot", type: "Boots", price: "255.00", compareAt: null, sku: "HEA-JOD", tags: ["dummy-data", "boots"], description: "Strap-and-buckle jodhpur in burnished calf. Quietly the most elegant thing on this page.", media: ["p-4.jpg", "boot-black.jpg", "boot-green.jpg"], colors: { "Oiled Brown": 0, "Black": 1, "Green": 2 } },

  // ——— Loafers (10) ———
  { title: "Beau Tassel Loafer", type: "Loafers", price: "179.00", compareAt: "209.00", sku: "BEA-TAS", tags: ["dummy-data", "loafers", "Bestseller"], description: "Hand-tied tassels on a polished calf upper. The loafer that dresses up without trying.", media: ["p-3.jpg", "loafer-black.jpg", "loafer-green.jpg", "cat-loafer.jpg"], colors: { "Tobacco": 0, "Black": 1, "Green": 2 } },
  { title: "Cove Horsebit Loafer", type: "Loafers", price: "199.00", compareAt: null, sku: "COV-HRS", tags: ["dummy-data", "loafers"], description: "A slim gold-tone bit on soft grain leather. Seventies energy, present-day manners.", media: ["v-3.jpg", "loafer-black.jpg", "ugc-3.jpg"], colors: { "Suede Tan": 0, "Black": 1 } },
  { title: "Marlot Suede Loafer", type: "Loafers", price: "159.00", compareAt: null, sku: "MRL-SUE", tags: ["dummy-data", "loafers"], description: "Buttery suede, unstructured heel, flexible sole. Feels like a slipper, reads like a shoe.", media: ["n-3.jpg", "slipon-green.jpg", "craft.jpg"], colors: { "Sand": 0, "Green": 1 } },
  { title: "Danby Driving Loafer", type: "Loafers", price: "139.00", compareAt: "165.00", sku: "DAN-DRV", tags: ["dummy-data", "loafers"], description: "Nubbed rubber sole, moccasin construction, laced apron. Made for pedals, worn everywhere.", media: ["cat-loafer.jpg", "loafer-green.jpg", "p-3.jpg"], colors: { "Tobacco": 0, "Green": 1 } },
  { title: "Ellis Butterfly Loafer", type: "Loafers", price: "185.00", compareAt: null, sku: "ELL-BTF", tags: ["dummy-data", "loafers"], description: "A wide butterfly strap and a beefier sole. The loafer with boots in its family tree.", media: ["ugc-3.jpg", "loafer-black.jpg", "v-3.jpg"], colors: { "Suede Tan": 0, "Black": 1 } },
  { title: "Pember Venetian Loafer", type: "Loafers", price: "169.00", compareAt: null, sku: "PEM-VEN", tags: ["dummy-data", "loafers"], description: "No strap, no bit, no seams to speak of. The minimalist loafer in burnished calf.", media: ["p-3.jpg", "loafer-green.jpg", "cat-loafer.jpg"], colors: { "Tobacco": 0, "Green": 1 } },
  { title: "Solent Boat Shoe", type: "Loafers", price: "129.00", compareAt: "149.00", sku: "SOL-BOA", tags: ["dummy-data", "loafers"], description: "Hand-sewn moc toe, leather laces, siped sole. Salt-water heritage, city-pavement duty.", media: ["n-3.jpg", "slipon-green.jpg", "ugc-3.jpg"], colors: { "Sand": 0, "Green": 1 } },
  { title: "Rue Belgian Loafer", type: "Loafers", price: "175.00", compareAt: null, sku: "RUE-BEL", tags: ["dummy-data", "loafers", "Bestseller"], description: "A tiny bow, a soft square toe, and a whisper of a sole. Indoor elegance that goes outside.", media: ["v-3.jpg", "loafer-black.jpg", "loafer-green.jpg"], colors: { "Suede Tan": 0, "Black": 1, "Green": 2 } },
  { title: "Ferry Espadrille Loafer", type: "Loafers", price: "99.00", compareAt: null, sku: "FER-ESP", tags: ["dummy-data", "loafers"], description: "Jute-wrapped midsole, canvas-lined suede. Holiday shoes for people who stay in the city.", media: ["craft.jpg", "slipon-green.jpg", "n-3.jpg"], colors: { "Sand": 0, "Green": 1 } },
  { title: "Otis Kiltie Loafer", type: "Loafers", price: "189.00", compareAt: "219.00", sku: "OTI-KIL", tags: ["dummy-data", "loafers"], description: "Fringed kiltie over a penny strap, on a stitched leather sole. Ivy style, faithfully reproduced.", media: ["cat-loafer.jpg", "loafer-black.jpg", "ugc-3.jpg"], colors: { "Tobacco": 0, "Black": 1 } },

  // ——— Dress Shoes (10) ———
  { title: "Whitfield Cap-toe Oxford", type: "Dress Shoes", price: "249.00", compareAt: "299.00", sku: "WHI-OXF", tags: ["dummy-data", "dress shoes", "Bestseller"], description: "The interview, the wedding, the everything-else shoe. Closed lacing and a burnished cap toe in full-grain calf.", media: ["n-1.jpg", "oxford-black.jpg", "oxford-green.jpg", "cat-formal.jpg"], colors: { "Burnished Brown": 0, "Black": 1, "Green": 2 } },
  { title: "Selden Wholecut", type: "Dress Shoes", price: "289.00", compareAt: null, sku: "SEL-WHO", tags: ["dummy-data", "dress shoes"], description: "One piece of leather, one seam, nowhere to hide. Our benchmark make in museum calf.", media: ["p-1.jpg", "derby-black.jpg", "hero.jpg"], colors: { "Chestnut": 0, "Black": 1 } },
  { title: "Bexley Brogue", type: "Dress Shoes", price: "235.00", compareAt: "269.00", sku: "BEX-BRG", tags: ["dummy-data", "dress shoes"], description: "Full wingtip broguing on a country-weight sole. Formal rules, relaxed enforcement.", media: ["cat-formal.jpg", "derby-black.jpg", "derby-green.jpg", "v-1.jpg"], colors: { "Chestnut": 0, "Black": 1, "Green": 2 } },
  { title: "Aldwych Derby", type: "Dress Shoes", price: "219.00", compareAt: null, sku: "ALW-DER", tags: ["dummy-data", "dress shoes"], description: "Open lacing for higher insteps, plain toe for everything else. The forgiving formal shoe.", media: ["p-1.jpg", "derby-green.jpg", "ugc-4.jpg"], colors: { "Chestnut": 0, "Green": 1 } },
  { title: "Ivor Semi-brogue", type: "Dress Shoes", price: "245.00", compareAt: null, sku: "IVO-SEM", tags: ["dummy-data", "dress shoes"], description: "Punched cap toe, medallion detail, sleek last. Between plain and wingtip sits exactly this.", media: ["n-1.jpg", "oxford-black.jpg", "v-1.jpg"], colors: { "Burnished Brown": 0, "Black": 1 } },
  { title: "Calder Double Monk", type: "Dress Shoes", price: "259.00", compareAt: "299.00", sku: "CAL-MON", tags: ["dummy-data", "dress shoes"], description: "Two brass buckles and a burnished vamp. The shoe that ends conversations about what to wear.", media: ["ugc-4.jpg", "oxford-black.jpg", "oxford-green.jpg"], colors: { "Espresso": 0, "Black": 1, "Green": 2 } },
  { title: "Prior Plain-toe Oxford", type: "Dress Shoes", price: "209.00", compareAt: null, sku: "PRI-OXF", tags: ["dummy-data", "dress shoes"], description: "No broguing, no cap, no noise. The formal shoe reduced to its outline.", media: ["hero.jpg", "oxford-black.jpg", "cat-formal.jpg"], colors: { "Chestnut": 0, "Black": 1 } },
  { title: "Ganton Adelaide", type: "Dress Shoes", price: "265.00", compareAt: null, sku: "GAN-ADE", tags: ["dummy-data", "dress shoes"], description: "The U-throat oxford with hand-stitched broguing along the facing. A collector's silhouette, made wearable.", media: ["v-1.jpg", "derby-black.jpg", "p-1.jpg"], colors: { "Burnished Brown": 0, "Black": 1 } },
  { title: "Mercer Dress Boot", type: "Dress Shoes", price: "279.00", compareAt: "329.00", sku: "MER-DBT", tags: ["dummy-data", "dress shoes", "Bestseller"], description: "An oxford up top, a boot below the ankle. For winter weddings and long train platforms.", media: ["n-1.jpg", "oxford-black.jpg", "oxford-green.jpg", "ugc-4.jpg"], colors: { "Burnished Brown": 0, "Black": 1, "Green": 2 } },
  { title: "Rowan Opera Pump", type: "Dress Shoes", price: "199.00", compareAt: null, sku: "ROW-OPE", tags: ["dummy-data", "dress shoes"], description: "Grosgrain bow, patent-finish calf, feather-light sole. Black tie's last remaining shortcut.", media: ["derby-black.jpg", "p-1.jpg", "cat-formal.jpg"], colors: { "Black": 0, "Chestnut": 1 } },
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

// Resolve the New in collection id.
const nc = await gql(`{ collections(first: 20) { nodes { id handle } } }`);
const newInId = nc.collections.nodes.find((c) => c.handle === "new-in")?.id;
const newInAdds = [];

let done = 0;
for (const p of PRODUCTS) {
  const colorNames = Object.keys(p.colors);

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

  const mediaInputs = p.media.map((file, i) => {
    const url = POOL[file];
    if (!url) throw new Error(`No CDN url for ${file}`);
    const colorForIndex = colorNames.find((c) => p.colors[c] === i);
    return {
      originalSource: url,
      alt: colorForIndex ? `${p.title} in ${colorForIndex}` : p.title,
      mediaContentType: "IMAGE",
    };
  });
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

  const pub = await gql(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) { userErrors { field message } }
    }`,
    { id: productId, input: [{ publicationId: ONLINE_STORE }] }
  );
  const pubErrs = pub.publishablePublish.userErrors;

  // First two of each type also go to New in.
  const typeCount = PRODUCTS.filter((x) => x.type === p.type).indexOf(p);
  if (newInId && typeCount < 2) newInAdds.push(productId);

  done++;
  console.log(`OK ${p.title} [${p.type}]: ${colorNames.length} colors × ${SIZES.length} sizes, ${mediaIds.length} images${pubErrs.length ? " PUBLISH ERRORS: " + JSON.stringify(pubErrs) : ""}`);
}

if (newInId && newInAdds.length) {
  const add = await gql(
    `mutation($id: ID!, $productIds: [ID!]!) {
      collectionAddProductsV2(id: $id, productIds: $productIds) {
        userErrors { field message }
      }
    }`,
    { id: newInId, productIds: newInAdds }
  );
  const addErrs = add.collectionAddProductsV2.userErrors;
  console.log(`New in: +${newInAdds.length} products${addErrs.length ? " ERRORS: " + JSON.stringify(addErrs) : ""}`);
}
console.log(`Done: ${done}/${PRODUCTS.length} products created.`);
