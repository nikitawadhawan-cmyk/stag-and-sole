# Stag — Presubmission Checklist

> **STATUS 2026-09-01: SUBMISSION 1 REJECTED at the entry design screen** (no full
> review performed; no technical requirement cited). Reason: design must
> "surpass the catalog including free themes"; reviewer pointed to Awwwards.
> Strike 1 of 3 — a third rejection suspends submissions for 90 days. Next
> submission only after a transformative redesign (see REDESIGN-BRIEF.md).


Working roadmap for taking the Stag theme live on the Shopify Theme Store.
Status keys: `[x]` done · `[ ]` pending · `[~]` partial.

_Last updated: 2026-08-31_

## Built and verified

- [x] Homepage — hero, value props, video gallery (auto-scroll), category tiles, featured collection (grid + editorial), image with text + stats, testimonials, image gallery, newsletter
- [x] Product page — sticky cross-fade gallery (color-filtered media, hover zoom), variant picker with availability-aware pills, size chart dialog (click-to-select, sold-out aware), save-amount pricing, quantity, buy buttons + installments + pickup + gift-card recipient, animated accordions, share row, breadcrumbs
- [x] Product page extras — Seen on feet, reviews carousel, You may also like (manual scroll + arrows, mixed collections source), image banner
- [x] Collection page — faceted filters (list/boolean/price), sort, pagination, active-filter pills, empty state, per-page setting
- [x] Header group — rotating announcement bar, sticky header, stacked wordmark logo, multi-level menus, `<shopify-account>`, cart count
- [x] Footer group — link columns, brand blurb, newsletter block, payment icons, policies
- [x] Motion system — scroll reveal + stagger, auto-scroller, scroll-row arrows, all reduced-motion safe
- [x] `theme check` clean; Skeleton baseline; OS 2.0 JSON templates; section groups; @app + Custom Liquid blocks on product

## 1. Required pages (launch blockers)

- [x] **Cart** — page + slide-out drawer; line items (image, options, unit price, quantity steppers), AJAX updates with no-JS fallback, line + order discounts, cart notes (`/cart/update.js` on blur), selling plans, `cart.taxes_included`, accelerated checkout, empty states, free-shipping progress bar (threshold setting), add-to-cart opens drawer _(2026-08-14)_
- [x] **Search** — results template (product grid + pages/articles list), faceted filters + sort on search, no-results state, pagination, predictive overlay dropdown via Section Rendering API _(2026-08-14)_
- [x] **Page** template + **page.contact.json** with contact form _(2026-08-14)_
- [x] **Blog** — article cards, images, excerpts, author/date meta, pagination, empty state _(2026-08-14)_
- [x] **Article** — hero, rte content, breadcrumbs, comments (paginated, form with success/moderation states), `published_at` _(2026-08-14)_
- [x] **List collections** — tile grid with featured-image fallback, product counts, pagination _(2026-08-14)_
- [x] **404** — message + search bar + homepage link _(2026-08-14)_
- [x] **Gift card** — standalone template: QR 140px, formatted code, balance/expiry, Apple Wallet pass, wordmark, print-safe _(2026-08-14)_
- [x] **Password** — branded coming-soon: wordmark, serif accent heading, `shop.password_message`, storefront password form with error state _(2026-08-14)_

## 2. Mandatory features (not page-bound)

- [x] Country/region selector + language selector — both localization forms in the utility bar (show when >1 country / >1 language) _(language selector 2026-08-30)_
- [x] Social media icons + Follow on Shop button (`login_button`, footer newsletter block, hideable) _(Follow on Shop 2026-08-30)_
- [x] SEO: verified already present in meta-tags.liquid — canonical, meta description, OG/Twitter incl. `page_image`, product JSON-LD via `structured_data` _(audited vs official requirements 2026-08-30)_
- [x] Image focal points — object-position from image.presentation.focal_point injected at all 22 image_tag sites _(2026-08-30)_
- [ ] Selling plans on product + cart
- [~] Swatches — theme renders `swatch.color`/`swatch.image`; store-side taxonomy linking pending (needs metaobject scopes or admin UI)

## 3. Desirability (sells the theme)

