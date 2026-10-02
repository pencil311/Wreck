"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Hero3D = dynamic(() => import("./hero-3d"), { ssr: false });

/**
 * Fills its parent with the WebGL dumbbell once the device is capable. Falls
 * back to a bold Vulcanico panel (with the dumbbell silhouette implied by the
 * frame) when WebGL is unavailable or the user prefers reduced motion.
 */
export function HeroVisual() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let webgl = false;
    try {
      webgl = !!document.createElement("canvas").getContext("webgl");
    } catch {
      webgl = false;
    }
    setEnabled(!reduce && webgl);
  }, []);

  return (
    <div className="absolute inset-0">
      {enabled ? (
        <Hero3D />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-ember">
          <span className="font-display text-display-lg text-ink">WRECK</span>
        </div>
      )}
    </div>
  );
}
