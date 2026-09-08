"use client";

import { useState } from "react";
import type { Program } from "@/domain/types";
import { WorkoutRunner } from "./workout-runner";
import { Chip } from "@/components/ui/primitives";

/**
 * Lets the user pick which session of the week to run (rolling programs put the
 * next-best session first) and hands it to the runner.
 */
export function TrainingClient({
  program,
  previousByExercise
}: {
  program: Program;
  previousByExercise: Record<string, string>;
}) {
  const workouts = program.weeks[0]?.workouts ?? [];
  const [active, setActive] = useState(0);
  const workout = workouts[active];

  return (
    <div>
      <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1">
        {workouts.map((w, i) => (
          <Chip key={w.id} active={i === active} onClick={() => setActive(i)} className="shrink-0">
            {w.label}
          </Chip>
        ))}
      </div>
      {workout ? (
        <WorkoutRunner key={workout.id} workout={workout} previousByExercise={previousByExercise} />
      ) : (
        <p className="text-bone-dim">No sessions in this program yet.</p>
      )}
    </div>
  );
}
