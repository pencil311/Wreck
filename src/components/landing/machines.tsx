"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * The machine sequence — each gym machine rises OUT of a framed screen into the
 * bright page and hands off to the next as you scroll. Two synced copies of the
 * (transparent, AI-matted) cutout sell the pop-out: one clipped inside the
 * screen, one free above its top edge in front. Spring-smoothed scroll drives
 * the emergence; text transitions alongside. Reduced-motion / mobile get a
 * stacked gallery.
 */

type Machine = { src: string; tag: string; head: string; body: string };

const MACHINES: Machine[] = [
  { src: "/media/machines/cut-squat.png", tag: "The rack", head: "TRAINING\nENGINE", body: "Programs built from your days, equipment and experience, with progression and substitutions baked in." },
  { src: "/media/machines/cut-cable.png", tag: "The cable", head: "IT ADAPTS\nTO YOU", body: "Miss a day, travel, sleep badly. The plan reshapes around reality and records exactly why." },
  { src: "/media/machines/cut-treadmill.png", tag: "The belt", head: "EVERY GOAL,\nONE SYSTEM", body: "Strength, endurance, hybrid, sport. Eight modes, all driven by one model of you." },
  { src: "/media/machines/cut-bench.png", tag: "The bench", head: "REAL\nSTRENGTH", body: "Top sets, back-off work, safe progression. Numbers that move for a reason, not at random." },
  { src: "/media/machines/cut-pulldown.png", tag: "The stack", head: "PROGRESS\nTHAT COUNTS", body: "Strength trend, adherence, readiness. A timeline of the changes that actually mattered." }
];

const N = MACHINES.length;
const EASE = [0.22, 0.61, 0.36, 1] as const;

// Screen rectangle geometry (percent of the stage column). The clip-paths below
// must stay in sync with the .screen element's inset.
const SCR = { top: 24, side: 12, bottom: 18 };

export function MachineSequence() {
  const reduce = useReducedMotion();
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce || narrow ? <MachineGallery /> : <MachineStage />;
}

