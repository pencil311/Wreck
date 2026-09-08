import { labelGoal } from "../decision-engine";
import type { NutritionTargets, UserData } from "../types";
import { readiness } from "../adaptation/engine";

/**
 * The coach's deterministic core. It explains WRECK's existing decisions using
 * the user's real profile, program and logs. It never invents a second plan or
 * fabricates database facts. When an AI key is present the API route may phrase
 * these facts more conversationally, but the facts come from here.
 */

export const QUICK_ACTIONS = [
  { key: "tired", label: "I'm tired today" },
  { key: "missed", label: "I missed a workout" },
  { key: "change_meal", label: "Change my meal" },
  { key: "explain_workout", label: "Explain today's workout" },
  { key: "what_eat", label: "What should I eat" },
  { key: "why_changed", label: "Why did my plan change" }
] as const;

export type QuickActionKey = (typeof QUICK_ACTIONS)[number]["key"];

export interface CoachContext {
  displayName: string;
  goal: string;
  mode: string;
  targets?: NutritionTargets;
  todayWorkoutLabel?: string;
  todayWorkoutFocus?: string;
  latestReadiness?: number;
  recentAdaptations: { title: string; reason: string }[];
}

export function buildCoachContext(
  name: string,
  data: UserData,
  targets?: NutritionTargets
): CoachContext {
  const todays = data.program?.weeks[0]?.workouts[0];
  const latest = [...data.checkIns].sort((a, b) => b.date.localeCompare(a.date))[0];
  return {
    displayName: name,
    goal: data.profile ? labelGoal(data.profile.primaryGoal) : "your goal",
    mode: data.config?.mode ?? "general",
    targets,
    todayWorkoutLabel: todays?.label,
    todayWorkoutFocus: todays?.focus,
    latestReadiness: latest ? readiness(latest) : undefined,
    recentAdaptations: data.adaptations.slice(-3).map((a) => ({ title: a.title, reason: a.reason }))
  };
}

/** Deterministic reply for a quick action or free text. */
export function deterministicReply(
  input: { intent?: QuickActionKey; text?: string },
  ctx: CoachContext
): string {
  const intent = input.intent ?? inferIntent(input.text ?? "");

  switch (intent) {
    case "tired": {
      const r = ctx.latestReadiness;
      if (r !== undefined && r < 45) {
        return `Your last check-in put readiness at ${r} out of 100, which is low. WRECK will trim volume on the next hard session. Keep the movements, drop a set or two, and prioritise sleep tonight. If you would rather move gently, a walk or easy mobility still counts.`;
      }
      return `Feeling tired is a normal signal. If it is a low-energy day, keep the same session but reduce your loads slightly and stop each set a rep short. A short warm-up often decides whether the tiredness is real fatigue or just inertia. Log a check-in and WRECK will factor it into your plan.`;
    }
    case "missed":
      return `A missed session is not a setback. WRECK uses rolling sessions, so it simply moves your next planned session forward rather than stacking a backlog. Open Training and start the next session whenever you are ready.`;
    case "explain_workout":
      if (ctx.todayWorkoutLabel) {
        return `Today is ${ctx.todayWorkoutLabel}, focused on ${ctx.todayWorkoutFocus}. It leads with your highest-value compound movements while you are freshest, then supporting work. Aim to keep one or two reps in reserve on most sets so quality stays high. This session serves your ${ctx.goal} goal.`;
      }
      return `Generate your program first and today's session will appear here with its focus and prescribed work.`;
    case "change_meal":
    case "what_eat": {
      if (ctx.targets) {
        return `Your targets today are ${ctx.targets.calories} kcal and ${ctx.targets.proteinG} g protein. Build meals around a familiar staple plus a protein source. In Nutrition you can tap any meal, mark it unavailable, and WRECK will suggest alternatives from foods you actually eat, keeping the same calorie and protein intent.`;
      }
      return `Finish onboarding and WRECK will set your calorie and protein targets, then suggest meals from your regional food list.`;
    }
    case "why_changed":
      if (ctx.recentAdaptations.length) {
        return (
          `Here is what WRECK changed recently and why:\n\n` +
          ctx.recentAdaptations.map((a) => `• ${a.title} — ${a.reason}`).join("\n")
        );
      }
      return `Nothing has changed in your plan yet. When WRECK adapts something, it records the reason and the inputs behind it, and you will see it listed here.`;
    default:
      return `I can explain your plan and help you adjust it. I work from your real profile, program and logs, and I explain WRECK's decisions rather than inventing a different plan. Try one of the quick actions, or ask about today's session, your targets, or a recent change. For anything medical or injury-related, please speak to a qualified professional.`;
  }
}

function inferIntent(text: string): QuickActionKey | undefined {
  const t = text.toLowerCase();
  if (/tired|exhausted|no energy|drained/.test(t)) return "tired";
  if (/missed|skipped|couldn'?t train/.test(t)) return "missed";
  if (/why.*(change|changed|different)/.test(t)) return "why_changed";
  if (/explain|what.*workout|today.*session/.test(t)) return "explain_workout";
  if (/eat|meal|food|protein|calorie/.test(t)) return "what_eat";
  return undefined;
}
