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
import { useRef, useState } from "react";

/**
 * The machine reel — scroll-driven, not auto-playing. Each real gym-machine
 * shot is a static full-bleed frame; scrolling past a shot CUTS to the next
 * (quick settle, then it holds still). Story-style progress bars track scroll.
 * Collapses to a stacked static gallery under reduced motion.
 */

type Shot = { src: string; tag: string; head: string; origin: string };

const SHOTS: Shot[] = [
  { src: "/media/reel/reel-1.jpg", tag: "The floor", head: "A TRAINING\nENGINE", origin: "center" },
  { src: "/media/reel/reel-2.jpg", tag: "Adaptive", head: "IT ADAPTS\nTO YOU", origin: "right" },
  { src: "/media/reel/reel-3.jpg", tag: "Every goal", head: "ONE SYSTEM,\nEVERY GOAL", origin: "left" },
  { src: "/media/reel/reel-4.jpg", tag: "Strength", head: "REAL\nSTRENGTH", origin: "center" },
  { src: "/media/reel/reel-5.jpg", tag: "Progress", head: "PROGRESS\nTHAT COUNTS", origin: "right" }
];

const N = SHOTS.length;
const EASE = [0.22, 0.61, 0.36, 1] as const;

export function CinematicReel() {
  const reduce = useReducedMotion();
  if (reduce) return <ReelStatic />;
  return <ReelPlayer />;
}

function ReelPlayer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  const s = useTransform(p, (v) => Math.min(N - 0.0001, Math.max(0, v * N)));
  const local = useTransform(s, (v) => v - Math.floor(v)); // 0..1 within current shot
  const [index, setIndex] = useState(0);

  useMotionValueEvent(s, "change", (v) => {
    const i = Math.min(N - 1, Math.floor(v));
    setIndex((prev) => (i !== prev ? i : prev));
  });

  // Clicking a progress segment scrolls to that shot (still scroll-driven).
  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const scrollable = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + ((i + 0.4) / N) * scrollable, behavior: "smooth" });
  };

  const shot = SHOTS[index];

  return (
    <section ref={ref} className="relative border-y-2 border-ink bg-ink" style={{ height: `${N * 85}vh` }} aria-label="WRECK machine reel">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        {/* the static shot — a quick settle on the cut, then it holds still */}
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0 bg-cover"
            style={{ backgroundImage: `url(${shot.src})`, backgroundPosition: shot.origin }}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ opacity: { duration: 0.55, ease: EASE }, scale: { duration: 0.7, ease: EASE } }}
          />
        </AnimatePresence>

      {/* grade + legibility scrim (Noturno depth, one Vulcanico wash) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,22,33,0.86) 0%, rgba(0,22,33,0.35) 42%, transparent 70%), linear-gradient(0deg, rgba(0,22,33,0.8), transparent 45%), radial-gradient(80% 60% at 88% 12%, rgba(255,65,3,0.14), transparent 60%)"
        }}
      />

      {/* story-style progress bars — filled by scroll position */}
      <div className="absolute inset-x-0 top-[80px] z-30 flex gap-2 px-5 md:px-10">
        {SHOTS.map((_, i) => (
          <button
            key={i}
            onClick={() => jump(i)}
            className="h-[3px] flex-1 overflow-hidden bg-bone/25"
            aria-label={`Go to shot ${i + 1}`}
          >
            {i === index ? (
              <motion.span className="block h-full origin-left bg-ember" style={{ scaleX: local }} />
            ) : (
              <span className="block h-full origin-left bg-ember" style={{ transform: `scaleX(${i < index ? 1 : 0})` }} />
            )}
          </button>
        ))}
      </div>

      {/* corner brand + running label — the "video HUD" */}
      <div className="absolute left-5 top-[100px] z-20 flex items-center gap-3 md:left-10">
        <span className="h-2 w-2 animate-ember-pulse rounded-full bg-ember" aria-hidden />
        <span className="font-serif text-sm italic text-bone/70">On the floor with WRECK</span>
      </div>

      {/* headline, transitioning per shot */}
      <div className="absolute bottom-0 left-0 z-20 w-full px-5 pb-16 md:px-10 md:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="max-w-4xl"
          >
            <p className="font-serif text-xl italic text-ember">{shot.tag}</p>
            <h2 className="mt-2 font-display text-[clamp(3rem,9vw,8rem)] leading-[0.84] text-bone">
              {shot.head.split("\n").map((l, i) => (
                <span key={i} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.08 + i * 0.09 }}
                  >
                    {l}
                  </motion.span>
                </span>
              ))}
            </h2>
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </section>
  );
}

/* Reduced-motion fallback: a static full-bleed frame per shot, stacked. */
function ReelStatic() {
  return (
    <section className="border-y-2 border-ink">
      {SHOTS.map((s) => (
        <div key={s.src} className="relative h-[70vh] w-full overflow-hidden border-b-2 border-ink last:border-b-0">
          <div className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${s.src})`, backgroundPosition: s.origin }} />
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(0,22,33,0.8), transparent 55%)" }} />
          <div className="absolute bottom-0 left-0 px-5 pb-10 md:px-10">
            <p className="font-serif text-lg italic text-ember">{s.tag}</p>
            <h2 className="mt-1 font-display text-display-xl leading-[0.9] text-bone">{s.head.replace("\n", " ")}</h2>
          </div>
        </div>
      ))}
    </section>
  );
}
