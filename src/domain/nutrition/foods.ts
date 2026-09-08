import type { Food } from "../types";

/**
 * Seed food library with Indian/regional metadata, household units, macros,
 * approximate cost and effort. Values are reviewed estimates per household
 * serving — the database is the source of truth; the coach may assemble meals
 * from these but must never invent numbers outside this table.
 */
export const FOODS: Food[] = [
  // ---- Pan-India staples ----
  { id: "roti", name: "Roti (wheat)", cuisine: "pan_india", diet: "vegan", unit: "1 roti", gramsPerUnit: 40, kcal: 110, proteinG: 3, carbsG: 22, fatG: 1, costRupees: 5, effort: "quick", availability: "common", tags: ["grain", "staple"] },
  { id: "rice-cooked", name: "Cooked Rice", cuisine: "pan_india", diet: "vegan", unit: "1 katori", gramsPerUnit: 150, kcal: 195, proteinG: 4, carbsG: 43, fatG: 0.4, costRupees: 8, effort: "quick", availability: "common", tags: ["grain", "staple"] },
  { id: "dal", name: "Dal (cooked)", cuisine: "pan_india", diet: "vegan", unit: "1 katori", gramsPerUnit: 150, kcal: 150, proteinG: 9, carbsG: 20, fatG: 3, costRupees: 15, effort: "moderate", availability: "common", tags: ["protein", "legume"] },
  { id: "curd", name: "Curd (dahi)", cuisine: "pan_india", diet: "vegetarian", unit: "1 katori", gramsPerUnit: 150, kcal: 100, proteinG: 5, carbsG: 7, fatG: 5, costRupees: 12, effort: "no_cook", availability: "common", tags: ["dairy", "protein"] },
  { id: "paneer", name: "Paneer", cuisine: "pan_india", diet: "vegetarian", unit: "100 g", gramsPerUnit: 100, kcal: 265, proteinG: 18, carbsG: 4, fatG: 20, costRupees: 45, effort: "quick", availability: "common", tags: ["protein", "dairy"] },
  { id: "milk", name: "Milk (full)", cuisine: "pan_india", diet: "vegetarian", unit: "1 glass", gramsPerUnit: 200, kcal: 130, proteinG: 7, carbsG: 10, fatG: 7, costRupees: 14, effort: "no_cook", availability: "common", tags: ["dairy", "protein"] },
  { id: "egg", name: "Whole Egg (boiled)", cuisine: "pan_india", diet: "eggetarian", unit: "1 egg", gramsPerUnit: 50, kcal: 78, proteinG: 6, carbsG: 0.6, fatG: 5, costRupees: 7, effort: "quick", availability: "common", tags: ["protein"] },
  { id: "egg-white", name: "Egg White (boiled)", cuisine: "pan_india", diet: "eggetarian", unit: "1 white", gramsPerUnit: 33, kcal: 17, proteinG: 3.6, carbsG: 0.2, fatG: 0.1, costRupees: 7, effort: "quick", availability: "common", tags: ["protein", "lean"] },
  { id: "chicken-breast", name: "Chicken Breast (cooked)", cuisine: "pan_india", diet: "omnivore", unit: "100 g", gramsPerUnit: 100, kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6, costRupees: 40, effort: "moderate", availability: "common", tags: ["protein", "lean"] },
  { id: "soya-chunks", name: "Soya Chunks (cooked)", cuisine: "pan_india", diet: "vegan", unit: "1 katori", gramsPerUnit: 100, kcal: 175, proteinG: 26, carbsG: 12, fatG: 1, costRupees: 12, effort: "quick", availability: "common", tags: ["protein", "budget", "vegan"] },
  { id: "peanuts", name: "Roasted Peanuts", cuisine: "pan_india", diet: "vegan", unit: "handful", gramsPerUnit: 30, kcal: 170, proteinG: 8, carbsG: 5, fatG: 14, costRupees: 8, effort: "no_cook", availability: "common", tags: ["fat", "protein", "budget"] },
  { id: "banana", name: "Banana", cuisine: "pan_india", diet: "vegan", unit: "1 medium", gramsPerUnit: 118, kcal: 105, proteinG: 1.3, carbsG: 27, fatG: 0.3, costRupees: 6, effort: "no_cook", availability: "common", tags: ["fruit", "carb"] },
  { id: "whey", name: "Whey Protein", cuisine: "generic", diet: "vegetarian", unit: "1 scoop", gramsPerUnit: 30, kcal: 120, proteinG: 24, carbsG: 3, fatG: 1.5, costRupees: 55, effort: "no_cook", availability: "common", tags: ["protein", "supplement"] },

  // ---- Tamil / South ----
  { id: "idli", name: "Idli", cuisine: "tamil", diet: "vegan", unit: "2 idli", gramsPerUnit: 100, kcal: 116, proteinG: 4, carbsG: 25, fatG: 0.4, costRupees: 12, effort: "moderate", availability: "common", tags: ["breakfast", "fermented"] },
  { id: "dosa", name: "Plain Dosa", cuisine: "tamil", diet: "vegan", unit: "1 dosa", gramsPerUnit: 80, kcal: 168, proteinG: 4, carbsG: 29, fatG: 4, costRupees: 20, effort: "moderate", availability: "common", tags: ["breakfast"] },
  { id: "sambar", name: "Sambar", cuisine: "tamil", diet: "vegan", unit: "1 katori", gramsPerUnit: 150, kcal: 120, proteinG: 6, carbsG: 16, fatG: 4, costRupees: 15, effort: "moderate", availability: "common", tags: ["legume", "side"] },
  { id: "curd-rice", name: "Curd Rice", cuisine: "tamil", diet: "vegetarian", unit: "1 bowl", gramsPerUnit: 200, kcal: 230, proteinG: 7, carbsG: 38, fatG: 5, costRupees: 20, effort: "quick", availability: "common", tags: ["meal", "gut"] },
  { id: "pongal", name: "Ven Pongal", cuisine: "tamil", diet: "vegetarian", unit: "1 bowl", gramsPerUnit: 200, kcal: 290, proteinG: 8, carbsG: 42, fatG: 10, costRupees: 25, effort: "moderate", availability: "common", tags: ["breakfast"] },

  // ---- Kerala ----
  { id: "puttu", name: "Puttu", cuisine: "kerala", diet: "vegan", unit: "1 cylinder", gramsPerUnit: 150, kcal: 200, proteinG: 4, carbsG: 44, fatG: 1, costRupees: 18, effort: "moderate", availability: "regional", tags: ["breakfast"] },
  { id: "kadala-curry", name: "Kadala Curry", cuisine: "kerala", diet: "vegan", unit: "1 katori", gramsPerUnit: 150, kcal: 190, proteinG: 9, carbsG: 24, fatG: 6, costRupees: 20, effort: "moderate", availability: "regional", tags: ["legume", "protein"] },
  { id: "fish-curry", name: "Fish Curry", cuisine: "kerala", diet: "omnivore", unit: "1 piece", gramsPerUnit: 120, kcal: 200, proteinG: 22, carbsG: 4, fatG: 11, costRupees: 45, effort: "advanced", availability: "regional", tags: ["protein"] },

  // ---- Karnataka ----
  { id: "ragi-mudde", name: "Ragi Mudde", cuisine: "karnataka", diet: "vegan", unit: "1 ball", gramsPerUnit: 150, kcal: 190, proteinG: 5, carbsG: 40, fatG: 1, costRupees: 15, effort: "moderate", availability: "regional", tags: ["millet", "carb"] },
  { id: "bisi-bele-bath", name: "Bisi Bele Bath", cuisine: "karnataka", diet: "vegetarian", unit: "1 bowl", gramsPerUnit: 220, kcal: 330, proteinG: 10, carbsG: 52, fatG: 9, costRupees: 30, effort: "advanced", availability: "regional", tags: ["meal"] },

  // ---- Andhra / Telangana ----
  { id: "pesarattu", name: "Pesarattu", cuisine: "andhra_telangana", diet: "vegan", unit: "1 dosa", gramsPerUnit: 100, kcal: 180, proteinG: 10, carbsG: 24, fatG: 5, costRupees: 22, effort: "moderate", availability: "regional", tags: ["breakfast", "protein", "legume"] },
  { id: "gongura-dal", name: "Gongura Pappu", cuisine: "andhra_telangana", diet: "vegan", unit: "1 katori", gramsPerUnit: 150, kcal: 160, proteinG: 9, carbsG: 19, fatG: 5, costRupees: 18, effort: "moderate", availability: "regional", tags: ["legume", "protein"] },

  // ---- North Indian ----
  { id: "rajma", name: "Rajma (cooked)", cuisine: "north_indian", diet: "vegan", unit: "1 katori", gramsPerUnit: 150, kcal: 170, proteinG: 10, carbsG: 26, fatG: 3, costRupees: 18, effort: "moderate", availability: "common", tags: ["legume", "protein"] },
  { id: "chole", name: "Chole (chickpea)", cuisine: "north_indian", diet: "vegan", unit: "1 katori", gramsPerUnit: 150, kcal: 210, proteinG: 11, carbsG: 30, fatG: 6, costRupees: 20, effort: "moderate", availability: "common", tags: ["legume", "protein"] },
  { id: "paratha", name: "Aloo Paratha", cuisine: "north_indian", diet: "vegetarian", unit: "1 paratha", gramsPerUnit: 120, kcal: 280, proteinG: 6, carbsG: 40, fatG: 10, costRupees: 25, effort: "moderate", availability: "common", tags: ["breakfast"] },
  { id: "chicken-curry", name: "Chicken Curry", cuisine: "north_indian", diet: "omnivore", unit: "1 katori", gramsPerUnit: 180, kcal: 260, proteinG: 24, carbsG: 6, fatG: 15, costRupees: 55, effort: "advanced", availability: "common", tags: ["protein"] },

  // ---- Gujarati ----
  { id: "dhokla", name: "Dhokla", cuisine: "gujarati", diet: "vegetarian", unit: "3 pieces", gramsPerUnit: 120, kcal: 160, proteinG: 6, carbsG: 24, fatG: 4, costRupees: 22, effort: "advanced", availability: "regional", tags: ["snack", "fermented"] },
  { id: "khichdi", name: "Khichdi", cuisine: "gujarati", diet: "vegetarian", unit: "1 bowl", gramsPerUnit: 220, kcal: 300, proteinG: 11, carbsG: 48, fatG: 7, costRupees: 22, effort: "quick", availability: "common", tags: ["meal", "comfort"] },

  // ---- Punjabi ----
  { id: "dal-makhani", name: "Dal Makhani", cuisine: "punjabi", diet: "vegetarian", unit: "1 katori", gramsPerUnit: 150, kcal: 230, proteinG: 9, carbsG: 20, fatG: 12, costRupees: 30, effort: "advanced", availability: "common", tags: ["legume"] },
  { id: "lassi", name: "Salted Lassi", cuisine: "punjabi", diet: "vegetarian", unit: "1 glass", gramsPerUnit: 250, kcal: 150, proteinG: 6, carbsG: 12, fatG: 8, costRupees: 20, effort: "no_cook", availability: "common", tags: ["dairy", "drink"] },

  // ---- Bengali ----
  { id: "macher-jhol", name: "Macher Jhol", cuisine: "bengali", diet: "omnivore", unit: "1 piece", gramsPerUnit: 120, kcal: 180, proteinG: 21, carbsG: 5, fatG: 8, costRupees: 45, effort: "advanced", availability: "regional", tags: ["protein", "fish"] },
  { id: "cholar-dal", name: "Cholar Dal", cuisine: "bengali", diet: "vegan", unit: "1 katori", gramsPerUnit: 150, kcal: 190, proteinG: 9, carbsG: 27, fatG: 5, costRupees: 18, effort: "moderate", availability: "regional", tags: ["legume", "protein"] },

  // ---- Maharashtrian ----
  { id: "poha", name: "Poha", cuisine: "maharashtrian", diet: "vegan", unit: "1 bowl", gramsPerUnit: 180, kcal: 250, proteinG: 5, carbsG: 45, fatG: 6, costRupees: 18, effort: "quick", availability: "common", tags: ["breakfast"] },
  { id: "misal", name: "Misal", cuisine: "maharashtrian", diet: "vegan", unit: "1 bowl", gramsPerUnit: 220, kcal: 330, proteinG: 14, carbsG: 40, fatG: 12, costRupees: 35, effort: "advanced", availability: "regional", tags: ["legume", "protein", "spicy"] }
];

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(
  FOODS.map((f) => [f.id, f])
);

/** Diet permission ranking — lower diets are subsets of higher. */
const DIET_RANK: Record<Food["diet"], number> = {
  vegan: 0,
  vegetarian: 1,
  eggetarian: 2,
  omnivore: 3
};

/** Is a food eligible for someone with the given diet? */
export function eligibleForDiet(food: Food, diet: Food["diet"]): boolean {
  return DIET_RANK[food.diet] <= DIET_RANK[diet];
}
