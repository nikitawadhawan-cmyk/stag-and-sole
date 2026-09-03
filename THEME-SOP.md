# Shopify Theme Store SOP

The complete build-to-submission playbook, distilled from shipping Stag
(Aug 2026). Follow the phases in order — every rule here was either paid for
in rework or verified against Shopify's official requirements
(shopify.dev/docs/storefronts/themes/store/requirements).

---

## Phase 0 — Decisions before any code

1. **Pick the merchant segment first.** The Stage-4 review judges whether the
   theme is a product for a segment, not one brand's website. Design for a
   category (e.g. "premium footwear & craft goods"), keep template names
   generic (gallery, about — never lookbook, our-story), and plan
   placeholder imagery that spans the segment.
2. **Name: 1–2 words, a noun, under 30 chars.** Not a Shopify product/event
   name, not a company name, not an industry ("Fashion"), not an SEO word
   ("Performance"). Check availability: `themes.shopify.com/themes/<name>`
   should 404. Re-check the week of submission.
3. **One preset at launch.** Every preset needs its own demo store AND a
   `/listings/<preset>/templates/` folder in the zip. Ship one; add presets
   in v1.1. Keep the second palette designed and archived.
4. **Price range $100–500, $10 steps.** Decide late; record it in LISTING.md.
5. **Baseline: Shopify Skeleton only.** Dawn/Horizon derivations are
   ineligible. Uniqueness must be architectural — art direction plus original
   mechanics, not restyled defaults.

---

## Phase 1 — Environment setup (the three-store model)

| Store | Type | Purpose |
|---|---|---|
| `<name>` workshop | Development | Daily build + seeded catalog. Publishing the dev theme = pushes go live; fine, it's private. |
| `<name>-benchmark` | Development | Lighthouse only. Stays empty except Shopify's official CSV. Create it EARLY. |
| `<name> demo` | **Client transfer** | The reviewer/merchant-facing demo. Required type for listings. |

**Store-type gotchas (cost us real time):**
- Store type is fixed at creation. A dev store can never become the demo.
- Client-transfer stores REFUSE the client-credentials OAuth grant
  (`shop_not_permitted`). Use the app's permanent Admin API token
  (`shpat_`, "Reveal token once" on the API credentials page).
- Never put "Demo"/"Test" in the demo store's NAME — the theme prints
  `shop.name` in the wordmark and `<title>`. Name it like the brand.
- Turn OFF "generate test data" when creating stores.

**Custom app per store** (Settings → Apps → Develop apps → allow legacy
custom app development → create → scopes → install). Grant from day one:

```
read/write: products, publications, themes, content, inventory,
online_store_navigation, online_store_pages, locales, metaobjects,
locations, files, discounts
```

The last three bit us by omission: no `locations` = no inventory levels
(no sold-out demo states), no `metaobjects` = no swatch taxonomy linking,
no `discounts` = can't create test codes.

**Tooling conventions:**
- `.env` per store; client-credentials tokens expire in 24h — always
  exchange fresh, never cache.
- `update-theme.mjs` (themeFilesUpsert) for incremental pushes: push
  section `.liquid` files FIRST, then template/group `.json` in a second
  call, or the server validates JSON against stale schemas.
- `push-theme.mjs` (zip → staged upload → themeCreate) for full pushes.
- Theme editor owns `settings_data.json` and group JSONs remotely:
  ALWAYS read-merge-write those, never blind-overwrite.
- Keep a git mirror; commit at every milestone.
- `npx @shopify/cli theme check` at zero offenses, always. Run it before
  every push. Note: it silently behaves differently in oddly-assembled
  directories — verify a clean copy if results look wrong.

---

## Phase 2 — The banned list (read BEFORE designing features)

Building then removing features is the most expensive mistake. We built a
wishlist AND a cart coupon field, then deleted both.

**Never build (named app-like examples — automatic rejection):**
- Wishlists (any form, localStorage included)
- Cart-level discount code fields (codes belong at checkout only)
- Appointment scheduling
- Instagram feeds
- Anything "incomplete resembling an app feature"

