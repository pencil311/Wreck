import { describe, it, expect } from "vitest";
import { normalizeItem, normalizeItems, totalsFromItems, type RawScanItem } from "./photo-estimate";
import { FOOD_BY_ID } from "./foods";
import { sumDay } from "./engine";
import type { FoodLogEntry } from "../types";

describe("photo-estimate", () => {
  it("recomputes DB-matched items from FOODS and ignores the model's numbers", () => {
    const paneer = FOOD_BY_ID["paneer"]; // kcal 265, protein 18 per unit
    const raw: RawScanItem = {
      name: "Paneer cubes",
      dbFoodId: "paneer",
      units: 2,
      kcal: 9999, // model lied; must be discarded
      proteinG: 1,
      carbsG: 1,
      fatG: 1
    };
    const item = normalizeItem(raw);
    expect(item.origin).toBe("database");
    expect(item.dbFoodId).toBe("paneer");
    expect(item.kcal).toBe(Math.round(paneer.kcal * 2)); // 530, not 9999
    expect(item.proteinG).toBe(paneer.proteinG * 2);
  });

  it("treats an unknown dbFoodId as a web estimate and keeps the model numbers", () => {
    const raw: RawScanItem = {
      name: "Mystery curry",
      dbFoodId: "does-not-exist",
      units: 1,
      kcal: 420,
      proteinG: 22,
      carbsG: 30,
      fatG: 18
    };
    const item = normalizeItem(raw);
    expect(item.origin).toBe("web_estimate");
    expect(item.dbFoodId).toBeUndefined();
    expect(item.kcal).toBe(420);
  });

  it("clamps values to the allowed bounds", () => {
    const item = normalizeItem({ name: "Huge", kcal: 99999, proteinG: 9999, carbsG: -5, fatG: 9999 });
    expect(item.kcal).toBe(3000);
    expect(item.proteinG).toBe(300);
    expect(item.carbsG).toBe(0);
    expect(item.fatG).toBe(300);
  });

  it("totals equal the sum of the items", () => {
    const items = normalizeItems([
      { name: "A", kcal: 100, proteinG: 10, carbsG: 20, fatG: 5 },
      { name: "B", kcal: 250, proteinG: 15, carbsG: 30, fatG: 8 }
    ]);
    const t = totalsFromItems(items);
    expect(t.kcal).toBe(350);
    expect(t.proteinG).toBe(25);
    expect(t.carbsG).toBe(50);
    expect(t.fatG).toBe(13);
  });

  it("legacy FoodLogEntry without the new fields still sums correctly", () => {
    const legacy: FoodLogEntry = {
      id: "fl_1",
      userId: "u1",
      date: "2026-01-01",
      foodId: "roti",
      foodName: "Roti",
      units: 2,
      kcal: 220,
      proteinG: 6,
      carbsG: 44,
      fatG: 2,
      meal: "lunch"
    };
    expect(sumDay([legacy]).kcal).toBe(220);
  });
});
