import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { Eyebrow } from "@/components/ui/primitives";

export function LegalPage({
  title,
  updated,
  children
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-prose px-5 py-16 md:py-24">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-4 font-display text-display-lg text-bone">{title}</h1>
        <p className="mt-3 text-sm text-bone-faint">Last updated {updated}</p>
        <div className="legal mt-10 space-y-6 text-bone-dim">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-display-md text-bone">{heading}</h2>
      <div className="mt-3 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}
