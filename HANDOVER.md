# Stag — Session Handover

Everything a fresh session needs to continue this project without re-discovery.
Read this alongside `PRESUBMISSION.md` (the living roadmap — open and update it
whenever Nikita says "check the presubmission checklist").

_Last updated: 2026-08-28_

## What this project is

**Stag** — a commercial Shopify theme built for **Theme Store sale**, following
the `shopify-theme-creator-for-sale` skill (Skeleton-only baseline, exclusivity,
Lighthouse gates). Design source is the Stag & Sole brand: cream `#F4F1EA`,
sand `#E3DCCD`, ink `#14140F`, forest `#23402F`, tan `#C0703A`; Archivo +
Instrument Serif (theme uses `font_picker`, serif defaults to Playfair Display).
The `ecom-product-page` user-level skill (`~/.claude/skills/`) encodes the PDP
architecture for reuse.

## Directory layout (local)

```
~/Desktop/Claude AI/Shopify Themes/
├── .env                  ← store credentials (SHOPIFY_STORE, CLIENT_ID, CLIENT_SECRET)
├── theme/                ← WORKING COPY of the theme (edit here)
├── scripts/              ← Admin API tooling (below)
├── design-system/        ← Claude Design card bundle
└── stag-and-sole/        ← git clone (design site + synced copy of theme/, scripts/, docs)
```

**Convention: edit `theme/`, push to the dev theme, then copy changed files
into `stag-and-sole/theme/` and amend-commit.** The repo copy is a mirror, not
the working copy.

## Store connection

- Store: `stag-and-sole.myshopify.com` ("Stag and Sole", app-dev plan, base currency USD)
- Auth: **client-credentials OAuth** — `POST /admin/oauth/access_token` with
  `grant_type=client_credentials` + id/secret from `.env`. Tokens (`shpca_`)
  **expire every 24h** — always exchange fresh; never cache.
- API: GraphQL Admin `2025-07`. REST is legacy — don't use it.
- Granted scopes: products, publications, content, themes, inventory (+
  shipments/transfers), product_feeds, online_store_navigation,
  online_store_pages, markets (read+write), unauthenticated bulk.
  **Not granted:** metaobjects (blocks swatch taxonomy linking), files.
- Storefront is **password-protected** (dev store). Claude cannot enter
  passwords — Nikita types it into the browser pane. API access is unaffected.

## Theme on the store

- **Theme id `160178307221` ("Stag (dev)") — now the PUBLISHED (MAIN) theme.**
  Pushes go straight to the live storefront.
- `node scripts/update-theme.mjs <files…>` — upsert files (paths relative to
  `theme/`). **Push section `.liquid` files in one call, then template/group
  `.json` in a second call** — server validates templates against the previous
  section schema otherwise ("Type must be defined in schema").
- `node scripts/push-theme.mjs [name]` — full zip → staged upload → new theme.
- Lint: `npx --yes @shopify/cli@latest theme check` from `theme/` (no global
  CLI installed). Keep at **zero offenses** — currently clean at 78 files.
- Theme editor changes by Nikita live in the remote `settings_data.json` /
  group JSONs — read-merge-write if touching those (see social links flow in
  session history).

## Git / GitHub

- **The original repo github.com/eclecticdigital/stag-and-sole is GONE
  (404 as of 2026-08-28)** — deleted, renamed, or made private; PR #1 with it.
  The canonical GitHub home is now the former fork:
  **github.com/nikitawadhawan-cmyk/stag-and-sole** (remote name `fork`,
  write access via local gh login). Confirm the repo's fate with Nikita.
- Workflow: `git add -A && git commit --amend --no-edit && git push fork main
  --force-with-lease`. Everything rides one amended commit.
- **GitHub Pages image hot-links are dead** (`eclecticdigital.github.io/…`
  404s). The STORE IS UNAFFECTED — Shopify copied all product/article images
  to its own CDN at upload time. But the `seed-*.mjs` scripts reference those
  Pages URLs via their `IMG` constant: if rerun, either enable Pages on the
  current repo and update the constant, or switch to staged uploads from the
  local `images/` folder.

