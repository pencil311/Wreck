# WRECK — Scroll Motion & Ambient Environment brief

**How to use this file:** open Claude Code in `C:\Wreck\Wreck-claude-wreck-app-build-q06i2d` and say:

> Read `scrollcraft/MOTION-BRIEF.md` in full, then implement it phase by phase. Stop after each phase and show me what changed. Use the `impeccable` skill for the design pass.

Do not skim this. Every number in it is deliberate.

---

## 0. What already exists — do not rebuild it

This codebase is **not** a blank slate. Before writing a line, read:

| File | What it is |
|---|---|
| `tailwind.config.ts` | The full token set. Palette, type scale, radii cap, the single easing curve. |
| `src/app/globals.css` | Font faces, body grain + tonal wash, `--ease-wreck`, reduced-motion block. |
| `src/components/landing/motion.tsx` | Existing primitives: `Reveal`, `RevealGroup`, `RevealItem`, `MagneticLink`, `MagneticNav`, `Marquee`, `TiltCard`. |
| `src/components/landing/acts/*.tsx` | Five authored scroll acts. Read all five. |
| `scrollcraft/builds/wreck/BRIEF.md` | The narrative brief the landing was built from — energy curve, feeling curve, the peak. |
| `scrollcraft/FINGERPRINTS.md` | The uniqueness registry. The `wreck` row at the bottom is this site's claim. |

**Hard constraints inherited from those files:**

- Palette is `ink #001621` (Noturno), `bone #EAF2F4`, `ember #FF4103` (Vulcanico), `sand #F4F2EC`. One accent, never a second.
- Radius caps at 4px. Most surfaces are square.
- Hairline borders, not soft drop shadows, for separation.
- One easing curve: `cubic-bezier(0.22, 0.61, 0.36, 1)`, exported as `--ease-wreck` and as `EASE` in `motion.tsx`.
- `tailwind.config.ts` says verbatim: *"A single, purposeful curve. No bouncy overshoot."* **This is binding.** See §3.4 where it conflicts with the reference.
- The landing ground is **sand (bright)**. The app interior behind `/app` is **ink (dark)**. Two different worlds. Motion must read as one system across both without flattening that contrast.

Reuse `Reveal` / `RevealGroup` / `RevealItem` wherever a plain reveal is wanted. Do not write a second reveal component.

---

## 1. The reference, and what to take from it

**Reference:** a @uiuxzaid motion study — a Nike Jordan product configurator. Frame-by-frame, what it does:

1. Selecting a colorway morphs the **entire ambient environment**, not just the product: the page background gradient, the card's translucent tint, and the shadow all crossfade together to the new palette. Lime → teal → pale blue-grey → lilac → dusty rose → terracotta.
2. The crossfade takes roughly **600–900ms**, smoothly eased, never a hard cut.
3. The shoe swaps mid-morph: outgoing exits with rotation + translate, incoming enters from the opposite side, rotated ~15–25°, scaling up with a slight overshoot.
4. The airborne shoe **breaks the card's bounds** — it is not clipped by the container it belongs to.
5. A soft contact shadow tracks underneath it, translating and skewing in sync, softening while the object is airborne.
6. A large "NIKE" wordmark sits behind the product, fixed, never animating. Z-order: card background < wordmark < product.
7. UI chrome (price, size pills, swatches, arrows) never moves. It only re-tints.

**What transfers to WRECK:** items 1, 2, 4, 5, 6, 7 — with **scroll progress replacing the click**. Instead of a swatch changing the environment, *scroll position* changes it, continuously.

**What does not transfer:** the pastel, high-key, full-hue-wheel palette (§3.1), and the overshoot in item 3 (§3.4).

The single sentence to hold onto: **the environment reacts to the content, and it reacts slower than the content does.**

---

## 2. Phase plan

Four phases. Stop after each and show the diff.

- **Phase 1** — the ambient field (the core system). §3
- **Phase 2** — wire the five landing acts into it. §4
- **Phase 3** — motion layer for the app interior. §5
- **Phase 4** — verification. §6

---

## 3. Phase 1 — The Ambient Field

### 3.1 The texture decision

`public/media/texture/oxide-flow.webp` (162 KB) and `.png` are already in the project. A halftone-dithered liquid gradient, dominant tones `#E66001` and `#801002` — both ember-family, which is why it belongs here.

**It is 514×740.** Do not stretch it full-bleed at native size and hope; the halftone dots will mush or moiré on a large display. Handle it as:

