"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { MODE_LIST, MODE_META } from "@/domain/modes";
import type { Mode } from "@/domain/types";
import { ProgressBar } from "@/components/ui/primitives";
import { BarSeries } from "@/components/charts/wreck-charts";

/**
 * Live personalization demo. Selecting an identity morphs a real sample of the
 * WRECK interface — navigation, hero metric, today's action, emphasis and a
 * mini training-volume chart all change from the same MODE_META the app uses.
 * Transitions are handled by motion; a numeric hero metric counts on change.
 */

interface Sample {
  action: string;
  sub: string;
  stats: { label: string; value: string; fill: number }[];
  series: number[];
}

const SAMPLE: Record<Mode, Sample> = {
  beginner: {
    action: "Full Body A — 25 min",
    sub: "Five movements, gentle progression. You have got this.",
    stats: [
      { label: "Confidence", value: "Building", fill: 55 },
      { label: "This week", value: "2 of 3", fill: 66 }
    ],
    series: [1, 1, 0, 1, 1, 0, 1]
  },
  bodybuilding: {
    action: "Push — chest, shoulders, triceps",
    sub: "Lead with the bench, keep one rep in reserve.",
    stats: [
      { label: "Protein", value: "142 / 178 g", fill: 80 },
      { label: "Weekly volume", value: "On track", fill: 72 }
    ],
    series: [12, 10, 14, 9, 13, 11, 15]
  },
  strength: {
    action: "Squat Day — 5 × 5",
    sub: "Top set at last week's load plus a small step.",
    stats: [
      { label: "Est. 1RM squat", value: "138 kg", fill: 68 },
      { label: "Main lift trend", value: "Rising", fill: 74 }
    ],
    series: [120, 122, 125, 124, 128, 130, 134]
  },
  running: {
    action: "Easy Run — 8 km",
    sub: "Conversational pace. Finish feeling you had more.",
    stats: [
      { label: "Weekly mileage", value: "34 / 40 km", fill: 85 },
      { label: "Fueling", value: "Carb focus", fill: 60 }
    ],
    series: [6, 8, 5, 10, 4, 12, 6]
  },
  sports: {
    action: "Lower Power + conditioning",
    sub: "Readiness is good, so today runs at full output.",
    stats: [
      { label: "Readiness", value: "78 / 100", fill: 78 },
      { label: "Season phase", value: "In-season", fill: 50 }
    ],
    series: [7, 8, 6, 9, 8, 7, 9]
  },
  calisthenics: {
    action: "Pull Skill — pull-up 3 × 5",
    sub: "Quality reps first, then the assistance work.",
    stats: [
      { label: "Pull-up", value: "3 × 5", fill: 62 },
      { label: "Hollow hold", value: "35 s", fill: 58 }
    ],
    series: [5, 6, 6, 7, 6, 8, 8]
  },
  hybrid: {
    action: "Lift + 5 km easy",
    sub: "Recovery decides the order. Strength leads today.",
    stats: [
      { label: "Strength", value: "Maintained", fill: 66 },
      { label: "Endurance", value: "Growing", fill: 70 }
    ],
    series: [9, 6, 10, 7, 9, 8, 11]
  },
  general: {
    action: "Full Body B — 35 min",
    sub: "Balanced session. Consistency is the win.",
    stats: [
      { label: "This week", value: "3 of 4", fill: 75 },
      { label: "Energy", value: "Good", fill: 72 }
    ],
    series: [1, 1, 1, 0, 1, 1, 0]
  }
};

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function ModeDemo() {
  const [mode, setMode] = useState<Mode>("bodybuilding");
  const reduce = useReducedMotion();
  const meta = MODE_META[mode];
  const sample = SAMPLE[mode];
  const metricNum = Number(meta.heroMetric.sample);
  const numeric = !Number.isNaN(metricNum);

  return (
    <div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {MODE_LIST.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={
              "relative shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold tracking-wide transition-colors duration-150 " +
              (m.key === mode ? "border-ember/60 text-ember-hi" : "border-ink-line text-bone-dim hover:text-bone hover:border-bone/30")
            }
          >
            {m.key === mode && !reduce && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 -z-10 rounded-full bg-ember/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {m.label}
          </button>
        ))}
      </div>

      <div className="edge mt-6 overflow-hidden rounded-md bg-ink-raise">
        {/* App chrome: mode-specific navigation labels */}
        <div className="flex items-center gap-4 overflow-x-auto border-b border-ink-line px-5 py-3 no-scrollbar">
          {meta.nav.map((n, i) => (
            <span key={n.key} className={i === 0 ? "text-xs font-bold text-bone" : "text-xs text-bone-faint"}>
              {n.label}
            </span>
          ))}
        </div>

        <div className="p-6 md:p-8">
          <p className="eyebrow">Today · {meta.label}</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-metric text-bone">
                      {numeric ? <NumberFlow value={metricNum} /> : meta.heroMetric.sample}
                    </span>
                    <span className="text-sm text-bone-dim">{meta.heroMetric.unit}</span>
                  </div>
                  <p className="eyebrow mt-1">{meta.heroMetric.label}</p>
                </div>
                <div className="hidden w-40 sm:block">
                  <BarSeries data={sample.series} labels={DAYS} height={64} />
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
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-ink-line px-6 py-3">
          <p className="text-xs text-bone-faint">{meta.accentNote}</p>
        </div>
      </div>
    </div>
  );
}
