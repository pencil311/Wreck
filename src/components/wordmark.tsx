import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The WRECK wordmark. Extreme negative tracking on the display face so it reads
 * like a stamped mark rather than set text. The final glyph carries the ember
 * accent as the single brand color moment.
 */
export function Wordmark({
  className,
  href = "/",
  size = "md",
  tone = "bone"
}: {
  className?: string;
  href?: string | null;
  size?: "sm" | "md" | "lg";
  tone?: "bone" | "ink";
}) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
  const mark = (
    <span className={cn("wordmark leading-none", tone === "ink" ? "text-ink" : "text-bone", sizes[size], className)}>
      WREC<span className="text-ember">K</span>
    </span>
  );
  if (href === null) return mark;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="WRECK home">
      {mark}
    </Link>
  );
}
