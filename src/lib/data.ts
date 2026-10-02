import "server-only";
import { redirect } from "next/navigation";
import type { NutritionTargets, User, UserData } from "@/domain/types";
import { computeTargets } from "@/domain/nutrition/engine";
import { getCurrentUser } from "@/lib/auth/session";
import { getStore } from "@/lib/store";

export interface Viewer {
  user: User;
  data: UserData;
}

/** Load the signed-in user and their data, or redirect to login. */
export async function getViewer(): Promise<Viewer> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const data = await getStore().getData(user.id);
  return { user, data };
}

/** Nutrition targets are derived, never stored — recompute from profile. */
export function targetsFor(data: UserData): NutritionTargets | undefined {
  if (!data.profile || !data.config) return undefined;
  return computeTargets(data.profile, data.config);
}
