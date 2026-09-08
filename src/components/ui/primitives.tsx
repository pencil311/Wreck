import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-sans font-bold uppercase tracking-wide select-none transition-colors duration-150 ease-wreck disabled:opacity-40 disabled:pointer-events-none rounded-sm";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-ember text-ink hover:bg-ember-hi",
  secondary: "bg-transparent text-bone border border-ink-line hover:border-bone/40",
  ghost: "bg-transparent text-bone-dim hover:text-bone",
  danger: "bg-transparent text-clay border border-clay/40 hover:bg-clay/10"
};

const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "text-[0.6875rem] px-3 py-1.5",
  md: "text-xs px-4 py-2.5",
  lg: "text-sm px-6 py-3.5"
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button className={cn(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], className)} {...props}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Surface / Card                                                      */
/* ------------------------------------------------------------------ */

export function Card({
  className,
  children,
  as: Tag = "div",
  ...props
}: HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article" | "li" }) {
  return (
    <Tag className={cn("bg-ink-raise border border-ink-line rounded-sm", className)} {...props}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

/* ------------------------------------------------------------------ */
/* Chip / Badge                                                        */
/* ------------------------------------------------------------------ */

export function Chip({
  active,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold tracking-wide transition-colors duration-150 ease-wreck",
        active
          ? "border-ember bg-ember/10 text-ember-hi"
          : "border-ink-line text-bone-dim hover:text-bone hover:border-bone/30",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "ember" | "moss" | "clay" }) {
  const tones = {
    neutral: "border-ink-line text-bone-dim",
    ember: "border-ember/40 text-ember-hi",
    moss: "border-moss/40 text-moss",
    clay: "border-clay/40 text-clay"
  };
  return (
    <span className={cn("inline-flex items-center rounded-sm border px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-label", tones[tone])}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

export function Label({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("block eyebrow mb-2", className)} {...props}>
      {children}
    </label>
  );
}

const CONTROL =
  "w-full bg-ink border border-ink-line rounded-sm px-3.5 py-3 text-bone placeholder:text-bone-faint text-sm font-sans transition-colors duration-150 focus:border-ember/60";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "resize-none", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, "appearance-none pr-10", className)} {...props}>
      {children}
    </select>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-clay">{children}</p>;
}

/* ------------------------------------------------------------------ */
/* Progress: bar + ring                                                */
/* ------------------------------------------------------------------ */

export function ProgressBar({
  value,
  tone = "ember",
  className,
  label
}: {
  value: number; // 0..100
  tone?: "ember" | "moss" | "clay" | "bone";
  className?: string;
  label?: string;
}) {
  const tones = { ember: "bg-ember", moss: "bg-moss", clay: "bg-clay", bone: "bg-bone" };
  return (
    <div className={className}>
      <div className="h-1.5 w-full bg-ink-line overflow-hidden rounded-sm" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div
          className={cn("h-full origin-left animate-bar-grow rounded-sm", tones[tone])}
          style={{ transform: `scaleX(${Math.max(0, Math.min(100, value)) / 100})` }}
        />
      </div>
    </div>
  );
}

export function Ring({
  value,
  size = 96,
  stroke = 6,
  children
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * circ;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#26262A" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#D8613A"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="butt"
          style={{ transition: "stroke-dasharray 0.9s var(--ease-wreck)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton (this product ships real loading states)                   */
/* ------------------------------------------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-sm", className)} />;
}

/* ------------------------------------------------------------------ */
/* Metric — the editorial "big number"                                 */
/* ------------------------------------------------------------------ */

export function Metric({
  value,
  unit,
  label,
  className
}: {
  value: ReactNode;
  unit?: ReactNode;
  label?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-metric text-bone">{value}</span>
        {unit ? <span className="text-sm text-bone-dim font-sans">{unit}</span> : null}
      </div>
      {label ? <p className="eyebrow mt-1">{label}</p> : null}
    </div>
  );
}
