"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform
} from "framer-motion";
import { useRef, useState } from "react";

/**
 * Act 4 — the substance. A pinned macro sequence: the frame cuts through
 * close-up training textures as the five systems advance in the copy. Content
 * moves inside a held frame (pin), image cross-cuts on the beat. Reduced motion
 * / mobile get a stacked list.
 */

const SYSTEMS = [
  { title: "A training engine, not a template", body: "Programs from your days, equipment and experience, with progression and substitutions built in.", img: "/media/cinematic/macro-1.jpg" },
  { title: "Nutrition that respects your kitchen", body: "Targets from real math, then meals from your regional cuisine, your diet and your budget.", img: "/media/cinematic/macro-2.jpg" },
  { title: "Adaptation you can see", body: "Missed sessions, poor recovery and travel reshape the plan, and it records exactly why.", img: "/media/cinematic/macro-3.jpg" },
  { title: "A coach that explains, never invents", body: "Answers from your real profile and logs. It explains WRECK's decisions and never invents numbers.", img: "/media/cinematic/macro-1.jpg" },
  { title: "Progress that means something", body: "Metrics matched to your identity, and a timeline of the changes that actually mattered.", img: "/media/cinematic/macro-2.jpg" }
];

const N = SYSTEMS.length;
const EASE = [0.22, 0.61, 0.36, 1] as const;

export function MacroScrub() {
  const reduce = useReducedMotion();
  if (reduce) return <MacroList />;
  return <MacroPinned />;
}

function MacroPinned() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const s = useTransform(scrollYProgress, (v) => Math.min(N - 0.0001, Math.max(0, v * N)));
  const [i, setI] = useState(0);
  useMotionValueEvent(s, "change", (v) => setI(Math.min(N - 1, Math.floor(v))));
  const railFill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const sys = SYSTEMS[i];

  return (
    <section ref={ref} className="relative border-b-2 border-ink bg-ink" style={{ height: `${N * 80}vh` }} aria-label="The five systems">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={sys.img + i}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${sys.img})` }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.5, ease: EASE }, scale: { duration: 0.8, ease: EASE } }}
          />
        </AnimatePresence>
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,22,33,0.9) 0%, rgba(0,22,33,0.45) 40%, transparent 68%)" }} />

        <div className="relative z-10 mx-auto flex h-full max-w-shell items-center px-5 md:px-8">
          <div className="max-w-lg">
            <p className="font-serif text-lg italic text-ember">Five systems, one model of you</p>
            <div className="mt-4 flex items-start gap-5">
              <span className="mt-2 font-display text-display-md tabular-nums text-ember">{String(i + 1).padStart(2, "0")}</span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <h3 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[0.95] text-bone">{sys.title}</h3>
                  <p className="mt-4 max-w-md text-bone/75">{sys.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-8 h-[3px] w-56 max-w-full bg-bone/20">
              <motion.div className="h-full origin-left bg-ember" style={{ scaleX: railFill }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MacroList() {
  return (
    <section className="border-b-2 border-ink bg-ink">
      <div className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <p className="font-serif text-lg italic text-ember">Five systems, one model of you</p>
        <ol className="mt-10 divide-y-2 divide-bone/10 border-y-2 border-bone/20">
          {SYSTEMS.map((sys, i) => (
            <li key={sys.title} className="grid gap-2 py-6 md:grid-cols-12">
              <span className="font-display text-display-md tabular-nums text-ember md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-display-md text-bone md:col-span-5">{sys.title}</h3>
              <p className="text-bone/70 md:col-span-6">{sys.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
