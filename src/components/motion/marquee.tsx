"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * An infinite marquee band. Two identical tracks scroll to create a seamless
 * loop. CSS-driven; pauses on hover; disabled under reduced-motion via the
 * global media query in globals.css.
 */
export function Marquee({
  children,
  className,
  reverse = false,
  duration = 32
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  duration?: number;
}) {
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className="flex shrink-0 items-center gap-8 pr-8 will-change-transform group-hover:[animation-play-state:paused]"
          style={{
            animation: `marquee ${duration}s linear infinite`,
            animationDirection: reverse ? "reverse" : "normal"
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
