"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Palmo-style intro: a full-screen Noturno curtain with a Vulcanico count-up
 * and a growing baseline, then it lifts away to reveal the page. Shows once per
 * browser session so repeat navigations are instant. Defaults to "gone" so SSR
 * and reduced-motion never trap the page behind an overlay.
 */
export function Preloader() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"hidden" | "counting" | "lifting">("hidden");
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toString().padStart(2, "0"));
  const width = useTransform(count, (v) => `${v}%`);

  useEffect(() => {
    if (reduce || sessionStorage.getItem("wreck-intro")) return;
    setPhase("counting");
    document.body.style.overflow = "hidden";
    const controls = animate(count, 100, {
      duration: 2,
      ease: [0.22, 0.61, 0.36, 1],
      onComplete: () => {
        sessionStorage.setItem("wreck-intro", "1");
        document.body.style.overflow = "";
        setPhase("lifting");
      }
    });
    // Failsafe: never trap the page behind the curtain if rAF is starved.
    const failsafe = setTimeout(() => {
      sessionStorage.setItem("wreck-intro", "1");
      document.body.style.overflow = "";
      setPhase("lifting");
    }, 5000);
    return () => {
      controls.stop();
      clearTimeout(failsafe);
      document.body.style.overflow = "";
    };
  }, [reduce, count]);

  if (phase === "hidden") return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-ember px-6 py-8 md:px-10 md:py-10"
      initial={{ y: 0 }}
      animate={{ y: phase === "lifting" ? "-100%" : 0 }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => phase === "lifting" && setPhase("hidden")}
    >
      <div className="flex items-start justify-between">
        <span className="wordmark text-2xl text-ink">WRECK</span>
        <span className="font-serif text-lg italic text-ink/70">Loading your system</span>
      </div>

      <div className="font-display text-[22vw] leading-[0.8] text-ink md:text-[15vw]">
        <motion.span>{rounded}</motion.span>
        <span className="text-sand">%</span>
      </div>

      <div className="h-[3px] w-full bg-ink/20">
        <motion.div className="h-full bg-ink" style={{ width }} />
      </div>
    </motion.div>
  );
}
