import type { NutritionTargets, Profile, WreckConfig } from "../types";

/**
 * Deterministic nutrition targets. No AI, no invented numbers.
 *
 * BMR: Mifflin-St Jeor.
 * TDEE: BMR x activity factor.
 * Direction: from the decision engine's nutritionMode.
 * Protein: g per kg bodyweight, biased by goal.
 * Fat: a share of calories with a sane floor.
 * Carbs: the remainder.
 *
 * Everything is exposed via `basis` so the user always sees how it was derived.
 * These are starting estimates; the adaptation layer refines from real trend.
 */

const ACTIVITY_FACTOR: Record<Profile["activity"], number> = {
  sedentary: 1.35,
  light: 1.5,
  moderate: 1.65,
  high: 1.8
};

export function mifflinStJeor(p: Profile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  if (p.sex === "male") return base + 5;
  if (p.sex === "female") return base - 161;
  // unspecified: average of the male/female constants
  return base - 78;
}

function proteinPerKg(p: Profile, direction: NutritionTargets["direction"]): number {
  // Higher protein in a deficit (muscle retention) and for muscle goals.
  if (direction === "deficit") return 2.2;
  if (p.primaryGoal === "muscle" || p.primaryGoal === "strength") return 2.0;
  if (p.identity === "running") return 1.6;
  return 1.8;
}

export function computeTargets(p: Profile, config: WreckConfig): NutritionTargets {
  const bmr = Math.round(mifflinStJeor(p));
  const tdee = Math.round(bmr * ACTIVITY_FACTOR[p.activity]);
  const direction = config.nutritionMode;

  let calories = tdee;
  const basis: string[] = [
    `BMR ${bmr} kcal (Mifflin-St Jeor from your age, height and weight).`,
    `TDEE ${tdee} kcal (BMR x ${ACTIVITY_FACTOR[p.activity]} for ${p.activity} activity).`
  ];

  if (direction === "deficit") {
    calories = Math.round(tdee * 0.8);
    basis.push(`Fat-loss target holds a ~20% deficit: ${calories} kcal.`);
  } else if (direction === "surplus") {
    calories = Math.round(tdee * 1.1);
    basis.push(`Muscle / strength target holds a ~10% surplus: ${calories} kcal.`);
  } else {
    basis.push(`Maintenance target sits at TDEE: ${calories} kcal.`);
  }

  const ppk = proteinPerKg(p, direction);
  const proteinG = Math.round(p.weightKg * ppk);
  basis.push(`Protein ${proteinG} g (${ppk} g per kg bodyweight).`);

  // Fat: 25% of calories, floor 0.6 g/kg.
  const fatFromPct = (calories * 0.25) / 9;
  const fatFloor = p.weightKg * 0.6;
  const fatG = Math.round(Math.max(fatFromPct, fatFloor));
  basis.push(`Fat ${fatG} g (~25% of calories, floor 0.6 g per kg).`);

  // Carbs: remainder.
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbsG = Math.max(0, Math.round((calories - proteinKcal - fatKcal) / 4));
  basis.push(`Carbs ${carbsG} g fill the rest of the calorie target.`);

  return { bmr, tdee, calories, proteinG, carbsG, fatG, direction, basis };
}

/** Sum a day of food log entries. */
export function sumDay(entries: { kcal: number; proteinG: number; carbsG: number; fatG: number }[]) {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      proteinG: acc.proteinG + e.proteinG,
      carbsG: acc.carbsG + e.carbsG,
      fatG: acc.fatG + e.fatG
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}
