# Stag 2.0 — Redesign Brief

_Prepared 2026-09-01 in response to submission 1 rejection (entry design
screen). Strike 1 of 3. The next submission happens once, after this._

---

## 1. What the rejection actually says

No requirement was cited; the full review never ran. Shopify's entry screen
judged the demo against one bar: **"surpass the catalog, including the free
themes"** — "intentionality and sophistication in design choices, layout,
consistency, accessibility, and both customer and merchant UX" — and pointed
at **Awwwards**. That is a request for art direction, not features.

## 2. What the bar looks like today (research, Sept 2026)

Newest accepted premium themes and how they pitch:

| Theme | Price | Pitch | What it signals |
|---|---|---|---|
| Analog / Anthem (Groupthought) | $400 | "Creative control for modern commerce" — cascading design settings; full-bleed split-photo hero, transparent header, custom-set wordmark | Cinematic imagery + deep merchant styling control |
| Helix / Marlow / Selene (ModuTheme) | $250 | "Fully built with theme blocks… flexible layouts that evolve with your store" | Theme-blocks architecture is now table stakes |
| Awaken / Essenken / Greenley | $320 | "Elegant layouts, refined colors, captivating every sense" | Refinement + 3 presets |
| Soft family | $270 | Playful, segment-specific (toys), 5 presets, age-based discovery | Segment-native ideas, preset breadth |

Common to all: 2–5 presets, theme-blocks composability, campaign-grade
photography, merchandising toys (hotspots, before/after, lookbooks), and a
visual identity you can name in one glance.

Shopify's own design doc asks for **"strong, opinionated theme art
direction"** balanced with commerce, antifragile layouts, expressive
story sections, cohesion of scale/spacing/weight, mobile-first.
Awwwards e-commerce winners share: typography-led design, orchestrated
motion and transitions, unconventional navigation, scroll narratives,
horizontal layouts.

## 3. Honest diagnosis of Stag 1.0

- **Homepage grammar is the free-theme formula**: hero → value props →
  tiles → featured collection → testimonials. Executed well; recognisably
  familiar in a 60-second skim.
- **Type is polite, not expressive**: a sensible scale, serif italic on the
  last word — a hint of identity, never a statement.
- **Layouts are symmetric and centered**; nothing overlaps, offsets, pins,
  or scrolls sideways. No memorable composition.
- **Motion is generic**: fade-up reveals and hover cross-fades. No
  signature, no page-transition identity.
- **Navigation is conventional**: standard header, standard dropdowns.
- **Our real uniqueness is invisible**: color-aware gallery, cart
  engineering, no-JS resilience — mechanical strengths that don't register
  visually.
- **Imagery is "decent"**: recolored brand photos + generated fills. Demo
  photography is half of perceived design quality; ours reads catalog, not
  campaign.
- **One preset, no theme blocks, standard merchant settings** — while
  accepted peers pitch composability and cascading style control.

## 4. The thesis: Stag 2.0 — "the editorial atelier"

Stag becomes the theme that makes a product catalog read like a printed
lookbook come alive: **typography with conviction, asymmetric editorial
composition, cinematic product storytelling, one orchestrated motion
signature** — on top of the engine we already trust.

### Pillar A — A typographic identity (the biggest lever)

- **Display face with character** (Shopify font library only): first choice
  **Fraunces** (soft-serif with optical-size axis — editorial, warm,
  distinct); alternates **Bodoni Moda** (high-contrast fashion) or
  **Libre Caslon Display**. Body: keep **Archivo** for continuity (or
  **Figtree** for a rounder counterpoint).
- **Headline system**: fluid oversized headlines (clamp 48px → 9vw),
  tight leading, mixed roman/italic within one line as a designed object
  — not a decoration on the last word.
