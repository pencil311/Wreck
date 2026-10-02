"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants
} from "framer-motion";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Reveal — scroll-into-view rise. GPU-only (opacity + translateY).    */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  as = "div",
  play = "inView"
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span";
  /** "inView" reveals on scroll; "mount" plays immediately (above-the-fold). */
  play?: "inView" | "mount";
}) {
  const reduce = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  const anim = { opacity: 1, y: 0 };
  const trigger =
    play === "mount"
      ? { animate: anim }
      : { whileInView: anim, viewport: { once: true, margin: "-12% 0px -12% 0px" } };
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...trigger}
    >
      {children}
    </M>
  );
}

/** Stagger container + item for lists. */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }
};

export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  as = "div"
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const M = motion[as] as typeof motion.div;
  return (
    <M className={className} variants={staggerItem}>
      {children}
    </M>
  );
}

/* ------------------------------------------------------------------ */
/* MagneticLink — button that leans toward the cursor, then springs.   */
/* ------------------------------------------------------------------ */

export function MagneticLink({
  href,
  children,
  className,
  strength = 0.4
}: {
  href: string;
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.a>
  );
}

/* Internal-route magnetic wrapper (uses next/link for client nav). */
export function MagneticNav({
  href,
  children,
  className,
  linkClassName,
  strength = 0.35
}: {
  href: string;
  children: ReactNode;
  className?: string;
  /** Styles applied to the actual <a> (e.g. buttonClass). The CTA is a real
   *  link, never a <button> nested inside it. */
  linkClassName?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className={cn("inline-flex", className)}
    >
      <Link href={href} className={cn("inline-flex", linkClassName)}>
        {children}
      </Link>
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee — infinite horizontal scroller, pauses on hover.            */
/* ------------------------------------------------------------------ */

export function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("edge-fade-x overflow-hidden", className)}>
      <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused] motion-reduce:animate-none">
        <div className="flex shrink-0 items-center gap-10">{children}</div>
        <div className="flex shrink-0 items-center gap-10" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TiltCard — subtle pointer-driven 3D tilt on a surface.              */
/* ------------------------------------------------------------------ */

export function TiltCard({
  children,
  className,
  max = 6
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div className="tilt-scene">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}