- [x] Cart drawer with free-shipping progress bar _(built with §1 Cart, 2026-08-14)_
- [x] ~~Cart milestone rewards~~ — REMOVED 2026-08-30 (risk under "misleading/incomplete app-like features" rule: theme cannot fulfill gift promises); free-shipping progress banner retained
- [x] Cart gift option — checkbox + gift message saved as cart attributes, drawer + cart page, hideable in settings _(2026-08-28)_
- [x] Cart drawer "You may also like" — recommendations seeded by first line item via Section Rendering API, quick add for single-variant products, hideable in settings _(2026-08-28)_
- [x] Cart drawer card redesign — green "Pick your gifts (x/y)" offers banner (expandable progress), login/register card for guests, card-style line items with "You pay" rows, coupon card (code saved via /discount/ + cart attribute, applied at checkout), collapsible price details, sticky grand-total footer with Proceed button _(2026-08-28)_
- [x] ~~Cart coupon field + celebration~~ — REMOVED 2026-08-30 ("cart-level discount codes" is a named disallowed app-like feature in official requirements §8); automatic-discount display and You save row retained; view-bag link stays removed
- [x] PDP share row — direct social icons (Facebook, X, Pinterest, WhatsApp) + copy-link with status note _(2026-08-28)_
- [x] ~~Wishlist~~ — REMOVED 2026-08-30 per Theme Store rules (disallowed app-like feature): files deleted locally + remotely, header/PDP/cart hooks stripped, store page + menu item deleted
- [x] Quick add / quick view — hover pill on product cards opens a dialog (Section Rendering API fetch of quick-view.liquid, reuses featured-product element/styles: variant selects, live price/availability, add-to-bag opens cart drawer); per-collection-section setting; falls back to navigating to the product on fetch failure _(2026-08-31)_
- [x] Mega menu option — dropdown columns + promo image in header (was built earlier; checklist was stale)
- [x] Sticky add-to-bag bar on mobile PDP _(2026-08-16)_
- [x] Recently viewed section — localStorage handles recorded on PDP, cards fetched client-side, hides when empty; on product template below related products _(2026-08-31)_
- [~] Color schemes — second style preset "Alpine" (white/charcoal/slate) added alongside "Stag" in settings_data presets _(2026-08-30)_; full color_scheme groups still a possible enhancement
- [x] More homepage sections — slideshow (hero carousel), FAQ, rich text, ticker, image with text, blog posts, logo list, multicolumn, video hero all built _(last four 2026-08-31; blog posts live on demo homepage)_
- [x] §16 color pairing — added "Text on secondary background" color setting, wired via --color-foreground-secondary (cart summary, contact details) _(2026-08-30)_
- [~] Second preset — DEFERRED to post-launch by decision 2026-08-30 (each preset requires its own demo store + /listings templates); Alpine palette archived in alpine-preset.json

### Added from official-requirements audit (2026-08-30)

- [x] Featured product section — media w/ rich media + thumbs, variant selects with live price/availability/media swap, quantity, buy buttons + dynamic checkout, description, @app + Custom Liquid blocks
- [x] Support form per guidelines — file upload field + auto-responder added

### Submission zip — READY (2026-08-31)

- [x] **Stag-1.0.0.zip** built (115 files, 2.0 MB) and validated by a real themeCreate install on the benchmark store. Sanitized for merchant installs vs the working theme: shopify://pages/* button links removed (labels blanked so buttons hide), shopify://collections/* retargeted to /all, contact demo details cleared, countdown date cleared, newsletter popup default off, social links emptied. No markets.json / .md / dotfiles. Zip lives at repo root and workspace root; rebuild = cp theme → sanitize (script in git history) → zip.

## 4. Submission gates

- [ ] Schema-locale extraction (`t:` keys for all new section settings)
- [ ] Settings copy pass: sentence case, American English, no ampersands, verbs on buttons
- [x] Lighthouse vs Shopify benchmark dataset _(2026-08-31, stag-benchmark.myshopify.com, official CSV, medians of repeat runs)_:
  - Desktop: home 95 / product 99 / collection 98 (avg 97) — a11y 90/92/100
  - Mobile: home ~71 / product 88 / collection ~71 (avg ~77) — a11y 90/95/95
  - Bars: perf ≥60 ✓ comfortable margin; a11y ≥90 ✓ every page
  - Perf fixes landed during testing: responsive asset_img_url placeholders (srcset + CDN resize), hero placeholder eager + fetchpriority, first two collection cards eager, placeholder JPGs recompressed (~40% smaller)
- [~] Keyboard-only pass — code-level audit done 2026-08-31 (:focus-visible global, skip link, details/summary nav, all image_tags now carry alt); live browser pass still pending demo store
- [ ] Browser matrix incl. Instagram/Facebook/Pinterest webviews
- [ ] JS-disabled pass (nav + checkout forms functional)
- [~] Demo store — LIVE: stag-sole-demo-d8eynfu8.myshopify.com (client transfer, password "opeebe", Stag theme published). Full clone from source 2026-08-31 via scripts/clone-to-demo.mjs: 58 products (variant images mapped, untracked inventory — no locations scope), 7 collections, 6 pages + suffixes, Journal blog (3 articles), all 5 menus, settings_data. Admin steps DONE 2026-08-31: Bogus Gateway active (verified in checkout markup), Search & Discovery filters live (Availability/Price/Color/Size render on collection pages). Screenshots retaken with filters visible. Optional remaining: store rename to drop "DEMO" from wordmark, publish languages, color taxonomy swatches
- [x] Documentation site LIVE at https://nikitawadhawan-cmyk.github.io/stag-and-sole/ + support form at /support.html wired to nikita@eclecticdigital.in — formsubmit ACTIVATED by Nikita 2026-08-31 (confirmation clicked; submissions now deliver)
- [x] Theme name collision check — themes.shopify.com/themes/stag 404s as of 2026-08-30; no "Stag" theme found. Re-verify at submission
- [x] Version 1.0.0 + RELEASE-NOTES.md + pricing recommendation ($240, in LISTING.md) _(2026-08-31)_
- [~] Listing assets — LISTING.md complete (description, tags Shoes/Clothing + Some 11-100, price rec $240, screenshot shot list); screenshots pending demo store
