import Link from "next/link";
import { Wordmark } from "./wordmark";
import { buttonClass } from "./ui/primitives";

/** Public site header — bright theme, bold hairline, single-line nav. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-sand/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-shell items-center justify-between px-5 md:px-8">
        <Wordmark tone="ink" />
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#how" className="text-sm font-bold text-ink/70 transition-colors hover:text-ember">
            How it works
          </Link>
          <Link href="/#pillars" className="text-sm font-bold text-ink/70 transition-colors hover:text-ember">
            What it does
          </Link>
          <Link href="/#trust" className="text-sm font-bold text-ink/70 transition-colors hover:text-ember">
            Trust
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden text-sm font-bold text-ink/70 transition-colors hover:text-ember sm:inline">
            Sign in
          </Link>
          <Link href="/register" className={buttonClass("primary", "sm")}>
            Build my WRECK
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Public footer — bright, carries real legal links. */
export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink bg-sand text-ink">
      <div className="mx-auto max-w-shell px-5 py-16 md:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <Wordmark href={null} tone="ink" />
            <p className="mt-4 text-sm text-ink/60">
              Your fitness, built around you. A personalized fitness operating system that plans,
              tracks and adapts to real life.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-14 gap-y-8 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                ["What it does", "/#pillars"],
                ["How it works", "/#how"],
                ["Trust and safety", "/#trust"]
              ]}
            />
            <FooterCol
              title="Account"
              links={[
                ["Sign in", "/login"],
                ["Create account", "/register"]
              ]}
            />
            <FooterCol
              title="Legal"
              links={[
                ["Terms of Service", "/terms"],
                ["Privacy Policy", "/privacy"]
              ]}
            />
          </div>
        </div>
        <div className="mt-12 h-px bg-ink/15" />
        <div className="mt-6 flex flex-col justify-between gap-3 text-xs text-ink/50 sm:flex-row">
          <p>© {new Date().getFullYear()} WRECK. Built for people, not screenshots.</p>
          <p>Not a medical service. Training and nutrition guidance is educational.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-4 text-xs font-bold uppercase tracking-label text-ink/40">{title}</p>
      <ul className="space-y-3">
        {links.map(([label, href]) => (
          <li key={href + label}>
            <Link href={href} className="text-sm text-ink/70 transition-colors hover:text-ember">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
