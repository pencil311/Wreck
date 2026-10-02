"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * A soft Vulcanico ring that trails the pointer and swells over interactive
 * elements. Desktop + fine-pointer only; never shown on touch or reduced
 * motion, and it never blocks clicks (pointer-events: none).
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(false);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    setOn(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement;
      setActive(!!t.closest("a, button, [role='button'], input, select, textarea"));
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [reduce, x, y]);

  if (!on) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] hidden md:block"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="rounded-full border border-ember"
        animate={{
          width: active ? 46 : 26,
          height: active ? 46 : 26,
          opacity: active ? 1 : 0.6,
          backgroundColor: active ? "rgba(255,65,3,0.12)" : "rgba(255,65,3,0)"
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        style={{ marginLeft: -13, marginTop: -13 }}
      />
    </motion.div>
  );
}
