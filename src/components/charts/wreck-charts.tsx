"use client";

import { useId } from "react";
import { area, curveCatmullRom, line } from "d3-shape";
import { motion, useReducedMotion } from "motion/react";
import NumberFlow from "@number-flow/react";

/**
 * WRECK chart set — bklit-inspired, built on d3-shape + motion (the same
 * primitives bklit-ui uses) and tuned to the WRECK design language. Animated,
 * responsive, and reduced-motion aware. These are visual, self-contained
 * components; they take plain arrays.
 */

const EASE = [0.22, 0.61, 0.36, 1] as const;

/* ---------------- Area / line trend ---------------- */

export function AreaTrend({
  data,
  height = 220,
  className,
  caption
}: {
  data: number[];
  height?: number;
  className?: string;
  caption?: string;
}) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const W = 640;
  const H = height;
  const padY = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - padY - ((v - min) / range) * (H - padY * 2);

  const linePath =
    line<number>()
      .x((_, i) => x(i))
      .y((v) => y(v))
      .curve(curveCatmullRom.alpha(0.6))(data) ?? "";
  const areaPath =
    area<number>()
      .x((_, i) => x(i))
      .y0(H)
      .y1((v) => y(v))
      .curve(curveCatmullRom.alpha(0.6))(data) ?? "";

  const last = data.length - 1;

  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" role="img" aria-label={caption}>
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D8613A" stopOpacity="0.34" />
            <stop offset="1" stopColor="#D8613A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`stroke-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E8794F" />
            <stop offset="1" stopColor="#D8613A" />
          </linearGradient>
        </defs>

        {/* baseline hairlines */}
        {[0.5, 0.82].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#26262A" strokeWidth="1" />
        ))}

        <motion.path
          d={areaPath}
          fill={`url(#fill-${id})`}
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke={`url(#stroke-${id})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={reduce ? undefined : { pathLength: 0 }}
          whileInView={reduce ? undefined : { pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE }}
        />
        {/* endpoint marker */}
        <motion.circle
          cx={x(last)}
          cy={y(data[last])}
          r="4.5"
          fill="#E8794F"
          initial={reduce ? undefined : { scale: 0 }}
          whileInView={reduce ? undefined : { scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.1, duration: 0.4, ease: EASE }}
        />
        {!reduce && (
          <circle cx={x(last)} cy={y(data[last])} r="4.5" fill="none" stroke="#E8794F" strokeWidth="1.5">
            <animate attributeName="r" values="4.5;12;4.5" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="2.4s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
      {caption && <figcaption className="mt-3 text-xs text-bone-faint">{caption}</figcaption>}
    </figure>
  );
}

/* ---------------- Animated ring / gauge ---------------- */

export function RingStat({
  value,
  label,
  size = 132,
  suffix = ""
}: {
  value: number; // 0..100
  label: string;
  size?: number;
  suffix?: string;
}) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#E8794F" />
              <stop offset="1" stopColor="#D8613A" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1A1A1D" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#ring-${id})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={reduce ? { strokeDashoffset: offset } : { strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EASE }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-3xl text-bone">
            <NumberFlow value={clamped} suffix={suffix} />
          </span>
        </div>
      </div>
      <span className="eyebrow mt-3">{label}</span>
    </div>
  );
}

/* ---------------- Animated bars ---------------- */

export function BarSeries({
  data,
  labels,
  height = 200,
  className
}: {
  data: number[];
  labels?: string[];
  height?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const max = Math.max(...data) || 1;
  return (
    <div className={className}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end">
            <motion.div
              className="w-full rounded-sm bg-gradient-to-t from-ember-lo to-ember-hi"
              style={{ transformOrigin: "bottom" }}
              initial={reduce ? { height: `${(v / max) * 100}%` } : { height: 0 }}
              whileInView={{ height: `${(v / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
            />
          </div>
        ))}
      </div>
      {labels && (
        <div className="mt-2 flex gap-2">
          {labels.map((l, i) => (
            <span key={i} className="flex-1 text-center text-[0.625rem] uppercase tracking-wide text-bone-faint">
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
