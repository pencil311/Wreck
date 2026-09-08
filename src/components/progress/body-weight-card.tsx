"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logBodyMetricAction } from "@/app/actions";
import { Button, Card, Input } from "@/components/ui/primitives";

export interface WeightPoint {
  date: string;
  weightKg: number;
}

/** Body-weight log with a hairline sparkline. Private by default. */
export function BodyWeightCard({ points }: { points: WeightPoint[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const latest = points[points.length - 1]?.weightKg;
  const first = points[0]?.weightKg;
  const delta = latest !== undefined && first !== undefined ? latest - first : 0;

  async function add() {
    const w = Number(value);
    if (!w || w < 30 || w > 250) return;
    setBusy(true);
    await logBodyMetricAction({ weightKg: w });
    setBusy(false);
    setValue("");
    router.refresh();
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">Body weight</p>
          {latest !== undefined ? (
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-metric text-bone">{latest}</span>
              <span className="text-sm text-bone-dim">kg</span>
              {points.length > 1 && (
                <span className={"text-xs " + (delta <= 0 ? "text-moss" : "text-clay")}>
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(1)} kg
                </span>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-bone-dim">No entries yet.</p>
          )}
        </div>
        {points.length > 1 && <Sparkline points={points.map((p) => p.weightKg)} />}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Input
          type="number"
          placeholder="Today's weight (kg)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="py-2"
        />
        <Button size="sm" onClick={add} disabled={busy || !value}>
          {busy ? "Saving" : "Log"}
        </Button>
      </div>
    </Card>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const w = 120;
  const h = 44;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const d = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * (h - 6) - 3;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} aria-hidden className="text-ember">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.6} />
    </svg>
  );
}
