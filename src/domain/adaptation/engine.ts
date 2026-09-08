import type {
  AdaptationEvent,
  CheckIn,
  FoodLogEntry,
  NutritionTargets,
  Profile,
  WorkoutLog
} from "../types";

/**
 * Rule-based adaptation. The deterministic engine decides whether a change is
 * allowed; AI may only explain the result. Every proposal carries the inputs
 * behind it so the user can tap "why did WRECK change this?" and see them.
 *
 * This function is pure: it observes recent state and returns proposed events.
 * Persisting / applying them is the caller's job.
 */

export interface AdaptationInput {
  profile: Profile;
  targets: NutritionTargets;
  workoutLogs: WorkoutLog[]; // most recent first not required
  foodLogs: FoodLogEntry[];
  checkIns: CheckIn[];
  today?: Date;
}

function daysAgo(iso: string, today: Date): number {
  const d = new Date(iso).getTime();
  return Math.floor((today.getTime() - d) / 86_400_000);
}

function id() {
  return `adp_${Math.random().toString(36).slice(2, 9)}`;
}

export function readiness(c: {
  energy: number;
  soreness: number;
  sleep: number;
  stress: number;
}): number {
  // energy + sleep are positive (1..5), soreness + stress are negative (1..5)
  const positive = (c.energy + c.sleep) / 2; // 1..5
  const negative = (c.soreness + c.stress) / 2; // 1..5
  const score = (positive - (negative - 1)) / 5; // roughly -0.2..1
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

export function detectAdaptations(input: AdaptationInput): AdaptationEvent[] {
  const today = input.today ?? new Date();
  const userId = "self";
  const out: AdaptationEvent[] = [];
  const iso = today.toISOString().slice(0, 10);

  // --- Missed sessions: fewer than expected completed in the last 7 days ---
  const last7 = input.workoutLogs.filter((w) => daysAgo(w.date, today) <= 7 && w.completed);
  const expected = Math.min(input.profile.daysPerWeek, 7);
  if (input.workoutLogs.length > 0 && last7.length < Math.max(1, expected - 2)) {
    out.push({
      id: id(),
      userId,
      date: iso,
      signal: "missed_sessions",
      title: "Re-sequenced your week",
      reason:
        "You completed fewer sessions than planned this week, so WRECK moves the next session forward instead of piling up missed days.",
      inputs: [`Completed ${last7.length} of ${expected} planned sessions in 7 days.`],
      affected: "Training schedule (rolling next session)",
      applied: false
    });
  }

  // --- Low recovery from recent check-ins ---
  const recentCheck = input.checkIns
    .filter((c) => daysAgo(c.date, today) <= 3)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (recentCheck && readiness(recentCheck) < 45) {
    out.push({
      id: id(),
      userId,
      date: iso,
      signal: "low_recovery",
      title: "Eased today's training load",
      reason:
        "Your latest check-in shows low readiness, so WRECK trims volume on the next hard session. Push again once readiness recovers.",
      inputs: [
        `Readiness ${readiness(recentCheck)} / 100`,
        `Energy ${recentCheck.energy}/5, sleep ${recentCheck.sleep}/5, soreness ${recentCheck.soreness}/5, stress ${recentCheck.stress}/5`
      ],
      affected: "Next resistance session volume",
      applied: false
    });
  }

  // --- Repeated low protein ---
  const proteinByDay = new Map<string, number>();
  for (const f of input.foodLogs) {
    if (daysAgo(f.date, today) <= 7) {
      proteinByDay.set(f.date, (proteinByDay.get(f.date) ?? 0) + f.proteinG);
    }
  }
  const loggedDays = [...proteinByDay.entries()];
  const lowDays = loggedDays.filter(([, g]) => g < input.targets.proteinG * 0.8);
  if (loggedDays.length >= 3 && lowDays.length >= Math.ceil(loggedDays.length / 2)) {
    out.push({
      id: id(),
      userId,
      date: iso,
      signal: "low_protein",
      title: "Suggested practical protein additions",
      reason:
        "Protein came in under target on most logged days. WRECK suggests a few cheap, familiar additions rather than changing your whole diet.",
      inputs: [
        `Target ${input.targets.proteinG} g`,
        `${lowDays.length} of ${loggedDays.length} logged days below 80% of target.`
      ],
      affected: "Nutrition suggestions",
      applied: false
    });
  }

  // --- Frequent travel ---
  if (input.profile.travelFrequency === "frequent") {
    out.push({
      id: id(),
      userId,
      date: iso,
      signal: "frequent_travel",
      title: "Travel Mode kept ready",
      reason:
        "You travel often, so WRECK keeps portable, equipment-light alternatives one tap away and won't penalise a shifted day.",
      inputs: ["Travel frequency: frequent"],
      affected: "Exercise pool + scheduling",
      applied: true
    });
  }

  return out;
}
