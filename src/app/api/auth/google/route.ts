import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

/**
 * Start Google OAuth. Builds the consent URL and stashes a CSRF `state` in a
 * short-lived cookie that the callback checks. The redirect URI is derived from
 * the request origin so it works across localhost and deployed domains; it must
 * be registered verbatim in the Google Cloud console.
 */
export const runtime = "nodejs";

const STATE_COOKIE = "g_oauth_state";

export function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google_unconfigured", req.url));
  }

  const state = randomUUID();
  const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600 // 10 minutes
  });
  return res;
}
