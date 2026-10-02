import type { Profile } from "./types";

/** Fixture profiles used by tests (and handy as seed personas). */

const base: Profile = {
  primaryGoal: "health",
  identity: "general",
  experience: "intermediate",
  daysPerWeek: 3,
  sessionMinutes: 45,
  equipment: "full_gym",
  travelFrequency: "rare",
  sex: "male",
  age: 28,
  heightCm: 175,
  weightKg: 75,
  activity: "moderate",
  diet: "omnivore",
  cuisine: "no_preference",
  mealSource: "home",
  budget: "moderate",
  sleepHours: 7.5,
  stress: "low",
  coaching: "balanced",
  dislikes: []
};

export const beginnerVeg: Profile = {
  ...base,
  primaryGoal: "health",
  identity: "beginner",
  experience: "new",
  daysPerWeek: 3,
  sessionMinutes: 30,
  equipment: "bodyweight",
  diet: "vegetarian",
  cuisine: "tamil",
  budget: "low"
};

export const bodybuilder: Profile = {
  ...base,
  primaryGoal: "muscle",
  identity: "bodybuilding",
  experience: "intermediate",
  daysPerWeek: 4,
  sessionMinutes: 60,
  equipment: "full_gym",
  diet: "omnivore",
  cuisine: "north_indian",
  physiquePriority: "balanced"
};

export const runner: Profile = {
  ...base,
  primaryGoal: "endurance",
  identity: "running",
  daysPerWeek: 4,
  sessionMinutes: 45,
  equipment: "bodyweight",
  diet: "eggetarian",
  cuisine: "no_preference",
  raceDistance: "10k",
  weeklyMileageKm: 30
};

export const footballer: Profile = {
  ...base,
  primaryGoal: "sport",
  identity: "sports",
  daysPerWeek: 4,
  sessionMinutes: 60,
  equipment: "full_gym",
  sport: "football",
  sportSeason: "in"
};

export const homeTrainee: Profile = {
  ...base,
  primaryGoal: "fat_loss",
  identity: "general",
  experience: "returning",
  daysPerWeek: 3,
  sessionMinutes: 40,
  equipment: "home_basic",
  diet: "vegetarian",
  cuisine: "kerala",
  budget: "moderate"
};

export const traveler: Profile = {
  ...base,
  primaryGoal: "health",
  identity: "general",
  equipment: "hotel",
  travelFrequency: "frequent",
  daysPerWeek: 3,
  sessionMinutes: 30
};

export const ALL_FIXTURES = { beginnerVeg, bodybuilder, runner, footballer, homeTrainee, traveler };
