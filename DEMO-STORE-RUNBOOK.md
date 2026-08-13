# Demo store + Lighthouse runbook

Two stores are needed before submission. Nikita does the store creation
(Partner Dashboard access); Claude automates everything scriptable once
given credentials in the same `.env` format as the current store.

## Store A — Lighthouse benchmark store (do this FIRST)

Purpose: get real performance/accessibility scores before polishing anything
else. Shopify measures against THEIR data, not ours.

**Nikita (10 min):**
1. Partner Dashboard → Stores → Add store → **Development store**
   (purpose: test/build, no developer preview).
2. In the new store admin: Settings → Apps and sales channels →
   **Develop apps** → create app "stag-tools" → Admin API scopes:
   `read_products, write_products, read_publications, write_publications,
   read_themes, write_themes, read_content, write_content, read_inventory,
   write_inventory, read_online_store_navigation, write_online_store_navigation,
   read_online_store_pages, write_online_store_pages, read_locales,
   write_locales, read_metaobjects, write_metaobjects` → install → copy
   client ID + secret.
3. Hand over: store domain + client ID + secret (new `.env`), plus the
   storefront password (Online Store → Preferences).
4. Import Shopify's benchmark dataset: admin → Products → Import → upload
   Shopify's benchmark CSV (from the performance testing docs at
   shopify.dev/docs/storefronts/themes/store/requirements → "Testing the
   performance of your theme"). The import is a browser step — Claude will
   supply the exact CSV link when the store exists.

**Claude (after handoff):** push the theme, assign benchmark
products/collections to templates, run Lighthouse desktop + mobile against
home/product/collection through the password, report the six scores. A
perf fail changes priorities — that's why this store comes first.

## Store B — public demo store (after Lighthouse passes)

Purpose: the store merchants browse from the Theme Store listing.

**Nikita:**
1. Partner Dashboard → Stores → Add store → **Client transfer store**
   (dev-preview stores can't transfer; this type is required for demos).
2. Same custom-app dance as Store A; hand over credentials.
3. Admin-only steps Claude can't reach:
   - Settings → Payments → **Bogus Gateway** (or Shopify Payments test
     mode); disable every other method.
   - Apps → install **Search & Discovery** → Filters: enable Availability,
     Price, Color, Size (collection + search filtering stays empty
     without this).
   - Settings → Languages → publish French + German (optional demo polish).
   - Products → link the Color option to Shopify's standard Color taxonomy
     (enables swatch dots) — or grant metaobject scopes and Claude scripts it.

**Claude (after handoff):** re-run the seed suite against the new store —
products with CDN imagery (`seed-*.mjs` + `scripts/cdn-pool.json`),
collections, menus (incl. footer-shop), pages + contact details, blog +
articles, template assignments, settings_data (palette, cart settings,
newsletter popup), focal points on hero imagery, homepage featured product.
Then the visual QA pass (keyboard-only, contrast, mobile) with screenshots
per LISTING.md's shot list.

## Submission day order

1. Lighthouse scores green (Store A)
2. Demo store live and polished (Store B)
3. Screenshots captured → LISTING.md fields into the Partner Dashboard form
4. Zip the theme from `theme/` (push-theme.mjs pattern; excludes repo .md
   files; no config/markets.json — verified absent)
5. Submit; expect Stage-4 subjective feedback and plan one revision round
