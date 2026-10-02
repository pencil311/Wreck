import { NextResponse, type NextRequest } from "next/server";

/**
 * Device routing:
 *  - Marketing landing "/" is desktop-only; mobile visitors start at /login.
 *  - The app has two skins behind the same auth: mobile uses the Next app at
 *    "/app"; desktop uses the planet-jumping app at "/desktop". Each device is
 *    redirected to its own skin so login (which lands on /app) reaches the right
 *    one. Auth itself is enforced by the /desktop route handler and the /app
 *    shell layout, not here.
 *
 * Detection is user-agent based (the only signal available server-side). Note:
 * iPadOS reports a desktop UA, so tablets get the desktop experience.
 */
const MOBILE_UA = /Android|iPhone|iPod|Windows Phone|BlackBerry|Opera Mini|IEMobile|Mobile Safari/i;

// TEMP: force every device onto the mobile UI (the Next /app shell) while the
// desktop planet-jumping app is still being wired. Set back to false to restore
// desktop -> /desktop routing.
const FORCE_MOBILE = true;

export function middleware(req: NextRequest) {
  const isMobile = FORCE_MOBILE || MOBILE_UA.test(req.headers.get("user-agent") ?? "");
  const { pathname } = req.nextUrl;

  const to = (p: string) => {
    const url = req.nextUrl.clone();
    url.pathname = p;
    return NextResponse.redirect(url);
  };

  if (pathname === "/") {
    if (isMobile) {
      // Signed-in users skip the login screen entirely. Presence of the session
      // cookie is enough here; the real JWT check and onboarding gating stay in
      // the /app layouts (an invalid cookie ends at /login via those, no loop).
      const signedIn = Boolean(req.cookies.get("wreck_session")?.value);
      return to(signedIn ? "/app" : "/login");
    }
  } else if (pathname === "/app") {
    if (!isMobile) return to("/desktop"); // desktop uses planet-jumping
  } else if (pathname === "/desktop") {
    if (isMobile) return to("/app"); // mobile uses the Next app shell
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/app", "/desktop"]
};
