import type { SVGProps } from "react";

/**
 * WRECK icon set — hand-drawn, geometric, stroke-based. Deliberately NOT
 * lucide/feather (a "vibecoded" tell). Consistent 24-grid, 1.6 stroke, square
 * caps to match the product's sharp geometry. All inherit currentColor.
 */
export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size = 24): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
    "aria-hidden": true
  };
}

/** Dumbbell — training / home. Reads as a real dumbbell: outer collars,
 *  tall inner plates, and a knurled handle between them. */
export function IconBarbell({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      {/* left collar + plate */}
      <path d="M4 8.5v7M7 5.5v13" />
      {/* handle */}
      <path d="M7 12h10" />
      {/* right plate + collar */}
      <path d="M17 5.5v13M20 8.5v7" />
    </svg>
  );
}

/** Bowl — nutrition / eat. */
export function IconBowl({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 11h18M4 11a8 8 0 0 0 16 0M9 11c0-3 6-3 6 0M12 4v3" />
    </svg>
  );
}

/** Pulse — readiness / recovery. A stepped waveform. */
export function IconPulse({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M2 12h4l2-6 4 12 2-6h8" />
    </svg>
  );
}

/** Columns — progress / charts. */
export function IconColumns({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20V7M2 20h20" />
    </svg>
  );
}

/** Speech — coach. A square speech frame. */
export function IconSpeech({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 4h16v11H9l-4 4v-4H4z" />
    </svg>
  );
}

/** Person — profile / identity. */
export function IconPerson({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM5 20v-1c0-3 3-5 7-5s7 2 7 5v1" />
    </svg>
  );
}

/** Run — a figure mid-stride, for runner mode. */
export function IconRun({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M14 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM13 9l-4 3 3 2-1 5M12 14l4 2M9 12l-4 1" />
    </svg>
  );
}

/** Compass / target — goal. */
export function IconTarget({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <rect x="7" y="7" width="10" height="10" />
    </svg>
  );
}

/** Plus. */
export function IconPlus({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Close. */
export function IconClose({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Arrow right — used sparingly, never animated. */
export function IconArrow({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

/** A stamped tick used only for completion state, not as a bullet style. */
export function IconTick({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

/** Swap — substitutions. */
export function IconSwap({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </svg>
  );
}

/** Gear — settings. Squared. */
export function IconGear({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="9" y="9" width="6" height="6" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
    </svg>
  );
}

/** Logout. */
export function IconExit({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M14 4H5v16h9M10 12h10M17 8l4 4-4 4" />
    </svg>
  );
}

/** Menu. */
export function IconMenu({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

/** Shield — trust / safety / privacy. */
export function IconShield({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />
    </svg>
  );
}

/** Home. A squared-off house. */
export function IconHome({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 11l8-6 8 6M6 10v9h12v-9M10 19v-5h4v5" />
    </svg>
  );
}

/** Book — learn. */
export function IconBook({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M5 4h9a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM16 6h3v14H7" />
    </svg>
  );
}

/**
 * DumbbellMark — a full-colour, dimensional dumbbell for hero / feature use
 * (as opposed to the monochrome line icon above). Metallic steel plates with
 * ember collars, tilted for energy. Self-contained gradients.
 */
export function DumbbellMark({
  size = 48,
  className,
  ...p
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden
      {...p}
    >
      <defs>
        <linearGradient id="wreckSteel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DFE1E6" />
          <stop offset="0.5" stopColor="#9DA1A8" />
          <stop offset="1" stopColor="#5C5F66" />
        </linearGradient>
        <linearGradient id="wreckEmber" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F0906B" />
          <stop offset="0.55" stopColor="#D8613A" />
          <stop offset="1" stopColor="#A9421F" />
        </linearGradient>
      </defs>
      <g transform="rotate(-20 24 24)">
        {/* handle */}
        <rect x="14" y="21.5" width="20" height="5" rx="2.5" fill="url(#wreckSteel)" />
        {/* left plates */}
        <rect x="9" y="14" width="6.5" height="20" rx="2.2" fill="url(#wreckSteel)" />
        <rect x="4" y="17.5" width="5" height="13" rx="2" fill="url(#wreckEmber)" />
        {/* right plates */}
        <rect x="32.5" y="14" width="6.5" height="20" rx="2.2" fill="url(#wreckSteel)" />
        <rect x="39" y="17.5" width="5" height="13" rx="2" fill="url(#wreckEmber)" />
        {/* top highlight for sheen */}
        <rect x="9" y="14" width="6.5" height="3" rx="1.6" fill="#FFFFFF" opacity="0.28" />
        <rect x="32.5" y="14" width="6.5" height="3" rx="1.6" fill="#FFFFFF" opacity="0.28" />
      </g>
    </svg>
  );
}

/** Clock — availability / duration. */
export function IconClock({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="4" y="4" width="16" height="16" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}