**Never fake urgency/scarcity:** countdowns must require a merchant-set
date and hide otherwise; no fictitious stock counters or viewer counts; no
reward promises the theme cannot fulfill (our "spend $X get free gift"
milestones died on this — the theme can't add the gift).

**Code rules:**
- No Sass/.scss; no minified CSS/JS (ES6 + third-party libs excepted)
- Scripts hosted by Shopify only (theme assets)
- No designer credits or affiliate links; `powered_by_link` unaltered
- Links to Shopify domains carry `rel="nofollow"`
- Protocol-relative/`asset_url` linking only; never hardcode http(s) assets
- Don't touch/parse `content_for_header`; `<html lang="{{ request.locale.iso_code }}">`
- Use the `routes` object for every storefront URL
- No `robots.txt.liquid`; no `config/markets.json` in the zip

**Allowed and worth having:** recently-viewed via localStorage, quick
view/quick add, mega menus, gift message via cart attributes, free-shipping
progress bar, newsletter popups (ship default-OFF), countdowns (merchant
date required).

---

## Phase 3 — Required features (build these into v0, not retrofit)

**Templates (all 16):** 404, article, blog, cart, collection, index,
list-collections, page, page.contact, password, product, search (.json) +
gift_card.liquid + theme.liquid + settings_schema + settings_data.

**Architecture:** sections everywhere (OS 2.0); header/footer as section
groups; a Custom Liquid SECTION available on all templates; Custom Liquid
BLOCKS wherever app blocks go; product page fully block-based with `@app`
support in BOTH the main product section AND a **featured product section**
(easy to forget — it's explicitly required, with rich media + app blocks).

**Feature checklist (every one is mandatory):**
- Accelerated checkout buttons on product + cart, enabled by default,
  branded colors untouched
- Faceted filtering (availability/price/type/vendor/options) on collection
  AND search; sorting; pagination or lazy-load
- Predictive search + search template returning products/pages/articles
- Gift card template: QR ≥120px, code, Apple Wallet, logo/shop name;
  recipient form (form.email/name/message + send_on)
- Image focal points: pass `style: object-position from
  image.presentation.focal_point` on EVERY cover-cropped image_tag from day
  one (retrofitting 22 call sites hurts)
- `page_image` OG/Twitter meta; SEO title/description/canonical; product
  JSON-LD via `{{ product | structured_data }}`
- Country/currency + language selectors (localization forms; render when
  >1 option)
- Multi-level (3-deep) menus + a mega menu option
- Newsletter form; pickup availability; Shop Pay Installments banner
- Related AND complementary recommendations (intents)
- Selling plans displayed in cart; unit pricing on product/collection/cart
- Variant images swap on selection; media follows selected color
- Follow on Shop (`login_button`, unrecolored); `<shopify-account>` visible
  in desktop AND mobile header
- Cart: notes, automatic discount display, taxes_included note, line
  quantity editing + full refresh, empty state
- Swatches: render `value.swatch.color/image` (store-side needs the Color
  option linked to Shopify's taxonomy)

**Settings & copy rules (§14 — do this as you write schemas, not in a
cleanup pass):** sentence case; American English; no ampersands; no
questions ("Show X", not "Show X?"); buttons start with verbs; descriptive
option names (no "Style 1/2/3"); every setting labeled; `link_list`
defaults main-menu/footer; a favicon setting; `theme_info` block; image
guidance format "1200 x 300px .jpg recommended"; Shopify terminology
("home page" not "homepage", "slideshow" not "slider", "cart type: drawer").

**Colors & fonts:** ≥4 color settings; every background setting has a
paired foreground setting; `font_picker` with a real default; CSS loads
bold/italic/bold-italic via `font_modify`; no custom font files.

**Accessibility (§12):** every image_tag gets an explicit `alt` (the
filter does NOT always add one); visible `:focus-visible` styles + skip
link; keyboard-order = DOM order; contrast 4.5:1 (3:1 large/UI); touch
targets ≥24×24px; unique input ids with matching labels; h1–h6 visually
distinct; details/summary for no-JS dropdowns.

**Progressive enhancement:** every purchase-critical flow must work with
JavaScript disabled — forms post natively, drawer falls back to cart page,
selectors are real `<form>`s. Motion honors `prefers-reduced-motion`.

---

## Phase 4 — Performance (test EARLY, on their data)

Bars: Lighthouse perf ≥60 and a11y ≥90, averaged across home/product/
collection, desktop AND mobile, measured on Shopify's benchmark dataset —
not your catalog.

**Benchmark flow (repeatable):**
1. Empty dev store + app → import
   `shopify.dev/csv/theme-store-testing-shop-product-data.csv`
   (11 products incl. a 100-variant tee) via API with `tracked:false`
   variants; one "Shop all" collection.
2. Push + publish the theme.
3. Auth Lighthouse through the password: POST /password with curl to a
   cookie jar. **Gotcha:** the auth cookie (`_shopify_essential`) sits on a
   `#HttpOnly_` jar line — naive parsing drops it and you silently measure
   the password page (score ~89/43 with identical values across pages is
   the tell; always check `finalDisplayedUrl`).
4. Run `npx lighthouse` per page × form factor with
   `--extra-headers '{"Cookie": ...}'`; mobile is noisy — take medians of 3.

**What actually moved our scores (fresh-install state is what's tested):**
- Bundled placeholder images must ship through `asset_img_url` with
  srcsets — raw `asset_url` serves the full-size original to phones
  (home-mobile 43 → 74 from this alone)
- Hero/first image: `loading: eager` + `fetchpriority: high`; everything
  else lazy
- First 2 collection-grid cards eager (they're the collection LCP)
- Compress bundled JPGs: longest side ≤1400px, quality ~72, ≤~150KB
- Sections must show real content on install — the placeholder system is
  what gets measured, so make it fast AND beautiful

---

## Phase 5 — Demo store

- Clone the workshop content with a script (products with media by public
  CDN URL, variant→image mapping, smart+manual collections, pages with
  template suffixes, blog+articles, menus as HTTP-type items — resource
  IDs don't transfer across stores).
- Authentic copy everywhere. No Lorem Ipsum, no onboarding text, no
  profanity, no text/buttons embedded in images, no apps visible
  (Search & Discovery + free review/translation apps are the exceptions).
- Show variety: sale product, sold-out variant, multi-variant product,
  gift card product.
- Admin clicks (only doable by a human): **Bogus Gateway** activated and
  everything else off (checkout test card number is `1`);
  **Search & Discovery** installed with Availability/Price/Color/Size
  filters; optionally publish extra languages; link Color option to
  taxonomy for swatch dots.
- Verify every storefront surface renders (home/product/collection/pages/
  blog/search 200s) before writing the testing blurb.

---

## Phase 6 — Submission package

**Docs + support (must be LIVE before submitting):**
- Documentation site (GitHub Pages works): setup guide, sections
  reference, FAQ, changelog. Match its copy to the theme's settings.
- Public support contact form with: name, email, store URL (with example),
  textarea for the problem, file upload, theme name, auto-responder, and a
  subject that pre-fills. (formsubmit.co works — the FIRST submission
  triggers a confirmation email that must be clicked before delivery
  starts; swap in their random alias to hide the address.)
- Put both URLs in `theme_info` (documentation_url, support_url).

**The zip (sanitize a COPY — never the working theme):**
- Contents: assets/config/layout/locales/sections/snippets/templates only.
  No .md, no dotfiles, no .github, no markets.json, no .DS_Store.
- Strip demo-store references: `shopify://pages/...` links → blank the
  link AND its paired label (buttons hide); `shopify://collections/<x>` →
  `shopify://collections/all` (exists on every store); clear demo contact
  details, countdown dates; newsletter popup default off; social link
  values empty (§13 requires it).
- Version 1.0.0 in settings_schema + release notes written.
- Validate by actually installing the zip on a store via themeCreate.
- Name it `<Theme>-<version>.zip` and never confuse it with the working zip.

**Listing kit (prepare in a LISTING.md before opening the form):**
- Tagline (one line), long description, highlight bullets
- Feature checkboxes = Theme Store FILTER tags, not app features — tick
  everything the theme genuinely does (ours: ~25 tags), skip anything you
  can't demo (reviewers verify)
- Industry (primary + secondary) + catalog size tag
- Price; "what makes it unique" + experience blurbs
- Demo testing notes (≤1920 chars): URL, password, Bogus card "1", a
  guided path through the differentiating features — every claim must be
  true on the live demo the day you submit
- Screenshots: 9-shot general set (6 desktop 1440w, 3 mobile 390w, 2×
  scale) + preset images at EXACT sizes: mobile 750×1334, desktop
  1000×1248 or 2000×2496, homepage only, no browser chrome, no embedded
  text
- "Merchant stores" section in the form = real customer stores (social
  proof) — leave empty for a new theme; the demo store URL goes on the
  preset

---

## Phase 7 — After submission

**Learned the hard way (Stag, submission 1):** there is an ENTRY design
screen before the full review. Reviewers skim the demo and reject on
design alone — "must surpass the catalog including the free themes",
"seek inspiration from Awwwards" — without checking a single technical
requirement. Compliance gets you to the door; only distinctive,
art-directed design gets you through it. Three rejections = 90-day
suspension, so never resubmit on a quick polish. Design ambition must be
decided in Phase 0, with the demo's photography treated as half the
design.

- Expect Stage-4 subjective feedback (uniqueness/design). A revision round
  is the normal path — plan the calendar for at least one resubmission.
- Support SLA once live: reply within 2 business days; critical bugs
  immediately or the theme gets pulled.
- Every update ships as a new zip with a bumped version + release notes.
- Keep the benchmark store; re-run Lighthouse before every version release.

---

## Appendix — what the retrofits cost us (why this SOP exists)

| Mistake | Cost |
|---|---|
| Built wishlist before reading §8 | Full feature deletion across 6 files + store cleanup |
| Built cart coupon + gift milestones | Same again — both are named/implied banned features |
| Focal points not wired from day one | 22 image_tag call sites patched in one sweep |
| Raw placeholder assets | Failed-grade mobile LCP (43) on the fresh-install state Shopify tests |
| Featured product section forgotten | Emergency build during the final requirements audit |
| Cookie jar parsing | An entire Lighthouse run silently measured the password page |
| "Demo" in the demo store's name | Wordmark/title said DEMO in every screenshot |

Read Phases 0–3 before writing the first section, and none of these happen
twice.
