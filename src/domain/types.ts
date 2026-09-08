/**
 * WRECK domain model.
 *
 * These are the typed contracts the whole product speaks. The deterministic
 * engines (decision, training, nutrition, adaptation) consume and produce
 * these shapes; the UI only ever renders them. Business rules never live in
 * components.
 */

/* ------------------------------------------------------------------ */
/* Identity primitives                                                 */
/* ------------------------------------------------------------------ */

export const MODES = [
  "beginner",
  "bodybuilding",
  "strength",
  "running",
  "sports",
  "calisthenics",
  "hybrid",
  "general"
] as const;
export type Mode = (typeof MODES)[number];

export const GOALS = [
  "muscle",
  "fat_loss",
  "strength",
  "endurance",
  "sport",
  "health"
] as const;
export type Goal = (typeof GOALS)[number];

export const EXPERIENCE = ["new", "returning", "intermediate", "advanced"] as const;
export type Experience = (typeof EXPERIENCE)[number];

export const EQUIPMENT = ["full_gym", "home_basic", "home_minimal", "bodyweight", "hotel"] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const DIETS = ["omnivore", "eggetarian", "vegetarian", "vegan"] as const;
export type Diet = (typeof DIETS)[number];

export const CUISINES = [
  "tamil",
  "kerala",
  "karnataka",
  "andhra_telangana",
  "north_indian",
  "gujarati",
  "punjabi",
  "bengali",
  "maharashtrian",
  "no_preference"
] as const;
export type Cuisine = (typeof CUISINES)[number];

export const MEAL_SOURCES = ["home", "hostel_mess", "restaurant", "mixed"] as const;
export type MealSource = (typeof MEAL_SOURCES)[number];

export const BUDGETS = ["low", "moderate", "flexible"] as const;
export type Budget = (typeof BUDGETS)[number];

export const COACHING = ["hands_off", "balanced", "educational"] as const;
export type Coaching = (typeof COACHING)[number];

export const SEX = ["male", "female", "unspecified"] as const;
export type Sex = (typeof SEX)[number];

export const ACTIVITY = ["sedentary", "light", "moderate", "high"] as const;
export type Activity = (typeof ACTIVITY)[number];

/* ------------------------------------------------------------------ */
/* Onboarding profile                                                  */
/* ------------------------------------------------------------------ */

export interface Profile {
  // Goal
  primaryGoal: Goal;
  secondaryGoal?: Goal;

  // Identity / mode selection
  identity: Mode;
  experience: Experience;

  // Availability + constraints
  daysPerWeek: number; // 2..6
  sessionMinutes: number; // 20..90
  equipment: Equipment;
  travelFrequency: "rare" | "sometimes" | "frequent";

  // Body metrics
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;

  // Nutrition context
  diet: Diet;
  cuisine: Cuisine;
  mealSource: MealSource;
  budget: Budget;

  // Recovery context
  sleepHours: number; // typical
  stress: "low" | "moderate" | "high";

  // Preferences
  coaching: Coaching;
  dislikes: string[]; // free tags, e.g. ["burpees"]

  // Mode-specific branches (all optional; presence depends on identity)
  physiquePriority?: "upper" | "lower" | "balanced" | "arms" | "back";
  raceDistance?: "5k" | "10k" | "half" | "full";
  weeklyMileageKm?: number;
  sport?: string;
  sportSeason?: "off" | "pre" | "in";
  targetSkills?: string[]; // calisthenics
}

/* ------------------------------------------------------------------ */
/* Decision engine output — the WRECK configuration                    */
/* ------------------------------------------------------------------ */

export interface WreckConfig {
  mode: Mode;
  /** Ordered dashboard sections for this mode. */
  dashboardPriorities: DashboardSection[];
  /** Which training template family the training engine should use. */
  trainingTemplate: TrainingTemplate;
  /** Nutrition posture. */
  nutritionMode: "surplus" | "deficit" | "maintenance";
  /** Bottom / side navigation for this mode. */
  navigation: NavItem[];
  /** Feature flags derived from constraints. */
  flags: {
    travelMode: boolean;
    budgetMode: boolean;
    regionalNutrition: boolean;
    recoveryWatch: boolean;
    beginnerGuidance: boolean;
  };
  /** Human-readable rationale lines, surfaced in the Blueprint + coach. */
  rationale: string[];
}

export type DashboardSection =
  | "primary_action"
  | "training_focus"
  | "protein"
  | "run_fueling"
  | "readiness"
  | "learning"
  | "progress_snapshot"
  | "nutrition_snapshot"
  | "check_in";

export type TrainingTemplate =
  | "beginner_full_body"
  | "general_fitness"
  | "hypertrophy_split"
  | "strength_focus"
  | "endurance_base"
  | "sport_performance"
  | "calisthenics_skill";

export interface NavItem {
  key: string;
  label: string;
  href: string;
}

/* ------------------------------------------------------------------ */
/* Training                                                            */
/* ------------------------------------------------------------------ */

export type MovementPattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "push_horizontal"
  | "push_vertical"
  | "pull_horizontal"
  | "pull_vertical"
  | "core"
  | "carry"
  | "conditioning"
  | "skill";

