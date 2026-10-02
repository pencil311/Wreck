"use client";

import { useMemo } from "react";
import { Vector2 } from "three";

/**
 * A real dumbbell, not two lollipops: a knurled steel handle, sleeves, and
 * beveled Vulcanico bumper plates (two per side, stepped) with steel end caps.
 * Built from primitives + one lathe-revolved plate profile — no external assets.
 */

const EMBER = "#FF4103";
const EMBER_DEEP = "#C92E00";
const STEEL_LIGHT = "#cdd6db";
const STEEL = "#8b99a1";
const STEEL_DARK = "#3a474e";

/** Flat beveled bumper-plate cross-section, revolved around Y then laid onto X. */
function usePlateProfile(outer: number, thick: number) {
  return useMemo(() => {
    const hub = 0.17;
    const t = thick / 2;
    // Mostly-flat faces with a small chamfer at the rim so it reads as a plate.
    return [
      new Vector2(hub, t),
      new Vector2(outer - 0.03, t),
      new Vector2(outer, t - 0.03),
      new Vector2(outer, -t + 0.03),
      new Vector2(outer - 0.03, -t),
      new Vector2(hub, -t)
    ];
  }, [outer, thick]);
}

function Plate({ x, outer, thick, color }: { x: number; outer: number; thick: number; color: string }) {
  const pts = usePlateProfile(outer, thick);
  return (
    <group position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      {/* rubber bumper plate */}
      <mesh castShadow>
        <latheGeometry args={[pts, 64]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* steel hub ring around the sleeve hole */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, thick + 0.02, 48]} />
        <meshStandardMaterial color={STEEL} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Side({ dir }: { dir: 1 | -1 }) {
  return (
    <group>
      {/* sleeve the plates sit on */}
      <mesh position={[dir * 1.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.5, 32]} />
        <meshStandardMaterial color={STEEL} metalness={1} roughness={0.28} />
      </mesh>
      {/* two flat bumper plates near the end (inner bigger, outer smaller) */}
      <Plate x={dir * 0.95} outer={0.66} thick={0.15} color={EMBER} />
      <Plate x={dir * 1.16} outer={0.54} thick={0.13} color={EMBER_DEEP} />
      {/* steel end cap */}
      <mesh position={[dir * 1.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.19, 0.15, 0.1, 24]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.95} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function DumbbellMesh({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      {/* full-length steel handle, visible between the plates */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.082, 0.082, 2.0, 32]} />
        <meshStandardMaterial color={STEEL_LIGHT} metalness={1} roughness={0.22} />
      </mesh>
      {/* knurled grip in the middle (faceted cylinder reads as knurling) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.092, 0.092, 0.9, 16]} />
        <meshStandardMaterial color={STEEL} metalness={0.95} roughness={0.5} flatShading />
      </mesh>
      <Side dir={1} />
      <Side dir={-1} />
    </group>
  );
}
