"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import NumberFlow from "@number-flow/react";

/** A number that counts up when it scrolls into view. */
export function Counter({
  value,
  suffix,
  prefix,
  className
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? value : 0);

  useEffect(() => {
    if (inView) setV(value);
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      <NumberFlow value={v} prefix={prefix} suffix={suffix} />
    </span>
  );
}
