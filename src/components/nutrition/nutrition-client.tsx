"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildPlanAction,
  deleteFoodLogAction,
  logFoodAction,
  mealAlternativesAction
} from "@/app/actions";
import { FOODS, FOOD_BY_ID, eligibleForDiet } from "@/domain/nutrition/foods";
import type { Cuisine, Diet, FoodLogEntry, NutritionTargets } from "@/domain/types";
import { Button, Card, Input, ProgressBar, Select, Tag } from "@/components/ui/primitives";
import { IconClose, IconPlus, IconSwap } from "@/components/icons";
import { cn, fmt, pct } from "@/lib/utils";

type Meal = "breakfast" | "lunch" | "dinner" | "snack";
const MEALS: Meal[] = ["breakfast", "lunch", "dinner", "snack"];

export function NutritionClient({
  targets,
  todayFoods,
  diet,
  cuisine,
  budgetMode
}: {
  targets: NutritionTargets;
  todayFoods: FoodLogEntry[];
  diet: Diet;
  cuisine: Cuisine;
  budgetMode: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"today" | "search" | "plan">("today");

  const totals = todayFoods.reduce(
    (a, f) => ({
      kcal: a.kcal + f.kcal,
      proteinG: a.proteinG + f.proteinG,
      carbsG: a.carbsG + f.carbsG,
      fatG: a.fatG + f.fatG
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  return (
    <div>
      {/* Targets summary — always visible, with the derivation on demand */}
      <TargetSummary targets={targets} totals={totals} />

      <div className="mt-8 flex gap-2 border-b border-ink-line">
        {(["today", "search", "plan"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-1 pb-3 text-sm font-bold uppercase tracking-wide transition-colors",
              tab === t ? "border-ember text-bone" : "border-transparent text-bone-faint hover:text-bone-dim"
            )}
          >
            {t === "today" ? "Today's log" : t === "search" ? "Add food" : "Day plan"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "today" && <TodayLog foods={todayFoods} onChange={() => router.refresh()} />}
        {tab === "search" && (
          <FoodSearch diet={diet} cuisine={cuisine} onLogged={() => router.refresh()} />
        )}
        {tab === "plan" && <DayPlan budgetMode={budgetMode} onLogged={() => router.refresh()} />}
      </div>
    </div>
  );
}

function TargetSummary({
  targets,
  totals
}: {
  targets: NutritionTargets;
  totals: { kcal: number; proteinG: number; carbsG: number; fatG: number };
}) {
  const [showBasis, setShowBasis] = useState(false);
  const macros: [string, number, number, "ember" | "bone" | "moss" | "clay"][] = [
    ["Calories", totals.kcal, targets.calories, "bone"],
    ["Protein", totals.proteinG, targets.proteinG, "ember"],
    ["Carbs", totals.carbsG, targets.carbsG, "moss"],
    ["Fat", totals.fatG, targets.fatG, "clay"]
  ];
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Targets · {targets.direction}</p>
        <button onClick={() => setShowBasis((s) => !s)} className="text-xs font-bold uppercase tracking-wide text-ember-hi">
          {showBasis ? "Hide" : "How derived"}
        </button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {macros.map(([label, val, target, tone]) => (
          <div key={label}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-bone">{label}</span>
              <span className="text-xs text-bone-dim tabular-nums">
                {fmt(val)} / {fmt(target)}
              </span>
            </div>
            <ProgressBar className="mt-2" value={pct(val, target)} tone={tone} />
          </div>
        ))}
      </div>
      {showBasis && (
        <ul className="mt-4 space-y-1.5 border-t border-ink-line pt-4 text-xs text-bone-faint">
          {targets.basis.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
          <li className="text-bone-dim">These are starting estimates. They adapt from your real trend.</li>
        </ul>
      )}
    </Card>
  );
}

function TodayLog({ foods, onChange }: { foods: FoodLogEntry[]; onChange: () => void }) {
  if (foods.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-bone-dim">Nothing logged yet today.</p>
        <p className="mt-1 text-sm text-bone-faint">Use Add food, or build a day plan to get started.</p>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      {MEALS.map((meal) => {
        const items = foods.filter((f) => f.meal === meal);
        if (items.length === 0) return null;
        return (
          <div key={meal}>
            <p className="eyebrow mb-2 capitalize">{meal}</p>
            <Card className="divide-y divide-ink-line">
              {items.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm text-bone">
                      {f.foodName} <span className="text-bone-faint">× {f.units}</span>
                    </p>
                    <p className="text-xs text-bone-faint">
                      {f.kcal} kcal · {f.proteinG} g protein
                    </p>
                  </div>
                  <DeleteButton
                    onClick={async () => {
                      await deleteFoodLogAction(f.id);
                      onChange();
                    }}
                  />
                </div>
              ))}
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      aria-label="remove"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await onClick();
        setBusy(false);
      }}
      className="text-bone-faint hover:text-clay"
    >
      <IconClose size={18} />
    </button>
  );
}

function FoodSearch({ diet, cuisine, onLogged }: { diet: Diet; cuisine: Cuisine; onLogged: () => void }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const eligible = FOODS.filter((f) => eligibleForDiet(f, diet));
    const query = q.trim().toLowerCase();
    const matched = query
      ? eligible.filter((f) => f.name.toLowerCase().includes(query) || f.tags.some((t) => t.includes(query)))
      : eligible;
    // Prefer the user's cuisine, then pan-India.
    return [...matched].sort((a, b) => {
      const score = (f: (typeof matched)[number]) =>
        f.cuisine === cuisine ? 0 : f.cuisine === "pan_india" || f.cuisine === "generic" ? 1 : 2;
      return score(a) - score(b);
    });
  }, [q, diet, cuisine]);

  return (
    <div>
      <Input placeholder="Search foods, e.g. paneer, idli, soya" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {results.slice(0, 24).map((f) => (
          <FoodRow key={f.id} foodId={f.id} onLogged={onLogged} />
        ))}
      </div>
    </div>
  );
}

function FoodRow({ foodId, onLogged }: { foodId: string; onLogged: () => void }) {
  const food = FOOD_BY_ID[foodId];
  const [units, setUnits] = useState(1);
  const [meal, setMeal] = useState<Meal>("lunch");
  const [busy, setBusy] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-bone">{food.name}</p>
          <p className="text-xs text-bone-faint">
            per {food.unit}: {food.kcal} kcal · {food.proteinG} g P · ₹{food.costRupees}
          </p>
        </div>
        {food.cuisine !== "pan_india" && food.cuisine !== "generic" && <Tag>{String(food.cuisine).replace("_", " ")}</Tag>}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          min={0.5}
          step={0.5}
          value={units}
          onChange={(e) => setUnits(Number(e.target.value))}
          className="w-16 rounded-sm border border-ink-line bg-ink px-2 py-1.5 text-sm text-bone"
          aria-label="units"
        />
        <Select value={meal} onChange={(e) => setMeal(e.target.value as Meal)} className="py-1.5 text-sm">
          {MEALS.map((m) => (
            <option key={m} value={m} className="capitalize">
              {m}
            </option>
          ))}
        </Select>
        <Button
          size="sm"
          className="ml-auto"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await logFoodAction({ foodId, units, meal });
            setBusy(false);
            onLogged();
          }}
        >
          <IconPlus size={15} /> Log
        </Button>
      </div>
    </Card>
  );
}

