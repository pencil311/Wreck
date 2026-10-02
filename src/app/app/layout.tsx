import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Authentication boundary for the entire app. Anything under /app requires a
 * signed-in user. Profile/onboarding gating happens one level deeper, in the
 * shell layout, so that /app/onboarding itself stays reachable.
 */
export default async function AppAuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}
