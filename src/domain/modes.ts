import type { Mode, NavItem } from "./types";

/**
 * Per-mode presentation metadata. This is display + terminology only; it
 * carries no business logic. The decision engine references it to assemble a
 * WreckConfig, and the landing page's live demo reads it to morph the sample
 * interface as the visitor switches modes.
 */
export interface ModeMeta {
  key: Mode;
  label: string; // short label used in mode pickers
  identityLine: string; // "You train like a bodybuilder"
  blurb: string;
  /** Navigation labels change by mode (Train/Eat vs Run/Fuel, etc.) */
  nav: NavItem[];
  /** The single metric the dashboard hero leads with. */
  heroMetric: { label: string; sample: string; unit: string };
  /** Words the product uses in this mode. */
  lexicon: { session: string; plan: string };
  accentNote: string; // one restrained line describing the emphasis
}

const nav = (items: [string, string, string][]): NavItem[] =>
  items.map(([key, label, href]) => ({ key, label, href }));

export const MODE_META: Record<Mode, ModeMeta> = {
  beginner: {
    key: "beginner",
    label: "Beginner",
    identityLine: "You are building the habit",
    blurb: "One clear action a day, plus the why behind it. No jargon, no overwhelm.",
    nav: nav([
      ["home", "Home", "/app"],
      ["today", "Today", "/app/training"],
      ["learn", "Learn", "/app/learn"],
      ["eat", "Eat", "/app/nutrition"],
      ["progress", "Progress", "/app/progress"],
      ["coach", "Coach", "/app/coach"]
    ]),
    heroMetric: { label: "Sessions this week", sample: "2", unit: "of 3" },
    lexicon: { session: "session", plan: "starter plan" },
    accentNote: "Confidence and consistency over numbers."
  },
  bodybuilding: {
    key: "bodybuilding",
    label: "Bodybuilding",
    identityLine: "You train for physique",
    blurb: "Muscle-focused splits, weekly volume you can see, protein front and centre.",
    nav: nav([
      ["home", "Home", "/app"],
      ["train", "Train", "/app/training"],
      ["eat", "Eat", "/app/nutrition"],
      ["progress", "Progress", "/app/progress"],
      ["coach", "Coach", "/app/coach"]
    ]),
    heroMetric: { label: "Protein today", sample: "142", unit: "of 178 g" },
    lexicon: { session: "workout", plan: "hypertrophy block" },
    accentNote: "Volume, strength trend, protein adherence."
  },
  strength: {
    key: "strength",
    label: "Strength",
    identityLine: "You train for the lifts",
    blurb: "Built around your main lifts and their trend. Everything else supports them.",
    nav: nav([
      ["home", "Home", "/app"],
      ["train", "Train", "/app/training"],
      ["eat", "Eat", "/app/nutrition"],
      ["progress", "Progress", "/app/progress"],
      ["coach", "Coach", "/app/coach"]
    ]),
    heroMetric: { label: "Top set today", sample: "Squat", unit: "5 × 5" },
    lexicon: { session: "session", plan: "strength block" },
    accentNote: "Load, estimated one-rep max, main-lift trend."
  },
  running: {
    key: "running",
    label: "Runner",
    identityLine: "You train to run",
    blurb: "Today's run, your pace and distance, and what to eat around it.",
    nav: nav([
      ["home", "Home", "/app"],
      ["run", "Run", "/app/training"],
      ["fuel", "Fuel", "/app/nutrition"],
      ["progress", "Progress", "/app/progress"],
      ["coach", "Coach", "/app/coach"]
    ]),
    heroMetric: { label: "Today", sample: "8", unit: "km easy" },
    lexicon: { session: "run", plan: "base block" },
    accentNote: "Distance, pace, weekly mileage, fueling."
  },
  sports: {
    key: "sports",
    label: "Sport",
    identityLine: "You train for your sport",
    blurb: "Performance work matched to your season, gated by how recovered you are.",
    nav: nav([
      ["home", "Home", "/app"],
      ["train", "Train", "/app/training"],
      ["perform", "Perform", "/app/training"],
      ["recover", "Recover", "/app/progress"],
      ["coach", "Coach", "/app/coach"]
    ]),
    heroMetric: { label: "Readiness", sample: "78", unit: "of 100" },
    lexicon: { session: "session", plan: "performance block" },
    accentNote: "Performance output and readiness first."
  },
  calisthenics: {
    key: "calisthenics",
    label: "Calisthenics",
    identityLine: "You train for skill and control",
    blurb: "Skill progressions and holds, with the strength work that unlocks them.",
    nav: nav([
      ["home", "Home", "/app"],
      ["train", "Train", "/app/training"],
      ["eat", "Eat", "/app/nutrition"],
      ["progress", "Progress", "/app/progress"],
      ["coach", "Coach", "/app/coach"]
    ]),
    heroMetric: { label: "Skill focus", sample: "Pull-up", unit: "3 × 5" },
    lexicon: { session: "session", plan: "skill block" },
    accentNote: "Reps, holds, skill progression."
  },
  hybrid: {
    key: "hybrid",
    label: "Hybrid",
    identityLine: "You balance strength and endurance",
    blurb: "Two goals held in balance, with recovery deciding what leads on a given day.",
    nav: nav([
      ["home", "Home", "/app"],
      ["train", "Train", "/app/training"],
      ["eat", "Eat", "/app/nutrition"],
      ["progress", "Progress", "/app/progress"],
      ["coach", "Coach", "/app/coach"]
    ]),
    heroMetric: { label: "Today", sample: "Lift", unit: "+ 5 km" },
    lexicon: { session: "session", plan: "hybrid block" },
    accentNote: "Strength and endurance, balanced by recovery."
  },
  general: {
    key: "general",
    label: "General fitness",
    identityLine: "You train to feel strong and well",
    blurb: "A balanced mix of strength, movement and energy. Consistency is the win.",
    nav: nav([
      ["home", "Home", "/app"],
      ["train", "Train", "/app/training"],
      ["eat", "Eat", "/app/nutrition"],
      ["progress", "Progress", "/app/progress"],
      ["coach", "Coach", "/app/coach"]
    ]),
    heroMetric: { label: "This week", sample: "3", unit: "of 4 done" },
    lexicon: { session: "session", plan: "balanced plan" },
    accentNote: "Balanced progress and consistency."
  }
};

export const MODE_LIST = Object.values(MODE_META);
