"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  buildConfig
} from "@/domain/decision-engine";
import { generateProgram, rankSubstitutions } from "@/domain/training/engine";
import { computeTargets } from "@/domain/nutrition/engine";
import { buildDayPlan, mealAlternatives } from "@/domain/nutrition/meal-planner";
import { detectAdaptations, readiness } from "@/domain/adaptation/engine";
import { FOOD_BY_ID } from "@/domain/nutrition/foods";
import { emptyUserData, type Profile, type UserData } from "@/domain/types";
import {
  bodyMetricSchema,
  checkInSchema,
  foodLogSchema,
  onboardingDraftSchema,
  profileSchema,
  registerSchema,
  settingsSchema,
  workoutLogSchema
} from "@/lib/validation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  destroySession,
  getSessionUserId
} from "@/lib/auth/session";
import { getStore } from "@/lib/store";
import { todayISO } from "@/lib/utils";

/* ---------------------------------------------------------------- */
/* Result helpers                                                    */
/* ---------------------------------------------------------------- */

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fields?: Record<string, string> };

function zodFields(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

async function withData<T>(fn: (userId: string, data: UserData) => Promise<T> | T): Promise<T> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("UNAUTHORIZED");
  const store = getStore();
  const data = await store.getData(userId);
  const result = await fn(userId, data);
  return result;
}

/* ---------------------------------------------------------------- */
/* Auth                                                              */
/* ---------------------------------------------------------------- */

export async function registerAction(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fields: zodFields(parsed.error) };

  const store = getStore();
  try {
    const hash = await hashPassword(parsed.data.password);
    const user = await store.createUser({
      email: parsed.data.email,
      passwordHash: hash,
      displayName: parsed.data.displayName
    });
    await createSession(user.id);
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_TAKEN") {
      return { ok: false, error: "An account with that email already exists.", fields: { email: "Already registered." } };
    }
    return { ok: false, error: "Could not create your account. Please try again." };
  }
}

export async function loginAction(input: { email: string; password: string }): Promise<ActionResult> {
  const store = getStore();
  const user = await store.getUserByEmail(input.email ?? "");
  const ok = user ? await verifyPassword(input.password ?? "", user.passwordHash) : false;
  if (!user || !ok) {
    return { ok: false, error: "Email or password is incorrect." };
  }
  await createSession(user.id);
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  destroySession();
  redirect("/login");
}

/* ---------------------------------------------------------------- */
/* Onboarding                                                        */
/* ---------------------------------------------------------------- */

export async function saveDraftAction(
  draft: Record<string, unknown>
): Promise<ActionResult> {
  const parsed = onboardingDraftSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, error: "Invalid draft.", fields: zodFields(parsed.error) };
  await withData(async (userId, data) => {
    data.onboardingDraft = parsed.data as UserData["onboardingDraft"];
    await getStore().saveData(userId, data);
  });
  return { ok: true };
}

export async function completeOnboardingAction(
  profileInput: Record<string, unknown>
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(profileInput);
  if (!parsed.success) {
    return { ok: false, error: "Some answers are missing or invalid.", fields: zodFields(parsed.error) };
  }
  const profile = parsed.data as Profile;
  await withData(async (userId, data) => {
    const config = buildConfig(profile);
    const program = generateProgram(profile, config);
    data.profile = profile;
    data.config = config;
    data.program = program;
    data.onboardingDraft = undefined;
    // Seed the first adaptation events (e.g. travel mode) so the log is alive.
    const targets = computeTargets(profile, config);
    data.adaptations = detectAdaptations({
      profile,
      targets,
      workoutLogs: data.workoutLogs,
      foodLogs: data.foodLogs,
      checkIns: data.checkIns
    });
    await getStore().saveData(userId, data);
  });
  revalidatePath("/app");
  return { ok: true };
}

