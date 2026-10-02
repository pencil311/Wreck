"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/domain/types";
import { logoutAction } from "@/app/actions";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";
import {
  IconBarbell,
  IconBook,
  IconBowl,
  IconColumns,
  IconExit,
  IconGear,
  IconHome,
  IconPulse,
  IconRun,
  IconSpeech,
  IconTarget,
  type IconProps
} from "@/components/icons";

const ICONS: Record<string, (p: IconProps) => ReactNode> = {
  home: IconHome,
  today: IconBarbell,
  train: IconBarbell,
  run: IconRun,
  eat: IconBowl,
  fuel: IconBowl,
  perform: IconTarget,
  recover: IconPulse,
  learn: IconBook,
  progress: IconColumns,
  coach: IconSpeech
};

function iconFor(key: string) {
  return ICONS[key] ?? IconColumns;
}

/**
 * App chrome: a desktop left rail and a mobile bottom bar, both driven by the
 * mode-specific navigation the decision engine produced. Active state is real
 * (path-based), hover is restrained (color only, no scale bounce).
 */
export function AppChrome({
  nav,
  name,
  children
}: {
  nav: NavItem[];
  name: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  // The mobile bottom bar only fits 5 items; if Coach falls outside that window
  // (or a mode omits it), surface it in the top bar so it is always reachable.
  const coach = nav.find((n) => n.key === "coach");
  const coachInBottomBar = nav.slice(0, 5).some((n) => n.key === "coach");

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_1fr]">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-ink-line md:flex">
        <div className="px-6 py-6">
          <Wordmark size="sm" />
        </div>
        <nav className="flex-1 px-3">
          {nav.map((item) => {
            const Icon = iconFor(item.key);
            const active = isActive(item.href);
            return (
              <Link
                key={item.key + item.href}
                href={item.href}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors duration-150",
                  active ? "bg-ink-raise text-bone" : "text-bone-dim hover:text-bone"
                )}
              >
                <span className={active ? "text-ember" : ""}>
                  <Icon size={20} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-ink-line px-3 py-3">
          <Link
            href="/app/settings"
            className={cn(
              "mb-1 flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors duration-150",
              isActive("/app/settings") ? "bg-ink-raise text-bone" : "text-bone-dim hover:text-bone"
            )}
          >
            <IconGear size={20} />
            Settings
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-bone-dim transition-colors duration-150 hover:text-clay"
            >
              <IconExit size={20} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-ink-line px-5 py-4 md:hidden">
        <Wordmark size="sm" />
        <div className="flex items-center gap-4">
          {coach && !coachInBottomBar && (
            <Link
              href={coach.href}
              className={isActive(coach.href) ? "text-ember" : "text-bone-dim"}
              aria-label="Coach"
            >
              <IconSpeech size={22} />
            </Link>
          )}
          <Link href="/app/settings" className="text-bone-dim" aria-label="Settings">
            <IconGear size={22} />
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="pb-24 md:pb-0">{children}</div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-flow-col border-t border-ink-line bg-ink/95 backdrop-blur-[2px] md:hidden">
        {nav.slice(0, 5).map((item) => {
          const Icon = iconFor(item.key);
          const active = isActive(item.href);
          return (
            <Link
              key={item.key + item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[0.625rem] font-bold uppercase tracking-wide",
                active ? "text-ember" : "text-bone-faint"
              )}
            >
              <Icon size={22} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
