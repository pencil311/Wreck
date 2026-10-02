# WRECK — Photo Food Logging, Revoid Type Swap & Login Routing brief

**How to use this file:** open Claude Code in `C:\Wreck\Wreck-claude-wreck-app-build-q06i2d` and say:

> Read `briefs/FOOD-CAMERA-BRIEF.md` in full, then implement it phase by phase. Stop after each phase, show me what changed, and wait for my go-ahead before starting the next one.

Do not skim this. Every rule in it is deliberate.

---

## 0. What already exists — read before writing a line

This codebase is **not** a blank slate. Read these first:

| File | Why it matters here |
|---|---|
| `PRODUCT.md` | Product principles. Principle 1 ("show the work") and principle 5 ("AI explains; it never decides") govern the photo feature. |
| `src/domain/types.ts` | `FoodLogEntry`, `Food`, `UserData`, `UserSettings` (note `photosPrivate`, default `true`). |
| `src/domain/nutrition/foods.ts` | `FOODS` / `FOOD_BY_ID` — the curated Indian/regional food database. Household units + macros per unit. |
| `src/domain/nutrition/engine.ts` | `sumDay()` — day totals are computed from `kcal/proteinG/carbsG/fatG` on each log entry. |
| `src/app/actions.ts` | `logFoodAction`, `deleteFoodLogAction`, `exportDataAction`, `deleteAccountDataAction`, `withData()`, `ActionResult`, `zodFields()`. Match these patterns. |
| `src/lib/validation.ts` | zod schemas. Every new input gets a schema here. |
| `src/lib/store/*` | `Store` interface + `JsonStore` (`./.data`) + `SupabaseStore`. The app must keep running with **zero** external services. |
| `src/components/nutrition/nutrition-client.tsx` | The Nutrition screen: tabs `Today's log` / `Add food` / `Day plan`, `TodayLog`, `FoodSearch`, `FoodRow`. The camera feature lives here. |
| `src/components/ui/primitives.tsx` | `Card`, `Button`, `Input`, `Select`, `Tag`, `ProgressBar`, `Ring`. Reuse them. Do not create parallel primitives. |
| `src/components/icons.tsx` | The hand-drawn geometric icon set. A new `IconCamera` must be drawn in the same style (same stroke width, square caps, same 24-unit grid). No stock icon packs. |
| `src/app/api/coach/route.ts` | The existing pattern for calling Claude server-side: dynamic import of `@anthropic-ai/sdk`, graceful fallback when `ANTHROPIC_API_KEY` is missing or the call fails. Follow it. |
| `src/middleware.ts` | Device routing. `FORCE_MOBILE = true` (temporary) sends every device to the mobile `/app` shell. |
| `next.config.mjs` | `beforeFiles` rewrite of `/` → `/gym.html`. |
| `src/app/(auth)/layout.tsx`, `src/app/app/layout.tsx`, `src/lib/auth/session.ts` | Auth boundary and session cookie. |
| `tailwind.config.ts`, `src/app/globals.css` | Tokens and font faces. |

**Hard constraints (binding):**

