"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { MODE_LIST, MODE_META } from "@/domain/modes";

/**
 * Act 5 — range. Vertical scroll pans laterally through the eight training
 * modes: lateral travel reads as "options" where vertical reads as "argument".
 * Reduced motion / mobile fall back to a native horizontal scroll-snap strip.
 */
export function ModesPan() {
  const reduce = useReducedMotion();
  if (reduce) return <ModesStrip />;
  return <ModesPinned />;
}

function ModesPinned() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.5 });
  const x = useTransform(p, [0, 1], ["0vw", "-238vw"]);

  return (
    <section ref={ref} className="relative border-b-2 border-ink bg-sand" style={{ height: "320vh" }} aria-label="Eight training modes">
      <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
        <motion.div style={{ x }} className="flex h-full items-center gap-6 px-5 md:px-8">
          {/* intro panel */}
          <div className="flex h-full w-[86vw] shrink-0 flex-col justify-center md:w-[42vw]">
            <p className="font-serif text-xl italic text-ink/50">Eight ways to train</p>
            <h2 className="mt-3 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.86] text-ink">
              IT BENDS TO
              <br />
              WHOEVER YOU ARE.
            </h2>
            <p className="mt-5 max-w-sm text-ink/70">
              Beginner to sport performance. Pick an identity and the whole system reconfigures around it.
            </p>
          </div>

          {MODE_LIST.map((m, i) => {
            const meta = MODE_META[m.key];
            return (
              <article
                key={m.key}
                className="flex h-[64vh] w-[74vw] shrink-0 flex-col justify-between rounded-md border-2 border-ink bg-sand-deep p-7 shadow-[10px_10px_0_0_#001621] md:w-[26vw]"
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-display-md tabular-nums text-ember">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-serif text-sm italic text-ink/40">mode</span>
                </div>
                <div>
                  <h3 className="font-display text-display-md leading-none text-ink">{m.label}</h3>
                  <p className="mt-3 text-sm text-ink/70">{meta.identityLine}.</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">{meta.blurb}</p>
                </div>
              </article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function ModesStrip() {
  return (
    <section className="border-b-2 border-ink bg-sand">
      <div className="mx-auto max-w-shell px-5 py-16 md:px-8">
        <h2 className="font-display text-display-lg text-ink">IT BENDS TO WHOEVER YOU ARE.</h2>
      </div>
      <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-5 pb-16 md:px-8">
        {MODE_LIST.map((m, i) => {
          const meta = MODE_META[m.key];
          return (
            <article key={m.key} className="w-[80vw] shrink-0 snap-start rounded-md border-2 border-ink bg-sand-deep p-6 sm:w-[340px]">
              <span className="font-display text-display-md tabular-nums text-ember">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-display-md text-ink">{m.label}</h3>
              <p className="mt-2 text-sm text-ink/70">{meta.identityLine}.</p>
              <p className="mt-2 text-sm text-ink/60">{meta.blurb}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
