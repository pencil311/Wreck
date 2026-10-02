"use client";

import { useState, useTransition } from "react";
import { MODE_LIST, MODE_META } from "@/domain/modes";
import type { Mode } from "@/domain/types";
import { Chip, ProgressBar, Skeleton } from "@/components/ui/primitives";

/**
 * Live personalization demo. Selecting an identity morphs a real sample of the
 * WRECK interface · navigation labels, the hero metric, today's action and the
 * emphasis all change from the same MODE_META the app itself uses. A short
 * skeleton state on switch demonstrates the product's real loading behaviour.
 */

const SAMPLE: Record<
  Mode,
  { action: string; sub: string; stats: { label: string; value: string; fill: number }[] }
> = {
  beginner: {
    action: "Full Body A · 25 min",
    sub: "Five movements, gentle progression. You have got this.",
    stats: [
      { label: "Confidence", value: "Building", fill: 55 },
      { label: "This week", value: "2 of 3", fill: 66 }
    ]
  },
  bodybuilding: {
    action: "Push · chest, shoulders, triceps",
    sub: "Lead with the bench, keep one rep in reserve.",
    stats: [
      { label: "Protein", value: "142 / 178 g", fill: 80 },
      { label: "Weekly volume", value: "On track", fill: 72 }
    ]
  },
  strength: {
    action: "Squat Day · 5 × 5",
    sub: "Top set at last week's load plus a small step.",
    stats: [
      { label: "Est. 1RM squat", value: "138 kg", fill: 68 },
      { label: "Main lift trend", value: "Rising", fill: 74 }
    ]
  },
  running: {
    action: "Easy Run · 8 km",
    sub: "Conversational pace. Finish feeling you had more.",
    stats: [
      { label: "Weekly mileage", value: "34 / 40 km", fill: 85 },
      { label: "Fueling", value: "Carb focus", fill: 60 }
    ]
  },
  sports: {
    action: "Lower Power + conditioning",
    sub: "Readiness is good, so today runs at full output.",
    stats: [
      { label: "Readiness", value: "78 / 100", fill: 78 },
      { label: "Season phase", value: "In-season", fill: 50 }
    ]
  },
  calisthenics: {
    action: "Pull Skill · pull-up 3 × 5",
    sub: "Quality reps first, then the assistance work.",
    stats: [
      { label: "Pull-up", value: "3 × 5", fill: 62 },
      { label: "Hollow hold", value: "35 s", fill: 58 }
    ]
  },
  hybrid: {
    action: "Lift + 5 km easy",
    sub: "Recovery decides the order. Strength leads today.",
    stats: [
      { label: "Strength", value: "Maintained", fill: 66 },
      { label: "Endurance", value: "Growing", fill: 70 }
    ]
  },
  general: {
    action: "Full Body B · 35 min",
    sub: "Balanced session. Consistency is the win.",
    stats: [
      { label: "This week", value: "3 of 4", fill: 75 },
      { label: "Energy", value: "Good", fill: 72 }
    ]
  }
};

export function ModeDemo() {
  const [mode, setMode] = useState<Mode>("bodybuilding");
  const [pending, startTransition] = useTransition();
  const meta = MODE_META[mode];
  const sample = SAMPLE[mode];

  function choose(next: Mode) {
    if (next === mode) return;
    // Show a genuine loading state, then swap · the app reconfigures, it does not just restyle.
    startTransition(() => {
      setMode(next);
    });
  }

  return (
    <div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {MODE_LIST.map((m) => (
          <Chip key={m.key} active={m.key === mode} onClick={() => choose(m.key)} className="shrink-0">
            {m.label}
          </Chip>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-ink-line bg-ink-raise">
        {/* App chrome: mode-specific navigation labels */}
        <div className="flex items-center gap-4 overflow-x-auto border-b border-ink-line px-5 py-3 no-scrollbar">
          {meta.nav.map((n, i) => (
            <span
              key={n.key}
              className={i === 0 ? "text-xs font-bold text-bone" : "text-xs text-bone-faint"}
            >
              {n.label}
            </span>
          ))}
        </div>

        <div className="p-6 md:p-8">
          <p className="eyebrow">Today · {meta.label}</p>

          {pending ? (
            <DemoSkeleton />
          ) : (
            <div className="animate-fade-in">
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-metric text-bone">{meta.heroMetric.sample}</span>
                    <span className="text-sm text-bone-dim">{meta.heroMetric.unit}</span>
                  </div>
                  <p className="eyebrow mt-1">{meta.heroMetric.label}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-ink-line pt-5">
                <p className="text-xs uppercase tracking-label text-bone-faint">Primary action</p>
                <p className="mt-2 font-display text-display-md text-bone">{sample.action}</p>
                <p className="mt-2 text-sm text-bone-dim">{sample.sub}</p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {sample.stats.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-bone">{s.label}</span>
                      <span className="text-sm text-bone-dim">{s.value}</span>
                    </div>
                    <ProgressBar value={s.fill} className="mt-2" tone="ember" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-ink-line px-6 py-3">
          <p className="text-xs text-bone-faint">{meta.accentNote}</p>
        </div>
      </div>
    </div>
  );
}

function DemoSkeleton() {
  return (
    <div className="mt-4">
      <Skeleton className="h-12 w-40" />
      <Skeleton className="mt-3 h-3 w-24" />
      <div className="mt-6 border-t border-ink-line pt-5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-7 w-64 max-w-full" />
        <Skeleton className="mt-3 h-3 w-72 max-w-full" />
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  );
}
