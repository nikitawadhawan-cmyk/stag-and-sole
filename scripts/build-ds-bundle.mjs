// Compose the Claude Design card bundle: one self-contained preview HTML per
// design-system card, each opening with a @dsCard marker comment.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "design-system");

const BASE = `
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
:root {
  --cream:#F4F1EA; --sand:#E3DCCD; --ink:#14140F; --green:#23402F; --green-deep:#1B3325;
  --tan:#C0703A; --muted:#6B6558; --body-muted:#4A463C; --line:#DFD8CA; --input-line:#C9C0AE;
  --font-sans:'Archivo',system-ui,sans-serif; --font-serif:'Instrument Serif',serif;
  --r-tag:2px; --r-ui:3px; --r-card:4px;
}
*{box-sizing:border-box}
body{margin:0;padding:28px;background:var(--cream);color:var(--ink);font-family:var(--font-sans);-webkit-font-smoothing:antialiased}
a{color:var(--ink);text-decoration:none} a:hover{color:var(--tan)}
.serif{font-family:var(--font-serif);font-style:italic;font-weight:400}
:focus-visible{outline:2px solid var(--tan);outline-offset:2px}
.g-label{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 10px;display:block}
.g-spec{font-size:12px;color:var(--muted);font-family:ui-monospace,monospace}
.row{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start}
.stack{display:flex;flex-direction:column;gap:22px}
</style>`;

const page = (marker, title, body) => `${marker}
<!DOCTYPE html>
<html lang="en">
<head>
<title>${title}</title>
${BASE}
</head>
<body>
${body}
</body>
</html>
`;

