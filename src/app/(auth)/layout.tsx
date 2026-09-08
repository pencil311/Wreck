import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Signed-in users never see auth screens.
  const user = await getCurrentUser();
  if (user) redirect("/app");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-16 md:px-10">{children}</div>
      <aside className="relative hidden overflow-hidden border-l border-ink-line bg-ink-raise lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <p className="eyebrow">Your fitness, built around you</p>
          <blockquote className="max-w-md">
            <p className="font-display text-display-lg leading-tight text-bone">
              Understand. Plan. Execute. Measure. Learn. Adapt.
            </p>
            <p className="mt-6 text-bone-dim">
              WRECK connects training, nutrition, recovery and progress around a single model of
              who you are, then keeps the plan honest as life changes.
            </p>
          </blockquote>
          <p className="text-xs text-bone-faint">
            A real product with a deterministic core and safeguards. Not a medical service.
          </p>
        </div>
      </aside>
    </div>
  );
}
