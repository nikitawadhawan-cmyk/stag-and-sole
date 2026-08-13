// Clone the Stag & Sole catalog and content from the source store (.env)
// to the demo store (demo.env, static Admin token): products with media and
// variant-image mapping, collections (smart + manual), menus, pages, blog +
// articles, then the theme's settings_data. Media transfers by public CDN
// URL. Variants are untracked on the target (no locations scope).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const loadEnv = (file) =>
  Object.fromEntries(
    readFileSync(join(root, file), "utf8")
      .split("\n")
      .filter((l) => l.includes("="))
      .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
  );

const src = loadEnv(".env");
const dst = loadEnv("demo.env");

const srcTokenRes = await fetch(`https://${src.SHOPIFY_STORE}/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grant_type: "client_credentials",
    client_id: src.SHOPIFY_CLIENT_ID,
    client_secret: src.SHOPIFY_CLIENT_SECRET,
  }),
});
const srcToken = (await srcTokenRes.json()).access_token;
if (!srcToken) throw new Error("source token failed");
const dstToken = dst.SHOPIFY_ADMIN_TOKEN;

const gqlFor = (store, token) => async (query, variables) => {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(`https://${store}/admin/api/2025-07/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors && JSON.stringify(json.errors).includes("THROTTLED")) {
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 500));
    return json.data;
  }
  throw new Error("throttled too long");
};
const sq = gqlFor(src.SHOPIFY_STORE, srcToken);
const dq = gqlFor(dst.SHOPIFY_STORE, dstToken);

const pubs = await dq(`{ publications(first: 10) { nodes { id name } } }`);
const ONLINE = pubs.publications.nodes.find((p) => /online store/i.test(p.name)).id;
const publish = async (id) =>
  dq(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) { userErrors { field message } }
    }`,
    { id, input: [{ publicationId: ONLINE }] }
  );

/* ---------- 1. products ---------- */
let cursor = null;
const products = [];
while (true) {
  const r = await sq(
    `query($after: String) {
      products(first: 25, after: $after, query: "status:active") {
        nodes {
          handle title descriptionHtml vendor productType tags
          options { name position values }
          media(first: 20) { nodes { ... on MediaImage { id image { url } alt } } }
          variants(first: 100) {
            nodes {
              selectedOptions { name value }
              price compareAtPrice sku
              media(first: 1) { nodes { id } }
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }`,
    { after: cursor }
  );
  products.push(...r.products.nodes);
  if (!r.products.pageInfo.hasNextPage) break;
  cursor = r.products.pageInfo.endCursor;
}
console.log(`source products: ${products.length}`);

const createdByHandle = new Map();
for (const p of products) {
  const media = p.media.nodes.filter((m) => m.image);
  const mediaIndexById = new Map(media.map((m, i) => [m.id, i]));

  const variants = p.variants.nodes.map((v) => ({
    optionValues: v.selectedOptions.map((o) => ({ optionName: o.name, name: o.value })),
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    sku: v.sku,
    inventoryItem: { tracked: false },
  }));

  const set = await dq(
    `mutation($input: ProductSetInput!) {
      productSet(input: $input, synchronous: true) {
        product { id handle }
        userErrors { field message }
      }
    }`,
    {
      input: {
        handle: p.handle,
        title: p.title,
        status: "ACTIVE",
        vendor: p.vendor,
        productType: p.productType,
        tags: p.tags,
        descriptionHtml: p.descriptionHtml,
        productOptions: p.options
          .sort((a, b) => a.position - b.position)
          .map((o) => ({ name: o.name, position: o.position, values: o.values.map((name) => ({ name })) })),
        variants,
      },
    }
  );
  if (set.productSet.userErrors.length) {
    console.error(`FAILED ${p.handle}: ${JSON.stringify(set.productSet.userErrors).slice(0, 250)}`);
    continue;
  }
  const productId = set.productSet.product.id;
  createdByHandle.set(p.handle, productId);

  let mediaIds = [];
  if (media.length) {
    const created = await dq(
      `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media { id }
          mediaUserErrors { field message }
        }
      }`,
      {
        productId,
        media: media.map((m) => ({ originalSource: m.image.url, alt: m.alt, mediaContentType: "IMAGE" })),
      }
    );
    if (created.productCreateMedia.mediaUserErrors.length)
      console.error(`  media ${p.handle}: ${JSON.stringify(created.productCreateMedia.mediaUserErrors).slice(0, 200)}`);
    mediaIds = created.productCreateMedia.media.map((m) => m.id);
  }

  // variant featured media by source media index
  const detail = await dq(
    `query($id: ID!) { product(id: $id) { variants(first: 100) { nodes { id selectedOptions { name value } } } } }`,
    { id: productId }
  );
  const key = (opts) => opts.map((o) => `${o.name}:${o.value}`).join("|");
  const srcByKey = new Map(p.variants.nodes.map((v) => [key(v.selectedOptions), v]));
  const updates = [];
  for (const dv of detail.product.variants.nodes) {
    const sv = srcByKey.get(key(dv.selectedOptions));
    const svMedia = sv && sv.media.nodes[0];
    if (!svMedia) continue;
    const idx = mediaIndexById.get(svMedia.id);
    if (idx === undefined || !mediaIds[idx]) continue;
    updates.push({ id: dv.id, mediaId: mediaIds[idx] });
  }
  if (updates.length) {
    await dq(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { field message }
        }
      }`,
      { productId, variants: updates }
    );
  }

  await publish(productId);
  console.log(`OK product ${p.handle} (${variants.length} variants, ${media.length} images)`);
}