function MachineStage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.5 });

  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);

  // local progress within the active machine's slice, and the index
  const s = useTransform(p, (v) => Math.min(N - 0.0001, Math.max(0, v * N)));
  const local = useTransform(s, (v) => v - Math.floor(v));

  useMotionValueEvent(s, "change", (v) => {
    const i = Math.min(N - 1, Math.floor(v));
    setActive((prev) => {
      if (i !== prev) setDir(i > prev ? 1 : -1);
      return i;
    });
  });

  // emergence transforms (shared by both copies)
  const y = useTransform(local, [0, 1], ["8vh", "-40vh"]);
  const scale = useTransform(local, [0, 0.5, 1], [0.82, 1.08, 1.32]);
  const rotateX = useTransform(local, [0, 1], [12, -3]);
  const opacity = useTransform(local, [0, 0.14, 0.85, 1], [0, 1, 1, 0]);
  const shadow = useTransform(local, [0, 1], [0.12, 0.32]);
  const shadowScale = useTransform(local, [0, 1], [0.6, 1.1]);

  const railFill = useTransform(p, [0, 1], ["0%", "100%"]);
  const m = MACHINES[active];

  const imgStyle = { y, scale, rotateX, opacity, transformPerspective: 1200 } as const;
  const imgClass =
    "absolute left-1/2 top-1/2 h-[46%] w-auto -translate-x-1/2 -translate-y-1/2 object-contain will-change-transform [filter:contrast(1.06)_drop-shadow(0_18px_24px_rgba(0,22,33,0.28))]";

  return (
    <section
      ref={ref}
      className="relative border-y-2 border-ink bg-sand"
      style={{ height: `${N * 130}vh` }}
      aria-label="WRECK machine roster"
    >
      <div className="sticky top-0 grid h-[100dvh] grid-cols-1 items-center overflow-hidden md:grid-cols-12">
        {/* copy column */}
        <div className="z-30 mx-auto w-full max-w-shell px-5 md:col-span-5 md:col-start-1 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 26 * dir }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -26 * dir }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <p className="font-serif text-xl italic text-ember">{m.tag}</p>
              <h2 className="mt-2 font-display text-[clamp(2.5rem,5.5vw,5rem)] leading-[0.86] text-ink">
                {m.head.split("\n").map((l, i) => (
                  <span key={i} className="block">
                    {l}
                  </span>
                ))}
              </h2>
              <p className="mt-5 max-w-sm text-ink/70">{m.body}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center gap-4">
            <div className="relative h-24 w-[3px] bg-ink/15">
              <motion.div className="absolute left-0 top-0 w-[3px] bg-ember" style={{ height: railFill }} />
            </div>
            <div className="font-display text-display-md tabular-nums text-ink">
              <span className="text-ember">{String(active + 1).padStart(2, "0")}</span>
              <span className="text-ink/30"> / {String(N).padStart(2, "0")}</span>
            </div>
          </div>
        </div>

        {/* the screen + emerging machine */}
        <div className="relative hidden h-full md:col-span-7 md:col-start-6 md:block" style={{ perspective: 1200 }}>
          {/* the bright screen the machine climbs out of */}
          <div
            className="screen absolute overflow-hidden rounded-md border-2 border-ink bg-[linear-gradient(160deg,#f0f2ee,#dbe4e6)] shadow-[16px_16px_0_0_#FF4103]"
            style={{ top: `${SCR.top}%`, bottom: `${SCR.bottom}%`, left: `${SCR.side}%`, right: `${SCR.side}%` }}
          >
            {/* screen depth: soft inset + a low ember glow at the base */}
            <div aria-hidden className="absolute inset-0 rounded-md shadow-[inset_0_2px_18px_rgba(0,22,33,0.18)]" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "radial-gradient(55% 45% at 50% 88%, rgba(255,65,3,0.18), transparent 70%)" }}
            />
            <span className="absolute bottom-3 left-4 font-serif text-sm italic text-ink/40">Live from your plan</span>
          </div>

          {/* ground shadow under the emerged machine */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-8 w-[38%] -translate-x-1/2 rounded-[50%] bg-ink blur-xl"
            style={{ opacity: shadow, scaleX: shadowScale, y: "18vh" }}
          />

          {/* copy A: the part still inside the screen (clipped to the screen rect) */}
          <div
            className="absolute inset-0 z-20"
            style={{ clipPath: `inset(${SCR.top}% ${SCR.side}% ${SCR.bottom}% ${SCR.side}% round 8px)` }}
          >
            <motion.img src={m.src} alt="" aria-hidden draggable={false} className={imgClass} style={imgStyle} />
          </div>

          {/* copy B: the part that has emerged above the screen's top edge (in front) */}
          <div className="absolute inset-0 z-30" style={{ clipPath: `inset(0 0 ${100 - SCR.top}% 0)` }}>
            <motion.img
              src={m.src}
              alt={`WRECK ${m.tag}`}
              draggable={false}
              className={imgClass}
              style={imgStyle}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* Reduced-motion / mobile fallback: a clean stacked gallery of the cutouts. */
function MachineGallery() {
  return (
    <section className="border-y-2 border-ink bg-sand">
      <div className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <h2 className="max-w-2xl font-display text-display-lg text-ink">THE WHOLE FLOOR, ONE PLAN.</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {MACHINES.map((m) => (
            <div key={m.src} className="rounded-md border-2 border-ink bg-sand-deep p-6">
              <img src={m.src} alt={`WRECK ${m.tag}`} className="mx-auto h-48 w-auto object-contain" />
              <div className="mt-4 border-t-2 border-ink/30 pt-4">
                <p className="font-serif text-base italic text-ember">{m.tag}</p>
                <h3 className="mt-1 font-display text-display-md text-ink">{m.head.replace("\n", " ")}</h3>
                <p className="mt-2 text-sm text-ink/70">{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
