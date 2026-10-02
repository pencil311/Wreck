import "server-only";
import { getStore } from "@/lib/store";
import { targetsFor } from "@/lib/data";
import { sumDay } from "@/domain/nutrition/engine";
import { MODE_META } from "@/domain/modes";
import { todayISO } from "@/lib/utils";
import type { User } from "@/domain/types";

/**
 * Real-data snapshot for the planet-jumping desktop app. Mirrors what the Next
 * dashboard computes. Used both by /api/desktop/snapshot (client refresh after
 * actions) and by the /desktop route (server-side injection as window.__WRECK__
 * for the first synchronous render).
 */
export async function buildSnapshot(user: User) {
  const data = await getStore().getData(user.id);
  const config = data.config;
  const targets = targetsFor(data);
  const today = todayISO();

  const workouts = data.program?.weeks[0]?.workouts ?? [];
  const doneTodayIds = new Set(
    data.workoutLogs.filter((w) => w.date === today).map((w) => w.workoutId)
  );
  const nextWorkout = workouts.find((w) => !doneTodayIds.has(w.id)) ?? workouts[0];

  const weekAgo = Date.now() - 7 * 86_400_000;
  const sessionsThisWeek = data.workoutLogs.filter(
    (w) => w.completed && new Date(w.date).getTime() >= weekAgo
  ).length;

  const todayFood = data.foodLogs.filter((f) => f.date === today);
  const dayTotals = sumDay(todayFood);
  const todayCheckIn = data.checkIns.find((c) => c.date === today) ?? null;
  const meta = config ? MODE_META[config.mode] : null;

  return {
    onboarded: Boolean(data.profile && data.config),
    user: { name: user.displayName },
    mode: config?.mode ?? null,
    modeLabel: meta?.label ?? "",
    targets: targets
      ? {
          calories: targets.calories,
          proteinG: targets.proteinG,
          carbsG: targets.carbsG,
          fatG: targets.fatG,
          direction: targets.direction
        }
      : null,
    today: {
      session: nextWorkout
        ? { label: nextWorkout.label, focus: nextWorkout.focus, minutes: nextWorkout.estimatedMinutes }
        : null,
      food: {
        kcal: dayTotals.kcal,
        proteinG: dayTotals.proteinG,
        carbsG: dayTotals.carbsG,
        fatG: dayTotals.fatG,
        entries: todayFood.map((f) => ({
          id: f.id,
          name: f.foodName,
          units: f.units,
          kcal: f.kcal,
          proteinG: f.proteinG,
          meal: f.meal
        }))
      },
      checkIn: todayCheckIn
        ? {
            energy: todayCheckIn.energy,
            sleep: todayCheckIn.sleep,
            soreness: todayCheckIn.soreness,
            stress: todayCheckIn.stress,
            readiness: todayCheckIn.readiness
          }
        : null
    },
    week: {
      sessions: sessionsThisWeek,
      target: data.program?.daysPerWeek ?? (config?.mode === "beginner" ? 3 : 4)
    },
    program: data.program
      ? { title: data.program.title, daysPerWeek: data.program.daysPerWeek }
      : null,
    weight: data.bodyMetrics.map((b) => ({ date: b.date, kg: b.weightKg }))
  };
}
