"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";
import { DumbbellMesh } from "./dumbbell";
import { McpBridge } from "./mcp-bridge";

/**
 * Low-poly metallic dumbbell, lit only by explicit lights (no external HDR /
 * asset fetch, so nothing to block or stall). Vulcanico key + rim light on a
 * dark steel body over the Noturno ground. Kept deliberately light: a handful
 * of primitives, a small Sparkles field, and one slow rotation.
 */

const EMBER = "#FF4103";

function Dumbbell() {
  const g = useRef<Group>(null);

  useFrame((state, delta) => {
    // Pause work when the tab is hidden — no wasted frames in the background.
    if (typeof document !== "undefined" && document.hidden) return;
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    // Stay broadside (bar horizontal) so it always reads as a dumbbell, with a
    // gentle oscillation and a lean toward the pointer.
    const ty = Math.sin(t * 0.5) * 0.5 + state.pointer.x * 0.35;
    const tx = 0.18 + state.pointer.y * 0.2;
    g.current.rotation.y += (ty - g.current.rotation.y) * Math.min(1, delta * 4);
    g.current.rotation.x += (tx - g.current.rotation.x) * Math.min(1, delta * 4);
    g.current.rotation.z = 0.08;
  });

  return (
    <group ref={g} rotation={[0.18, 0, 0.08]}>
      <DumbbellMesh scale={1.05} />
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.2, 5], fov: 42 }}
    >
      <ambientLight intensity={0.7} />
      {/* bright key so steel reads on the light ground */}
      <directionalLight position={[-4, 4, 3]} intensity={1.6} color={"#ffffff"} />
      <directionalLight position={[3, 2, 2]} intensity={0.7} color={"#cfe4f2"} />
      {/* Vulcanico rim to make the plates glow */}
      <pointLight position={[3.5, 1.5, 3]} intensity={55} color={EMBER} distance={14} decay={2} />
      <pointLight position={[-2.5, -2, -1]} intensity={26} color={EMBER} distance={12} decay={2} />

      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.7}>
        <Dumbbell />
      </Float>

      <Sparkles count={36} scale={9} size={2.4} speed={0.3} opacity={0.5} color={EMBER} />

      {/* Dev-only: exposes this scene to the threlte-mcp server. */}
      <McpBridge />
    </Canvas>
  );
}
