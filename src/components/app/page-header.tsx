import type { ReactNode } from "react";

/** Consistent in-app page header: eyebrow, title, optional trailing action. */
export function PageHeader({
  eyebrow,
  title,
  children
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-line pb-6">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-2 font-display text-display-lg text-bone">{title}</h1>
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}

/** Standard content wrapper for shell pages. */
export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-10">{children}</div>;
}
