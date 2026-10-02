"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

/**
 * Act 2 — pinned tension scene. The frame holds still while the argument
 * assembles line by line, scrubbed by scroll. Bright still, scrim only where
 * the text sits. Reduced motion shows everything at once, static.
 */

const LINES = [
  "One app writes a plan.",
  "Another tracks your food.",
  "A third counts calories.",
  "None of them know each other. None of them know you."
];

function Line({ i, p, children }: { i: number; p: MotionValue<number>; children: React.ReactNode }) {
  // each line fades/rises across its slice of the pinned scroll
  const start = 0.22 + i * 0.16;
  const opacity = useTransform(p, [start, start + 0.1], [0.16, 1]);
  const y = useTransform(p, [start, start + 0.1], [16, 0]);
  return (
    <motion.p style={{ opacity, y }} className="max-w-xl text-2xl leading-snug text-bone md:text-3xl">
      {children}
    </motion.p>
  );
}

export function Fragmented() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section ref={ref} className="relative border-b-2 border-ink bg-ink" style={{ height: "230vh" }}>
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center [filter:contrast(1.05)]" style={{ backgroundImage: "url(/media/cinematic/tension.jpg)" }} />
        {/* scrim only under the copy (right third), plus a soft floor for legibility */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(270deg, rgba(0,22,33,0.9) 0%, rgba(0,22,33,0.45) 34%, transparent 62%)" }}
        />
        <div className="relative z-10 mx-auto flex h-full max-w-shell items-center justify-end px-5 md:px-8">
          <div className="max-w-xl">
            <p className="font-serif text-lg italic text-ember">The problem</p>
            <h2 className="mt-2 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] text-bone">
              FITNESS IS<br />FRAGMENTED.
            </h2>
            <div className="mt-8 space-y-4">
              {LINES.map((l, i) =>
                reduce ? (
                  <p key={i} className="max-w-xl text-2xl leading-snug text-bone md:text-3xl">
                    {l}
                  </p>
                ) : (
                  <Line key={i} i={i} p={scrollYProgress}>
                    {l}
                  </Line>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
