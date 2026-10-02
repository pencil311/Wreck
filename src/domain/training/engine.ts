import type {
  Exercise,
  ExercisePrescription,
  MovementPattern,
  Profile,
  Program,
  ProgramWeek,
  TrainingTemplate,
  Workout,
  WreckConfig
} from "../types";
import { EXERCISES, EXERCISE_BY_ID } from "./exercises";

/**
 * Deterministic program generator.
 *
 * Given a profile + config it selects exercises (filtered by equipment,
 * respecting dislikes and experience), assembles the right split for the
 * requested number of days, and prescribes sets/reps/rest/progression by
 * goal. It is pure and fully testable.
 */

const EXPERIENCE_TARGET_DIFFICULTY: Record<Profile["experience"], number> = {
  new: 1.5,
  returning: 2.2,
  intermediate: 3,
  advanced: 4
};

function dislikesExercise(p: Profile, ex: Exercise): boolean {
  const hay = `${ex.name} ${ex.tags.join(" ")}`.toLowerCase();
  return p.dislikes.some((d) => d.trim() && hay.includes(d.trim().toLowerCase()));
}

/** Pick the best available exercise for a pattern for this user. */
function pick(
  pattern: MovementPattern,
  p: Profile,
  used: Set<string>,
  opts: { conditioningId?: string } = {}
): Exercise | undefined {
  if (opts.conditioningId && EXERCISE_BY_ID[opts.conditioningId]) {
    return EXERCISE_BY_ID[opts.conditioningId];
  }
  const target = EXPERIENCE_TARGET_DIFFICULTY[p.experience];
  const candidates = EXERCISES.filter(
    (e) =>
      e.pattern === pattern &&
      e.equipment.includes(p.equipment) &&
      !dislikesExercise(p, e)
  );
  if (candidates.length === 0) {
    // Fall back to bodyweight-compatible options ignoring equipment filter.
    const fallback = EXERCISES.filter(
      (e) => e.pattern === pattern && e.equipment.includes("bodyweight")
    );
    if (fallback.length === 0) return undefined;
    candidates.push(...fallback);
  }
  candidates.sort((a, b) => {
    // Prefer not-yet-used, then closeness to target difficulty.
    const au = used.has(a.id) ? 1 : 0;
    const bu = used.has(b.id) ? 1 : 0;
    if (au !== bu) return au - bu;
    return Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target);
  });
  return candidates[0];
}

interface Scheme {
  sets: number;
  repsLow: number;
  repsHigh: number;
  restSeconds: number;
  progression: ExercisePrescription["progression"];
}

function schemeFor(template: TrainingTemplate, p: Profile): Scheme {
  switch (template) {
    case "strength_focus":
      return { sets: p.experience === "new" ? 3 : 4, repsLow: 3, repsHigh: 5, restSeconds: 150, progression: "linear_load" };
    case "hypertrophy_split":
      return { sets: 3, repsLow: 8, repsHigh: 12, restSeconds: 75, progression: "double_progression" };
    case "calisthenics_skill":
      return { sets: 3, repsLow: 4, repsHigh: 8, restSeconds: 90, progression: "rep_add" };
    case "beginner_full_body":
      return { sets: p.experience === "new" ? 2 : 3, repsLow: 8, repsHigh: 12, restSeconds: 90, progression: "rep_add" };
    case "general_fitness":
      return { sets: 3, repsLow: 10, repsHigh: 12, restSeconds: 75, progression: "double_progression" };
    default:
      return { sets: 3, repsLow: 8, repsHigh: 12, restSeconds: 75, progression: "double_progression" };
  }
}

function prescribe(ex: Exercise, scheme: Scheme, note?: string): ExercisePrescription {
  const isCore = ex.pattern === "core";
  return {
    exerciseId: ex.id,
    name: ex.name,
    sets: isCore ? 3 : scheme.sets,
    repsLow: isCore ? 20 : scheme.repsLow,
    repsHigh: isCore ? 40 : scheme.repsHigh,
    restSeconds: isCore ? 45 : scheme.restSeconds,
    progression: isCore ? "time_add" : scheme.progression,
    note
  };
}

/** Cap a session's block count by available time. */
function maxBlocks(sessionMinutes: number): number {
  return Math.min(7, Math.max(3, Math.round(sessionMinutes / 11)));
}

