"use client";

import { useEffect, useRef, type ElementType } from "react";
import { cn } from "@/lib/utils";

/**
 * Cursor-reactive display type. Each glyph pushes away from the pointer and
 * heats toward Vulcanico as the cursor nears it. Runs entirely on refs + a
 * single rAF loop (never React state), reads cached glyph centers (recomputed
 * on scroll/resize, not per frame), and collapses to static under reduced
 * motion. This is the interaction that replaced the old cursor ring.
 */
export function KineticHeading({
  text,
  as: Tag = "h1",
  className,
  radius = 150,
  push = 26
}: {
  text: string;
  as?: ElementType;
  className?: string;
  radius?: number;
  push?: number;
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const glyphs = Array.from(el.querySelectorAll<HTMLElement>("[data-g]"));
    const centers = new Float32Array(glyphs.length * 2);
    const cur = new Float32Array(glyphs.length * 3); // x, y, heat
    const pointer = { x: -9999, y: -9999 };

    const measure = () => {
      glyphs.forEach((g, i) => {
        const prev = g.style.transform;
        g.style.transform = "none";
        const r = g.getBoundingClientRect();
        g.style.transform = prev;
        centers[i * 2] = r.left + r.width / 2;
        centers[i * 2 + 1] = r.top + r.height / 2;
      });
    };
    measure();

    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    let raf = 0;
    const tick = () => {
      for (let i = 0; i < glyphs.length; i++) {
        const cx = centers[i * 2];
        const cy = centers[i * 2 + 1];
        const dx = cx - pointer.x;
        const dy = cy - pointer.y;
        const dist = Math.hypot(dx, dy);
        let tx = 0;
        let ty = 0;
        let heat = 0;
        if (dist < radius) {
          const f = 1 - dist / radius;
          const inv = 1 / (dist || 1);
          tx = dx * inv * push * f;
          ty = dy * inv * push * f;
          heat = f;
        }
        cur[i * 3] += (tx - cur[i * 3]) * 0.15;
        cur[i * 3 + 1] += (ty - cur[i * 3 + 1]) * 0.15;
        cur[i * 3 + 2] += (heat - cur[i * 3 + 2]) * 0.15;
        const g = glyphs[i];
        const h = cur[i * 3 + 2];
        g.style.transform = `translate(${cur[i * 3].toFixed(2)}px, ${cur[i * 3 + 1].toFixed(2)}px)`;
        g.style.color = h > 0.02 ? `color-mix(in oklab, currentColor, #FF4103 ${Math.round(h * 100)}%)` : "";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [text, radius, push]);

  const lines = text.split("\n");
  return (
    <Tag ref={root} className={cn("[perspective:600px]", className)} aria-label={text}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(" ").map((word, wi) => (
            <span key={wi} className="mr-[0.22em] inline-block whitespace-nowrap">
              {Array.from(word).map((ch, ci) => (
                <span
                  key={ci}
                  data-g
                  className="inline-block will-change-transform"
                  style={{ transition: "color 0.2s" }}
                >
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