const cards = {
  "foundations/colors.html": page(
    `<!-- @dsCard group="Foundations" name="Colors" subtitle="5 brand + 5 utility tokens, approved pairings" -->`,
    "Colors",
    `<style>
.sw{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.sc{border:1px solid var(--line);border-radius:var(--r-card);overflow:hidden}
.chip{height:72px}
.meta{padding:10px 12px}
.nm{font-size:13px;font-weight:600}
.pairs{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px}
.pair{border-radius:var(--r-card);padding:14px;font-size:13px;font-weight:500;min-height:70px;display:flex;flex-direction:column;justify-content:space-between}
</style>
<span class="g-label">Tokens</span>
<div class="sw">
  <div class="sc"><div class="chip" style="background:var(--cream)"></div><div class="meta"><div class="nm">Cream</div><div class="g-spec">#F4F1EA page bg</div></div></div>
  <div class="sc"><div class="chip" style="background:var(--sand)"></div><div class="meta"><div class="nm">Sand</div><div class="g-spec">#E3DCCD cards, media</div></div></div>
  <div class="sc"><div class="chip" style="background:var(--ink)"></div><div class="meta"><div class="nm">Ink</div><div class="g-spec">#14140F text, footer</div></div></div>
  <div class="sc"><div class="chip" style="background:var(--green)"></div><div class="meta"><div class="nm">Forest</div><div class="g-spec">#23402F bands, accents</div></div></div>
  <div class="sc"><div class="chip" style="background:var(--tan)"></div><div class="meta"><div class="nm">Tan</div><div class="g-spec">#C0703A hover, stars</div></div></div>
  <div class="sc"><div class="chip" style="background:var(--green-deep)"></div><div class="meta"><div class="nm">Forest deep</div><div class="g-spec">#1B3325</div></div></div>
  <div class="sc"><div class="chip" style="background:var(--muted)"></div><div class="meta"><div class="nm">Muted</div><div class="g-spec">#6B6558 secondary text</div></div></div>
  <div class="sc"><div class="chip" style="background:var(--body-muted)"></div><div class="meta"><div class="nm">Body</div><div class="g-spec">#4A463C long-form</div></div></div>
  <div class="sc"><div class="chip" style="background:var(--line)"></div><div class="meta"><div class="nm">Line</div><div class="g-spec">#DFD8CA hairlines</div></div></div>
  <div class="sc"><div class="chip" style="background:var(--input-line)"></div><div class="meta"><div class="nm">Input line</div><div class="g-spec">#C9C0AE form borders</div></div></div>
</div>
<span class="g-label" style="margin-top:20px">Approved pairings — cream is the only page bg; tan is never a bg</span>
<div class="pairs">
  <div class="pair" style="background:var(--cream);color:var(--ink);border:1px solid var(--line)"><span>Ink on cream</span><span class="g-spec">body default</span></div>
  <div class="pair" style="background:var(--sand);color:var(--ink)"><span>Ink on sand</span><span class="g-spec">cards</span></div>
  <div class="pair" style="background:var(--green);color:var(--cream)"><span>Cream on forest</span><span class="g-spec">bands</span></div>
  <div class="pair" style="background:var(--ink);color:var(--cream)"><span>Cream on ink</span><span class="g-spec">footer, buttons</span></div>
</div>`
  ),

  "foundations/typography.html": page(
    `<!-- @dsCard group="Foundations" name="Typography" subtitle="Archivo scale + Instrument Serif accent rule" -->`,
    "Typography",
    `<style>
.tr{display:flex;align-items:baseline;gap:20px;padding:14px 0;border-bottom:1px solid var(--line);flex-wrap:wrap}
.tr:last-child{border-bottom:none}
</style>
<div class="tr"><span style="font-size:64px;line-height:.94;letter-spacing:-.04em;font-weight:600">Made to be worn out.</span><span class="g-spec">Display 76/0.94/600/-0.04em (mob 47)</span></div>
<div class="tr"><span style="font-size:40px;font-weight:600;letter-spacing:-.03em">One workshop. <span class="serif" style="color:var(--green)">No</span> middlemen.</span><span class="g-spec">Serif = one accent word only, italic</span></div>
<div class="tr"><span style="font-size:34px;font-weight:600;letter-spacing:-.03em">This week's bestsellers</span><span class="g-spec">H2 34/600/-0.03em (mob 27)</span></div>
<div class="tr"><span style="font-size:25px;font-weight:600;letter-spacing:-.02em">Formal &amp; derby</span><span class="g-spec">H3 25/600/-0.02em</span></div>
<div class="tr"><span style="font-size:17px;line-height:1.6;color:var(--body-muted);max-width:420px">Everyday men's shoes on full-grain leather with a sole that survives the commute.</span><span class="g-spec">Lede 17/1.6</span></div>
<div class="tr"><span style="font-size:15px;line-height:1.65;color:var(--body-muted);max-width:420px">We cut, stitch and finish every pair with one family-run workshop.</span><span class="g-spec">Body 15-16/1.65</span></div>
<div class="tr"><span style="font-size:13px;color:var(--muted)">Full-grain calf leather · 3–5 days, tracked</span><span class="g-spec">Small 13 muted</span></div>
<div class="tr"><span style="font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)">Men's footwear · Autumn 2026</span><span class="g-spec">Eyebrow 12/600/+0.16em/caps</span></div>`
  ),

  "foundations/rules.html": page(
    `<!-- @dsCard group="Foundations" name="Layout, motion, imagery, voice" subtitle="Container, rhythm, radii, no shadows, copy rules" -->`,
    "Rules",
    `<style>
.rc{border:1px solid var(--line);border-radius:var(--r-card);padding:18px;flex:1;min-width:230px}
ul{margin:0;padding-left:16px;font-size:13px;color:var(--body-muted);line-height:1.7}
</style>
<div class="row">
  <div class="rc"><span class="g-label">Layout</span><ul>
    <li>Container 1320px · gutters 40px (24 ≤1024)</li>
    <li>Section rhythm 76–80px top (56 ≤700)</li>
    <li>Gaps: 18 cards · 16 tiles · 10 dense</li>
    <li>Breakpoints 1180 / 1024 / 900 / 700</li>
    <li>Radii 2 tags · 3 controls · 4 cards — never larger</li>
    <li>No shadows. Depth = color, scrims, hairlines</li>
  </ul></div>
  <div class="rc"><span class="g-label">Imagery</span><ul>
    <li>Warm, sunlit, editorial; shoes in use, not studio</li>
    <li>Always on sand, object-fit cover</li>
    <li>Hero 3:4 · PDP 4:5 · reels 9:16 · UGC 1:1</li>
    <li>Ink gradient scrim under text on imagery</li>
  </ul></div>
  <div class="rc"><span class="g-label">Motion</span><ul>
    <li>Color/bg transitions only, 0.15–0.18s ease</li>
    <li>No movement, scale, parallax, entrances</li>
    <li>Respect prefers-reduced-motion</li>
  </ul></div>
  <div class="rc"><span class="g-label">Voice</span><ul>
    <li>Sentence case (wordmark + eyebrows excepted)</li>
    <li>Honest, specific, lightly wry</li>
    <li>Direct-from-workshop value story, never "discount"</li>
    <li>₹ Indian grouping: ₹3,499</li>
    <li>Do: "42 hand steps per pair" · Don't: "Premium luxury"</li>
  </ul></div>
</div>`
  ),

  "components/buttons.html": page(
    `<!-- @dsCard group="Components" name="Buttons" subtitle="Dark / outline / ghost-on-dark + text link" -->`,
    "Buttons",
    `<style>
.btn{display:inline-block;padding:16px 30px;border-radius:var(--r-ui);border:none;font-family:var(--font-sans);font-size:14px;font-weight:600;letter-spacing:.02em;cursor:pointer;transition:background .18s ease,color .18s ease}
.b1{background:var(--ink);color:var(--cream)} .b1:hover{background:var(--green)}
.b2{background:transparent;border:1px solid var(--ink);color:var(--ink)} .b2:hover{background:var(--sand)}
.b3wrap{background:var(--green);padding:20px;border-radius:var(--r-card);display:inline-block}
.b3{background:transparent;color:var(--cream);border:1px solid rgba(244,241,234,.5)} .b3:hover{background:var(--cream);color:var(--green)}
.lnk{font-size:14px;font-weight:500;color:var(--muted)} .lnk:hover{color:var(--tan)}
</style>
<div class="row" style="align-items:center;gap:28px">
  <div><span class="g-label">Primary — ink → forest</span><button class="btn b1">Add to bag</button></div>
  <div><span class="g-label">Secondary — outline → sand</span><button class="btn b2">See new arrivals</button></div>
  <div><span class="g-label">Ghost on dark</span><div class="b3wrap"><button class="btn b3">Read our story</button></div></div>
  <div><span class="g-label">Text link — muted → tan</span><a href="#" class="lnk">View all →</a></div>
</div>
<p class="g-spec" style="margin-top:18px">Hover = color only, 0.18s ease. Nothing moves, grows, or casts a shadow. Focus: 2px tan outline.</p>`
  ),

  "components/selectors.html": page(
    `<!-- @dsCard group="Components" name="Selectors and badges" subtitle="Size pills, color swatches, tags, count pill" -->`,
    "Selectors",
    `<style>
.pill{min-width:56px;padding:12px 16px;border:1px solid var(--input-line);border-radius:var(--r-ui);background:transparent;font-family:var(--font-sans);font-size:14px;font-weight:500;cursor:pointer}
.pill:hover{border-color:var(--ink)}
.pill.on{background:var(--ink);border-color:var(--ink);color:var(--cream)}
.pill.out{color:var(--input-line);text-decoration:line-through;cursor:not-allowed}
.dot{width:34px;height:34px;border-radius:50%;border:1px solid rgba(20,20,15,.2);cursor:pointer}
.dot.on{box-shadow:0 0 0 2px var(--cream),0 0 0 4px var(--ink)}
.tag{display:inline-block;background:var(--cream);color:var(--ink);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:5px 9px;border-radius:var(--r-tag);border:1px solid var(--line)}
.tag.sale{background:var(--green);color:var(--cream);border-color:var(--green)}
.cnt{min-width:20px;height:20px;border-radius:10px;background:var(--ink);color:var(--cream);font-size:11px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;padding:0 6px}
</style>
<div class="stack">
  <div><span class="g-label">Size pills — default / hover / active / sold out</span>
    <div class="row" style="gap:8px"><button class="pill">UK 8</button><button class="pill on">UK 9</button><button class="pill out" disabled>UK 11</button></div></div>
  <div><span class="g-label">Color swatches — active ring in ink</span>
    <div class="row" style="gap:10px"><button class="dot on" style="background:#3A2318"></button><button class="dot" style="background:#14140F"></button><button class="dot" style="background:#8A5A32"></button></div></div>
  <div><span class="g-label">Badges and counts</span>
    <div class="row" style="gap:10px;align-items:center"><span class="tag">Bestseller</span><span class="tag sale">Sale</span><span class="cnt">2</span></div></div>
</div>`
  ),

  "components/forms.html": page(
    `<!-- @dsCard group="Components" name="Forms" subtitle="Inputs, quantity stepper — tan focus, no glow" -->`,
    "Forms",
    `<style>
.input{border:1px solid var(--input-line);background:var(--cream);border-radius:var(--r-ui);padding:16px 18px;font-family:var(--font-sans);font-size:15px;color:var(--ink);outline:none;min-width:240px}
.input:focus{border-color:var(--tan)}
.qty{display:inline-flex;align-items:stretch;border:1px solid var(--input-line);border-radius:var(--r-ui);overflow:hidden}
.qty button{width:44px;border:none;background:transparent;font-size:17px;cursor:pointer;color:var(--ink)}
.qty button:hover{background:var(--sand)}
.qty input{width:46px;border:none;text-align:center;font-family:var(--font-sans);font-size:15px;background:transparent}
</style>
<div class="row" style="gap:28px">
  <div><span class="g-label">Text input</span><input class="input" placeholder="you@email.com"></div>
  <div><span class="g-label">Quantity stepper</span><div class="qty"><button>−</button><input value="1"><button>+</button></div></div>
</div>
<p class="g-spec" style="margin-top:18px">16/18px padding, 3px radius. Labels: eyebrow-style or visually hidden with placeholder.</p>`
  ),

  "components/cards.html": page(
    `<!-- @dsCard group="Components" name="Cards" subtitle="Product card, review card, accordion — flat, no shadows" -->`,
    "Cards",
    `<style>
.pc{display:flex;flex-direction:column;gap:12px;width:230px}
.pcm{position:relative;height:250px;border-radius:var(--r-card);background:var(--sand);display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:11px;letter-spacing:.08em;text-transform:uppercase}
.tag{position:absolute;top:12px;left:12px;background:var(--cream);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:5px 9px;border-radius:var(--r-tag)}
.rv{background:var(--sand);border-radius:var(--r-card);padding:24px;display:flex;flex-direction:column;gap:12px;width:280px}
.stars{font-size:13px;letter-spacing:.2em;color:var(--tan)}
.acc{border-top:1px solid var(--line);width:300px}
.acc:last-of-type{border-bottom:1px solid var(--line)}
.acc summary{padding:14px 0;font-size:14px;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between}
.acc summary::-webkit-details-marker{display:none}
.acc summary::after{content:'+';font-weight:400;color:var(--muted)}
.acc[open] summary::after{content:'−'}
.acc div{padding:0 0 14px;font-size:13px;line-height:1.6;color:var(--body-muted)}
</style>
<div class="row" style="gap:32px">
  <div><span class="g-label">Product card</span>
    <div class="pc"><div class="pcm">Photo on sand<span class="tag">Bestseller</span></div>
      <div><div style="font-size:15px;font-weight:600">The Marlow Derby</div>
      <div style="font-size:13px;color:var(--muted)">Full-grain calf leather</div>
      <div style="font-size:14px;font-weight:600;margin-top:2px">₹3,499</div></div></div></div>
  <div><span class="g-label">Review card</span>
    <div class="rv"><span class="stars">★★★★★</span>
      <p style="margin:0;font-size:14px;line-height:1.6">Wore the Marlow straight out of the box to a nine-hour wedding. No blisters.</p>
      <div><div style="font-size:13px;font-weight:600">Aditya R.</div><div style="font-size:12px;color:var(--muted)">Bengaluru · The Marlow Derby</div></div></div></div>
  <div><span class="g-label">Accordion</span>
    <details class="acc" open><summary>Materials and construction</summary><div>Full-grain calf upper, stitched rubber sole.</div></details>
    <details class="acc"><summary>Shipping and returns</summary><div>Tracked delivery in 3–5 days across India.</div></details></div>
</div>`
  ),

  "components/band.html": page(
    `<!-- @dsCard group="Components" name="Forest band" subtitle="Stats + ghost CTA on forest green — max one per page" -->`,
    "Forest band",
    `<style>
.band{background:var(--green);color:var(--cream);border-radius:var(--r-card);padding:32px;display:flex;gap:40px;align-items:center;flex-wrap:wrap}
.stat{display:flex;flex-direction:column;gap:4px}
.sv{font-size:30px;font-weight:600;letter-spacing:-.02em}
.sl{font-size:13px;opacity:.65}
.gb{padding:14px 26px;border-radius:var(--r-ui);background:transparent;color:var(--cream);border:1px solid rgba(244,241,234,.5);font-family:var(--font-sans);font-size:14px;font-weight:600;cursor:pointer;margin-left:auto}
.gb:hover{background:var(--cream);color:var(--green)}
</style>
<div class="band">
  <div class="stat"><span class="sv">42</span><span class="sl">hand steps per pair</span></div>
  <div class="stat"><span class="sv">6 mo</span><span class="sl">sole warranty</span></div>
  <div class="stat"><span class="sv">1</span><span class="sl">workshop, no outsourcing</span></div>
  <button class="gb">Read our story</button>
</div>
<p class="g-spec" style="margin-top:16px">The brand moment. Serif accent allowed in its heading. Media on forest uses forest-deep backdrop.</p>`
  ),

  "brand/logo.html": page(
    `<!-- @dsCard group="Brand" name="Wordmark and ornament" subtitle="Stacked logo, ruled ampersand, dot separators" -->`,
    "Wordmark",
    `<style>
.logo{display:inline-flex;flex-direction:column;align-items:center;gap:1px;line-height:1.05}
.lw{font-size:18px;font-weight:600;letter-spacing:-.02em}
.lr{display:flex;align-items:center;gap:7px;width:104px}
.lr span{flex:1;height:1px;background:var(--ink);opacity:.3}
.la{font-family:var(--font-serif);font-style:italic;font-size:15px;color:var(--green)}
.dark{background:var(--ink);color:var(--cream);padding:24px;border-radius:var(--r-card);display:inline-block}
.dark .lr span{background:var(--cream);opacity:.4}
.dark .la{color:var(--tan)}
.rule{display:flex;align-items:center;gap:10px;width:200px}
.rule span:not(.serif){flex:1;height:1px;background:var(--ink);opacity:.3}
</style>
<div class="row" style="gap:44px;align-items:center">
  <div><span class="g-label">Wordmark on light — green ampersand</span>
    <span class="logo"><span class="lw">STAG</span><span class="lr"><span></span><span class="la">&amp;</span><span></span></span><span class="lw">SOLE</span></span></div>
  <div><span class="g-label">On dark — tan ampersand</span>
    <div class="dark"><span class="logo"><span class="lw">STAG</span><span class="lr"><span></span><span class="la">&amp;</span><span></span></span><span class="lw">SOLE</span></span></div></div>
  <div><span class="g-label">Rule motif — the only ornament</span>
    <div class="rule"><span></span><span class="serif" style="color:var(--green)">est. 2026</span><span></span></div></div>
  <div><span class="g-label">Dot separator</span>
    <div style="font-size:13px;color:var(--muted)">Full-grain leather <span style="opacity:.5">·</span> Cushioned insole</div></div>
</div>
<p class="g-spec" style="margin-top:18px">No icons, no illustrations. Where an icon feels needed: text label or 5px tan dot.</p>`
  ),
};

for (const [path, html] of Object.entries(cards)) {
  const full = join(out, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
  console.log("Wrote", path);
}
console.log("Bundle at", out);
