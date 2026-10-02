import type { Metadata } from "next";
import Link from "next/link";
import { getViewer, targetsFor } from "@/lib/data";
import { MODE_META } from "@/domain/modes";
import { sumDay } from "@/domain/nutrition/engine";
import type { DashboardSection, Workout } from "@/domain/types";
import { Page } from "@/components/app/page-header";
import { Card, ProgressBar, Ring, Tag } from "@/components/ui/primitives";
import { CheckInCard } from "@/components/app/check-in-card";
import { IconArrow, IconBarbell } from "@/components/icons";
import { todayISO, pct, fmt } from "@/lib/utils";

export const metadata: Metadata = { title: "Today" };

export default async function DashboardPage() {
  const { user, data } = await getViewer();
  const config = data.config!;
  const meta = MODE_META[config.mode];
  const targets = targetsFor(data);
  const today = todayISO();

  // ---- View model (computed from real data) ----
  const workouts = data.program?.weeks[0]?.workouts ?? [];
  const doneTodayIds = new Set(
    data.workoutLogs.filter((w) => w.date === today).map((w) => w.workoutId)
  );
  const nextWorkout: Workout | undefined =
    workouts.find((w) => !doneTodayIds.has(w.id)) ?? workouts[0];

  const weekAgo = Date.now() - 7 * 86_400_000;
  const sessionsThisWeek = data.workoutLogs.filter(
    (w) => w.completed && new Date(w.date).getTime() >= weekAgo
  ).length;

  const todayFood = data.foodLogs.filter((f) => f.date === today);
  const dayTotals = sumDay(todayFood);

  const todayCheckIn = data.checkIns.find((c) => c.date === today);
  const readinessVal = todayCheckIn?.readiness ?? null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Render each section the decision engine asked for, de-duplicating.
  const seen = new Set<DashboardSection>();
  const sections = config.dashboardPriorities.filter((s) => {
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  });

  function render(section: DashboardSection) {
    switch (section) {
      case "primary_action":
        return <PrimaryAction key={section} workout={nextWorkout} lexicon={meta.lexicon.session} />;
      case "training_focus":
        return (
          <Card key={section} className="p-5">
            <p className="eyebrow">Training focus</p>
            <p className="mt-2 font-display text-display-md text-bone">{data.program?.title}</p>
            <p className="mt-1 text-sm text-bone-dim">
              {config.flags.travelMode ? "Rolling sessions · travel-ready" : `${data.program?.daysPerWeek} days a week`}
            </p>
          </Card>
        );
      case "protein":
        return (
          <MacroCard
            key={section}
            label="Protein today"
            value={dayTotals.proteinG}
            target={targets?.proteinG ?? 0}
            unit="g"
            tone="ember"
          />
        );
      case "nutrition_snapshot":
        return (
          <MacroCard
            key={section}
            label="Calories today"
            value={dayTotals.kcal}
            target={targets?.calories ?? 0}
            unit="kcal"
            tone="bone"
            href="/app/nutrition"
          />
        );
      case "run_fueling":
        return (
          <Card key={section} className="p-5">
            <p className="eyebrow">Fueling</p>
            <p className="mt-2 text-sm text-bone-dim">
              Around today&apos;s run, lean on carbohydrates. Target {targets ? fmt(targets.calories) : "-"} kcal and
              {targets ? ` ${targets.proteinG} g protein` : " your protein target"}.
            </p>
            <Link href="/app/nutrition" className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-ember-hi">
              Plan fuel <IconArrow size={14} />
            </Link>
          </Card>
        );
      case "readiness":
        return (
          <Card key={section} className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="eyebrow">Readiness</p>
              <p className="mt-2 text-sm text-bone-dim">
                {readinessVal === null
                  ? "Log a check-in to gate today's load."
                  : readinessVal >= 66
                    ? "Cleared for full output."
                    : readinessVal >= 45
                      ? "Train as planned, watch quality."
                      : "Ease off. Recovery leads today."}
              </p>
            </div>
            {readinessVal !== null && (
              <Ring value={readinessVal} size={76} stroke={6}>
                <span className="font-display text-xl text-bone">{readinessVal}</span>
              </Ring>
            )}
          </Card>
        );
      case "learning":
        return (
          <Card key={section} className="p-5">
            <p className="eyebrow">Learn</p>
            <p className="mt-2 text-sm text-bone-dim">
              New lifters progress fastest by showing up and repeating the basics. Today, focus on
              form over load.
            </p>
            <Link href="/app/learn" className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-ember-hi">
              Learn more <IconArrow size={14} />
            </Link>
          </Card>
        );
      case "progress_snapshot":
        return (
          <Card key={section} className="p-5">
            <p className="eyebrow">This week</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-metric text-bone">{sessionsThisWeek}</span>
              <span className="text-sm text-bone-dim">of {config.mode === "beginner" ? 3 : data.program?.daysPerWeek} sessions</span>
            </div>
            <ProgressBar
              className="mt-3"
              value={pct(sessionsThisWeek, (data.program?.daysPerWeek ?? 3))}
              tone="moss"
            />
            <Link href="/app/progress" className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-ember-hi">
              See progress <IconArrow size={14} />
            </Link>
          </Card>
        );
      case "check_in":
        return <CheckInCard key={section} todayReadiness={readinessVal} />;
      default:
        return null;
    }
  }

  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            {greeting} · {meta.label}
          </p>
          <h1 className="mt-2 font-display text-display-lg text-bone">{user.displayName}.</h1>
        </div>
        {data.adaptations.some((a) => !a.applied) && (
          <Link href="/app/progress#adaptations">
            <Tag tone="ember">Plan updated</Tag>
          </Link>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map(render)}
      </div>
    </Page>
  );
}

/* ------------------------------------------------------------------ */

function PrimaryAction({ workout, lexicon }: { workout?: Workout; lexicon: string }) {
  return (
    <Card className="p-6 sm:col-span-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Your {lexicon} today</p>
          {workout ? (
            <>
              <p className="mt-3 font-display text-display-lg text-bone">{workout.label}</p>
              <p className="mt-2 text-bone-dim">{workout.focus}</p>
              <p className="mt-1 text-sm text-bone-faint">about {workout.estimatedMinutes} minutes</p>
            </>
          ) : (
            <p className="mt-3 text-bone-dim">Your program is being prepared.</p>
          )}
        </div>
        <span className="hidden text-ember sm:block">
          <IconBarbell size={40} />
        </span>
      </div>
      <Link
        href="/app/training"
        className="mt-6 inline-flex items-center gap-2 rounded-sm bg-ember px-5 py-3 text-xs font-bold uppercase tracking-wide text-ink transition-colors hover:bg-ember-hi"
      >
        Start session
        <IconArrow size={16} />
      </Link>
    </Card>
  );
}

function MacroCard({
  label,
  value,
  target,
  unit,
  tone,
  href
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  tone: "ember" | "bone";
  href?: string;
}) {
  const body = (
    <Card className="p-5">
      <p className="eyebrow">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-metric text-bone">{fmt(value)}</span>
        <span className="text-sm text-bone-dim">/ {fmt(target)} {unit}</span>
      </div>
      <ProgressBar className="mt-3" value={pct(value, target)} tone={tone} />
    </Card>
  );
  return href ? (
    <Link href={href} className="block transition-colors">
      {body}
    </Link>
  ) : (
    body
  );
}