- **Marginalia system**: small-caps folios, index numbers ("No. 03 —
  Loafers"), vertical spine labels, running captions. Structure that reads
  as editorial design, everywhere, consistently.
- **Numerals as imagery**: 120px tabular numerals in stats/details spreads.

### Pillar B — Editorial layout system

- 12-column grid used **asymmetrically**: offset image/text pairs, text
  that crosses image edges, deliberate negative space.
- **Signature sections (new)**:
  1. *Cinematic hero* — full-bleed duo/triptych imagery, transparent header
     that solidifies on scroll, headline overlapping the image seam.
  2. *Magazine spread* — sticky image with scrolling copy (pinned story).
  3. *Runway* — horizontal-scroll product strip with oversized index
     numbers and a drag cursor.
  4. *Bento composition* — category/collection mosaic with mixed ratios.
  5. *Details spread* — materials/craft with giant numerals + macro shots.
  6. *Marquee* — typographic ticker as texture (exists; make it a system).
  7. *Editorial testimonials* — pull-quote typography, not cards.
- Collection page: giant editorial header (title + count + description);
  grid **rhythm** (every 5th card spans 2 columns); type-led filter drawer.
- PDP: scrolling full-bleed media stack + sticky buy panel (keep the
  mechanics), add a *details spread* and a *complete-the-look runway*;
  keyboard-accessible lightbox with filmstrip.
- All sections antifragile: no perfect ratios required; graceful with
  missing content (Shopify's explicit ask).

### Pillar C — One motion signature

- Page-load: masked line-by-line headline reveal (the identity move).
- Scroll: CSS scroll-driven image scale/parallax (no JS cost), section
  numerals counting in.
- Hover: cursor-following "View" pill on product cards; image cross-fade
  (keep).
- Page-to-page: View Transitions API cross-fade where supported
  (progressive; no-JS untouched).
- Menu + drawer: choreographed open (stagger), not a slide.
- Rules: everything honors reduced-motion; perf budget enforced by the
  benchmark loop before every push.

### Pillar D — Navigation as a moment

- Full-screen takeover menu (desktop + mobile): oversized type, featured
  collection imagery, index numbers.
- Transparent overlay header on hero pages, solid on scroll.
- Mega menu retained, restyled editorially.

### Pillar E — Campaign-grade demo imagery

- One art-directed story: **workshop + city at golden hour**, consistent
  grade (warm, slightly desaturated), consistent framing.
- Shot list (~28): 3 hero duo/triptychs, 6 lookbook spreads, 8 macro
  craft details (stitching, grain, welts, laces), 6 lifestyle, 5 studio
  on-white product sets.
- Source: generated (Higgsfield Soul 2.0, ~90 credits on hand; budget a
  top-up) with a locked prompt system for consistency; or licensed stock
  as fallback (Shopify Burst is acceptable).

### Pillar F — Merchant sophistication

- **Two presets at launch**: *Stag* (warm editorial, footwear) and
  *Alpine* (light/minimal — pitched at a **different segment**, e.g.
  ceramics/homeware) → proves segment breadth. Two demo stores.
- **Cascading style controls**: global type scale, corner radius, section
  spacing density, image treatment (grain/duotone), button style —
  each overridable per section.
- **Theme blocks** for the new editorial sections (nested, reorderable
  blocks) — the architecture accepted peers advertise.
- Settings copy audit per §14 as we build.

### What stays (untouched)

Cart drawer engine, PDP variant/media mechanics, filters/search,
localization, gift/notes, recommendations, all compliance work, perf
tooling, three-store pipeline, docs/support, screenshot + zip tooling.

## 5. Plan & effort

| Phase | Output | Duration |
|---|---|---|
| A. Direction lock | Mood board, type system, palette evolution, 3 signature sections as HTML prototypes; side-by-side with Analog/Awaken demos | 3–4 days |
| B. Visual layer rebuild | Header/nav takeover, hero systems, 7 editorial sections, collection + PDP recomposition, cart re-skin, motion signature | 2–3 weeks |
| C. Imagery + demo | Generate/grade ~28 images, reseed demo, copywriting pass | 3–4 days |
| D. Second preset | Alpine on a second segment + second demo store + /listings templates | 3–4 days |
| E. QA + resubmit | Lighthouse loop, a11y pass, external design review, screenshots, zip, form | 2–3 days |

**≈ 4–5 weeks.** Gate before resubmission: two or three independent
designers compare Stag 2.0 against Analog/Awaken demos and say it clearly
surpasses — we do not spend strike 2 on opinion alone.

## 6. Risks

- Motion/type/imagery vs. performance — mitigated by the benchmark loop
  on every milestone (mobile must stay ≥70 median).
- Ambition vs. usability — Shopify wants both; every editorial section
  must stay antifragile and mobile-first.
- Theme-blocks migration scope — confine to new sections; don't rewrite
  the engine.
- Two strikes remain — external review is mandatory, not optional.

## 7. Decisions needed from Nikita

1. **Type direction**: Fraunces (editorial-warm) vs Bodoni Moda (fashion)
   vs Libre Caslon (classic). I recommend **Fraunces**.
2. **Second preset segment**: ceramics/homeware vs apparel vs stay footwear.
   I recommend **homeware** (widest signal of versatility).
3. **Theme blocks** for the new sections: yes (recommended) / defer.
4. **Imagery budget**: top up generation credits (~$) or licensed stock.
5. **Keep the name "Stag"**: yes — the rejection isn't attached to the
   name, and the strike count is per theme regardless.
