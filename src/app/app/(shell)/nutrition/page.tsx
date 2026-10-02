import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer, targetsFor } from "@/lib/data";
import { MODE_META } from "@/domain/modes";
import { Page, PageHeader } from "@/components/app/page-header";
import { NutritionClient } from "@/components/nutrition/nutrition-client";
import { Tag } from "@/components/ui/primitives";
import { todayISO } from "@/lib/utils";

export const metadata: Metadata = { title: "Nutrition" };

export default async function NutritionPage() {
  const { data } = await getViewer();
  if (!data.profile || !data.config) redirect("/app/onboarding");
  const profile = data.profile;
  const config = data.config;
  const targets = targetsFor(data)!;
  const today = todayISO();
  const todayFoods = data.foodLogs.filter((f) => f.date === today);
  const navLabel = MODE_META[config.mode].nav.find((n) => n.href === "/app/nutrition")?.label ?? "Nutrition";

  return (
    <Page>
      <PageHeader eyebrow={config.nutritionMode} title={navLabel}>
        {config.flags.budgetMode && <Tag tone="ember">Budget mode</Tag>}
        {config.flags.regionalNutrition && <Tag>Regional</Tag>}
      </PageHeader>
      <div className="mt-8">
        <NutritionClient
          targets={targets}
          todayFoods={todayFoods}
          diet={profile.diet}
          cuisine={profile.cuisine}
          budgetMode={config.flags.budgetMode}
        />
      </div>
    </Page>
  );
}