## Store data (all seeded via scripts/)

- **58 products** (tag `dummy-data`; 40 added 2026-08-28 via
  `seed-catalog-expansion.mjs`, reusing CDN imagery from `scripts/cdn-pool.json`
  — ~14-15 per category), Color × Size matrices (UK 7–11),
  color-accurate variant images (brand photos + HSV recolors — regenerate via
  `scratchpad recolor.py` pattern if needed), some variants deliberately sold
  out (see `seed-soldout.mjs`).
- **Collections:** sneakers, boots, loafers, formal-shoes (smart by type),
  bestsellers (tag `Bestseller`), sale (smart `IS_PRICE_REDUCED`,
  templateSuffix `sale`), new-in (manual).
- **Menus:** `main-menu` (Home · Pages▾ 3-level · The Lookbook · Journal ·
  Contact us), `footer` (Help), `explore` (footer Explore), `footer-shop`
  (footer Shop column — collections; replaced main-menu there because its `#`
  "Pages" parent was a dead link; footer.liquid now also expands `#` parents
  into children), `utility` (utility bar). Update via `menuUpdate` — items replace wholesale.
- **Pages + template suffixes:** wishlist→`wishlist`, contact-us→`contact`,
  the-lookbook→`lookbook`, our-story→`our-story`, faq→`faq`,
  shipping-and-returns→`shipping`, size-guide (default template). Contact
  page has a details panel (email/phone/address/hours settings on the
  contact-form section, demo values in page.contact.json) + richer body.
- **Blog:** `journal` (moderated comments), 3 articles.
- **Markets:** United States only — the International market (45 countries)
  was DELETED 2026-08-30 on Nikita's call ("remove multiple currencies"),
  since multi-currency pricing needed Shopify Payments test mode and all
  countries showed USD. The theme's country selector renders only when >1
  market country exists, so it is now hidden by design (theme code intact).
  Shopify Payments test mode is still wanted eventually — the DEMO STORE
  submission requirement (§20) needs Bogus Gateway or Payments test mode.

## Theme architecture cheat-sheet

- Custom elements: `variant-picker`, `media-gallery`, `size-chart`,
  `accordion-group`, `gift-card-recipient`, `product-recommendations`
  (product.js); `quantity-input`, `auto-scroller`, `scroll-row`,
  `announcement-rotator` + reveal/hover-menu/dropdown-close (global.js);
  `cart-drawer` + `cart-recommendations` + AJAX cart (cart.js, exposes
  `window.themeCart`); the drawer is card-based (2026-08-28 redesign): green
  offers banner ("Pick your gifts (x/y)", expandable milestone progress —
  free-shipping-bar.liquid), guest login card, card line items with "You pay"
  rows, coupon card (JS hits `/discount/CODE`, checks `/cart.js`
  `discount_codes[].applicable` with price-drop fallback, stores the code in
  the `Coupon` cart attribute, confetti on success, inline error otherwise),
  gift checkbox/message (cart attributes `Gift` / `Gift message`), order
  note, collapsible price details, sticky grand-total footer (no view-bag
  link); recs fetch `section_id=cart-recommendations` seeded by first line;
  `header-search` (search.js); `wishlist-*` (wishlist.js, localStorage,
  **strip before Theme Store submission**); section-local JS via
  `{% javascript %}`: collection filters, reviews carousel, FAQ, countdown,
  hero carousel, newsletter popup.
- Variant change = section re-render: fetch `?variant=X&section_id=Y`, swap
  `[data-swap]` regions (price/buy/pickup/sku), then `pdp:swapped` event
  (sticky ATC bar listens).
- Color↔media mapping: media tied to variant featured images hide unless that
  color is selected (`data-media-colors`).
- Shared placeholder photos: `snippets/placeholder-image.liquid` (workshop /
  street / formal / sneakers / loafers / cafe / scooter / bench / unboxing /
  doorway) — sections expose a `placeholder_image` select.
