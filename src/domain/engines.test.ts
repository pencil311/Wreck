import { describe, expect, it } from "vitest";
import { buildConfig } from "./decision-engine";
import { computeTargets, mifflinStJeor } from "./nutrition/engine";
import { generateProgram, rankSubstitutions } from "./training/engine";
import { buildDayPlan } from "./nutrition/meal-planner";
import { detectAdaptations, readiness } from "./adaptation/engine";
import { EXERCISE_BY_ID } from "./training/exercises";
import { eligibleForDiet, FOODS } from "./nutrition/foods";
import { beginnerVeg, bodybuilder, footballer, homeTrainee, runner, traveler } from "./fixtures";
import type { FoodLogEntry } from "./types";

describe("decision engine", () => {
  it("maps identity to the right training template", () => {
    expect(buildConfig(bodybuilder).trainingTemplate).toBe("hypertrophy_split");
    expect(buildConfig(runner).trainingTemplate).toBe("endurance_base");
    expect(buildConfig(footballer).trainingTemplate).toBe("sport_performance");
    expect(buildConfig(beginnerVeg).trainingTemplate).toBe("beginner_full_body");
  });

  it("sets nutrition direction from primary goal", () => {
    expect(buildConfig(bodybuilder).nutritionMode).toBe("surplus");
    expect(buildConfig(homeTrainee).nutritionMode).toBe("deficit"); // fat_loss
    expect(buildConfig(runner).nutritionMode).toBe("maintenance");
  });

  it("derives feature flags from constraints", () => {
    const trav = buildConfig(traveler);
    expect(trav.flags.travelMode).toBe(true);

    const beg = buildConfig(beginnerVeg);
    expect(beg.flags.budgetMode).toBe(true); // budget low
    expect(beg.flags.beginnerGuidance).toBe(true);
    expect(beg.flags.regionalNutrition).toBe(true); // tamil cuisine
  });

  it("orders dashboard sections by mode", () => {
    const bb = buildConfig(bodybuilder);
    expect(bb.dashboardPriorities[0]).toBe("primary_action");
    expect(bb.dashboardPriorities).toContain("protein");

    const sport = buildConfig(footballer);
    expect(sport.dashboardPriorities).toContain("readiness");
  });

  it("produces human-readable rationale", () => {
    expect(buildConfig(bodybuilder).rationale.length).toBeGreaterThan(2);
  });
});

describe("nutrition engine", () => {
  it("computes Mifflin-St Jeor with sex constants", () => {
    // male 75kg 175cm 28y => 750 + 1093.75 - 140 + 5 = 1708.75
    expect(Math.round(mifflinStJeor(bodybuilder))).toBe(1709);
  });

  it("applies deficit and surplus correctly", () => {
    const cut = computeTargets(homeTrainee, buildConfig(homeTrainee));
    expect(cut.calories).toBeLessThan(cut.tdee);
    expect(cut.direction).toBe("deficit");

    const bulk = computeTargets(bodybuilder, buildConfig(bodybuilder));
    expect(bulk.calories).toBeGreaterThan(bulk.tdee);
  });

  it("keeps protein high in a deficit and macros consistent", () => {
    const t = computeTargets(homeTrainee, buildConfig(homeTrainee));
    expect(t.proteinG).toBeGreaterThanOrEqual(Math.round(homeTrainee.weightKg * 2.0));
    // macros should roughly reconstruct the calorie target
    const reconstructed = t.proteinG * 4 + t.carbsG * 4 + t.fatG * 9;
    expect(Math.abs(reconstructed - t.calories)).toBeLessThan(60);
    expect(t.basis.length).toBeGreaterThan(3);
  });
});