export async function regenerateProgramAction(): Promise<ActionResult> {
  await withData(async (userId, data) => {
    if (!data.profile || !data.config) throw new Error("NO_PROFILE");
    data.program = generateProgram(data.profile, data.config);
    await getStore().saveData(userId, data);
  });
  revalidatePath("/app/training");
  return { ok: true };
}

/* ---------------------------------------------------------------- */
/* Training                                                          */
/* ---------------------------------------------------------------- */

export async function logWorkoutAction(input: unknown): Promise<ActionResult> {
  const parsed = workoutLogSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid workout log.", fields: zodFields(parsed.error) };
  await withData(async (userId, data) => {
    const p = parsed.data;
    data.workoutLogs.push({
      id: `wl_${Date.now().toString(36)}`,
      userId,
      programId: data.program?.id ?? "none",
      workoutId: p.workoutId,
      workoutLabel: p.workoutLabel,
      date: todayISO(),
      exercises: p.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        name: e.name,
        sets: e.sets,
        substitutedFor: e.substitutedFor,
        substituteReason: e.substituteReason
      })),
      durationMinutes: p.durationMinutes,
      notes: p.notes,
      completed: true
    });
    await runAdaptationInternal(data);
    await getStore().saveData(userId, data);
  });
  revalidatePath("/app");
  revalidatePath("/app/progress");
  return { ok: true };
}

export async function getSubstitutionsAction(
  exerciseId: string,
  reason: string
): Promise<ActionResult<{ id: string; name: string; difficulty: number }[]>> {
  return withData((_, data) => {
    if (!data.profile) return { ok: false, error: "Complete onboarding first." };
    const subs = rankSubstitutions(exerciseId, reason, data.profile).map((e) => ({
      id: e.id,
      name: e.name,
      difficulty: e.difficulty
    }));
    return { ok: true, data: subs };
  });
}

/* ---------------------------------------------------------------- */
/* Nutrition                                                         */
/* ---------------------------------------------------------------- */

