# Stag — Presubmission Checklist

Working roadmap for taking the Stag theme live on the Shopify Theme Store.
Status keys: `[x]` done · `[ ]` pending · `[~]` partial.

_Last updated: 2026-08-14_

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

- [~] Country/region selector — currency dropdown in header via localization form (shows when >1 market country enabled); language selector still pending
- [~] Social media icons setting set + footer icon row done _(2026-08-14)_; Follow on Shop (`login_button`) still pending
- [ ] SEO: JSON-LD product snippets, canonical, meta description, OG/Twitter via `page_image`
- [ ] Image focal points respected on cover-cropped images
- [ ] Selling plans on product + cart
- [~] Swatches — theme renders `swatch.color`/`swatch.image`; store-side taxonomy linking pending (needs metaobject scopes or admin UI)

## 3. Desirability (sells the theme)

- [x] Cart drawer with free-shipping progress bar _(built with §1 Cart, 2026-08-14)_
- [x] Wishlist — localStorage module: heart on PDP title, header link + count badge, wishlist page (page.wishlist template), "Move to wishlist" on cart lines _(2026-08-14; NOTE: strip or feature-flag before Theme Store submission — wishlists are a disallowed app-like feature)_
- [ ] Quick add / quick view on product cards
- [ ] Mega menu option
- [ ] Sticky add-to-bag bar on mobile PDP
- [ ] Recently viewed section
- [ ] Color schemes (selectable palettes)
- [ ] More homepage sections: slideshow, FAQ, blog posts, logo/press strip, multicolumn, video hero
- [ ] Second preset (different palette/typography)

## 4. Submission gates

- [ ] Schema-locale extraction (`t:` keys for all new section settings)
- [ ] Settings copy pass: sentence case, American English, no ampersands, verbs on buttons
- [ ] Lighthouse vs Shopify benchmark dataset: perf ≥60, a11y ≥90, desktop + mobile
- [ ] Keyboard-only pass on every template
- [ ] Browser matrix incl. Instagram/Facebook/Pinterest webviews
- [ ] JS-disabled pass (nav + checkout forms functional)
- [ ] Demo store polish + Search & Discovery filters configured
- [ ] Documentation site live; support contact form live; FAQ; support policy
- [ ] Theme name collision check ("Stag") on live Theme Store
- [ ] Pricing ($100–500, $10 increments); version + release notes
- [ ] Listing assets to spec (screenshots, copy, video); industry + catalog-size tags
