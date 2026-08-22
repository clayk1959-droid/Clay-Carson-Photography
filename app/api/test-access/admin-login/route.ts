import { NextResponse } from "next/server";
import { createSessionCookieValue, SESSION_COOKIE_MAX_AGE_SECONDS, SESSION_COOKIE_NAME } from "../../../../lib/session-cookie";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function POST(request: Request) {
  if (!isPrivateAccessEnabled()) return new NextResponse("Not found", { status: 404 });

  const formData = await request.formData();
  const submittedPassword = formData.get("password");
  const redirectTarget = formData.get("redirect");

  const expectedPassword = process.env.EDITOR_PASSWORD;
  const isCorrect =
    typeof submittedPassword === "string" &&
    !!expectedPassword &&
    timingSafeEqual(submittedPassword, expectedPassword);

  const loginUrl = new URL("/test-access/admin-login", request.url);
  if (typeof redirectTarget === "string" && redirectTarget) {
    loginUrl.searchParams.set("redirect", redirectTarget);
  }

  if (!isCorrect) {
    loginUrl.searchParams.set("error", "1");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  // Only ever redirect to a same-site path -- never to a URL an attacker
  // could have supplied via the redirect field.
  const destination =
    typeof redirectTarget === "string" && redirectTarget.startsWith("/") && !redirectTarget.startsWith("//")
      ? redirectTarget
      : "/test-access/admin";

  const response = NextResponse.redirect(new URL(destination, request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE_NAME, await createSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}
