import { redirect } from "next/navigation";
import { getViewer } from "@/lib/data";
import { AppChrome } from "@/components/app/chrome";

/**
 * The in-app shell. Requires a completed profile — a signed-in user with no
 * profile is sent to onboarding. Navigation comes from the decision engine, so
 * it is already mode-specific by the time it reaches the chrome.
 */
export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const { user, data } = await getViewer();
  if (!data.profile || !data.config) redirect("/app/onboarding");

  return (
    <AppChrome nav={data.config.navigation} name={user.displayName}>
      {children}
    </AppChrome>
  );
}