export interface Exercise {
  id: string;
  name: string;
  pattern: MovementPattern;
  primary: string[]; // primary muscles
  secondary: string[];
  equipment: Equipment[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  instructions: string[];
  tags: string[];
  /** ids of sensible substitutions, same objective */
  substitutions: string[];
}

export interface ExercisePrescription {
  exerciseId: string;
  name: string;
  sets: number;
  repsLow: number;
  repsHigh: number;
  restSeconds: number;
  /** progression rule key applied when logging */
  progression: "double_progression" | "linear_load" | "rep_add" | "time_add";
  note?: string;
}

export interface Workout {
  id: string;
  label: string; // "Push A", "Full Body 1", "Tempo Run"
  focus: string; // "Chest / shoulders / triceps"
  estimatedMinutes: number;
  blocks: ExercisePrescription[];
  kind: "resistance" | "run" | "conditioning" | "skill" | "mobility";
}

export interface ProgramWeek {
  index: number;
  workouts: Workout[];
}

export interface Program {
  id: string;
  template: TrainingTemplate;
  mode: Mode;
  title: string;
  daysPerWeek: number;
  weeks: ProgramWeek[];
  /** rolling = next-session-first rather than fixed weekday. */
  rolling: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Logging                                                             */
/* ------------------------------------------------------------------ */

export interface SetLog {
  reps: number;
  loadKg?: number;
  done: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  name: string;
  sets: SetLog[];
  substitutedFor?: string; // original exercise id if swapped
  substituteReason?: SubstituteReason;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  programId: string;
  workoutId: string;
  workoutLabel: string;
  date: string; // ISO date
  exercises: LoggedExercise[];
  durationMinutes?: number;
  notes?: string;
  completed: boolean;
}

export type SubstituteReason =
  | "no_equipment"
  | "dislike"
  | "too_hard"
  | "injury_area"
  | "other";

/* ------------------------------------------------------------------ */
/* Nutrition                                                           */
/* ------------------------------------------------------------------ */

export interface NutritionTargets {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  direction: "surplus" | "deficit" | "maintenance";
  /** How these were derived — shown to the user, never hidden. */
  basis: string[];
}

export interface Food {
  id: string;
  name: string;
  cuisine: Cuisine | "pan_india" | "generic";
  diet: Diet; // most permissive diet it fits within
  unit: string; // household unit, e.g. "1 katori", "2 idli"
  gramsPerUnit: number;
  kcal: number; // per unit
  proteinG: number;
  carbsG: number;
  fatG: number;
  costRupees: number; // approx per unit
  effort: "no_cook" | "quick" | "moderate" | "advanced";
  availability: "common" | "seasonal" | "regional";
  tags: string[];
}

export interface FoodLogEntry {
  id: string;
  userId: string;
  date: string; // ISO date
  foodId: string;
  foodName: string;
  units: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
}

export interface SavedMeal {
  id: string;
  userId: string;
  name: string;
  items: { foodId: string; units: number }[];
}

/* ------------------------------------------------------------------ */
/* Recovery + progress                                                 */
/* ------------------------------------------------------------------ */

export interface CheckIn {
  id: string;
  userId: string;
  date: string;
  energy: 1 | 2 | 3 | 4 | 5;
  soreness: 1 | 2 | 3 | 4 | 5;
  sleep: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  readiness: number; // derived 0..100
}

export interface BodyMetric {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Adaptation                                                          */
/* ------------------------------------------------------------------ */

export type AdaptationSignal =
  | "missed_sessions"
  | "low_recovery"
  | "low_protein"
  | "frequent_travel"
  | "goal_change"
  | "performance_up"
  | "repeated_failure";

export interface AdaptationEvent {
  id: string;
  userId: string;
  date: string;
  signal: AdaptationSignal;
  title: string;
  reason: string; // plain-language, user facing
  inputs: string[]; // the observed inputs behind the change
  affected: string; // plan element affected
  applied: boolean;
}

/* ------------------------------------------------------------------ */
/* User + persistence root                                             */
/* ------------------------------------------------------------------ */

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: string;
}

/** Everything owned by one user, as persisted. */
export interface UserData {
  profile?: Profile;
  config?: WreckConfig;
  onboardingDraft?: Partial<Profile> & { step?: number };
  program?: Program;
  workoutLogs: WorkoutLog[];
  foodLogs: FoodLogEntry[];
  savedMeals: SavedMeal[];
  checkIns: CheckIn[];
  bodyMetrics: BodyMetric[];
  adaptations: AdaptationEvent[];
  settings: UserSettings;
}

export interface UserSettings {
  reducedMotion: boolean;
  photosPrivate: boolean; // always default true
  notifyTraining: boolean;
  notifyNutrition: boolean;
}

export function emptyUserData(): UserData {
  return {
    workoutLogs: [],
    foodLogs: [],
    savedMeals: [],
    checkIns: [],
    bodyMetrics: [],
    adaptations: [],
    settings: {
      reducedMotion: false,
      photosPrivate: true,
      notifyTraining: true,
      notifyNutrition: false
    }
  };
}
