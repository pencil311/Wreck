import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer, targetsFor } from "@/lib/data";
import { Page, PageHeader } from "@/components/app/page-header";
import { Card, ProgressBar, Tag } from "@/components/ui/primitives";
import { BodyWeightCard, type WeightPoint } from "@/components/progress/body-weight-card";
import { pct, fmt } from "@/lib/utils";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const { data } = await getViewer();
  if (!data.profile || !data.config) redirect("/app/onboarding");
  const config = data.config;
  const targets = targetsFor(data)!;

  const now = Date.now();
  const within = (iso: string, days: number) => now - new Date(iso).getTime() <= days * 86_400_000;

  const completed = data.workoutLogs.filter((w) => w.completed);
  const sessionsThisWeek = completed.filter((w) => within(w.date, 7)).length;
  const target = data.program?.daysPerWeek ?? 3;

  // Nutrition adherence: average protein over the last 7 days that have any logs.
  const proteinByDay = new Map<string, number>();
  for (const f of data.foodLogs) if (within(f.date, 7)) proteinByDay.set(f.date, (proteinByDay.get(f.date) ?? 0) + f.proteinG);
  const loggedDays = [...proteinByDay.values()];
  const avgProtein = loggedDays.length ? Math.round(loggedDays.reduce((a, b) => a + b, 0) / loggedDays.length) : 0;

  // Strength trend: best logged load per exercise for lift-focused modes.
  const bestLoad = new Map<string, { name: string; load: number }>();
  for (const w of completed) {
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        if (s.done && s.loadKg) {
          const cur = bestLoad.get(ex.exerciseId);
          if (!cur || s.loadKg > cur.load) bestLoad.set(ex.exerciseId, { name: ex.name, load: s.loadKg });
        }
      }
    }
  }
  const topLifts = [...bestLoad.values()].sort((a, b) => b.load - a.load).slice(0, 4);

  const weightPoints: WeightPoint[] = [...data.bodyMetrics]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({ date: m.date, weightKg: m.weightKg }));

  const showStrength = config.mode === "strength" || config.mode === "bodybuilding";

  return (
    <Page>
      <PageHeader eyebrow="Progress" title="What is changing" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Adherence */}
        <Card className="p-5">
          <p className="eyebrow">Training adherence</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-metric text-bone">{sessionsThisWeek}</span>
            <span className="text-sm text-bone-dim">of {target} this week</span>
          </div>
          <ProgressBar className="mt-3" value={pct(sessionsThisWeek, target)} tone="moss" />
          <p className="mt-3 text-xs text-bone-faint">{completed.length} sessions logged all-time.</p>
        </Card>

        {/* Nutrition adherence */}
        <Card className="p-5">
          <p className="eyebrow">Protein adherence</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-metric text-bone">{avgProtein}</span>
            <span className="text-sm text-bone-dim">avg / {targets.proteinG} g</span>
          </div>
          <ProgressBar className="mt-3" value={pct(avgProtein, targets.proteinG)} tone="ember" />
          <p className="mt-3 text-xs text-bone-faint">
            {loggedDays.length ? `Across ${loggedDays.length} logged day(s) this week.` : "No food logged this week yet."}
          </p>
        </Card>

        <BodyWeightCard points={weightPoints} />

        {/* Strength or identity metric */}
        {showStrength ? (
          <Card className="p-5">
            <p className="eyebrow">Best loads</p>
            {topLifts.length ? (
              <ul className="mt-3 space-y-2">
                {topLifts.map((l) => (
                  <li key={l.name} className="flex items-center justify-between text-sm">
                    <span className="text-bone">{l.name}</span>
                    <span className="text-bone-dim tabular-nums">{fmt(l.load)} kg</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-bone-dim">Log a workout with loads to see your trend.</p>
            )}
          </Card>
        ) : (
          <Card className="p-5">
            <p className="eyebrow">Consistency</p>
            <p className="mt-3 text-sm text-bone-dim">
              You have logged {completed.length} session(s). The habit is the metric that matters most
              early on. Keep showing up.
            </p>
          </Card>
        )}
      </div>

      {/* Adaptation timeline — auditable, with reasons and inputs */}
      <section id="adaptations" className="mt-12 scroll-mt-8">
        <div className="flex items-center gap-3 border-b border-ink-line pb-4">
          <h2 className="font-display text-display-md text-bone">What WRECK changed, and why</h2>
        </div>
        {data.adaptations.length === 0 ? (
          <p className="mt-6 text-sm text-bone-dim">
            No adaptations yet. As you log sessions, meals and check-ins, WRECK will adjust your plan
            and record each change here with the reason behind it.
          </p>
        ) : (
          <ol className="mt-6 space-y-4">
            {[...data.adaptations].reverse().map((a) => (
              <li key={a.id} className="border-l-2 border-ember/40 pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg text-bone">{a.title}</h3>
                  <Tag tone={a.applied ? "moss" : "ember"}>{a.applied ? "Applied" : "Proposed"}</Tag>
                  <span className="text-xs text-bone-faint">{a.date}</span>
                </div>
                <p className="mt-1.5 text-sm text-bone-dim">{a.reason}</p>
                <div className="mt-2 text-xs text-bone-faint">
                  <span className="uppercase tracking-label">Based on</span>
                  <ul className="mt-1 space-y-0.5">
                    {a.inputs.map((inp, i) => (
                      <li key={i}>· {inp}</li>
                    ))}
                    <li>· Affects: {a.affected}</li>
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Page>
  );
}
