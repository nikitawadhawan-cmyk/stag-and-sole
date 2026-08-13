# Stag & Sole

Design and Shopify theme for **Stag & Sole**, a direct-to-consumer men's leather
footwear brand — and the development home of **Stag**, a commercial Shopify theme
built on the Skeleton baseline for Theme Store sale.

**Live design site:** https://eclecticdigital.github.io/stag-and-sole/

## Contents

| Path | What it is |
| --- | --- |
| `index.html` + `styles.css` | Static homepage design (from the Claude Design project *"Stag & Sole branding direction"*) |
| `product.html` | Static product-page design seed (same tokens, self-contained) |
| `design-system.html` | Living style guide — tokens, type, components, rules |
| `design-system/` | Per-component design-system cards synced to the Claude Design project |
| `images/` | AI-generated brand photography (also served to the dev store via GitHub Pages) |
| `theme/` | **The Stag Shopify theme** — Skeleton-based, OS 2.0, homepage + product page built |
| `scripts/` | Dev-store tooling: token exchange, theme push (`push-theme.mjs`, `update-theme.mjs`), catalog seeding |

## Theme development

The theme targets the `stag-and-sole.myshopify.com` development store via the
Admin GraphQL API (client-credentials OAuth). Credentials live in an `.env`
file at the repo root (gitignored):

```
SHOPIFY_STORE=...
SHOPIFY_CLIENT_ID=...
SHOPIFY_CLIENT_SECRET=...
```

- `node scripts/push-theme.mjs` — package and upload the theme as a new unpublished theme
- `node scripts/update-theme.mjs <files…>` — upsert changed files to the dev theme
- `npx @shopify/cli theme check` — lint (kept at zero offenses)

Seed scripts (`seed-*.mjs`) build the demo catalog: products with Color × Size
variant matrices, color-accurate variant images, collections, inventory, and
deliberate sold-out combinations.

## Design system

Palette: cream `#F4F1EA` · sand `#E3DCCD` · ink `#14140F` · forest `#23402F` ·
tan `#C0703A`. Fonts: [Archivo](https://fonts.google.com/specimen/Archivo) +
[Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (theme
uses Shopify `font_picker`, serif defaults to Playfair Display). Full rules in
`design-system.html`.

## Local preview of the design site

```
python -m http.server 8080
```