/** Build the ordered movement patterns for a given day of a split. */
function daySplit(template: TrainingTemplate, days: number, dayIndex: number): {
  label: string;
  focus: string;
  patterns: MovementPattern[];
  kind: Workout["kind"];
} {
  const FULL: MovementPattern[] = ["squat", "hinge", "push_horizontal", "pull_horizontal", "push_vertical", "core"];

  if (template === "endurance_base") {
    const runDays = [
      { label: "Easy Run", focus: "Aerobic base", id: "easy-run" },
      { label: "Tempo Run", focus: "Threshold", id: "tempo-run" },
      { label: "Intervals", focus: "Speed", id: "intervals" },
      { label: "Long Run", focus: "Endurance", id: "easy-run" },
      { label: "Support Lift", focus: "Durability", id: null }
    ];
    const d = runDays[dayIndex % runDays.length];
    if (d.id) {
      return { label: d.label, focus: d.focus, patterns: ["conditioning"], kind: "run" };
    }
    return { label: d.label, focus: d.focus, patterns: ["squat", "hinge", "core"], kind: "resistance" };
  }

  if (template === "hypertrophy_split") {
    if (days <= 2) {
      return dayIndex % 2 === 0
        ? { label: "Upper", focus: "Chest / back / shoulders / arms", patterns: ["push_horizontal", "pull_horizontal", "push_vertical", "pull_vertical", "core"], kind: "resistance" }
        : { label: "Lower", focus: "Quads / hamstrings / glutes", patterns: ["squat", "hinge", "lunge", "core"], kind: "resistance" };
    }
    if (days === 3) {
      const three = [
        { label: "Push", focus: "Chest / shoulders / triceps", patterns: ["push_horizontal", "push_vertical", "push_horizontal", "core"] as MovementPattern[] },
        { label: "Pull", focus: "Back / biceps", patterns: ["pull_vertical", "pull_horizontal", "pull_horizontal", "core"] as MovementPattern[] },
        { label: "Legs", focus: "Quads / hamstrings / glutes", patterns: ["squat", "hinge", "lunge", "core"] as MovementPattern[] }
      ];
      const d = three[dayIndex % 3];
      return { ...d, kind: "resistance" };
    }
    // 4+ days: Upper / Lower alternating with variety
    return dayIndex % 2 === 0
      ? { label: `Upper ${Math.floor(dayIndex / 2) + 1}`, focus: "Push and pull", patterns: ["push_horizontal", "pull_horizontal", "push_vertical", "pull_vertical", "core"], kind: "resistance" }
      : { label: `Lower ${Math.floor(dayIndex / 2) + 1}`, focus: "Legs and posterior chain", patterns: ["squat", "hinge", "lunge", "core"], kind: "resistance" };
  }

  if (template === "strength_focus") {
    const lifts = [
      { label: "Squat Day", focus: "Squat + accessories", patterns: ["squat", "hinge", "pull_horizontal", "core"] as MovementPattern[] },
      { label: "Bench Day", focus: "Bench + accessories", patterns: ["push_horizontal", "push_vertical", "pull_horizontal", "core"] as MovementPattern[] },
      { label: "Deadlift Day", focus: "Deadlift + accessories", patterns: ["hinge", "squat", "pull_vertical", "core"] as MovementPattern[] },
      { label: "Press Day", focus: "Overhead + accessories", patterns: ["push_vertical", "push_horizontal", "pull_horizontal", "core"] as MovementPattern[] }
    ];
    const d = lifts[dayIndex % lifts.length];
    return { ...d, kind: "resistance" };
  }

  if (template === "calisthenics_skill") {
    const skill = [
      { label: "Push Skill", focus: "Push strength + skill", patterns: ["push_vertical", "push_horizontal", "core"] as MovementPattern[] },
      { label: "Pull Skill", focus: "Pull strength + skill", patterns: ["pull_vertical", "pull_horizontal", "core"] as MovementPattern[] },
      { label: "Legs + Core", focus: "Lower body and midline", patterns: ["squat", "lunge", "core"] as MovementPattern[] }
    ];
    const d = skill[dayIndex % skill.length];
    return { ...d, kind: "skill" };
  }

  if (template === "sport_performance") {
    const perf = [
      { label: "Lower Power", focus: "Legs and power", patterns: ["squat", "hinge", "lunge", "core"] as MovementPattern[], kind: "resistance" as const },
      { label: "Upper Strength", focus: "Push and pull", patterns: ["push_horizontal", "pull_horizontal", "push_vertical", "core"] as MovementPattern[], kind: "resistance" as const },
      { label: "Conditioning", focus: "Sport energy systems", patterns: ["conditioning"] as MovementPattern[], kind: "conditioning" as const }
    ];
    return perf[dayIndex % perf.length];
  }

  // beginner_full_body / general_fitness: alternate A/B full body
  const rotated = dayIndex % 2 === 0 ? FULL : ["hinge", "squat", "pull_horizontal", "push_horizontal", "pull_vertical", "core"] as MovementPattern[];
  return {
    label: dayIndex % 2 === 0 ? "Full Body A" : "Full Body B",
    focus: "Whole body",
    patterns: rotated,
    kind: "resistance"
  };
}

