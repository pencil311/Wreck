import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buildSnapshot } from "@/lib/desktop-snapshot";

/**
 * Serves the planet-jumping desktop app (a self-contained static HTML app) to
 * authenticated desktop users. The HTML lives outside /public so it is not
 * directly reachable without a session; only its assets (/desktop/assets/*) are
 * public. Device routing (desktop -> here, mobile -> /app) is in middleware.
 *
 * Real data is injected server-side as window.__WRECK__ so the app's first
 * synchronous render uses the user's actual data. Actions POST to
 * /api/desktop/* (Phase C), which refetch /api/desktop/snapshot.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const [html, snapshot] = await Promise.all([
    readFile(path.join(process.cwd(), "desktop-app", "index.html"), "utf8"),
    buildSnapshot(user)
  ]);

  // Escape "<" so a value can never break out of the <script> tag.
  const json = JSON.stringify(snapshot).replace(/</g, "\\u003c");
  const injected = html.replace(
    "</head>",
    `<script>window.__WRECK__=${json};</script></head>`
  );

  return new NextResponse(injected, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