- Palette: `ink #001621`, `bone #EAF2F4`, `ember #FF4103` (one accent only), `moss`, `clay`. No new colours.
- Radius caps at 4px (`rounded-full` only for genuine pills/avatars). Hairline borders, no soft drop shadows, no glassmorphism.
- One easing curve: `cubic-bezier(0.22, 0.61, 0.36, 1)` (`--ease-wreck` / `ease-wreck`). No bounce or overshoot.
- Business logic never lives in components. New logic goes in `src/domain/**` or server code; components only render.
- Copy that depends on mode goes through `MODE_META`, never hardcoded per screen.
- `prefers-reduced-motion` is honoured on everything new.
- No emojis and no em dashes in UI copy (matches the coach's rules).
- Zero-config local run must keep working: no Supabase env → local JSON, no Anthropic key → the feature degrades gracefully (see §3.6).
- The user tests in a **desktop browser using Chrome DevTools mobile emulation (390×844)**, so everything must work there, using the laptop webcam as "the camera".

---

## 1. Phase plan

Four phases. **Stop after each one** and show the diff plus a screenshot at 390×844.

- **Phase 1** — Login routing fix. §2
- **Phase 2** — Revoid display font. §4
- **Phase 3** — Photo food logging. §3 (largest; it has sub-steps, but report once at the end of the phase)
- **Phase 4** — Verification. §5

---

## 2. Phase 1 — Login routing

### Required behaviour

| Visitor state | Opens `http://localhost:3000/` (or any app entry) | Lands on |
|---|---|---|
| Not signed in | `/`, `/app`, any `/app/*` | `/login` |
| Signed in, onboarding incomplete | `/` or `/login` | `/app/onboarding` |
| Signed in, onboarded | `/` or `/login` | `/app` (Home / dashboard) |
| Just signed out | — | `/login` |

### Steps

1. **Reproduce first, do not guess.** Start the dev server. In a mobile-emulated browser, open `/` both signed out and signed in, and record exactly where each one lands, including the redirect chain. Report what you find before changing anything.
2. Find the cause. Candidates to check: whether the `/` → `/gym.html` rewrite in `next.config.mjs` wins over the middleware redirect in this setup; whether the middleware is actually executing (matcher, file location, dev-server restart); whether the session cookie is being set and read (`session.ts`); and where `logoutAction` redirects to.
3. Fix it so the table above holds. Preferred approach: in `middleware.ts`, for `/` on mobile (currently every device, because of `FORCE_MOBILE`), redirect to `/app` if a session cookie is present and to `/login` otherwise. Leave the real JWT verification and onboarding gating where they already live (the `/app` layouts). An invalid or expired cookie must still end on `/login`, never in a loop.
4. Keep `gym.html` reachable directly at `/gym.html`. Do not delete it, and do not change `FORCE_MOBILE`.
5. `logoutAction` must end on `/login`.

---

## 3. Phase 3 — Photo food logging

### 3.1 What the user wants (in their words)

> If I'm eating a meal that isn't in the existing foods, I want to tap a camera icon, it opens the camera, I capture the meal, and it automatically analyses the food's details: calories, protein and so on. After I log it, tapping that log should show the image. I should be able to add multiple images and retake shots.

### 3.2 How this squares with "AI never decides numbers"

`PRODUCT.md` says deterministic engines own every number. This feature is the one sanctioned exception, and it must **show its work** so it stays honest:

1. Claude vision **identifies** each item on the plate and estimates the portion in household units (katori, piece, roti, glass, grams).
2. For every item, **the WRECK database is checked first.** If an item matches a `FOODS` entry, its numbers come from `FOOD_BY_ID` × units, computed **server-side by our code**, not by the model. This is labelled **"WRECK database"**.
3. Items that are not in the database are **cross-matched with a web search** (Claude's server-side web search tool) against nutrition sources (government/IFCT-style tables, USDA FoodData Central, reputable nutrition sites, restaurant nutrition pages). The model returns the per-portion estimate **plus the source URLs it used**. These are labelled **"Web estimate"** with a confidence level, and the sources are shown as tappable links.
4. **The user reviews and can edit every number before anything is saved.** Nothing is logged automatically.

### 3.3 Data model (`src/domain/types.ts`, `src/lib/validation.ts`)

Extend, don't replace. Every new field is optional, so existing logs and fixtures keep working:

```ts
export interface FoodLogEntry {
  // ...existing fields unchanged...
  source?: "database" | "photo" | "manual";   // absent = "database" (legacy)
  photoIds?: string[];                          // 1..6 photos, in capture order
  items?: PhotoLogItem[];                       // the breakdown the totals came from
}

export interface PhotoLogItem {
  name: string;               // "Chicken biryani"
  portion: string;            // "1 plate (~350 g)"
  kcal: number; proteinG: number; carbsG: number; fatG: number;
  origin: "database" | "web_estimate" | "user_edited";
  dbFoodId?: string;          // set when origin === "database"
  confidence?: "high" | "medium" | "low";
  sources?: { title: string; url: string }[];
}
```

- A photo log is **one `FoodLogEntry` per meal capture**. Its `kcal/proteinG/carbsG/fatG` are the sum of its `items`, so `sumDay()`, the dashboard, the desktop snapshot, the adaptation engine and the coach all keep working with no changes. Set `foodId: "photo"`, `units: 1`, and `foodName` to a short human name ("Biryani + raita").
- If the user edits a number on an item, mark that item `origin: "user_edited"`.
- Add a zod `photoFoodLogSchema` in `validation.ts` with sane bounds (per item kcal 0–3000, macros 0–300 g, max 12 items, max 6 photo ids, strings length-capped).

### 3.4 Photo storage (via the `Store` abstraction)

Add photo methods to the `Store` interface so both adapters support it:

```ts
putPhoto(userId: string, id: string, bytes: Buffer, mime: "image/jpeg" | "image/webp"): Promise<void>;
getPhoto(userId: string, id: string): Promise<{ bytes: Buffer; mime: string } | null>;
deletePhotos(userId: string, ids: string[]): Promise<void>;
```

- **JsonStore:** files under `./.data/photos/<userId>/<id>.jpg` (already git-ignored via `.data`).
- **SupabaseStore:** a **private** Storage bucket `food-photos`, path `<userId>/<id>.jpg`, accessed only with the service-role key on the server. Add the bucket creation to `supabase/schema.sql` as a commented SQL/CLI note.
- Serve photos through an authenticated route `GET /api/food-photos/[id]`. It verifies the session and that the photo belongs to that user (an id not in the user's own logs or pending uploads returns 404), and sets `cache-control: private, max-age=31536000, immutable`. No public URLs anywhere (`photosPrivate` defaults to true).
- Photo ids: `ph_` + random, validated against `/^ph_[a-z0-9]{8,32}$/` before touching the filesystem, so there is no path traversal.
- `deleteFoodLogAction` deletes that entry's photos. `deleteAccountDataAction` deletes all of the user's photos. `exportDataAction` includes `photoIds` (bytes not included) and says so.
- Orphan cleanup: photos uploaded for analysis but never logged are deleted when the user cancels the flow. Also add a best-effort sweep that removes the user's unreferenced photos older than 24 h, run inside `logFoodAction`/photo-log action.

### 3.5 Capture UI (mobile-first, one hand, at the table)

**Entry points:**
- A camera icon button next to the search input in the **Add food** tab, labelled "Snap a meal". Search for something with no results and that empty state also offers "Not here? Snap it".
- A secondary "Snap a meal" action in the **Today's log** empty state.

**Camera sheet** (new client component `src/components/nutrition/meal-camera.tsx`):
- Full-screen sheet on mobile (respect `env(safe-area-inset-*)`), centred max-w-md panel on wider screens.
- Live viewfinder via `navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } }, audio: false })`. On the desktop webcam `environment` won't exist, which is fine because `ideal` falls back.
- Large shutter button (≥ 64 px, in thumb reach at the bottom), a close button, and a "Gallery" button.
- **Multiple shots:** each capture draws the video frame to a canvas and adds a thumbnail to a horizontal strip above the shutter. Max **6** photos (the counter shows `3 / 6`).
- **Retake:** tapping a thumbnail opens it large with **Retake** (returns to the viewfinder and replaces that photo in the same slot) and **Remove**.
- **Fallbacks:**
  - Permission denied, no camera, or `getUserMedia` unavailable: show a clear message and an `<input type="file" accept="image/*" capture="environment" multiple>` button that feeds the same strip.
  - The Gallery button always uses the same input without `capture`.
- **Compression on the client** before upload: longest edge 1600 px, JPEG quality ~0.82, EXIF orientation respected (draw via `createImageBitmap(file, { imageOrientation: "from-image" })`). Target < 600 KB per photo.
- Stop every `MediaStreamTrack` when the sheet closes or unmounts (the camera light must go off).
- A primary **Analyse** button, enabled once there is at least 1 photo, plus an optional one-line "Anything we can't see?" text field (e.g. "cooked in ghee", "half eaten") that is passed to the analysis.

**Analysing state:** this can take 10–40 s because of web search. Show an honest progress state ("Identifying items", then "Checking nutrition sources") with the photos visible. No fake percentage bar. It is cancellable, and cancelling deletes the uploaded photos.

**Review sheet** (`src/components/nutrition/photo-log-review.tsx`):
- Photo strip at the top.
- One row per item: name, portion, kcal · P · C · F, an origin badge (`Tag`) reading **WRECK database** or **Web estimate · medium confidence**, and the sources as small links (open in a new tab, `rel="noopener noreferrer"`).
- Every field is editable inline: a numeric keypad (`inputMode="decimal"`) for numbers, ≥ 44 px tap targets. Items can be removed, and "Add item" adds a blank manual row.
- Meal selector, defaulted from the local time of day (before 11:00 breakfast, 11–16 lunch, 16–19 snack, after 19 dinner).
- Live totals, then a **Log meal** button. Also **Back to photos**, which keeps the shots so the user can retake and re-analyse.
- Copy line under the totals: "Estimates from your photo. Check them, they adapt from your real trend." (No em dash.)

**After logging, in Today's log:**
- Photo entries show a small square thumbnail (first photo, 40 px, `rounded-sm`) instead of the plain row, plus a "Photo" marker.
- Tapping the entry opens a **detail sheet**: the photos are swipeable (scroll-snap, no library) and tap to view full-screen; it also shows the item breakdown with origin badges and sources, the totals, and a Delete action.
- Database-logged entries behave exactly as today.

### 3.6 Analysis endpoint — `POST /api/food-scan`

Implement as a route handler (`src/app/api/food-scan/route.ts`, `runtime = "nodejs"`), mirroring `api/coach/route.ts`:

1. Auth via session, 401 otherwise. Simple per-user rate limit (e.g. 20 scans / hour, in-memory is fine for now).
2. Accept `multipart/form-data`: 1–6 images (`image/jpeg|png|webp`, ≤ 5 MB each after client compression; reject otherwise), optional `note` (≤ 200 chars). Store each photo with `putPhoto`, then return `photoIds` alongside the analysis.
3. **No `ANTHROPIC_API_KEY`:** skip the analysis and return `{ photoIds, items: [], source: "manual" }`. The review sheet then opens with one blank item row and the message "Automatic analysis isn't set up. Enter the details and your photos will still be saved." The feature still works end to end.
4. **With a key:** call the Messages API with the images as base64 image blocks and Claude's **server-side web search tool** enabled (`max_uses` ≈ 5). **Before writing this, check the current Anthropic docs (docs.claude.com) for the exact web-search tool `type` string and for current model IDs. Do not rely on memory.** The model comes from `FOOD_SCAN_MODEL` (add to `.env.example`), defaulting to a current Sonnet-class model ID that you have verified exists.
5. The system prompt must instruct the model to:
   - list each distinct food item visible, with the portion in household units and estimated grams;
   - compare against the provided WRECK food list (send a compact `id | name | unit` list from `FOODS`) and return `dbFoodId` when an item genuinely matches, without forcing a match;
   - for non-matches, use web search to find per-100 g or per-serving nutrition from reputable sources, scale to the estimated portion, and return the URLs actually used;
   - give a confidence level per item, and say so when it can't identify something rather than guessing a dish;
   - answer **only** with JSON matching a schema you define (enforce it via a tool/structured output, then validate with zod; one repair retry, then fail gracefully).
6. **Server-side post-processing (our code, not the model):** for any item with a valid `dbFoodId`, discard the model's numbers and recompute from `FOOD_BY_ID[dbFoodId]` × the estimated units, setting `origin: "database"`. Clamp everything to the zod bounds. Round kcal to integers and macros to 1 decimal.
7. Put this logic in `src/domain/nutrition/photo-estimate.ts` (pure functions: the DB-override/recompute step and the totals) so it is unit-testable. The route only handles I/O.
8. Timeouts: 60 s on the API call. On failure, return the photos with an empty item list and a friendly error, so the user can still log manually. Never surface raw API errors.
9. The API key never reaches the client, and no image is sent anywhere except the Anthropic API.

A separate server action `logPhotoMealAction(input)` validates with `photoFoodLogSchema`, confirms every `photoId` belongs to this user, recomputes totals from `items` server-side (the client's totals are never trusted), writes the entry, runs `runAdaptationInternal`, and revalidates `/app/nutrition` and `/app`.

---

## 4. Phase 2 — Revoid display font

The user finds the current type ugly and wants **Revoid**.

**Facts about the font:** Revoid by limitype ([FontSpace](https://www.fontspace.com/revoid-font-f167889)) is a **single style, Bold Condensed** display face, licensed as freeware for **non-commercial** use (a commercial licence must be bought from the designer before WRECK launches commercially). Add that note to `public/fonts/README.md`.

**The font file:** the user will place the downloaded file in `public/fonts/`. If it is `.ttf`/`.otf`, convert it to `revoid.woff2` (e.g. with the `ttf2woff2` npm package as a one-off; don't add it as a dependency). If the file isn't there, **stop and ask the user for it**. Do not substitute another font silently.

**Scope:**
- Revoid **replaces American Captain as the display family**: headings, `font-display`, `.wordmark`, metric numbers (`text-metric`), and the nav labels if they use display type.
- **Body text stays Arial.** Revoid only has one heavy condensed style and is unreadable at paragraph sizes. Do not set Revoid on body, inputs, buttons' small labels or `.eyebrow`.
- Update `@font-face` in `globals.css` (`font-display: swap`, a single weight `700`), `fontFamily.display` in `tailwind.config.ts` (`"Revoid", "American Captain", "Arial Black", Arial, sans-serif`), and the comment block at the top of `tailwind.config.ts` and `globals.css` that documents the type pairing. This token change is authorised; nothing else in the tokens changes.
- Preload it in `src/app/layout.tsx` (`<link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous">`).
- **Re-tune the display scale for a condensed face:** the current `letterSpacing` values (-0.015em to -0.03em) were set for American Captain. Check them at 390 px and loosen them (likely to around `0` / `0.01em`) if letters collide. Check that line-height `0.9–0.95` doesn't clip Revoid's caps or descenders.
- At 390×844, check every `/app` screen plus `/login`, `/register` and `/app/onboarding` for: headline overflow or awkward wrapping (the user's display name in the dashboard `h1` especially, so test a long name like "Yeshwanth Kumar"), metric numbers that crowd, and the nav.
- Do **not** touch `public/gym.html` or `desktop-app/index.html` in this phase. List where they set their own fonts so the user can decide later.

---

## 5. Phase 4 — Verification

1. `npm run typecheck`, `npm run test`, `npm run build`: all pass.
2. **New unit tests** in `src/domain/` for `photo-estimate.ts`:
   - DB-matched items are recomputed from `FOODS` and the model's numbers are ignored.
   - An unknown `dbFoodId` is treated as a web estimate.
   - Values are clamped to bounds.
   - The totals equal the sum of the items.
   - Legacy `FoodLogEntry` objects without the new fields still pass through `sumDay()` correctly.
3. **Manual run-through at 390×844 in Chrome DevTools, using the laptop webcam:**
   - Signed out, `/` lands on `/login`. Signed in, `/` lands on `/app`. Sign out lands on `/login`.
   - Snap 3 photos, retake the 2nd, remove the 3rd, analyse, edit one number, log it. Then check:
     - totals update on Nutrition and on the dashboard;
     - tapping the entry shows the photos and the breakdown with sources;
     - deleting the entry removes its photo files from `.data/photos`.
   - Deny camera permission and check the file-input fallback works.
   - Remove `ANTHROPIC_API_KEY` and check the manual-entry path still logs with photos.
   - Close the camera sheet mid-capture: the webcam light turns off and no orphan files are left.
   - `/api/food-photos/<someone else's id>` returns 404.
   - Reduced motion: sheets appear without animated movement.
4. Report: what changed per file, any deviations from this brief and why, the web-search tool string and model ID you verified (with the doc URL), and anything left for later (e.g. HTTPS for testing on a real phone: `next dev --experimental-https`, since the camera needs a secure context off `localhost`).

---

## 6. Definition of done

- Opening the app signed out always lands on login. Signed in, it lands on home.
- A meal not in the database can be logged from 1–6 photos, with retakes. The numbers show where they came from (WRECK database or web estimate with sources), and nothing is saved until the user confirms.
- Tapping a photo log shows its photos and breakdown.
- Photos are private, owned per user, deleted with their log, and work on both the local JSON store and Supabase.
- Display type is Revoid and reads cleanly at 390 px. Body text is still Arial.
- Typecheck, tests and build pass. No tokens were loosened beyond the authorised font-family change.