function DayPlan({ budgetMode, onLogged }: { budgetMode: boolean; onLogged: () => void }) {
  const [plan, setPlan] = useState<
    { items: { foodId: string; name: string; units: number; meal: string }[]; totals: Record<string, number> } | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState(false);
  const [altFor, setAltFor] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    const res = await buildPlanAction();
    setLoading(false);
    if (res.ok && res.data) setPlan(res.data);
  }

  async function logAll() {
    if (!plan) return;
    setLogging(true);
    for (const it of plan.items) {
      await logFoodAction({ foodId: it.foodId, units: it.units, meal: it.meal as Meal });
    }
    setLogging(false);
    onLogged();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-bone-dim">
          A realistic day built from your targets, diet and cuisine{budgetMode ? ", ranked for budget" : ""}.
        </p>
        <Button variant="secondary" size="sm" onClick={generate} disabled={loading}>
          {loading ? "Building" : plan ? "Rebuild plan" : "Build a day plan"}
        </Button>
      </div>

      {plan && (
        <div className="mt-6">
          <Card className="mb-4 flex flex-wrap gap-x-8 gap-y-2 p-4 text-sm">
            <span className="text-bone">{fmt(plan.totals.kcal)} kcal</span>
            <span className="text-bone-dim">{fmt(plan.totals.proteinG)} g protein</span>
            <span className="text-bone-dim">₹{fmt(plan.totals.costRupees)} approx</span>
          </Card>
          {MEALS.map((meal) => {
            const items = plan.items.filter((i) => i.meal === meal);
            if (items.length === 0) return null;
            return (
              <div key={meal} className="mb-4">
                <p className="eyebrow mb-2 capitalize">{meal}</p>
                <Card className="divide-y divide-ink-line">
                  {items.map((it) => (
                    <div key={it.foodId + meal}>
                      <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <span className="text-sm text-bone">
                          {it.name} <span className="text-bone-faint">× {it.units}</span>
                        </span>
                        <button
                          onClick={() => setAltFor(altFor === it.foodId ? null : it.foodId)}
                          className="inline-flex items-center gap-1 text-xs text-bone-dim hover:text-bone"
                        >
                          <IconSwap size={14} /> Unavailable?
                        </button>
                      </div>
                      {altFor === it.foodId && <Alternatives foodId={it.foodId} onLogged={onLogged} />}
                    </div>
                  ))}
                </Card>
              </div>
            );
          })}
          <Button className="mt-2" onClick={logAll} disabled={logging}>
            {logging ? "Logging" : "Log this day"}
          </Button>
        </div>
      )}
    </div>
  );
}

function Alternatives({ foodId, onLogged }: { foodId: string; onLogged: () => void }) {
  const [alts, setAlts] = useState<{ id: string; name: string; kcal: number; proteinG: number; costRupees: number }[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await mealAlternativesAction(foodId);
      if (active) {
        setAlts(res.ok ? res.data ?? [] : []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [foodId]);

  return (
    <div className="border-t border-ink-line bg-ink px-4 py-3">
      <p className="eyebrow mb-2">Swap from foods you eat</p>
      {loading && <p className="text-xs text-bone-faint">Finding options…</p>}
      {alts && (
        <div className="space-y-2">
          {alts.length === 0 && <p className="text-xs text-bone-faint">No close match found.</p>}
          {alts.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2">
              <span className="text-sm text-bone">
                {a.name} <span className="text-bone-faint">· {a.kcal} kcal · {a.proteinG} g P · ₹{a.costRupees}</span>
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await logFoodAction({ foodId: a.id, units: 1, meal: "lunch" });
                  onLogged();
                }}
              >
                Log
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