- `background-size: cover` with `transform: scale(1.35)` — slight over-scale hides edge softness
- `image-rendering: auto`
- a `blur(0.4px)` on the layer to kill dot aliasing at scale, and a `contrast(1.08)` to win back the bite that blur costs

**The treatment — "Oxide Bleed".** The texture does **not** go behind everything at uniform strength. That would drown the sand landing in orange and break the two-world contrast. Instead it is one persistent fixed layer whose **strength and blend vary by zone**, driven by scroll:

| Zone | Opacity | Blend mode |
|---|---|---|
| Sand acts (Hero, Reforge, ModesPan, Trust) | `0.05` | `multiply` — reads as warmth in the paper, not as orange |
| Ink acts (Fragmented, MacroScrub) | `0.16` | `screen` — oxide flow glows up out of the dark |
| Ember moments (weld ignition, FinalCta) | `0.55` | `normal` — the texture becomes the surface |
| App interior (`/app`) | `0.08` | `screen` |

Blend modes **cannot be animated**. So render **two stacked texture layers** — one fixed at `multiply`, one at `screen` — and crossfade their opacities. At any scroll position at most one is meaningfully visible. A third `normal`-blend layer handles the ember moments.

Hue: allow at most **±6° `hue-rotate`** across the entire page scroll. Not a hue swing. The reference earns its rainbow because a shoe justifies it; WRECK has one accent and a rainbow would destroy it. The morph here is in **luminance, saturation and blend**, not hue.

### 3.2 New file: `src/components/motion/ambient-field.tsx`

Client component. Mounted **once**, in `src/app/layout.tsx`, directly inside `<body>` before `{children}`.

```
fixed inset-0 -z-10 pointer-events-none overflow-hidden
```

Structure:

- **Layer A** — oxide texture, `mix-blend-mode: multiply`, opacity from `multiplyOpacity`
- **Layer B** — oxide texture, `mix-blend-mode: screen`, opacity from `screenOpacity`
- **Layer C** — oxide texture, normal blend, opacity from `emberOpacity`
- **Layer D** — the existing tonal wash from `globals.css` body rule, moved here so it can also respond to scroll

All four share one parallax `y` transform. Mask every layer with
`radial-gradient(120% 100% at 50% 40%, #000 55%, transparent 100%)`
so the texture never hard-cuts at the viewport edge.

Keep the SVG turbulence grain in `globals.css` on `body`. It is a separate, finer frequency and the two read as different materials. Do not replace it with the oxide texture.

### 3.3 The zone system — how scroll drives it

This is the heart of the port. Do it exactly this way.

**Declaration.** Each landing section declares its ambient intent with data attributes on its root element:

```tsx
<section data-ambient-multiply="0.05" data-ambient-screen="0" data-ambient-ember="0" ...>
```

**Collection.** A `useAmbientZones()` hook in `src/components/motion/ambient-zones.ts`:

- on mount, `document.querySelectorAll('[data-ambient-multiply]')`
- record each element's `offsetTop` and `offsetHeight`
- recompute on resize, debounced 150ms, and on route change

