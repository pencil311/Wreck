import type { Food, PhotoLogItem } from "../types";
import { FOOD_BY_ID } from "./foods";

/**
 * Pure logic for photo meal estimates. Kept out of the route so it is unit
 * testable and so the "AI never decides numbers" rule is enforced by our code:
 * when the model matches an item to the WRECK database, we DISCARD the model's
 * numbers and recompute from FOOD_BY_ID x the estimated units.
 */

const KCAL_MAX = 3000;
const MACRO_MAX = 300;

/** The raw per-item shape the vision model returns (includes `units` so DB
 *  matches can be recomputed; `units` is not persisted). */
export interface RawScanItem {
  name: string;
  portion?: string;
  units?: number; // estimated household units of the matched food
  kcal?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  dbFoodId?: string;
  confidence?: "high" | "medium" | "low";
  sources?: { title: string; url: string }[];
}

function clamp(n: unknown, lo: number, hi: number): number {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.min(hi, Math.max(lo, v));
}
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Normalise one raw item into a stored PhotoLogItem.
 * - Valid dbFoodId -> numbers recomputed from FOODS x units, origin "database".
 * - Otherwise -> the model's (web) estimate, origin "web_estimate", clamped.
 */
export function normalizeItem(
  raw: RawScanItem,
  foodById: Record<string, Food> = FOOD_BY_ID
): PhotoLogItem {
  const food = raw.dbFoodId ? foodById[raw.dbFoodId] : undefined;
  const name = String(raw.name ?? "").trim().slice(0, 80);

  if (food) {
    const units = clamp(raw.units ?? 1, 0.1, 20);
    return {
      name: name || food.name,
      portion: (raw.portion ?? "").slice(0, 80) || `${units} x ${food.unit}`,
      kcal: Math.round(clamp(food.kcal * units, 0, KCAL_MAX)),
      proteinG: round1(clamp(food.proteinG * units, 0, MACRO_MAX)),
      carbsG: round1(clamp(food.carbsG * units, 0, MACRO_MAX)),
      fatG: round1(clamp(food.fatG * units, 0, MACRO_MAX)),
      origin: "database",
      dbFoodId: food.id,
      confidence: raw.confidence
    };
  }

  return {
    name,
    portion: (raw.portion ?? "").slice(0, 80),
    kcal: Math.round(clamp(raw.kcal, 0, KCAL_MAX)),
    proteinG: round1(clamp(raw.proteinG, 0, MACRO_MAX)),
    carbsG: round1(clamp(raw.carbsG, 0, MACRO_MAX)),
    fatG: round1(clamp(raw.fatG, 0, MACRO_MAX)),
    origin: "web_estimate",
    confidence: raw.confidence,
    sources: Array.isArray(raw.sources) ? raw.sources.slice(0, 6) : undefined
  };
}

export function normalizeItems(
  raw: RawScanItem[],
  foodById: Record<string, Food> = FOOD_BY_ID
): PhotoLogItem[] {
  return (Array.isArray(raw) ? raw : []).slice(0, 12).map((r) => normalizeItem(r, foodById));
}

/** Day/meal totals are always the sum of the items (our code, never the model). */
export function totalsFromItems(
  items: { kcal: number; proteinG: number; carbsG: number; fatG: number }[]
) {
  return items.reduce(
    (a, i) => ({
      kcal: a.kcal + i.kcal,
      proteinG: round1(a.proteinG + i.proteinG),
      carbsG: round1(a.carbsG + i.carbsG),
      fatG: round1(a.fatG + i.fatG)
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}