describe("training engine", () => {
  it("generates the requested number of sessions", () => {
    const p = generateProgram(bodybuilder, buildConfig(bodybuilder));
    expect(p.weeks[0].workouts).toHaveLength(bodybuilder.daysPerWeek);
  });

  it("only prescribes exercises the user's equipment supports (or bodyweight fallback)", () => {
    const p = generateProgram(beginnerVeg, buildConfig(beginnerVeg));
    for (const w of p.weeks[0].workouts) {
      for (const block of w.blocks) {
        const ex = EXERCISE_BY_ID[block.exerciseId];
        const ok = ex.equipment.includes("bodyweight") || ex.equipment.includes(beginnerVeg.equipment);
        expect(ok).toBe(true);
      }
    }
  });

  it("gives runners run sessions and enables rolling for travellers", () => {
    const r = generateProgram(runner, buildConfig(runner));
    expect(r.weeks[0].workouts.some((w) => w.kind === "run")).toBe(true);

    const t = generateProgram(traveler, buildConfig(traveler));
    expect(t.rolling).toBe(true);
  });

  it("respects short sessions by capping block count", () => {
    const p = generateProgram(beginnerVeg, buildConfig(beginnerVeg)); // 30 min
    for (const w of p.weeks[0].workouts) {
      expect(w.blocks.length).toBeLessThanOrEqual(4);
    }
  });

  it("ranks substitutions within the same movement pattern", () => {
    const subs = rankSubstitutions("back-squat", "too_hard", beginnerVeg);
    expect(subs.length).toBeGreaterThan(0);
    for (const s of subs) {
      expect(s.pattern).toBe(EXERCISE_BY_ID["back-squat"].pattern);
    }
  });
});

describe("meal planner", () => {
  it("never suggests foods outside the user's diet", () => {
    const targets = computeTargets(beginnerVeg, buildConfig(beginnerVeg));
    const plan = buildDayPlan(beginnerVeg, targets, true);
    for (const item of plan.items) {
      expect(eligibleForDiet(item.food, beginnerVeg.diet)).toBe(true);
    }
  });

  it("moves protein meaningfully toward the target", () => {
    const targets = computeTargets(bodybuilder, buildConfig(bodybuilder));
    const plan = buildDayPlan(bodybuilder, targets, false);
    expect(plan.totals.proteinG).toBeGreaterThan(targets.proteinG * 0.6);
    expect(plan.totals.kcal).toBeGreaterThan(0);
  });

  it("has verified numbers for every seed food", () => {
    for (const f of FOODS) {
      expect(f.kcal).toBeGreaterThanOrEqual(0);
      expect(f.proteinG).toBeGreaterThanOrEqual(0);
      expect(f.costRupees).toBeGreaterThan(0);
    }
  });
});

describe("adaptation engine", () => {
  it("scores readiness sensibly", () => {
    const good = readiness({ energy: 5, sleep: 5, soreness: 1, stress: 1 });
    const bad = readiness({ energy: 1, sleep: 1, soreness: 5, stress: 5 });
    expect(good).toBeGreaterThan(bad);
    expect(good).toBeLessThanOrEqual(100);
    expect(bad).toBeGreaterThanOrEqual(0);
  });

  it("flags travel mode for frequent travellers", () => {
    const targets = computeTargets(traveler, buildConfig(traveler));
    const events = detectAdaptations({
      profile: traveler,
      targets,
      workoutLogs: [],
      foodLogs: [],
      checkIns: []
    });
    expect(events.some((e) => e.signal === "frequent_travel")).toBe(true);
  });

  it("detects repeated low protein and records inputs", () => {
    const targets = computeTargets(bodybuilder, buildConfig(bodybuilder));
    const today = new Date();
    const iso = (d: number) => new Date(today.getTime() - d * 86_400_000).toISOString().slice(0, 10);
    const low = (date: string, i: number): FoodLogEntry => ({
      id: `f${date}${i}`,
      userId: "self",
      date,
      foodId: "roti",
      foodName: "Roti",
      units: 1,
      kcal: 300,
      proteinG: 20, // well under target
      carbsG: 40,
      fatG: 5,
      meal: "lunch"
    });
    const foodLogs = [low(iso(0), 0), low(iso(1), 1), low(iso(2), 2)];
    const events = detectAdaptations({
      profile: bodybuilder,
      targets,
      workoutLogs: [],
      foodLogs,
      checkIns: []
    });
    const proteinEvent = events.find((e) => e.signal === "low_protein");
    expect(proteinEvent).toBeTruthy();
    expect(proteinEvent!.inputs.length).toBeGreaterThan(0);
  });
});
