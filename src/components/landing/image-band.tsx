"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Full-bleed editorial image band. The photo is desaturated and pushed into the
 * WRECK palette (Noturno depth + a Vulcanico wash) so stock never reads as
 * pasted-in, then parallax-drifts on scroll. Children render over it.
 */
export function ImageBand({
  src,
  alt,
  children,
  className,
  height = "h-[70vh] min-h-[420px]",
  focus = "object-center",
  priority = false
}: {
  src: string;
  alt: string;
  children?: ReactNode;
  className?: string;
  height?: string;
  focus?: string;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-10%", "10%"]);

  return (
    <section
      ref={ref}
      className={cn("relative w-full overflow-hidden border-y border-ink-line", height, className)}
    >
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[10%] h-[120%]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          priority={priority}
          className={cn("object-cover [filter:grayscale(0.55)_contrast(1.05)_brightness(0.85)]", focus)}
        />
      </motion.div>

      {/* Vulcanico wash — branded highlight, kept subtle */}
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay"
        style={{ background: "linear-gradient(115deg, rgba(255,65,3,0.55), rgba(255,65,3,0) 55%)" }}
      />
      {/* Noturno depth + legibility gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,22,33,0.92) 0%, rgba(0,22,33,0.5) 45%, rgba(0,22,33,0.15) 100%), linear-gradient(0deg, rgba(0,22,33,0.85), transparent 55%)"
        }}
      />

      <div className="relative z-10 mx-auto flex h-full max-w-shell items-end px-5 pb-12 md:px-8 md:pb-16">
        {children}
      </div>
    </section>
  );
}
