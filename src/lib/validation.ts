import { z } from "zod";
import {
  ACTIVITY,
  BUDGETS,
  COACHING,
  CUISINES,
  DIETS,
  EQUIPMENT,
  EXPERIENCE,
  GOALS,
  MEAL_SOURCES,
  MODES,
  SEX
} from "@/domain/types";

export const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const registerSchema = credentialsSchema.extend({
  displayName: z.string().trim().min(1, "Tell us what to call you.").max(40)
});

export const profileSchema = z.object({
  primaryGoal: z.enum(GOALS),
  secondaryGoal: z.enum(GOALS).optional(),
  identity: z.enum(MODES),
  experience: z.enum(EXPERIENCE),
  daysPerWeek: z.number().int().min(2).max(6),
  sessionMinutes: z.number().int().min(20).max(120),
  equipment: z.enum(EQUIPMENT),
  travelFrequency: z.enum(["rare", "sometimes", "frequent"]),
  sex: z.enum(SEX),
  age: z.number().int().min(13).max(90),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(30).max(250),
  activity: z.enum(ACTIVITY),
  diet: z.enum(DIETS),
  cuisine: z.enum(CUISINES),
  mealSource: z.enum(MEAL_SOURCES),
  budget: z.enum(BUDGETS),
  sleepHours: z.number().min(3).max(12),
  stress: z.enum(["low", "moderate", "high"]),
  coaching: z.enum(COACHING),
  dislikes: z.array(z.string()).default([]),
  physiquePriority: z.enum(["upper", "lower", "balanced", "arms", "back"]).optional(),
  raceDistance: z.enum(["5k", "10k", "half", "full"]).optional(),
  weeklyMileageKm: z.number().min(0).max(250).optional(),
  sport: z.string().max(40).optional(),
  sportSeason: z.enum(["off", "pre", "in"]).optional(),
  targetSkills: z.array(z.string()).optional()
});

export const onboardingDraftSchema = profileSchema.partial().extend({
  step: z.number().int().min(0).optional()
});

export const checkInSchema = z.object({
  energy: z.number().int().min(1).max(5),
  soreness: z.number().int().min(1).max(5),
  sleep: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5)
});

export const foodLogSchema = z.object({
  foodId: z.string(),
  units: z.number().positive().max(20),
  meal: z.enum(["breakfast", "lunch", "dinner", "snack"])
});

export const bodyMetricSchema = z.object({
  weightKg: z.number().min(30).max(250),
  note: z.string().max(140).optional()
});

export const workoutLogSchema = z.object({
  workoutId: z.string(),
  workoutLabel: z.string(),
  durationMinutes: z.number().int().min(0).max(300).optional(),
  notes: z.string().max(500).optional(),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      name: z.string(),
      substitutedFor: z.string().optional(),
      substituteReason: z
        .enum(["no_equipment", "dislike", "too_hard", "injury_area", "other"])
        .optional(),
      sets: z.array(
        z.object({
          reps: z.number().int().min(0).max(100),
          loadKg: z.number().min(0).max(500).optional(),
          done: z.boolean()
        })
      )
    })
  )
});

export const settingsSchema = z.object({
  reducedMotion: z.boolean(),
  photosPrivate: z.boolean(),
  notifyTraining: z.boolean(),
  notifyNutrition: z.boolean()
});

export const coachSchema = z.object({
  intent: z
    .enum(["tired", "missed", "change_meal", "explain_workout", "what_eat", "why_changed"])
    .optional(),
  text: z.string().max(1000).optional()
});
