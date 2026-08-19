import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, isValidSessionCookieValue } from "./lib/session-cookie";

export async function proxy(request: NextRequest) {
  // This is the single line that guarantees zero effect on production:
  // EDITOR_MODE is only ever set on the password-protected remote editor
  // deployment, never on the real production site.
  if (process.env.EDITOR_MODE !== "remote") {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (await isValidSessionCookieValue(cookie)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const loginUrl = new URL("/editor-login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!editor-login|api/editor-login|_next/static|_next/image|favicon.ico).*)"],
};
