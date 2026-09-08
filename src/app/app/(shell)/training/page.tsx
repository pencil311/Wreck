import type { Metadata } from "next";
import { getViewer } from "@/lib/data";
import { Page, PageHeader } from "@/components/app/page-header";
import { TrainingClient } from "@/components/training/training-client";
import { Tag } from "@/components/ui/primitives";
import { RegenerateButton } from "@/components/training/regenerate-button";

export const metadata: Metadata = { title: "Training" };

export default async function TrainingPage() {
  const { data } = await getViewer();
  const program = data.program;

  // Build a "last time" summary per exercise from history (most recent wins).
  const previousByExercise: Record<string, string> = {};
  for (const log of [...data.workoutLogs].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const ex of log.exercises) {
      const done = ex.sets.filter((s) => s.done);
      if (done.length === 0) continue;
      const load = done.find((s) => s.loadKg)?.loadKg;
      const reps = done[0]?.reps;
      previousByExercise[ex.exerciseId] =
        `${done.length} × ${reps}${load ? ` @ ${load} kg` : ""}`;
    }
  }

  return (
    <Page>
      <PageHeader eyebrow={program?.rolling ? "Rolling program" : "Your program"} title={program?.title ?? "Training"}>
        <RegenerateButton />
      </PageHeader>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Tag>{program?.daysPerWeek} days / week</Tag>
        {program?.rolling && <Tag tone="ember">Travel-ready</Tag>}
        <span className="text-sm text-bone-faint">
          Pick today&apos;s session. A missed day is not a backlog — start the next one.
        </span>
      </div>

      <div className="mt-8">
        {program ? (
          <TrainingClient program={program} previousByExercise={previousByExercise} />
        ) : (
          <p className="text-bone-dim">Your program is being prepared. Revisit your blueprint.</p>
        )}
      </div>
    </Page>
  );
}
