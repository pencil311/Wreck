"use client";

import dynamic from "next/dynamic";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const Anatomy3D = dynamic(() => import("./anatomy-3d"), { ssr: false });

/** The scroll-revealed feature beats — real WRECK systems, one per rotation. */
const BEATS = [
  {
    tag: "The bar",
    title: "A training engine",
    body: "Programs assembled from your days, session length, equipment and experience, with progression and substitutions built in."
  },
  {
    tag: "The load",
    title: "Nutrition that fits",
    body: "Calorie and protein targets from real math, then meals from your regional cuisine, your diet and your budget."
  },
  {
    tag: "The turn",
    title: "Adaptation you can see",
    body: "Missed sessions, poor recovery and travel reshape the plan, and it records exactly why it changed."
  },
  {
    tag: "The grip",
    title: "A coach that explains",
    body: "Answers from your real profile, program and logs. It explains WRECK's decisions and never invents numbers."
  },
  {
    tag: "The record",
    title: "Progress that means something",
    body: "Metrics matched to your identity, and a timeline of the changes that actually mattered."
  }
] as const;

export function Anatomy() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    let webgl = false;
    try {
      webgl = !!document.createElement("canvas").getContext("webgl");
    } catch {
      webgl = false;
    }
    setEnabled(!reduce && !narrow && webgl);
  }, []);

  return enabled ? <AnatomyScrolly /> : <AnatomyFallback />;
}

/* ---------- Desktop: pinned, scroll-driven rotation + callouts ---------- */

function AnatomyScrolly() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(BEATS.length - 1, Math.max(0, Math.floor(v * BEATS.length)));
    setActive(i);
  });

  const railFill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const beat = BEATS[active];

  return (
    <section ref={ref} className="relative border-y-2 border-ink bg-sand-deep" style={{ height: `${BEATS.length * 90}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* the 3D main character, pinned behind the copy */}
        <div className="pointer-events-none absolute inset-0">
          <Anatomy3D progress={scrollYProgress} />
        </div>

        <div className="relative z-10 mx-auto grid h-full w-full max-w-shell grid-cols-12 items-center gap-6 px-5 md:px-8">
          {/* left: heading + vertical progress rail */}
          <div className="col-span-6 md:col-span-4">
            <p className="font-serif text-xl italic text-ink/50">Anatomy of your plan</p>
            <h2 className="mt-3 font-display text-display-lg leading-[0.95] text-ink">
              ONE OBJECT.
              <br />
              FIVE SYSTEMS.
            </h2>
            <div className="mt-8 flex items-center gap-4">
              <div className="relative h-40 w-[3px] bg-ink/15">
                <motion.div className="absolute left-0 top-0 w-[3px] bg-ember" style={{ height: railFill }} />
              </div>
              <div className="font-display text-display-md tabular-nums text-ink">
                <span className="text-ember">{String(active + 1).padStart(2, "0")}</span>
                <span className="text-ink/30"> / {String(BEATS.length).padStart(2, "0")}</span>
              </div>
            </div>
          </div>

          {/* right: the active callout, swapped on each beat */}
          <div className="col-span-6 flex justify-end md:col-span-4 md:col-start-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                className="max-w-sm rounded-sm border-2 border-ink bg-sand/85 p-6 text-left backdrop-blur-sm"
              >
                <p className="font-serif text-lg italic text-ember">{beat.tag}</p>
                <h3 className="mt-2 font-display text-display-md text-ink">{beat.title}</h3>
                <p className="mt-3 text-ink/70">{beat.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Fallback: accessible stacked list, no 3D ---------- */

function AnatomyFallback() {
  const reduce = useReducedMotion();
  return (
    <section className="border-y-2 border-ink bg-sand-deep">
      <div className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <p className="font-serif text-xl italic text-ink/50">Anatomy of your plan</p>
        <h2 className="mt-3 font-display text-display-lg text-ink">ONE OBJECT. FIVE SYSTEMS.</h2>
        <ol className="mt-12 divide-y-2 divide-ink/10 border-y-2 border-ink">
          {BEATS.map((b, i) => (
            <motion.li
              key={b.title}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="grid gap-2 py-6 md:grid-cols-12 md:gap-6"
            >
              <div className="flex items-center gap-3 md:col-span-4">
                <span className="font-display text-display-md tabular-nums text-ember">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-display-md text-ink">{b.title}</span>
              </div>
              <p className="text-ink/70 md:col-span-8">{b.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
