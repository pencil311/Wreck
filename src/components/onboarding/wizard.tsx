"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction, saveDraftAction } from "@/app/actions";
import type { Mode, Profile } from "@/domain/types";
import { Button, Card, Chip, Input, Label, ProgressBar, Select } from "@/components/ui/primitives";
import { Wordmark } from "@/components/wordmark";
import { IconArrow } from "@/components/icons";

type Draft = Partial<Profile>;

/* Option tables kept close to the UI (presentation, not business logic). */
const GOAL_OPTS: [Profile["primaryGoal"], string, string][] = [
  ["muscle", "Build muscle", "Add size and shape"],
  ["fat_loss", "Lose fat", "Lean out, keep strength"],
  ["strength", "Get stronger", "Move heavier loads"],
  ["endurance", "Build endurance", "Run and last longer"],
  ["sport", "Perform in sport", "Train for a game"],
  ["health", "Feel healthy", "Energy and consistency"]
];

const IDENTITY_OPTS: [Mode, string, string][] = [
  ["beginner", "New to this", "Keep it simple and clear"],
  ["bodybuilding", "Bodybuilding", "Physique and muscle"],
  ["strength", "Strength", "The main lifts"],
  ["running", "Running", "Roads and distance"],
  ["sports", "Sport athlete", "A sport comes first"],
  ["calisthenics", "Calisthenics", "Bodyweight skill"],
  ["hybrid", "Hybrid", "Strength and endurance"],
  ["general", "General fitness", "A bit of everything"]
];

const EXPERIENCE_OPTS: [Profile["experience"], string, string][] = [
  ["new", "Just starting", "Under 3 months"],
  ["returning", "Coming back", "Trained before, paused"],
  ["intermediate", "Consistent", "A year or two in"],
  ["advanced", "Advanced", "Many years, know my body"]
];

const EQUIPMENT_OPTS: [Profile["equipment"], string, string][] = [
  ["full_gym", "Full gym", "Barbells, machines, everything"],
  ["home_basic", "Home, some kit", "Dumbbells, a bench, a bar"],
  ["home_minimal", "Home, minimal", "Bands, a pair of dumbbells"],
  ["bodyweight", "Bodyweight", "Just me and the floor"],
  ["hotel", "Hotel / travel", "Whatever the room has"]
];

const DIET_OPTS: [Profile["diet"], string][] = [
  ["omnivore", "Omnivore"],
  ["eggetarian", "Eggetarian"],
  ["vegetarian", "Vegetarian"],
  ["vegan", "Vegan"]
];

const CUISINE_OPTS: [Profile["cuisine"], string][] = [
  ["no_preference", "No preference"],
  ["tamil", "Tamil"],
  ["kerala", "Kerala"],
  ["karnataka", "Karnataka"],
  ["andhra_telangana", "Andhra / Telangana"],
  ["north_indian", "North Indian"],
  ["gujarati", "Gujarati"],
  ["punjabi", "Punjabi"],
  ["bengali", "Bengali"],
  ["maharashtrian", "Maharashtrian"]
];

const MEAL_SOURCE_OPTS: [Profile["mealSource"], string][] = [
  ["home", "Home cooked"],
  ["hostel_mess", "Hostel / mess"],
  ["restaurant", "Mostly eating out"],
  ["mixed", "A mix"]
];

const BUDGET_OPTS: [Profile["budget"], string, string][] = [
  ["low", "Tight", "Cheap, high-value foods"],
  ["moderate", "Moderate", "Balanced spending"],
  ["flexible", "Flexible", "Cost is not a concern"]
];

const ACTIVITY_OPTS: [Profile["activity"], string][] = [
  ["sedentary", "Mostly sitting"],
  ["light", "Lightly active"],
  ["moderate", "Moderately active"],
  ["high", "On my feet a lot"]
];

/** The base step order; a mode-specific branch step is inserted before summary. */
type StepKey =
  | "goal"
  | "identity"
  | "experience"
  | "availability"
  | "equipment"
  | "body"
  | "nutrition"
  | "recovery"
  | "coaching"
  | "branch"
  | "summary";

