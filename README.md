# WRECK

**Your fitness, built around you.**

WRECK is a personalized fitness operating system. It understands your goal,
schedule, equipment, food culture, budget and recovery, builds a plan around
all of it, tracks what actually happens, and adapts when life gets in the way.
It is not a generic workout generator and not a chatbot.

This repository is a full-stack implementation: a premium, cinematic front end
and a real backend with deterministic domain engines, authentication, and
persistence that runs locally with zero external services and deploys to
Supabase + Vercel unchanged.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a custom token system (no component-library defaults)
- **Server Actions** for mutations, a **route handler** for the AI coach
- **jose** (JWT session cookies) + **bcryptjs** (password hashing)
- **Supabase / Postgres** in production, durable **local JSON** in development
- **@anthropic-ai/sdk** for the optional AI coach (with a full deterministic fallback)
- **Vitest** for engine tests
- Motion is CSS-only and respects `prefers-reduced-motion` (no animation library)

## Run it locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Nothing is required to run locally:

- With **no Supabase env vars**, user data persists to `./.data` (git-ignored).
- With **no `ANTHROPIC_API_KEY`**, the coach answers from its deterministic
  explanation engine using your real profile and logs.

Copy `.env.example` to `.env.local` to configure production services.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Run the engine unit tests |
| `npm run lint` | Next.js lint |

## Fonts

WRECK pairs **Epic Pro** (display) with **Arial** (body). Arial is a system
font. Epic Pro is licensed and not committed here — drop
`EpicPro-Regular.woff2` and `EpicPro-Bold.woff2` into `public/fonts/` and it
activates automatically (see `public/fonts/README.md`). Until then the display
family degrades gracefully to a heavy Arial, so the hierarchy stays intact.

## Architecture

```
Browser UI → Next.js (Server Components + Server Actions)
           → deterministic domain engines  (src/domain/**)
           → storage adapter               (src/lib/store/**)
           → Supabase/Postgres OR local JSON
           → AI service (coach only, server-side, optional)
```

The rule from the blueprint holds throughout: **deterministic business logic
owns the important calculations and constraints; AI is only used for
conversation and explanation.** The AI coach never invents a plan or fabricates
nutrition numbers — it rephrases facts the engines produce.

### Domain engines (`src/domain`)

| Module | Responsibility |
| --- | --- |
| `decision-engine.ts` | Turns a `Profile` into a `WreckConfig` (mode, dashboard, template, nutrition mode, feature flags, rationale). Pure, testable rules — the blueprint's decision matrix. |
| `training/engine.ts` | Assembles a program from a template + profile, filtered by equipment, with sets/reps/rest, progression rules, substitution ranking and rolling sessions. |
| `training/exercises.ts` | Seed exercise library (movement pattern, muscles, equipment, difficulty, instructions, substitutions). |
| `nutrition/engine.ts` | Mifflin-St Jeor BMR → TDEE → calorie/protein/carb/fat targets, with the derivation exposed to the user. |
| `nutrition/foods.ts` | Indian/regional food database with cuisine, diet, household units, macros, cost and effort. |
| `nutrition/meal-planner.ts` | Assembles day plans and alternatives from the approved foods, with Budget and Family-Food behaviour. |
| `adaptation/engine.ts` | Rule-based adaptation: missed sessions, low recovery, low protein, travel — each with an auditable reason and inputs. |
| `coach/explain.ts` | Deterministic, grounded coach answers from real profile/program/logs. |

The engines are covered by `src/domain/engines.test.ts` using the fixture
profiles in `src/domain/fixtures.ts` (beginner vegetarian, bodybuilder, runner,
footballer, home trainee, frequent traveller).

### Persistence (`src/lib/store`)

A single `Store` interface with two adapters, chosen at runtime:

- `SupabaseStore` — used when `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set.
- `JsonStore` — durable local JSON under `./.data`, used otherwise.

Each user's fitness data is a single `UserData` document, mirrored by the
`user_data.data` JSONB column in Postgres.

### Auth (`src/lib/auth`)

Email + bcrypt-hashed password, signed JWT in an http-only, SameSite=Lax
cookie. `AUTH_SECRET` is required in production; a dev fallback keeps local
setup zero-config. The `/app` layout is the authentication boundary; the shell
layout additionally gates on a completed profile.

## Deployment

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Set environment variables (see `.env.example`): `AUTH_SECRET`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally
   `ANTHROPIC_API_KEY`.
3. Import the repository into Vercel and deploy. The service-role key is
   server-only and never reaches the client; Row Level Security denies direct
   client access to the tables.

## Landing page motion & charts

The marketing landing page is intentionally heavier on motion than the app. It
uses **motion** (Framer Motion 12) for cursor-reactive interactions —
magnetic buttons, 3D tilt cards, a headline whose text lights up under the
cursor (no blob cursor-follower), scroll reveals and a marquee — and an
animated chart set built on **d3-shape + motion** with **@number-flow/react**
counters (`src/components/charts`, `src/components/motion`). All motion honours
`prefers-reduced-motion`.

> On `bklit-ui`: its shadcn registry host is not reachable from this
> environment, and its charts target React 19 + Tailwind 4 + @visx/@base-ui,
> while WRECK is React 18 + Tailwind 3. The chart set here reproduces bklit's
> aesthetic using its own React-18-compatible primitives (d3-shape + motion +
> number-flow) tuned to the WRECK design language.

## Design intent

The interface is deliberately built to avoid the "AI-generated" look: a warm
near-black ground (never pure white/black), a single restrained ember accent
(no neon, no purple, no pastel), sharp geometry with hairline borders (no soft
drop shadows or glassmorphism), a hand-drawn geometric icon set (not a stock
icon pack), editorial layouts with large display type (not three-card grids or
bento boxes), real interactive product demos, real skeleton loaders, and real
Terms and Privacy pages. Motion is purposeful and honours reduced-motion.

## Product coverage

Authentication, branching onboarding with resume, the deterministic identity /
decision engine, the signature Blueprint reveal, a mode-specific dynamic
dashboard, the training engine with workout logging and substitutions, the
nutrition engine with an Indian/regional food database, meal planning with
Budget and Family-Food behaviour, food logging, progress with an auditable
adaptation timeline, the daily recovery check-in, the grounded AI coach, and
settings with data export and deletion.

> WRECK provides educational fitness and nutrition guidance, not medical
> advice. Its numbers are starting estimates that adapt from real data.
