"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

/**
 * Dev-only bridge that exposes this react-three-fiber scene to the threlte-mcp
 * server (ws://127.0.0.1:8083) so an AI client can inspect and manipulate it.
 * Uses the framework-agnostic MCPBridge class (not the Svelte component), is
 * dynamically imported so it never enters the production bundle, and only runs
 * under `next dev`. Mount it as a child of a <Canvas>.
 */
export function McpBridge() {
  const scene = useThree((s) => s.scene);
  const bridge = useRef<{ update: () => void; disconnect: () => void } | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    let disposed = false;
    // Deep-import the class file: the package's ./client entry re-exports a
    // .svelte component that webpack cannot parse.
    import("threlte-mcp/client/MCPBridge.js")
      .then(({ MCPBridge }) => {
        if (disposed) return;
        bridge.current = new MCPBridge(scene, { autoConnect: true, url: "ws://127.0.0.1:8083" });
      })
      .catch((e) => console.warn("[threlte-mcp] bridge failed to load:", e));
    return () => {
      disposed = true;
      bridge.current?.disconnect();
      bridge.current = null;
    };
  }, [scene]);

  useFrame(() => bridge.current?.update());
  return null;
}
