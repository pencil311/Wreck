"use client";

import Link from "next/link";
import { Button, Card } from "@/components/ui/primitives";
import { Wordmark } from "@/components/wordmark";
import { IconArrow } from "@/components/icons";

export interface BlueprintData {
  name: string;
  modeLabel: string;
  identityLine: string;
  lines: { label: string; value: string }[];
  rationale: string[];
  plan: { title: string; days: number; firstWorkout?: string; firstFocus?: string };
  targets?: { calories: number; proteinG: number };
}

/**
 * The Blueprint reveal. Sections rise in on a short stagger so the profile
 * feels assembled rather than dumped. Everything shown is generated from the
 * user's real profile via the deterministic engines — nothing is hardcoded.
 */
export function BlueprintReveal({ data }: { data: BlueprintData }) {
  let delay = 0;
  const step = () => {
    delay += 90;
    return { animationDelay: `${delay}ms` } as const;
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-5 py-10 md:py-16">
      <div className="animate-fade-in" style={step()}>
        <Wordmark size="sm" href={null} />
      </div>

      <div className="mt-10 animate-rise-in" style={step()}>
        <p className="eyebrow">Your WRECK blueprint</p>
        <h1 className="mt-4 font-display text-display-xl text-bone">
          {data.name}, your plan is built.
        </h1>
        <p className="mt-4 text-lg text-bone-dim">{data.identityLine}.</p>
      </div>

      <Card className="mt-10 animate-rise-in divide-y divide-ink-line" style={step()}>
        {data.lines.map((l) => (
          <div key={l.label} className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="eyebrow">{l.label}</span>
            <span className="text-right text-sm text-bone">{l.value}</span>
          </div>
        ))}
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="animate-rise-in p-5" style={step()}>
          <p className="eyebrow">Your first block</p>
          <p className="mt-3 font-display text-display-md text-bone">{data.plan.title}</p>
          <p className="mt-2 text-sm text-bone-dim">{data.plan.days} days per week</p>
          {data.plan.firstWorkout && (
            <p className="mt-4 border-t border-ink-line pt-3 text-sm text-bone">
              First up: <span className="text-ember-hi">{data.plan.firstWorkout}</span>
              {data.plan.firstFocus ? ` · ${data.plan.firstFocus}` : ""}
            </p>
          )}
        </Card>
        {data.targets && (
          <Card className="animate-rise-in p-5" style={step()}>
            <p className="eyebrow">Starting nutrition</p>
            <div className="mt-3 flex items-baseline gap-6">
              <div>
                <span className="font-display text-metric text-bone">{data.targets.calories}</span>
                <span className="ml-1 text-sm text-bone-dim">kcal</span>
              </div>
              <div>
                <span className="font-display text-metric text-bone">{data.targets.proteinG}</span>
                <span className="ml-1 text-sm text-bone-dim">g protein</span>
              </div>
            </div>
            <p className="mt-4 border-t border-ink-line pt-3 text-xs text-bone-faint">
              A starting estimate. It adapts from your real trend.
            </p>
          </Card>
        )}
      </div>

      <div className="mt-8 animate-rise-in" style={step()}>
        <p className="eyebrow mb-3">Why it looks like this</p>
        <ul className="space-y-2.5">
          {data.rationale.map((r, i) => (
            <li key={i} className="flex gap-3 text-sm text-bone-dim">
              <span className="font-display text-bone-faint tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 flex animate-rise-in justify-center pb-6" style={step()}>
        <Link href="/app">
          <Button size="lg">
            Enter WRECK
            <IconArrow size={18} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
