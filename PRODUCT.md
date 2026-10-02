# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone serious about training — the product deliberately has no single lead
audience. Eight training identities are first-class and equally weighted:
beginner, bodybuilding, strength, running, sports, calisthenics, hybrid and
general. The user arrives with a goal, a schedule, whatever equipment they
actually have, a food culture, a budget and a recovery reality, and the product
shapes itself around that combination rather than asking the user to shape
themselves around a template.

Because no mode is the default, every surface must read as native to whichever
identity the visitor holds. A screen that only makes sense to a lifter is a
defect for the runner.

The onboarding-captured context that defines a user: goal, experience level,
equipment access (full gym → hotel room), diet (omnivore → vegan), regional
cuisine, meal source (home, hostel mess, restaurant, mixed), budget tier, and
preferred coaching tone (hands-off, balanced, educational).

## Product Purpose

WRECK is a personalized fitness operating system. It understands the user's
goal, schedule, equipment, food culture, budget and recovery; builds a plan
around all of it; tracks what actually happens; and adapts when life gets in
the way.

Success is a user whose plan survives contact with their real life — travel, a
missed week, a bad-sleep stretch, a tight month — because the system adjusted
with a stated reason instead of silently breaking or guilt-tripping.

It is explicitly not a generic workout generator and not a chatbot.

## Positioning

**Deterministic engines own every number and constraint; AI is used only for
conversation and explanation.** The coach never invents a plan or fabricates a
nutrition figure — it rephrases facts the engines produced, from the user's own
profile and logs. Every adaptation carries an auditable reason and the inputs
that triggered it.

This is the claim a neighboring product cannot truthfully copy: most
competitors either hand the plan to an LLM or hide a fixed template behind a
quiz. WRECK can show its work for any number on screen.

Second differentiator: food culture is a first-class input, not a filter.
Regional Indian cuisines, hostel-mess sourcing, household measures and cost
per meal are modeled in the food database itself.

## Operating Context

- The plan is consulted before a session and logged during or right after it —
  often on a phone, in a gym, with one hand.
- Nutrition is checked at meal times against what is actually available to
  cook or buy, under a real budget.
- A daily recovery check-in feeds the adaptation engine.
- The Blueprint reveal is the moment the product earns trust: the user sees the
  reasoning behind their configuration, not just its output.
- Progress is reviewed occasionally, as a timeline of what changed and why.

## Capabilities and Constraints

Shipped: authentication; branching onboarding with resume; the deterministic
identity/decision engine; the Blueprint reveal; a mode-specific dynamic
dashboard; the training engine with logging, progression and substitutions;
the nutrition engine (Mifflin-St Jeor → TDEE → macro targets, derivation shown
to the user); an Indian/regional food database; meal planning with Budget and
Family-Food behaviour; food logging; progress with an auditable adaptation
timeline; the daily recovery check-in; the grounded AI coach; settings with
data export and deletion.

Constraints:

- Business logic never lives in components. Engines produce typed shapes
  (`src/domain/types.ts`); the UI only renders them.
- Zero external services required to run. No Supabase env vars → durable local
  JSON under `./.data`. No `ANTHROPIC_API_KEY` → the coach answers from the
  deterministic explanation engine.
- The same codebase deploys unchanged to Supabase + Vercel.
- Navigation labels and lexicon change per mode (Train/Eat vs Run/Fuel). Copy
  must go through the mode metadata, never be hardcoded per screen.

Terminology is mode-dependent by design: "session" / "workout" / "run", "plan"
/ "hypertrophy block" / "starter plan".

## Brand Commitments

- Name: **WRECK**. Tagline: **Your fitness, built around you.**
- Required disclaimer, already in the product: WRECK provides educational
  fitness and nutrition guidance, not medical advice; its numbers are starting
  estimates that adapt from real data.
- Licensed display faces ship in `public/fonts/` (American Captain, Gloucester
  MT Condensed). The README's reference to Epic Pro is stale.
- Real photography exists in `public/media/` (gym floor, battle ropes,
  calisthenics).

## Evidence on Hand

**The founder's own results are the only real proof.** They may be cited as a
first-person story, never as aggregate outcomes.

There are no users, no testimonials, no case studies, no press, no benchmarks
and no retention or outcome statistics. Future work must not invent any of
these, must not imply a userbase size, and must not present the founder's
results as typical. Persuasion surfaces earn belief by showing the mechanism —
the engines' reasoning, the real interactive demos — rather than by borrowing
social proof that does not exist.

Pricing, licensing and deployment claims are likewise undecided and must not
be fabricated.

## Product Principles

1. **Show the work.** Any number on screen can be traced to its inputs. The
   product explains rather than asserts.
2. **No mode is the default.** Every identity gets a native-feeling surface;
   none is a degraded version of another.
3. **Fit the user's real life, not the ideal one.** Equipment they have, food
   they eat, budget they live on, weeks they miss.
4. **Adapt with a stated reason.** Changes are auditable events, never silent.
5. **AI explains; it never decides.** Conversation and phrasing only.

## Accessibility & Inclusion

Reduced-motion is honoured throughout — motion is CSS-only and gated on
`prefers-reduced-motion`. No product-specific standard beyond that has been
established; treat WCAG AA as the working floor for a launching product.
