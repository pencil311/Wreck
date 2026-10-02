"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue
} from "framer-motion";
import { useRef } from "react";

/**
 * Act 3 — "The Reforge" (signature move, the peak). Scattered fragment tiles
 * converge and weld into one plan as you scroll; a Vulcanico weld-line ignites
 * along the seam as they lock. Bespoke, coded here, driven off the section's
 * scroll progress. Reduced motion shows the fused state, static.
 */

type Frag = { label: string; value: string; sx: string; sy: string; sr: number; ex: string; ey: string; er: number };

const FRAGS: Frag[] = [
  { label: "Training", value: "Push · 5x5", sx: "-36vw", sy: "-24vh", sr: -12, ex: "-8.5vw", ey: "-7vh", er: -3 },
  { label: "Nutrition", value: "1,940 kcal · 178g", sx: "38vw", sy: "-20vh", sr: 11, ex: "8.5vw", ey: "-7vh", er: 3 },
  { label: "Recovery", value: "Readiness 78", sx: "-34vw", sy: "26vh", sr: 9, ex: "-8.5vw", ey: "7vh", er: 2 },
  { label: "Check-in", value: "Sleep 7h 20", sx: "34vw", sy: "28vh", sr: -10, ex: "8.5vw", ey: "7vh", er: -2 }
];

function FragTile({ f, p }: { f: Frag; p: MotionValue<number> }) {
  const x = useTransform(p, [0.12, 0.6], [f.sx, f.ex]);
  const y = useTransform(p, [0.12, 0.6], [f.sy, f.ey]);
  const rotate = useTransform(p, [0.12, 0.6], [f.sr, f.er]);
  const opacity = useTransform(p, [0.08, 0.24, 0.72, 0.82], [0, 1, 1, 0.0]);
  return (
    <motion.div
      style={{ x, y, rotate, opacity }}
      className="absolute left-1/2 top-1/2 -ml-[110px] -mt-[42px] w-[220px] rounded-md border-2 border-ink bg-ink px-4 py-3 shadow-[0_18px_40px_-18px_rgba(0,22,33,0.6)]"
    >
      <p className="font-serif text-xs italic text-ember">{f.label}</p>
      <p className="mt-1 font-display text-xl text-bone">{f.value}</p>
    </motion.div>
  );
}

export function Reforge() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // weld line ignites as the fragments lock
  const weldScale = useTransform(scrollYProgress, [0.5, 0.72], [0, 1]);
  const weldGlow = useTransform(scrollYProgress, [0.6, 0.72, 0.86], [0, 1, 0.5]);
  const weldShadow = useTransform(weldGlow, (g) => `0 0 ${18 + g * 40}px ${g * 8}px rgba(255,65,3,${0.35 + g * 0.5})`);

  // the fused plan resolves after the weld
  const planOpacity = useTransform(scrollYProgress, [0.74, 0.9], [0, 1]);
  const planY = useTransform(scrollYProgress, [0.74, 0.9], [30, 0]);
  const tagOpacity = useTransform(scrollYProgress, [0.02, 0.12], [0, 1]);

  return (
    <section ref={ref} className="relative border-b-2 border-ink bg-sand" style={{ height: "280vh" }} aria-label="The Reforge">
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden">
        {/* held-quiet tag (authored silence before the peak) */}
        <motion.p
          style={{ opacity: reduce ? 1 : tagOpacity }}
          className="absolute top-[16%] left-1/2 -translate-x-1/2 font-serif text-xl italic text-ink/50"
        >
          Four scattered pieces
        </motion.p>

        {reduce ? (
          <div className="text-center">
            <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
              {FRAGS.map((f) => (
                <div key={f.label} className="rounded-md border-2 border-ink bg-ink px-4 py-3 text-left">
                  <p className="font-serif text-xs italic text-ember">{f.label}</p>
                  <p className="mt-1 font-display text-xl text-bone">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {FRAGS.map((f) => (
              <FragTile key={f.label} f={f} p={scrollYProgress} />
            ))}
            {/* the weld line */}
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[3px] w-[280px] -translate-x-1/2 origin-center bg-ember"
              style={{ scaleX: weldScale, boxShadow: weldShadow }}
            />
          </>
        )}

        {/* the fused plan */}
        <motion.div
          style={reduce ? undefined : { opacity: planOpacity, y: planY }}
          className="absolute bottom-[14%] left-1/2 w-full max-w-2xl -translate-x-1/2 px-5 text-center"
        >
          <p className="font-serif text-xl italic text-ember">The Reforge</p>
          <h2 className="mt-2 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.86] text-ink">
            ONE MODEL OF YOU.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink/70">
            Every piece fused into a single plan that knows your goal, your kitchen, your schedule and
            your recovery, and moves them together.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
