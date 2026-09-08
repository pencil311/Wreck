import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer, targetsFor } from "@/lib/data";
import { MODE_META } from "@/domain/modes";
import { labelCuisine, labelEquipment, labelGoal } from "@/domain/decision-engine";
import { BlueprintReveal, type BlueprintData } from "@/components/blueprint/reveal";

export const metadata: Metadata = { title: "Your blueprint" };

export default async function BlueprintPage() {
  const { user, data } = await getViewer();
  if (!data.profile || !data.config) redirect("/app/onboarding");

  const p = data.profile;
  const meta = MODE_META[data.config.mode];
  const targets = targetsFor(data);
  const first = data.program?.weeks[0]?.workouts[0];

  const blueprint: BlueprintData = {
    name: user.displayName,
    modeLabel: meta.label,
    identityLine: meta.identityLine,
    lines: [
      ["Goal", labelGoal(p.primaryGoal)],
      ["Mode", meta.label],
      ["Training", `${p.daysPerWeek} days · ${p.sessionMinutes} min · ${labelEquipment(p.equipment)}`],
      ["Nutrition", `${data.config.nutritionMode} · ${labelCuisine(p.cuisine)} · ${p.diet}`],
      ["Recovery", `${p.sleepHours} h sleep · ${p.stress} stress`],
      [
        "Modes on",
        [
          data.config.flags.travelMode ? "Travel" : null,
          data.config.flags.budgetMode ? "Budget" : null,
          data.config.flags.regionalNutrition ? "Regional food" : null,
          data.config.flags.recoveryWatch ? "Recovery watch" : null
        ]
          .filter(Boolean)
          .join(", ") || "Standard"
      ]
    ].map(([label, value]) => ({ label, value })),
    rationale: data.config.rationale,
    plan: {
      title: data.program?.title ?? "Your block",
      days: data.program?.daysPerWeek ?? p.daysPerWeek,
      firstWorkout: first?.label,
      firstFocus: first?.focus
    },
    targets: targets ? { calories: targets.calories, proteinG: targets.proteinG } : undefined
  };

  return <BlueprintReveal data={blueprint} />;
}