- Motion: `[data-reveal]` + `[data-reveal-stagger]`; everything honors
  `prefers-reduced-motion`; no-JS fallbacks everywhere.
- Liquid traps hit twice: **no ternary operator**; **filters inside `t:`
  params apply to the result** (assign the money string first).

## Known open items / gotchas

- **Coupon demo needs a real discount code**: the drawer's coupon card only
  celebrates when Shopify accepts the code. Nikita planned code "Happy" —
  must be created in admin (Discounts → amount off order); the app has **no
  read/write_discounts scope**, so scripts can't create or verify codes.

- **Filters need Search & Discovery**: `collection.filters` is empty until the
  free app is configured (Apps → Search & Discovery → Filters). Sort works
  regardless. If "filters broken" comes up again, check this first.
- **Swatch dots**: theme renders `value.swatch` correctly; store lacks
  taxonomy linking (needs `read/write_metaobjects` scopes or admin UI link).
  Until then color options render as text pills.
- **Wishlist** is a disallowed app-like feature for Theme Store review —
  isolated in wishlist.js + one section + three hooks; remove or flag before
  submission (noted in PRESUBMISSION §3).
- **Newsletter popup** ships default-off (on for this store), 50% scroll
  trigger, localStorage frequency capping.
- Countdown section requires a real merchant-set end date (anti fake-urgency);
  demo date set to 2026-09-28 on the sale template.
- Image generation: Higgsfield + OpenArt accounts had **zero credits** — new
  imagery was done by reusing brand photos or local HSV recoloring in Python. Check
  credits before promising generated images.
- Claude Design: design-system project id `9b749b40-188b-43e7-a96e-8ba81baf8e08`
  (name shows HTML-escaped "&amp;" — rename in UI pending). Sync via
  DesignSync, incremental per-card.

## Recent session (2026-08-28) — quick recap

Catalog expanded to 58 products (~14–15 per category, `seed-catalog-expansion.mjs`);
footer `#`-parent dead-link fix + `footer-shop` menu; contact page details
panel + richer body; cart drawer card redesign with milestone offers, login
card, coupon w/ confetti, gift + note, price details, recommendations; PDP
share row is now direct social icons (Facebook, X, Pinterest, WhatsApp,
copy-link with status note instead of text swap). All live on theme
160178307221; storefront password still gates visual QA (default Shopify
password page shows, not the themed one — uninvestigated).

## 2026-08-30 presubmission round

Languages: six locales added by Nikita but UNPUBLISHED (selector hides until
published; app lacks read/write_locales scope — Nikita publishes in Settings →
Languages, or adds locales+metaobjects scopes to the custom app).

Shopify reviewer feedback actioned: wishlist fully removed (files, hooks,
store page, explore-menu item, remote theme files); language selector added
beside the country selector in the utility bar; focal-point support injected
at all 22 image_tag call sites (`focal_style` object-position pattern);
docs site + support form live on GitHub Pages (main branch /docs) at
https://nikitawadhawan-cmyk.github.io/stag-and-sole/ — **support form action
is a formsubmit.co placeholder until Nikita picks the support email**;
version bumped to 1.0.0 (+ RELEASE-NOTES.md); name "Stag" free on the Theme
Store as of today. Still open: Lighthouse vs benchmark dataset (needs a NEW
clean dev store from Nikita), demo-store genericizing, second preset,
listing assets, pricing.

## Stage-4 de-branding round (2026-08-30, later)

