"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSubstitutionsAction, logWorkoutAction } from "@/app/actions";
import type { SubstituteReason, Workout } from "@/domain/types";
import { EXERCISE_BY_ID } from "@/domain/training/exercises";
import { Button, Card, Tag } from "@/components/ui/primitives";
import { IconSwap, IconTick } from "@/components/icons";

interface SetRow {
  reps: number;
  loadKg: string; // string to allow empty input
  done: boolean;
}

const REASON_LABELS: [SubstituteReason, string][] = [
  ["no_equipment", "No equipment"],
  ["too_hard", "Too hard"],
  ["dislike", "Don't like it"],
  ["injury_area", "Sore area"],
  ["other", "Other"]
];

export function WorkoutRunner({
  workout,
  previousByExercise
}: {
  workout: Workout;
  previousByExercise: Record<string, string>;
}) {
  const router = useRouter();
  const isRun = workout.kind === "run" || workout.kind === "conditioning";

  // Local, editable copy of the prescription so substitutions can mutate it.
  const [blocks, setBlocks] = useState(
    workout.blocks.map((b) => ({
      ...b,
      originalId: b.exerciseId,
      substituteReason: undefined as SubstituteReason | undefined
    }))
  );
  const [logs, setLogs] = useState<Record<string, SetRow[]>>(() =>
    Object.fromEntries(
      workout.blocks.map((b) => [
        b.exerciseId,
        Array.from({ length: b.sets }, () => ({ reps: b.repsHigh, loadKg: "", done: false }))
      ])
    )
  );
  const [subOpen, setSubOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const completedSets = useMemo(
    () => Object.values(logs).flat().filter((s) => s.done).length,
    [logs]
  );
  const totalSets = useMemo(() => Object.values(logs).flat().length, [logs]);

  function updateSet(exId: string, i: number, patch: Partial<SetRow>) {
    setLogs((prev) => {
      const rows = [...(prev[exId] ?? [])];
      rows[i] = { ...rows[i], ...patch };
      return { ...prev, [exId]: rows };
    });
  }

  async function complete() {
    setSaving(true);
    const payload = {
      workoutId: workout.id,
      workoutLabel: workout.label,
      exercises: blocks.map((b) => ({
        exerciseId: b.exerciseId,
        name: b.name,
        substitutedFor: b.exerciseId !== b.originalId ? b.originalId : undefined,
        substituteReason: b.exerciseId !== b.originalId ? b.substituteReason : undefined,
        sets: (logs[b.exerciseId] ?? []).map((s) => ({
          reps: Number(s.reps) || 0,
          loadKg: s.loadKg === "" ? undefined : Number(s.loadKg),
          done: s.done
        }))
      }))
    };
    const res = await logWorkoutAction(payload);
    setSaving(false);
    if (res.ok) {
      setDone(true);
      router.refresh();
    }
  }

  if (done) {
    return (
      <Card className="p-8 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-moss/50 text-moss">
          <IconTick size={28} />
        </span>
        <h2 className="mt-5 font-display text-display-md text-bone">Session logged</h2>
        <p className="mt-2 text-sm text-bone-dim">
          {completedSets} of {totalSets} sets completed. Nice work — this is recorded and feeds your
          progress and adaptation.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => router.push("/app")}>
            Back to today
          </Button>
          <Button onClick={() => router.push("/app/progress")}>See progress</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-bone-dim">
          {completedSets} / {totalSets} sets
        </p>
        <Button size="sm" onClick={complete} disabled={saving || completedSets === 0}>
          {saving ? "Saving" : "Complete session"}
        </Button>
      </div>

      <div className="space-y-4">
        {blocks.map((b) => {
          const ex = EXERCISE_BY_ID[b.exerciseId];
          const rows = logs[b.exerciseId] ?? [];
          const prev = previousByExercise[b.exerciseId] ?? previousByExercise[b.originalId];
          return (
            <Card key={b.originalId} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg text-bone">{b.name}</h3>
                    {b.exerciseId !== b.originalId && <Tag tone="ember">Swapped</Tag>}
                  </div>
                  <p className="mt-1 text-sm text-bone-dim">
                    {isRun
                      ? "One effort · follow the cue below"
                      : `${b.sets} × ${b.repsLow}-${b.repsHigh} · ${b.restSeconds}s rest`}
                  </p>
                  {prev && <p className="mt-1 text-xs text-bone-faint">Last time: {prev}</p>}
                </div>
                {!isRun && (
                  <button
                    onClick={() => setSubOpen(subOpen === b.originalId ? null : b.originalId)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-ink-line px-2.5 py-1.5 text-xs text-bone-dim hover:text-bone"
                  >
                    <IconSwap size={15} /> Can&apos;t do this?
                  </button>
                )}
              </div>

              {ex && (
                <ol className="mt-3 space-y-1 border-t border-ink-line pt-3 text-xs text-bone-faint">
                  {ex.instructions.map((ins, i) => (
                    <li key={i}>
                      {i + 1}. {ins}
                    </li>
                  ))}
                </ol>
              )}

              {subOpen === b.originalId && (
                <SubstitutionPanel
                  exerciseId={b.exerciseId}
                  onPick={(pick, reason) => {
                    setBlocks((prev2) =>
                      prev2.map((x) =>
                        x.originalId === b.originalId
                          ? { ...x, exerciseId: pick.id, name: pick.name, substituteReason: reason }
                          : x
                      )
                    );
                    setLogs((prev2) => {
                      const clone = { ...prev2 };
                      const existing = clone[b.exerciseId];
                      delete clone[b.exerciseId];
                      clone[pick.id] = existing ?? [];
                      return clone;
                    });
                    setSubOpen(null);
                  }}
                />
              )}

              {!isRun && (
                <div className="mt-4 space-y-2">
                  {rows.map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-10 text-xs text-bone-faint">Set {i + 1}</span>
                      <input
                        aria-label="reps"
                        type="number"
                        value={row.reps}
                        onChange={(e) => updateSet(b.exerciseId, i, { reps: Number(e.target.value) })}
                        className="w-16 rounded-sm border border-ink-line bg-ink px-2 py-1.5 text-sm text-bone"
                      />
                      <span className="text-xs text-bone-faint">reps</span>
                      <input
                        aria-label="load in kg"
                        type="number"
                        placeholder="kg"
                        value={row.loadKg}
                        onChange={(e) => updateSet(b.exerciseId, i, { loadKg: e.target.value })}
                        className="w-20 rounded-sm border border-ink-line bg-ink px-2 py-1.5 text-sm text-bone"
                      />
                      <button
                        aria-label="mark set done"
                        onClick={() => updateSet(b.exerciseId, i, { done: !row.done })}
                        className={
                          "ml-auto inline-flex h-8 w-8 items-center justify-center rounded-sm border transition-colors " +
                          (row.done ? "border-moss bg-moss/20 text-moss" : "border-ink-line text-bone-faint hover:text-bone")
                        }
                      >
                        <IconTick size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isRun && (
                <label className="mt-4 flex items-center gap-3 text-sm text-bone">
                  <button
                    onClick={() => updateSet(b.exerciseId, 0, { done: !rows[0]?.done })}
                    className={
                      "inline-flex h-8 w-8 items-center justify-center rounded-sm border transition-colors " +
                      (rows[0]?.done ? "border-moss bg-moss/20 text-moss" : "border-ink-line text-bone-faint")
                    }
                  >
                    <IconTick size={16} />
                  </button>
                  Mark this run complete
                </label>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={complete} disabled={saving || completedSets === 0}>
          {saving ? "Saving" : "Complete session"}
        </Button>
      </div>
    </div>
  );
}

function SubstitutionPanel({
  exerciseId,
  onPick
}: {
  exerciseId: string;
  onPick: (pick: { id: string; name: string }, reason: SubstituteReason) => void;
}) {
  const [reason, setReason] = useState<SubstituteReason>("no_equipment");
  const [options, setOptions] = useState<{ id: string; name: string; difficulty: number }[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(r: SubstituteReason) {
    setReason(r);
    setLoading(true);
    const res = await getSubstitutionsAction(exerciseId, r);
    setLoading(false);
    setOptions(res.ok ? res.data ?? [] : []);
  }

  return (
    <div className="mt-4 border-t border-ink-line pt-4">
      <p className="eyebrow mb-2">Why swap it?</p>
      <div className="flex flex-wrap gap-2">
        {REASON_LABELS.map(([r, label]) => (
          <button
            key={r}
            onClick={() => load(r)}
            className={
              "rounded-full border px-3 py-1 text-xs transition-colors " +
              (reason === r && options ? "border-ember text-ember-hi" : "border-ink-line text-bone-dim hover:text-bone")
            }
          >
            {label}
          </button>
        ))}
      </div>
      {loading && <p className="mt-3 text-xs text-bone-faint">Finding alternatives…</p>}
      {options && !loading && (
        <div className="mt-3 space-y-2">
          {options.length === 0 && <p className="text-xs text-bone-faint">No close alternative found.</p>}
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => onPick({ id: o.id, name: o.name }, reason)}
              className="flex w-full items-center justify-between rounded-sm border border-ink-line px-3 py-2 text-left text-sm text-bone hover:border-bone/30"
            >
              {o.name}
              <span className="text-xs text-bone-faint">swap in</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
