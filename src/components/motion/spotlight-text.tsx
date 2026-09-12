"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * SpotlightText: the cursor recolours the text it passes over. A base layer
 * renders in bone; an ember-gradient copy is stacked on top and masked to a
 * soft circle that tracks the pointer, so the headline lights up under the
 * cursor. This is the "cursor affects the text" behaviour. Pass the same
 * content once; it is duplicated internally for the two layers.
 */
export function SpotlightText({
  children,
  className,
  radius = 190
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.style.setProperty("--sp", "1");
  }
  function onLeave() {
    ref.current?.style.setProperty("--sp", "0");
  }

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const mask = `radial-gradient(${radius}px circle at var(--mx, -999px) var(--my, -999px), #000 0%, #000 35%, transparent 72%)`;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("relative", className)}
      style={{ ["--sp" as string]: "0" }}
    >
      {/* Base layer */}
      <div className="relative">{children}</div>
      {/* Ember spotlight layer, masked to the cursor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ember-hi via-ember to-ember-lo bg-clip-text text-transparent transition-opacity duration-200"
        style={{
          opacity: "var(--sp)",
          WebkitMaskImage: mask,
          maskImage: mask
        }}
      >
        {children}
      </div>
    </div>
  );
}
