import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getStore } from "@/lib/store";
import { OnboardingWizard } from "@/components/onboarding/wizard";

export const metadata: Metadata = { title: "Build your WRECK" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const data = await getStore().getData(user.id);
  // If a profile already exists, onboarding is done — go to the app.
  if (data.profile) redirect("/app");

  return <OnboardingWizard initial={data.onboardingDraft ?? {}} />;
}