**Interpolation.** Given `scrollY + viewportHeight * 0.5` (the viewport's midline — the ambient responds to what is *centred*, not what is entering):

- find the two zones the midline falls between
- linearly interpolate each of the three opacity channels across the **overlap window**, defined as the last 40% of the outgoing zone plus the first 40% of the incoming one

That overlap window is what produces the reference's 600–900ms crossfade. At a typical scroll speed a 40%+40% window over two ~100vh sections lands almost exactly in that band. **Do not use a fixed-duration transition** — the whole point is that the morph is scroll-linked, so the user controls it.

**The lag.** Feed the interpolated values through a spring:

```ts
useSpring(raw, { stiffness: 90, damping: 30, mass: 0.6 })
```

Deliberately softer than `hero-parallax.tsx`'s `{ stiffness: 140, damping: 30, mass: 0.4 }`. **The ambient must lag the content.** This is the single detail that makes an environment feel like an environment rather than a decal — in the reference the background settles a beat after the product does. Do not tune these to match the hero.

**Parallax.** One shared `y`, from `0%` to `-12%` across the full document scroll. Subtle. The texture drifts; it does not travel.

### 3.4 Conflict to resolve — overshoot

The reference's shoe entry has a **slight scale overshoot** (item 3, §1). `tailwind.config.ts` explicitly forbids bouncy overshoot.

**Resolution: the design system wins.** Do not add spring overshoot to entrances.

Get the reference's sense of *mass* a different way — through **anticipation and asymmetric duration**, not bounce:

- entrance: `opacity 0→1` over 0.5s, `y 28px→0` over 0.7s, `rotate 1.5°→0` over 0.7s — the longer positional settle against the faster opacity is what reads as weight
- both on `--ease-wreck`
- no `scale` overshoot past 1.0, ever

If you believe a specific moment genuinely needs overshoot, do not add it — flag it to the user and let them decide.

---

## 4. Phase 2 — Wire the landing acts

Per act. Preserve all existing choreography; you are adding an ambient layer beneath it, not rewriting the acts.

**`hero-parallax.tsx`** — `multiply 0.04`. Add the ambient declaration. Existing three-plane parallax stays exactly as is. The oxide should be barely perceptible here; the hero's job is the athlete.

**`fragmented.tsx`** — `screen 0.18`. This is the friction beat on ink ground, and the oxide flow rising behind the pinned copy is the strongest use of the texture on the page. Drive a secondary effect off the existing `scrollYProgress`: push `screen` from `0.10 → 0.22` as the four lines assemble, so the environment tightens with the argument.

**`reforge.tsx`** — the peak, and the most important one. Three beats:

- `0.00 → 0.50` (fragments converging): `multiply 0.05` — held quiet, per the "authored silence" note in the BRIEF
- `0.50 → 0.72` (weld-line ignites): spike `ember` to `0.45`, **synchronised to the existing `weldGlow` MotionValue** — do not create a second timeline, read that one
- `0.74 → 1.00` (plan resolves): decay `ember` back to `0.08`

The oxide flaring as the weld ignites and then dying back is the WRECK equivalent of the reference's full-environment colour morph. This is the money moment of the whole port. Get the decay right — it should feel like heat leaving metal, so the decay is **slower than the ignition**: ignition over 0.22 of scroll progress, decay over 0.26.

**`macro-scrub.tsx`** — `screen 0.14`. Additionally: on each of the five system cuts, pulse `screen` by `+0.05` over 0.4s and let it settle. This is the reference's per-swap environment reaction, at low amplitude. The image cross-cut already carries the beat; the ambient just acknowledges it.

**`modes-pan.tsx`** — `multiply 0.06`. Because this act travels laterally, drive the ambient's `x` (not `y`) from the same horizontal MotionValue, `0% → -6%`. The environment should drift **with** the pan but far slower — the eight cards move 238vw, the texture moves 6%.

**`FinalCta` in `src/app/page.tsx`** — `ember 0.60`. The section is already a full-bleed Vulcanico block; the texture turns that flat colour into worked material. Highest strength on the page, and the last thing the user sees.

**`Trust` in `src/app/page.tsx`** — `multiply 0.05`. Quiet. It's a reading section.

Also add to `page.tsx`: `RevealGroup`/`RevealItem` already wrap the Trust cards. Leave them.

---

## 5. Phase 3 — App interior (`/app`)

**Read the room.** The landing is a showreel; `/app` is a tool someone opens every day to find out what to train. Motion that delights once is motion that irritates on the four-hundredth open.

**Budget: roughly one third of the landing's.** Specifically:

- Reveal distance `y: 12px`, not 22
- Duration 0.45s, not 0.7
- `viewport={{ once: true }}` — **mandatory**, no re-triggering on scroll back
- No pinned sections. No horizontal pans. No parallax on content.
- Ambient at `screen 0.08`, flat — no per-section morphing inside the app shell. The environment is stable because the user is working.

**New file: `src/components/app/motion/app-motion.tsx`**

Four primitives, and nothing more:

1. **`<StaggerCards>`** — wraps a card grid. `staggerChildren: 0.05`, and a hard rule: **stagger caps at 6 items.** Item seven onwards animates with item six's delay. Otherwise a 20-row list takes a second to finish and the user is waiting on decoration.

2. **`<CountUp value={n} />`** — the dashboard and progress pages are full of metrics. Count from 0 to value over 0.9s on `--ease-wreck`, once, when scrolled into view. Use `tabular-nums` (already in the codebase) so the digits don't jitter width. Respect `prefers-reduced-motion` by rendering the final value immediately.

3. **`<ScrollRail>`** — a hairline progress rail for long scrolling pages (`nutrition`, `progress`, `learn`). 3px, `bg-ink-line`, filled `bg-ember`, `scaleX` from the page scroll. Matches the rail already in `macro-scrub.tsx` — reuse that visual language exactly.

4. **`<CondenseHeader>`** — `src/components/app/page-header.tsx` shrinks on scroll. Height `88px → 56px`, title `display-lg → display-md`, over the first 120px of scroll. Scroll-linked, not a state toggle, so it tracks the finger.

**Apply to:**

- `src/app/app/(shell)/page.tsx` (dashboard) — `StaggerCards` on the card grid, `CountUp` on every metric
- `src/app/app/(shell)/progress/page.tsx` — `CountUp` on metrics, `ScrollRail`
- `src/app/app/(shell)/nutrition/page.tsx` — `StaggerCards` on meal cards, `ScrollRail`
- `src/app/app/(shell)/training/page.tsx` — `StaggerCards` on the exercise list
- `src/components/app/page-header.tsx` — `CondenseHeader`

**Do not touch** `src/components/training/workout-runner.tsx`. Someone is mid-set with a phone on the floor. Animation there is actively hostile.

---

## 6. Phase 4 — Verification

Run all of these. Report results; do not declare done without them.

1. **`npm run typecheck`** — must pass clean.
2. **`npm run test`** — `vitest`, must stay green. The domain tests shouldn't be affected; confirm they aren't.
3. **`npm run build`** — must succeed. Watch for `"use client"` boundary errors: `ambient-field.tsx` is a client component being mounted in a server layout.
4. **Playwright screenshots** — the project has `.playwright/` already configured. Capture the landing at scroll positions `0%, 15%, 30%, 45%, 60%, 75%, 90%, 100%` at 1440×900, and the dashboard at `0%` and `50%`. Look at them. The ambient should be visibly different between ink and sand acts and should spike at the Reforge weld and the final CTA.
5. **Reduced motion** — emulate `prefers-reduced-motion: reduce` and re-capture. Requirements: ambient renders **static at each zone's base opacity** (do not hide it — it's texture, not motion), all reveals show final state, no pinned scrubbing, `CountUp` shows final values. The existing acts already handle this via `useReducedMotion()` — match their pattern.
6. **Performance** — DevTools Performance, record a full scroll of the landing. **Target: no frame over 16ms during ambient crossfades.** If the texture layers cost too much, the fix is reducing layer count or texture scale, *not* removing the spring.
7. **Mobile** — 390×844. The oxide texture at 0.55 on a small ember CTA can be overwhelming; check it and reduce to 0.40 on viewports under 640px if it is.
8. **`scrollcraft/FINGERPRINTS.md`** — this work adds a new signature to the `wreck` row: the ambient oxide field. Append a bullet under **What is taken** describing it, so future builds don't reuse it. Do not edit the existing row.

