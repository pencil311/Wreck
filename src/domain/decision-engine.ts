import { MODE_META } from "./modes";
import type {
  DashboardSection,
  Mode,
  Profile,
  TrainingTemplate,
  WreckConfig
} from "./types";

/**
 * The decision engine converts a Profile into a WreckConfig.
 *
 * It is intentionally a set of small, ordered, testable rules — not a prompt.
 * AI never runs this. Every branch here is covered by decision-engine.test.ts.
 */

function resolveTemplate(p: Profile): TrainingTemplate {
  // Identity is the strongest signal, then goal, then experience.
  switch (p.identity) {
    case "bodybuilding":
      return "hypertrophy_split";
    case "strength":
      return "strength_focus";
    case "running":
      return "endurance_base";
    case "sports":
      return "sport_performance";
    case "calisthenics":
      return "calisthenics_skill";
    case "beginner":
      return "beginner_full_body";
    case "hybrid":
      // Hybrid leans on the goal it is biased toward.
      return p.primaryGoal === "endurance" ? "endurance_base" : "strength_focus";
    case "general":
    default:
      // A brand-new general trainee still gets the gentle full-body ramp.
      return p.experience === "new" ? "beginner_full_body" : "general_fitness";
  }
}

function resolveNutritionMode(p: Profile): WreckConfig["nutritionMode"] {
  if (p.primaryGoal === "fat_loss") return "deficit";
  if (p.primaryGoal === "muscle") return "surplus";
  if (p.primaryGoal === "strength") return "surplus";
  // endurance / sport / health hold at maintenance unless fat loss is secondary
  if (p.secondaryGoal === "fat_loss") return "deficit";
  if (p.secondaryGoal === "muscle") return "surplus";
  return "maintenance";
}

function resolveDashboard(mode: Mode): DashboardSection[] {
  const base: DashboardSection[] = ["primary_action"];
  const tail: DashboardSection[] = ["progress_snapshot", "check_in"];
  switch (mode) {
    case "bodybuilding":
      return [...base, "training_focus", "protein", "nutrition_snapshot", ...tail];
    case "strength":
      return [...base, "training_focus", "nutrition_snapshot", ...tail];
    case "running":
      return [...base, "run_fueling", "nutrition_snapshot", ...tail];
    case "sports":
      return [...base, "readiness", "training_focus", ...tail];
    case "calisthenics":
      return [...base, "training_focus", "nutrition_snapshot", ...tail];
    case "beginner":
      return [...base, "learning", "nutrition_snapshot", ...tail];
    case "hybrid":
      return [...base, "readiness", "training_focus", "nutrition_snapshot", ...tail];
    case "general":
    default:
      return [...base, "training_focus", "nutrition_snapshot", ...tail];
  }
}

export function buildConfig(p: Profile): WreckConfig {
  const mode = p.identity;
  const template = resolveTemplate(p);
  const nutritionMode = resolveNutritionMode(p);

  const flags = {
    travelMode: p.travelFrequency !== "rare" || p.equipment === "hotel",
    budgetMode: p.budget === "low",
    regionalNutrition: p.cuisine !== "no_preference",
    recoveryWatch: p.sleepHours < 6.5 || p.stress === "high",
    beginnerGuidance: p.experience === "new" || mode === "beginner"
  };

  const rationale: string[] = [];
  rationale.push(
    `Primary goal is ${labelGoal(p.primaryGoal)}, so nutrition is set to ${nutritionMode}.`
  );
  rationale.push(
    `${p.daysPerWeek} days a week at ~${p.sessionMinutes} min drives a ${p.daysPerWeek}-day structure.`
  );
  if (p.sessionMinutes <= 30) {
    rationale.push("Short sessions, so high-value compound movements are prioritised.");
  }
  rationale.push(`Equipment is ${labelEquipment(p.equipment)}; exercises are filtered to match.`);
  if (flags.travelMode) {
    rationale.push("You travel, so Travel Mode keeps portable alternatives ready.");
  }
  if (flags.regionalNutrition) {
    rationale.push(`Meals prefer ${labelCuisine(p.cuisine)} foods you actually eat.`);
  }
  if (flags.budgetMode) {
    rationale.push("Budget Mode ranks low-cost, high-protein foods higher.");
  }
  if (flags.recoveryWatch) {
    rationale.push("Recovery looks tight, so the plan will watch load and adjust.");
  }

  return {
    mode,
    dashboardPriorities: resolveDashboard(mode),
    trainingTemplate: template,
    nutritionMode,
    navigation: MODE_META[mode].nav,
    flags,
    rationale
  };
}

/* ---- small label helpers (also used by UI) ---- */

export function labelGoal(g: Profile["primaryGoal"]): string {
  return {
    muscle: "muscle gain",
    fat_loss: "fat loss",
    strength: "strength",
    endurance: "endurance",
    sport: "sport performance",
    health: "general health"
  }[g];
}

export function labelEquipment(e: Profile["equipment"]): string {
  return {
    full_gym: "a full gym",
    home_basic: "a basic home setup",
    home_minimal: "minimal home kit",
    bodyweight: "bodyweight only",
    hotel: "hotel / travel"
  }[e];
}

export function labelCuisine(c: Profile["cuisine"]): string {
  return {
    tamil: "Tamil",
    kerala: "Kerala",
    karnataka: "Karnataka",
    andhra_telangana: "Andhra / Telangana",
    north_indian: "North Indian",
    gujarati: "Gujarati",
    punjabi: "Punjabi",
    bengali: "Bengali",
    maharashtrian: "Maharashtrian",
    no_preference: "no specific"
  }[c];
}