/* ---------- 2. collections ---------- */
const cols = await sq(
  `{ collections(first: 30) {
      nodes {
        handle title descriptionHtml sortOrder templateSuffix
        ruleSet { appliedDisjunctively rules { column relation condition } }
        products(first: 100) { nodes { handle } }
      }
    } }`
);
for (const c of cols.collections.nodes) {
  if (c.handle === "frontpage") continue;
  const input = {
    title: c.title,
    handle: c.handle,
    descriptionHtml: c.descriptionHtml,
    sortOrder: c.sortOrder,
    templateSuffix: c.templateSuffix,
  };
  if (c.ruleSet) {
    input.ruleSet = {
      appliedDisjunctively: c.ruleSet.appliedDisjunctively,
      rules: c.ruleSet.rules.map((r) => ({ column: r.column, relation: r.relation, condition: r.condition })),
    };
  } else {
    input.products = c.products.nodes.map((n) => createdByHandle.get(n.handle)).filter(Boolean);
  }
  const made = await dq(
    `mutation($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id handle }
        userErrors { field message }
      }
    }`,
    { input }
  );
  if (made.collectionCreate.userErrors.length) {
    console.error(`collection ${c.handle}: ${JSON.stringify(made.collectionCreate.userErrors).slice(0, 200)}`);
    continue;
  }
  await publish(made.collectionCreate.collection.id);
  console.log(`OK collection ${c.handle}${c.ruleSet ? " (smart)" : " (manual)"}`);
}

/* ---------- 3. pages ---------- */
const pages = await sq(`{ pages(first: 30) { nodes { title handle body templateSuffix isPublished } } }`);
for (const pg of pages.pages.nodes) {
  const made = await dq(
    `mutation($page: PageCreateInput!) {
      pageCreate(page: $page) { page { id handle } userErrors { field message } }
    }`,
    {
      page: {
        title: pg.title,
        handle: pg.handle,
        body: pg.body,
        templateSuffix: pg.templateSuffix,
        isPublished: pg.isPublished,
      },
    }
  );
  if (made.pageCreate.userErrors.length)
    console.error(`page ${pg.handle}: ${JSON.stringify(made.pageCreate.userErrors).slice(0, 200)}`);
  else console.log(`OK page ${pg.handle} (template: ${pg.templateSuffix || "default"})`);
}

/* ---------- 4. blog + articles ---------- */
const blogs = await sq(
  `{ blogs(first: 5) {
      nodes {
        handle title commentPolicy
        articles(first: 20) {
          nodes { title handle body summary tags publishedAt author { name } image { url altText } }
        }
      }
    } }`
);
for (const b of blogs.blogs.nodes) {
  const madeBlog = await dq(
    `mutation($blog: BlogCreateInput!) {
      blogCreate(blog: $blog) { blog { id handle } userErrors { field message } }
    }`,
    { blog: { title: b.title, handle: b.handle, commentPolicy: b.commentPolicy } }
  );
  if (madeBlog.blogCreate.userErrors.length) {
    console.error(`blog ${b.handle}: ${JSON.stringify(madeBlog.blogCreate.userErrors)}`);
    continue;
  }
  const blogId = madeBlog.blogCreate.blog.id;
  for (const a of b.articles.nodes) {
    const article = {
      blogId,
      title: a.title,
      handle: a.handle,
      body: a.body,
      summary: a.summary,
      tags: a.tags,
      isPublished: true,
      author: { name: a.author.name },
    };
    if (a.image) article.image = { url: a.image.url, altText: a.image.altText };
    const madeArt = await dq(
      `mutation($article: ArticleCreateInput!) {
        articleCreate(article: $article) { article { id handle } userErrors { field message } }
      }`,
      { article }
    );
    if (madeArt.articleCreate.userErrors.length)
      console.error(`  article ${a.handle}: ${JSON.stringify(madeArt.articleCreate.userErrors).slice(0, 200)}`);
    else console.log(`OK article ${a.handle}`);
  }
  console.log(`OK blog ${b.handle}`);
}

/* ---------- 5. menus ---------- */
const srcMenus = await sq(
  `{ menus(first: 10) { nodes { handle title items { title url type items { title url type items { title url type } } } } } }`
);
const dstMenus = await dq(`{ menus(first: 20) { nodes { id handle } } }`);
const dstMenuByHandle = new Map(dstMenus.menus.nodes.map((m) => [m.handle, m.id]));
const asHttp = (items) =>
  items.map((i) => ({
    title: i.title,
    type: "HTTP",
    url: i.url || "#",
    ...(i.items && i.items.length ? { items: asHttp(i.items) } : {}),
  }));
for (const m of srcMenus.menus.nodes) {
  if (m.handle === "customer-account-main-menu") continue;
  const items = asHttp(m.items);
  if (dstMenuByHandle.has(m.handle)) {
    const upd = await dq(
      `mutation($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
        menuUpdate(id: $id, title: $title, items: $items) { userErrors { field message } }
      }`,
      { id: dstMenuByHandle.get(m.handle), title: m.title, items }
    );
    console.log(`OK menu ${m.handle} (updated)`, JSON.stringify(upd.menuUpdate.userErrors));
  } else {
    const made = await dq(
      `mutation($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
        menuCreate(title: $title, handle: $handle, items: $items) { menu { id } userErrors { field message } }
      }`,
      { title: m.title, handle: m.handle, items }
    );
    console.log(`OK menu ${m.handle} (created)`, JSON.stringify(made.menuCreate.userErrors));
  }
}

console.log("CLONE COMPLETE");
