/** Join class names, dropping falsy values. Tiny, dependency-free. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Format a number with thin separators, no locale surprises. */
export function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-IN");
}

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return clamp(Math.round((part / whole) * 100), 0, 100);
}