function estimateMinutes(blocks: ExercisePrescription[], kind: Workout["kind"]): number {
  if (kind === "run" || kind === "conditioning") return 35;
  // rough: sets * (working + rest) + warmup
  const total = blocks.reduce((m, b) => m + b.sets * (b.restSeconds + 45), 0);
  return Math.round(total / 60) + 8;
}

export function generateProgram(p: Profile, config: WreckConfig): Program {
  const template = config.trainingTemplate;
  const scheme = schemeFor(template, p);
  const cap = maxBlocks(p.sessionMinutes);
  const days = Math.min(6, Math.max(2, p.daysPerWeek));

  const workouts: Workout[] = [];
  for (let d = 0; d < days; d++) {
    const split = daySplit(template, days, d);
    const used = new Set<string>();
    const blocks: ExercisePrescription[] = [];

    if (split.kind === "run") {
      const runId =
        split.label === "Tempo Run" ? "tempo-run" : split.label === "Intervals" ? "intervals" : "easy-run";
      const ex = EXERCISE_BY_ID[runId];
      blocks.push({
        exerciseId: ex.id,
        name: ex.name,
        sets: 1,
        repsLow: 1,
        repsHigh: 1,
        restSeconds: 0,
        progression: "time_add",
        note: split.label === "Long Run" ? "Build distance gradually week to week." : undefined
      });
    } else {
      for (const pattern of split.patterns) {
        if (blocks.length >= cap) break;
        const ex = pick(pattern, p, used);
        if (!ex) continue;
        used.add(ex.id);
        blocks.push(prescribe(ex, scheme));
      }
    }

    workouts.push({
      id: `w${d + 1}`,
      label: split.label,
      focus: split.focus,
      kind: split.kind,
      blocks,
      estimatedMinutes: estimateMinutes(blocks, split.kind)
    });
  }

  const rolling = config.flags.travelMode || p.travelFrequency === "frequent";

  const week: ProgramWeek = { index: 1, workouts };

  return {
    id: `prog_${Date.now().toString(36)}`,
    template,
    mode: config.mode,
    title: programTitle(template),
    daysPerWeek: days,
    weeks: [week],
    rolling,
    createdAt: new Date().toISOString()
  };
}

function programTitle(t: TrainingTemplate): string {
  return {
    beginner_full_body: "Foundation — Full Body",
    general_fitness: "Balanced — General Fitness",
    hypertrophy_split: "Build — Hypertrophy Block",
    strength_focus: "Force — Strength Block",
    endurance_base: "Base — Endurance Block",
    sport_performance: "Perform — Sport Block",
    calisthenics_skill: "Control — Skill Block"
  }[t];
}

/**
 * Rank substitution options for an exercise given a reason.
 * Preserves the movement objective (same pattern) and respects equipment.
 */
export function rankSubstitutions(
  exerciseId: string,
  reason: string,
  p: Profile
): Exercise[] {
  const original = EXERCISE_BY_ID[exerciseId];
  if (!original) return [];
  const pool = EXERCISES.filter(
    (e) => e.id !== exerciseId && e.pattern === original.pattern && !dislikesExercise(p, e)
  );
  return pool
    .map((e) => {
      let score = 0;
      // Same movement objective is guaranteed (same pattern). Now weight by fit.
      if (e.equipment.includes(p.equipment)) score += 3;
      if (original.substitutions.includes(e.id)) score += 3;
      if (reason === "too_hard") score += (original.difficulty - e.difficulty); // easier ranks higher
      if (reason === "no_equipment" && e.equipment.includes("bodyweight")) score += 2;
      return { e, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.e)
    .slice(0, 4);
}
