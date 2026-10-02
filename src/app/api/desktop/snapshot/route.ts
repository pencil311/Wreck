import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buildSnapshot } from "@/lib/desktop-snapshot";

/**
 * Real-data snapshot for the planet-jumping desktop app. Auth is by session
 * cookie; no session → 401 and the client sends the user to /login. Used for
 * client-side refresh after actions (the first render is injected server-side
 * by the /desktop route).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const snapshot = await buildSnapshot(user);
  return NextResponse.json(snapshot, { headers: { "cache-control": "no-store" } });
}