Positioning agreed: "premium footwear, apparel & craft goods". Renamed
templates: page.lookbook.json → page.gallery.json (section lookbook.liquid →
gallery.liquid, schema name "Gallery"), page.our-story.json → page.about.json;
store pages' templateSuffix updated, old files deleted remotely. Style
presets added to settings_data.json: "Stag" (brand palette) + "Alpine"
(white #FFFFFF / charcoal #26262B / slate #35566B). Three generic placeholder
photos generated via Higgsfield Soul 2.0 (~90 credits remain): boots studio,
white-sneakers studio, street stride — assets placeholder-{boots,runners,stride}.jpg,
new keys in placeholder-image.liquid + select options in 5 sections. Support
form wired to nikita@eclecticdigital.in (formsubmit.co — first submission
sends a confirmation email Nikita must click; swap to their alias later to
hide the address from page source).

## Compliance strip (2026-08-30, latest)

Per official requirements audit + Nikita decision: cart COUPON feature fully
removed (drawer card, cart.js apply/confetti logic, settings, locales) —
"cart-level discount codes" is a named disallowed app-like example; milestone
rewards (m2/m3) removed too (theme can't fulfill gift promises) — the
free-shipping banner remains, green offers styling kept, single threshold.
Also added Follow on Shop (footer), featured-product.liquid section,
foreground_secondary_color setting (§16 pairing), support-form file upload +
auto-responder. Alpine preset deferred (palette in alpine-preset.json).

## Lighthouse benchmark (2026-08-31) — PASSED

Benchmark store stag-benchmark.myshopify.com (credentials in local
benchmark.env; storefront password tiprot; theme id 189454582071 published).
Seeded with Shopify's official CSV (shopify.dev/csv/theme-store-testing-shop-product-data.csv,
11 products incl. 100-variant tshirt) via scripts/seed-benchmark.mjs +
"Shop all" collection. Lighthouse (auth via cookie jar — note the
#HttpOnly_ lines carry _shopify_essential; a naive awk drops them and you
end up scoring the password page): desktop avg 97 perf, mobile avg ~77
(medians home 71 / product 88 / collection 71), a11y ≥90 on all six.
Perf work landed: placeholder pipeline now asset_img_url srcsets, hero
placeholder eager+fetchpriority, first 2 collection cards eager, all
placeholder JPGs recompressed. Both stores updated.

## Desirability build-out (2026-08-31, after Lighthouse)

All remaining §3 features built: blog-posts (on demo homepage w/ Journal),
logo-list (grayscale row, serif-name placeholders), multicolumn, video-hero
(muted looping video, reduced-motion pause), recently-viewed (localStorage
handles from product.js, /products/<handle>.js client fetch, on product
template), and quick add/quick view (card hover pill → dialog; global.js
fetches `?section_id=quick-view` which reuses the featured-product element +
styles; grid product-card refactored from <a>-root to div-root with
stretched title link so the button nests validly). Only §3 item left open:
full color-scheme groups (Alpine preset deferred). theme check: 85 files, 0
offenses. Both templates updated remotely (index adds journal-posts,
product adds recently-viewed).

## Demo store (2026-08-31) — built

stag-sole-demo-d8eynfu8.myshopify.com — CLIENT TRANSFER store (required type
for Theme Store listings). Auth: client-credentials grant NOT permitted on
this store type (shop_not_permitted) — use the permanent Admin API token in
demo.env (SHOPIFY_ADMIN_TOKEN, shpat_). Storefront password: opeebe. Theme
id 148011647091, published. Content cloned from the main store with
scripts/clone-to-demo.mjs (rerunnable; media via public CDN URLs; variants
untracked — sold-out demo states need read_locations scope added + a re-run
of a soldout pass). Smoke-tested: home/product/collection/contact/blog/search
all 200; featured product + blog-posts + drawer render. Nikita still owes:
Bogus Gateway + Search & Discovery filters on the demo store.

## What's next (see PRESUBMISSION.md for full state)

1. §2 features: SEO layer (JSON-LD, canonical, OG/Twitter via `page_image`),
   Follow on Shop (`login_button`), language selector, image focal points,
   selling plans on product.
2. §3: quick add/quick view, recently viewed, color schemes, remaining
   sections (blog posts, logo strip, multicolumn, video hero), second preset.
3. §4 gates: schema-locale extraction, settings copy pass, Lighthouse vs
   Shopify benchmark data, keyboard/browser/no-JS passes, docs + support site,
   naming/pricing, listing assets.
