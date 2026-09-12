import Link from "next/link";
import { Wordmark } from "./wordmark";
import { Button } from "./ui/primitives";
import { Magnetic } from "./motion/magnetic";

/** Public site header. Restrained, hairline-separated, no glass. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-line bg-ink/85 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-shell items-center justify-between px-5 py-4 md:px-8">
        <Wordmark />
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#how" className="text-sm text-bone-dim hover:text-bone">
            How it works
          </Link>
          <Link href="/#pillars" className="text-sm text-bone-dim hover:text-bone">
            What it does
          </Link>
          <Link href="/#trust" className="text-sm text-bone-dim hover:text-bone">
            Trust
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Magnetic strength={0.3}>
            <Link href="/register">
              <Button size="sm">Build my WRECK</Button>
            </Link>
          </Magnetic>
        </div>
      </div>
    </header>
  );
}

/** Public footer. Carries the real legal links — a product, not a demo. */
export function SiteFooter() {
  return (
    <footer className="border-t border-ink-line">
      <div className="mx-auto max-w-shell px-5 py-14 md:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <Wordmark href={null} />
            <p className="mt-4 text-sm text-bone-dim">
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
        <div className="rule mt-12" />
        <div className="mt-6 flex flex-col justify-between gap-3 text-xs text-bone-faint sm:flex-row">
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
      <p className="eyebrow mb-4">{title}</p>
      <ul className="space-y-3">
        {links.map(([label, href]) => (
          <li key={href + label}>
            <Link href={href} className="text-sm text-bone-dim hover:text-bone">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