---

## 7. Performance rules — binding

- **Animate `transform` and `opacity` only.** Never `background-position`, `filter` on large layers per-frame, `width`, `height`, `top`, `left`.
- **One scroll listener for the ambient field.** A single `useScroll()` at the field level. Do **not** call `useScroll` per card or per zone — that is a listener per component and it will not hold 60fps.
- `will-change: transform, opacity` on the ambient layers only. Never on anything that isn't currently animating.
- Preload the texture in `layout.tsx`: `<link rel="preload" as="image" href="/media/texture/oxide-flow.webp" />`. It is behind the LCP element; it must not delay it.
- The ambient field is `-z-10` and `pointer-events-none`. It must never intercept a click or create a stacking-context bug over the sticky header (`z-40`) or the acts (`z-10/20/30`).
- `useSpring` and `useTransform` chains are fine — they run off Framer's own rAF loop, not React renders. But do **not** call `setState` from `useMotionValueEvent` on anything running every frame. `macro-scrub.tsx` does this legitimately, because it fires only on integer index change; match that discipline.

---

## 8. Accessibility — binding

- `prefers-reduced-motion` handling is not optional. `globals.css` already has a global block; per-component handling via `useReducedMotion()` is still required for anything scroll-scrubbed, because a scrubbed animation isn't a CSS transition and the global block won't catch it.
- Every ambient layer gets `aria-hidden`.
- Scroll-linked content must remain reachable and readable without scrolling — never gate real information behind scroll progress alone.
- Focus order must be untouched by any of this.
- Contrast: at `multiply 0.05` over sand, re-check `text-ink/70` body copy still clears 4.5:1. If it does not, lower the opacity, not the text weight.

---

## 9. Definition of done

- The ambient environment visibly and continuously responds to scroll across the whole landing, strongest at the Reforge weld and the final CTA.
- The two worlds — bright sand landing, dark ink app — both read as the same system.
- `/app` feels faster and more considered, not more decorated.
- Typecheck, tests and build all pass.
- Nothing in `tailwind.config.ts` or `globals.css` was loosened to make a motion idea work. If a motion idea needed a token changed, the idea was wrong.
