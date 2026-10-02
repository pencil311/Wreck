"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import type { MotionValue } from "framer-motion";
import type { Group } from "three";
import { DumbbellMesh } from "./dumbbell";

const EMBER = "#FF4103";

/** Rotates the dumbbell as the section's scroll progress (0..1) advances. */
function ScrollDumbbell({ progress }: { progress: MotionValue<number> }) {
  const g = useRef<Group>(null);

  useFrame((_, delta) => {
    if (typeof document !== "undefined" && document.hidden) return;
    if (!g.current) return;
    const p = progress.get(); // 0..1 across the section
    // ~1.5 turns across the whole section so each beat shows a fresh face.
    const targetY = p * Math.PI * 3;
    const targetX = 0.25 + Math.sin(p * Math.PI) * 0.35;
    g.current.rotation.y += (targetY - g.current.rotation.y) * Math.min(1, delta * 6);
    g.current.rotation.x += (targetX - g.current.rotation.x) * Math.min(1, delta * 6);
  });

  return (
    <group ref={g} position={[-0.7, 0, 0]}>
      <DumbbellMesh scale={0.95} />
    </group>
  );
}

export default function Anatomy3D({ progress }: { progress: MotionValue<number> }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5], fov: 42 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[-4, 4, 3]} intensity={1.6} color={"#ffffff"} />
      <directionalLight position={[3, 2, 2]} intensity={0.7} color={"#cfe4f2"} />
      <pointLight position={[3.5, 1.5, 3]} intensity={55} color={EMBER} distance={14} decay={2} />
      <pointLight position={[-2.5, -2, -1]} intensity={26} color={EMBER} distance={12} decay={2} />
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5}>
        <ScrollDumbbell progress={progress} />
      </Float>
    </Canvas>
  );
}
