"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

/**
 * Hand-drawn Vulcanico accents that "draw" themselves when scrolled into view
 * (Palmo-style). Pure inline SVG, no assets. Marked aria-hidden — decoration.
 */

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }, opacity: { duration: 0.1 } }
  }
};

function Sketch({
  children,
  viewBox,
  className,
  style
}: {
  children: React.ReactNode;
  viewBox: string;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      aria-hidden
      viewBox={viewBox}
      fill="none"
      className={className}
      style={style}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      stroke="#FF4103"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </motion.svg>
  );
}

/** Rough underline beneath a word. */
export function ScribbleUnderline({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 300 24" className={className}>
      <motion.path
        d="M6 15C60 8 120 6 180 9c30 1.5 70 4 114 9M14 21c50-4 130-6 210-3"
        variants={draw}
      />
    </Sketch>
  );
}

/** Hand-drawn curved arrow (points down-left by default). */
export function CurvedArrow({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <Sketch viewBox="0 0 120 120" className={className} style={style}>
      <motion.path d="M100 12C104 48 88 86 44 100" variants={draw} />
      <motion.path d="M64 96 44 101 49 80" variants={draw} />
    </Sketch>
  );
}

/** Loose oval scribbled around a phrase. */
export function CircleScribble({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 340 120" className={className}>
      <motion.path
        d="M170 12C92 8 20 30 16 60c-4 33 88 50 158 48 66-2 150-20 150-52 0-27-70-46-150-45"
        variants={draw}
      />
    </Sketch>
  );
}
