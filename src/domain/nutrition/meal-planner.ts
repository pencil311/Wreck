import type { Food, NutritionTargets, Profile } from "../types";
import { FOODS, FOOD_BY_ID, eligibleForDiet } from "./foods";

/**
 * Deterministic meal assembly from the approved food database.
 *
 * It never invents foods or numbers. It filters by diet, prefers the user's
 * cuisine and (in Budget Mode) ranks cheap high-protein foods higher, then
 * greedily fills a day toward the calorie and protein targets. Family Food
 * Mode is expressed by keeping familiar regional staples and adding a
 * practical protein source rather than replacing the meal.
 */

export interface PlannedItem {
  food: Food;
  units: number;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
}

export interface DayPlan {
  items: PlannedItem[];
  totals: { kcal: number; proteinG: number; carbsG: number; fatG: number; costRupees: number };
}

function proteinValue(f: Food, budgetMode: boolean): number {
  // protein per rupee when budget matters, else raw protein
  return budgetMode ? f.proteinG / Math.max(1, f.costRupees) : f.proteinG;
}

function cuisineScore(f: Food, cuisine: Profile["cuisine"]): number {
  if (cuisine === "no_preference") return 0;
  if (f.cuisine === cuisine) return 3;
  if (f.cuisine === "pan_india" || f.cuisine === "generic") return 1;
  return -1; // a different specific region ranks lower
}

export function eligibleFoods(p: Profile): Food[] {
  return FOODS.filter((f) => eligibleForDiet(f, p.diet));
}

/** Rank protein-dense foods for "add protein to my meal" suggestions. */
export function proteinBoosters(p: Profile, budgetMode: boolean): Food[] {
  return eligibleFoods(p)
    .filter((f) => f.proteinG >= 6)
    .sort((a, b) => proteinValue(b, budgetMode) - proteinValue(a, budgetMode))
    .slice(0, 6);
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function addItem(items: PlannedItem[], food: Food, units: number, meal: PlannedItem["meal"]) {
  units = round1(units);
  if (units <= 0) return;
  items.push({ food, units, meal });
}

/**
 * Build a simple, realistic day plan.
 * Strategy: a carbohydrate staple + protein at lunch and dinner, a regional
 * breakfast, and a protein-forward snack to close the protein gap.
 */
export function buildDayPlan(p: Profile, targets: NutritionTargets, budgetMode: boolean): DayPlan {
  const pool = eligibleFoods(p);
  const byScore = [...pool].sort((a, b) => cuisineScore(b, p.cuisine) - cuisineScore(a, p.cuisine));

  const pickBreakfast = () =>
    byScore.find((f) => f.tags.includes("breakfast")) ??
    FOOD_BY_ID["poha"] ??
    pool[0];

  const pickStaple = () =>
    byScore.find((f) => f.tags.includes("grain") || f.tags.includes("staple")) ??
    FOOD_BY_ID["rice-cooked"];

  const proteins = pool
    .filter((f) => f.tags.includes("protein"))
    .sort((a, b) => proteinValue(b, budgetMode) - proteinValue(a, budgetMode));

  const legume = byScore.find((f) => f.tags.includes("legume")) ?? FOOD_BY_ID["dal"];
  const items: PlannedItem[] = [];

  const breakfast = pickBreakfast();
  addItem(items, breakfast, 1, "breakfast");

  const staple = pickStaple();
  addItem(items, staple, 2, "lunch");
  if (legume) addItem(items, legume, 1, "lunch");
  const lunchProtein = proteins[0];
  if (lunchProtein) addItem(items, lunchProtein, 1, "lunch");

  addItem(items, staple, 2, "dinner");
  const dinnerProtein = proteins[1] ?? proteins[0];
  if (dinnerProtein) addItem(items, dinnerProtein, 1, "dinner");

  // Compute running totals and close the protein gap with a snack.
  const total = () =>
    items.reduce(
      (acc, it) => ({
        kcal: acc.kcal + it.food.kcal * it.units,
        proteinG: acc.proteinG + it.food.proteinG * it.units,
        carbsG: acc.carbsG + it.food.carbsG * it.units,
        fatG: acc.fatG + it.food.fatG * it.units,
        costRupees: acc.costRupees + it.food.costRupees * it.units
      }),
      { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, costRupees: 0 }
    );

  let t = total();
  const proteinGap = targets.proteinG - t.proteinG;
  if (proteinGap > 8) {
    const booster = proteins.find((f) => f.proteinG >= 18) ?? proteins[0];
    if (booster) {
      const units = Math.max(1, Math.round(proteinGap / booster.proteinG));
      addItem(items, booster, units, "snack");
    }
  }

  // Close a large calorie gap with the staple (carbs), within reason.
  t = total();
  const kcalGap = targets.calories - t.kcal;
  if (kcalGap > 200 && staple) {
    const extra = Math.min(3, Math.round(kcalGap / staple.kcal));
    if (extra > 0) addItem(items, staple, extra, "dinner");
  }

  return { items, totals: roundTotals(total()) };
}

function roundTotals(t: DayPlan["totals"]): DayPlan["totals"] {
  return {
    kcal: Math.round(t.kcal),
    proteinG: Math.round(t.proteinG),
    carbsG: Math.round(t.carbsG),
    fatG: Math.round(t.fatG),
    costRupees: Math.round(t.costRupees)
  };
}

/** Alternatives for a meal the user says is unavailable. Same slot intent. */
export function mealAlternatives(foodId: string, p: Profile, budgetMode: boolean): Food[] {
  const original = FOOD_BY_ID[foodId];
  if (!original) return [];
  const sameIntent = eligibleFoods(p).filter(
    (f) => f.id !== foodId && sharesIntent(f, original)
  );
  return sameIntent
    .sort((a, b) => {
      const sc = cuisineScore(b, p.cuisine) - cuisineScore(a, p.cuisine);
      if (sc !== 0) return sc;
      return proteinValue(b, budgetMode) - proteinValue(a, budgetMode);
    })
    .slice(0, 5);
}

function sharesIntent(a: Food, b: Food): boolean {
  const roleTags = ["breakfast", "protein", "legume", "grain", "staple", "snack"];
  return roleTags.some((tag) => a.tags.includes(tag) && b.tags.includes(tag));
}