export function OnboardingWizard({ initial }: { initial: Draft & { step?: number } }) {
  const router = useRouter();
  // Seed slider-backed fields with their displayed defaults so "Continue" is
  // enabled without the user having to drag a slider to commit the value it
  // already shows. A resumed draft (initial) overrides these.
  const [draft, setDraft] = useState<Draft>(() => ({
    daysPerWeek: 3,
    sessionMinutes: 45,
    sleepHours: 7,
    ...stripStep(initial)
  }));
  const [index, setIndex] = useState<number>(clampStep(initial.step ?? 0));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = useMemo<StepKey[]>(() => {
    const base: StepKey[] = [
      "goal",
      "identity",
      "experience",
      "availability",
      "equipment",
      "body",
      "nutrition",
      "recovery",
      "coaching"
    ];
    const hasBranch =
      draft.identity === "bodybuilding" ||
      draft.identity === "running" ||
      draft.identity === "sports" ||
      draft.identity === "calisthenics";
    return hasBranch ? [...base, "branch", "summary"] : [...base, "summary"];
  }, [draft.identity]);

  const step = steps[Math.min(index, steps.length - 1)];
  const progress = ((index + 1) / steps.length) * 100;

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const canAdvance = validate(step, draft);

  async function next() {
    if (!canAdvance) return;
    const nextIndex = Math.min(index + 1, steps.length - 1);
    // Persist a resumable draft (fire and forget; failures are non-fatal).
    void saveDraftAction({ ...draft, step: nextIndex });
    if (index >= steps.length - 1) {
      await finish();
    } else {
      setIndex(nextIndex);
      window.scrollTo({ top: 0 });
    }
  }

  function back() {
    setIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0 });
  }

  async function finish() {
    setSubmitting(true);
    setError(null);
    const complete = withDefaults(draft);
    const res = await completeOnboardingAction(complete);
    if (res.ok) {
      router.push("/app/blueprint");
      router.refresh();
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <Wordmark size="sm" href={null} />
        <span className="eyebrow">
          Step {index + 1} of {steps.length}
        </span>
      </header>
      <ProgressBar value={progress} className="mt-4" />

      <div className="flex flex-1 flex-col justify-center py-10">
        <StepView
          step={step}
          draft={draft}
          set={set}
        />
      </div>

      {error && (
        <p className="mb-4 border border-clay/40 bg-clay/10 px-3 py-2 text-sm text-clay rounded-sm">{error}</p>
      )}

      <footer className="flex items-center justify-between gap-3 border-t border-ink-line pt-5">
        <Button variant="ghost" onClick={back} disabled={index === 0 || submitting}>
          Back
        </Button>
        <Button onClick={next} disabled={!canAdvance || submitting} size="lg">
          {submitting
            ? "Building your WRECK"
            : step === "summary"
              ? "Build my WRECK"
              : "Continue"}
          {!submitting && <IconArrow size={18} />}
        </Button>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step rendering                                                      */
/* ------------------------------------------------------------------ */

function StepHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-display-lg text-bone">{title}</h1>
      {sub && <p className="mt-3 text-bone-dim">{sub}</p>}
    </div>
  );
}

function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
  columns = 2
}: {
  options: [T, string, string?][];
  value: T | undefined;
  onChange: (v: T) => void;
  columns?: 1 | 2;
}) {
  return (
    <div className={columns === 2 ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
      {options.map(([val, label, desc]) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={
            "text-left rounded-sm border px-4 py-4 transition-colors duration-150 ease-wreck " +
            (value === val
              ? "border-ember bg-ember/10"
              : "border-ink-line bg-ink-raise hover:border-bone/30")
          }
        >
          <span className={"block font-display text-lg " + (value === val ? "text-ember-hi" : "text-bone")}>
            {label}
          </span>
          {desc && <span className="mt-1 block text-sm text-bone-dim">{desc}</span>}
        </button>
      ))}
    </div>
  );
}

