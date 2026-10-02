"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { buttonClass } from "@/components/ui/primitives";
import { KineticHeading } from "@/components/landing/kinetic-heading";
import { MagneticNav } from "@/components/landing/motion";
import { IconArrow } from "@/components/icons";

/**
 * Act 1 — parallax hero. Three planes move at different rates on scroll:
 * a blurred gym plate (back), the athlete cutout (mid), and a chalk-haze
 * foreground, with the headline set between back and mid. Bright sand ground.
 */
export function HeroParallax() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  const bgY = useTransform(p, [0, 1], ["0%", reduce ? "0%" : "16%"]);
  const bgScale = useTransform(p, [0, 1], [1.05, reduce ? 1.05 : 1.18]);
  const subjY = useTransform(p, [0, 1], ["0%", reduce ? "0%" : "-8%"]);
  const subjScale = useTransform(p, [0, 1], [1, reduce ? 1 : 1.06]);
  const copyY = useTransform(p, [0, 1], ["0%", reduce ? "0%" : "-26%"]);
  const hazeY = useTransform(p, [0, 1], ["0%", reduce ? "0%" : "-40%"]);

  return (
    <section ref={ref} className="relative min-h-[100dvh] overflow-hidden border-b-2 border-ink bg-sand">
      {/* back plane: blurred plate */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-45 [filter:saturate(0.85)]"
        style={{ backgroundImage: "url(/media/cinematic/hero-bg.jpg)", y: bgY, scale: bgScale }}
      />
      {/* sand wash so the page reads bright and the copy stays legible on the left */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, #F4F2EC 8%, rgba(244,242,236,0.55) 42%, rgba(244,242,236,0) 66%)" }}
      />

      {/* mid plane: athlete cutout, right side */}
      <motion.img
        src="/media/cinematic/hero-athlete.webp"
        alt="An athlete chalking up before a heavy set"
        style={{ y: subjY, scale: subjScale }}
        className="pointer-events-none absolute bottom-0 right-[-6%] z-10 h-[78vh] w-auto object-contain md:right-[2%] md:h-[92vh]"
      />

      {/* foreground haze */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 mix-blend-screen"
        style={{
          y: hazeY,
          background: "radial-gradient(40% 50% at 62% 60%, rgba(255,255,255,0.5), transparent 70%)"
        }}
      />

      {/* copy, between planes */}
      <motion.div
        style={{ y: copyY }}
        className="relative z-30 mx-auto flex min-h-[100dvh] max-w-shell flex-col justify-center px-5 pt-[72px] md:px-8"
      >
        <div className="max-w-2xl">
          <p className="font-serif text-xl italic text-ink/60">A personalized fitness operating system</p>
          <KineticHeading
            text={"YOUR FITNESS\nBUILT AROUND YOU"}
            className="mt-4 font-display text-[clamp(2.75rem,7.5vw,7rem)] leading-[0.84] text-ink"
          />
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
            One system that plans training, nutrition and recovery around your real life, then adapts
            the moment your week goes sideways.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticNav
              href="/register"
              linkClassName={buttonClass("primary", "lg", "shadow-[6px_6px_0_0_#001621] hover:shadow-[3px_3px_0_0_#001621]")}
            >
              Build my WRECK
              <IconArrow size={18} />
            </MagneticNav>
            <Link href="/#how" className={buttonClass("outline", "lg")}>
              See how it works
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
