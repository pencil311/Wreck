import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { hashPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";
import { getStore } from "@/lib/store";

/**
 * Google OAuth callback. Verifies the CSRF state, exchanges the code for tokens
 * at Google's token endpoint (server-to-server over TLS), reads the verified
 * email + name from the returned id_token, then finds-or-creates the user and
 * starts a normal WRECK session. Accounts merge by email, so a user who signed
 * up with a password and later uses Google lands on the same account.
 */
export const runtime = "nodejs";

const STATE_COOKIE = "g_oauth_state";
const fail = (req: NextRequest, code: string) =>
  NextResponse.redirect(new URL(`/login?error=${code}`, req.url));

type GoogleClaims = { email?: string; email_verified?: boolean | string; name?: string };

function decodeIdToken(idToken: string): GoogleClaims {
  const payload = idToken.split(".")[1];
  if (!payload) return {};
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as GoogleClaims;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail(req, "google_unconfigured");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !savedState || state !== savedState) return fail(req, "google");

  try {
    const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    if (!tokenRes.ok) return fail(req, "google");

    const { id_token } = (await tokenRes.json()) as { id_token?: string };
    if (!id_token) return fail(req, "google");

    const claims = decodeIdToken(id_token);
    const email = claims.email?.toLowerCase().trim();
    const verified = claims.email_verified === true || claims.email_verified === "true";
    if (!email || !verified) return fail(req, "google");

    const store = getStore();
    let user = await store.getUserByEmail(email);
    if (!user) {
      // Give the row a random (unusable) password hash; this account signs in
      // via Google. The column is NOT NULL, so a placeholder is required.
      const randomHash = await hashPassword(randomUUID() + randomUUID());
      user = await store.createUser({
        email,
        passwordHash: randomHash,
        displayName: claims.name?.trim() || email.split("@")[0]
      });
    }

    const token = await signSession(user.id);
    const res = NextResponse.redirect(new URL("/app", req.url));
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    res.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    console.error("google oauth callback failed:", e);
    return fail(req, "google");
  }
}