export async function logFoodAction(input: unknown): Promise<ActionResult> {
  const parsed = foodLogSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid food entry.", fields: zodFields(parsed.error) };
  const food = FOOD_BY_ID[parsed.data.foodId];
  if (!food) return { ok: false, error: "Unknown food." };
  await withData(async (userId, data) => {
    const u = parsed.data.units;
    data.foodLogs.push({
      id: `fl_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      userId,
      date: todayISO(),
      foodId: food.id,
      foodName: food.name,
      units: u,
      kcal: Math.round(food.kcal * u),
      proteinG: Math.round(food.proteinG * u),
      carbsG: Math.round(food.carbsG * u),
      fatG: Math.round(food.fatG * u),
      meal: parsed.data.meal
    });
    await runAdaptationInternal(data);
    await getStore().saveData(userId, data);
  });
  revalidatePath("/app/nutrition");
  revalidatePath("/app");
  return { ok: true };
}

export async function deleteFoodLogAction(id: string): Promise<ActionResult> {
  await withData(async (userId, data) => {
    data.foodLogs = data.foodLogs.filter((f) => f.id !== id);
    await getStore().saveData(userId, data);
  });
  revalidatePath("/app/nutrition");
  return { ok: true };
}

export async function buildPlanAction(): Promise<
  ActionResult<{ items: { foodId: string; name: string; units: number; meal: string }[]; totals: Record<string, number> }>
> {
  return withData((_, data) => {
    if (!data.profile || !data.config) return { ok: false, error: "Complete onboarding first." };
    const targets = computeTargets(data.profile, data.config);
    const plan = buildDayPlan(data.profile, targets, data.config.flags.budgetMode);
    return {
      ok: true,
      data: {
        items: plan.items.map((i) => ({ foodId: i.food.id, name: i.food.name, units: i.units, meal: i.meal })),
        totals: plan.totals
      }
    };
  });
}

export async function mealAlternativesAction(
  foodId: string
): Promise<ActionResult<{ id: string; name: string; kcal: number; proteinG: number; costRupees: number }[]>> {
  return withData((_, data) => {
    if (!data.profile || !data.config) return { ok: false, error: "Complete onboarding first." };
    const alts = mealAlternatives(foodId, data.profile, data.config.flags.budgetMode).map((f) => ({
      id: f.id,
      name: f.name,
      kcal: f.kcal,
      proteinG: f.proteinG,
      costRupees: f.costRupees
    }));
    return { ok: true, data: alts };
  });
}

/* ---------------------------------------------------------------- */
/* Recovery + progress                                               */
/* ---------------------------------------------------------------- */

export async function checkInAction(input: unknown): Promise<ActionResult> {
  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid check-in.", fields: zodFields(parsed.error) };
  await withData(async (userId, data) => {
    const c = parsed.data;
    const r = readiness(c);
    // one check-in per day: replace today's
    data.checkIns = data.checkIns.filter((x) => x.date !== todayISO());
    data.checkIns.push({
      id: `ci_${Date.now().toString(36)}`,
      userId,
      date: todayISO(),
      energy: c.energy as 1 | 2 | 3 | 4 | 5,
      soreness: c.soreness as 1 | 2 | 3 | 4 | 5,
      sleep: c.sleep as 1 | 2 | 3 | 4 | 5,
      stress: c.stress as 1 | 2 | 3 | 4 | 5,
      readiness: r
    });
    await runAdaptationInternal(data);
    await getStore().saveData(userId, data);
  });
  revalidatePath("/app");
  return { ok: true };
}

export async function logBodyMetricAction(input: unknown): Promise<ActionResult> {
  const parsed = bodyMetricSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid entry.", fields: zodFields(parsed.error) };
  await withData(async (userId, data) => {
    data.bodyMetrics.push({
      id: `bm_${Date.now().toString(36)}`,
      userId,
      date: todayISO(),
      weightKg: parsed.data.weightKg,
      note: parsed.data.note
    });
    await getStore().saveData(userId, data);
  });
  revalidatePath("/app/progress");
  return { ok: true };
}

/* ---------------------------------------------------------------- */
/* Settings + account                                                */
/* ---------------------------------------------------------------- */

export async function saveSettingsAction(input: unknown): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid settings." };
  await withData(async (userId, data) => {
    data.settings = parsed.data;
    await getStore().saveData(userId, data);
  });
  revalidatePath("/app/settings");
  return { ok: true };
}

export async function exportDataAction(): Promise<ActionResult<UserData>> {
  return withData((_, data) => ({ ok: true, data }));
}

export async function deleteAccountDataAction(): Promise<ActionResult> {
  await withData(async (userId) => {
    // Reset to an empty record. The auth user remains but all fitness data is wiped.
    await getStore().saveData(userId, emptyUserData());
  });
  revalidatePath("/app");
  return { ok: true };
}

/* ---------------------------------------------------------------- */
/* Adaptation                                                        */
/* ---------------------------------------------------------------- */

/** Re-run detection and merge new events, preserving applied ones. */
async function runAdaptationInternal(data: UserData): Promise<void> {
  if (!data.profile || !data.config) return;
  const targets = computeTargets(data.profile, data.config);
  const detected = detectAdaptations({
    profile: data.profile,
    targets,
    workoutLogs: data.workoutLogs,
    foodLogs: data.foodLogs,
    checkIns: data.checkIns
  });
  // Keep at most the latest of each signal type; keep a rolling history.
  const bySignal = new Map<string, (typeof detected)[number]>();
  for (const e of detected) bySignal.set(e.signal, e);
  const fresh = [...bySignal.values()];
  // Preserve previously recorded events that are still distinct by title.
  const history = data.adaptations.filter(
    (old) => !fresh.some((f) => f.signal === old.signal)
  );
  data.adaptations = [...history, ...fresh].slice(-12);
}

export async function runAdaptationAction(): Promise<ActionResult> {
  await withData(async (userId, data) => {
    await runAdaptationInternal(data);
    await getStore().saveData(userId, data);
  });
  revalidatePath("/app");
  return { ok: true };
}