function StepView({
  step,
  draft,
  set
}: {
  step: StepKey;
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
}) {
  switch (step) {
    case "goal":
      return (
        <div>
          <StepHeading title="What do you want most right now?" sub="This sets what your plan optimises for. You can change it later." />
          <ChoiceGrid options={GOAL_OPTS} value={draft.primaryGoal} onChange={(v) => set("primaryGoal", v)} />
        </div>
      );
    case "identity":
      return (
        <div>
          <StepHeading title="Which best describes your training?" sub="This chooses your mode and the questions that follow." />
          <ChoiceGrid options={IDENTITY_OPTS} value={draft.identity} onChange={(v) => set("identity", v)} />
        </div>
      );
    case "experience":
      return (
        <div>
          <StepHeading title="How long have you trained?" sub="This controls complexity and how fast the plan progresses." />
          <ChoiceGrid options={EXPERIENCE_OPTS} value={draft.experience} onChange={(v) => set("experience", v)} />
        </div>
      );
    case "availability":
      return (
        <div>
          <StepHeading title="How much time do you have?" sub="Honest answers make a plan you can actually keep." />
          <div className="space-y-8">
            <SliderField
              label={`Days per week — ${draft.daysPerWeek ?? 3}`}
              min={2}
              max={6}
              value={draft.daysPerWeek ?? 3}
              onChange={(v) => set("daysPerWeek", v)}
            />
            <SliderField
              label={`Minutes per session — ${draft.sessionMinutes ?? 45}`}
              min={20}
              max={90}
              step={5}
              value={draft.sessionMinutes ?? 45}
              onChange={(v) => set("sessionMinutes", v)}
            />
            <div>
              <Label>How often do you travel?</Label>
              <ChoiceGrid
                options={[
                  ["rare", "Rarely", "Same place, same kit"],
                  ["sometimes", "Sometimes", "A few trips a year"],
                  ["frequent", "Often", "On the road a lot"]
                ]}
                value={draft.travelFrequency}
                onChange={(v) => set("travelFrequency", v)}
              />
            </div>
          </div>
        </div>
      );
    case "equipment":
      return (
        <div>
          <StepHeading title="What do you train with?" sub="Exercises are filtered to what you can actually use." />
          <ChoiceGrid options={EQUIPMENT_OPTS} value={draft.equipment} onChange={(v) => set("equipment", v)} />
        </div>
      );
    case "body":
      return (
        <div>
          <StepHeading title="A little about your body" sub="Used to estimate your starting nutrition. Private by default." />
          <div className="space-y-5">
            <div>
              <Label>Sex (for calorie estimation)</Label>
              <ChoiceGrid
                options={[
                  ["male", "Male"],
                  ["female", "Female"],
                  ["unspecified", "Prefer not to say"]
                ]}
                value={draft.sex}
                onChange={(v) => set("sex", v)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField label="Age" value={draft.age} onChange={(v) => set("age", v)} min={13} max={90} suffix="yrs" />
              <NumberField label="Height" value={draft.heightCm} onChange={(v) => set("heightCm", v)} min={120} max={230} suffix="cm" />
              <NumberField label="Weight" value={draft.weightKg} onChange={(v) => set("weightKg", v)} min={30} max={250} suffix="kg" />
            </div>
            <div>
              <Label>Daily activity outside training</Label>
              <Select value={draft.activity ?? ""} onChange={(e) => set("activity", e.target.value as Profile["activity"])}>
                <option value="" disabled>
                  Choose one
                </option>
                {ACTIVITY_OPTS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      );
    case "nutrition":
      return (
        <div>
          <StepHeading title="How do you eat?" sub="So meals fit your kitchen, your culture and your budget." />
          <div className="space-y-5">
            <div>
              <Label>Diet</Label>
              <ChoiceGrid options={DIET_OPTS} value={draft.diet} onChange={(v) => set("diet", v)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Regional cuisine</Label>
                <Select value={draft.cuisine ?? ""} onChange={(e) => set("cuisine", e.target.value as Profile["cuisine"])}>
                  <option value="" disabled>
                    Choose one
                  </option>
                  {CUISINE_OPTS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Where do meals come from?</Label>
                <Select value={draft.mealSource ?? ""} onChange={(e) => set("mealSource", e.target.value as Profile["mealSource"])}>
                  <option value="" disabled>
                    Choose one
                  </option>
                  {MEAL_SOURCE_OPTS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>Food budget</Label>
              <ChoiceGrid options={BUDGET_OPTS} value={draft.budget} onChange={(v) => set("budget", v)} />
            </div>
          </div>
        </div>
      );
    case "recovery":
      return (
        <div>
          <StepHeading title="How is your recovery?" sub="This lets WRECK watch your load and adjust when needed." />
          <div className="space-y-8">
            <SliderField
              label={`Typical sleep — ${draft.sleepHours ?? 7} hours`}
              min={3}
              max={12}
              step={0.5}
              value={draft.sleepHours ?? 7}
              onChange={(v) => set("sleepHours", v)}
            />
            <div>
              <Label>Everyday stress</Label>
              <ChoiceGrid
                options={[
                  ["low", "Low", "Steady and calm"],
                  ["moderate", "Moderate", "Busy but managing"],
                  ["high", "High", "Stretched thin"]
                ]}
                value={draft.stress}
                onChange={(v) => set("stress", v)}
              />
            </div>
          </div>
        </div>
      );
    case "coaching":
      return (
        <div>
          <StepHeading title="How much coaching do you want?" sub="You can change the tone any time." />
          <ChoiceGrid
            options={[
              ["hands_off", "Hands off", "Just tell me what to do"],
              ["balanced", "Balanced", "Guidance with some detail"],
              ["educational", "Teach me", "Explain the why as we go"]
            ]}
            value={draft.coaching}
            onChange={(v) => set("coaching", v)}
          />
          <div className="mt-6">
            <Label htmlFor="dislikes">Anything you want to avoid? (optional)</Label>
            <Input
              id="dislikes"
              placeholder="e.g. burpees, running"
              defaultValue={(draft.dislikes ?? []).join(", ")}
              onChange={(e) =>
                set(
                  "dislikes",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
            />
          </div>
        </div>
      );
    case "branch":
      return <BranchStep draft={draft} set={set} />;
    case "summary":
      return <SummaryStep draft={draft} />;
    default:
      return null;
  }
}

function BranchStep({
  draft,
  set
}: {
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
}) {
  if (draft.identity === "bodybuilding") {
    return (
      <div>
        <StepHeading title="Where do you want to focus?" sub="Physique work will bias slightly toward this." />
        <ChoiceGrid
          options={[
            ["balanced", "Balanced", "Whole physique"],
            ["upper", "Upper body", "Chest, back, shoulders"],
            ["arms", "Arms", "Biceps and triceps"],
            ["back", "Back", "Width and thickness"],
            ["lower", "Legs", "Quads, hamstrings, glutes"]
          ]}
          value={draft.physiquePriority}
          onChange={(v) => set("physiquePriority", v)}
        />
      </div>
    );
  }
  if (draft.identity === "running") {
    return (
      <div>
        <StepHeading title="What are you training for?" sub="Distance shapes the balance of easy and hard running." />
        <ChoiceGrid
          options={[
            ["5k", "5K", "Speed and sharpness"],
            ["10k", "10K", "Speed with stamina"],
            ["half", "Half marathon", "Sustained endurance"],
            ["full", "Marathon", "Deep endurance"]
          ]}
          value={draft.raceDistance}
          onChange={(v) => set("raceDistance", v)}
        />
        <div className="mt-6">
          <NumberField
            label="Current weekly mileage"
            value={draft.weeklyMileageKm}
            onChange={(v) => set("weeklyMileageKm", v)}
            min={0}
            max={200}
            suffix="km"
          />
        </div>
      </div>
    );
  }
  if (draft.identity === "sports") {
    return (
      <div>
        <StepHeading title="Tell us about your sport" sub="Performance work is matched to your season." />
        <div className="space-y-5">
          <div>
            <Label htmlFor="sport">Your sport</Label>
            <Input id="sport" placeholder="e.g. football" value={draft.sport ?? ""} onChange={(e) => set("sport", e.target.value)} />
          </div>
          <div>
            <Label>Season phase</Label>
            <ChoiceGrid
              options={[
                ["off", "Off-season", "Build the base"],
                ["pre", "Pre-season", "Sharpen up"],
                ["in", "In-season", "Maintain and perform"]
              ]}
              value={draft.sportSeason}
              onChange={(v) => set("sportSeason", v)}
            />
          </div>
        </div>
      </div>
    );
  }
  // calisthenics
  return (
    <div>
      <StepHeading title="Which skills are you chasing?" sub="Pick any that apply. Progressions will build toward them." />
      <SkillPicker
        value={draft.targetSkills ?? []}
        onChange={(v) => set("targetSkills", v)}
      />
    </div>
  );
}

function SkillPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const skills = ["Pull-up", "Muscle-up", "Handstand", "Pistol squat", "L-sit", "Front lever"];
  function toggle(s: string) {
    onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s) => (
        <Chip key={s} active={value.includes(s)} onClick={() => toggle(s)}>
          {s}
        </Chip>
      ))}
    </div>
  );
}

function SummaryStep({ draft }: { draft: Draft }) {
  const rows: [string, string][] = [
    ["Goal", GOAL_OPTS.find((g) => g[0] === draft.primaryGoal)?.[1] ?? "-"],
    ["Identity", IDENTITY_OPTS.find((i) => i[0] === draft.identity)?.[1] ?? "-"],
    ["Experience", EXPERIENCE_OPTS.find((e) => e[0] === draft.experience)?.[1] ?? "-"],
    ["Schedule", `${draft.daysPerWeek ?? 3} days · ${draft.sessionMinutes ?? 45} min`],
    ["Equipment", EQUIPMENT_OPTS.find((e) => e[0] === draft.equipment)?.[1] ?? "-"],
    ["Diet", DIET_OPTS.find((d) => d[0] === draft.diet)?.[1] ?? "-"],
    ["Cuisine", CUISINE_OPTS.find((c) => c[0] === draft.cuisine)?.[1] ?? "-"]
  ];
  return (
    <div>
      <StepHeading title="Ready to build." sub="Here is what we heard. Build your WRECK and see your blueprint." />
      <Card className="divide-y divide-ink-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-5 py-3.5">
            <span className="eyebrow">{k}</span>
            <span className="text-sm text-bone">{v}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small field controls                                                */
/* ------------------------------------------------------------------ */

function SliderField({
  label,
  min,
  max,
  step = 1,
  value,
  onChange
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-ember"
      />
      <div className="mt-1 flex justify-between text-xs text-bone-faint">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  suffix
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-bone-faint">{suffix}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Validation + defaults                                               */
/* ------------------------------------------------------------------ */

function validate(step: StepKey, d: Draft): boolean {
  switch (step) {
    case "goal":
      return !!d.primaryGoal;
    case "identity":
      return !!d.identity;
    case "experience":
      return !!d.experience;
    case "availability":
      return !!d.daysPerWeek && !!d.sessionMinutes && !!d.travelFrequency;
    case "equipment":
      return !!d.equipment;
    case "body":
      return !!d.sex && !!d.age && !!d.heightCm && !!d.weightKg && !!d.activity;
    case "nutrition":
      return !!d.diet && !!d.cuisine && !!d.mealSource && !!d.budget;
    case "recovery":
      return !!d.sleepHours && !!d.stress;
    case "coaching":
      return !!d.coaching;
    case "branch":
      if (d.identity === "bodybuilding") return !!d.physiquePriority;
      if (d.identity === "running") return !!d.raceDistance;
      if (d.identity === "sports") return !!d.sport && !!d.sportSeason;
      if (d.identity === "calisthenics") return (d.targetSkills?.length ?? 0) > 0;
      return true;
    case "summary":
      return true;
    default:
      return false;
  }
}

/** Fill any unset optional fields with sane defaults before submit. */
function withDefaults(d: Draft): Record<string, unknown> {
  return {
    ...d,
    daysPerWeek: d.daysPerWeek ?? 3,
    sessionMinutes: d.sessionMinutes ?? 45,
    travelFrequency: d.travelFrequency ?? "rare",
    activity: d.activity ?? "light",
    sleepHours: d.sleepHours ?? 7,
    stress: d.stress ?? "moderate",
    coaching: d.coaching ?? "balanced",
    dislikes: d.dislikes ?? []
  };
}

function stripStep(v: Draft & { step?: number }): Draft {
  const copy: Draft & { step?: number } = { ...v };
  delete copy.step;
  return copy;
}

function clampStep(n: number): number {
  return Math.max(0, Math.min(9, n));
}
