import { NextResponse } from "next/server";
import {
  createSessionCookieValue,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
} from "../../../lib/session-cookie";
import { checkEditorPassword, findEditorUser } from "../../../lib/editor-users";

export async function POST(request: Request) {
  // Only meaningful on the remote editor deployment -- local dev already
  // grants editor access without a password, so this route doesn't exist
  // there at all.
  if (process.env.EDITOR_MODE !== "remote") {
    return new NextResponse("Not found", { status: 404 });
  }

  const formData = await request.formData();
  const submittedName = formData.get("name");
  const submittedPassword = formData.get("password");
  const redirectTarget = formData.get("redirect");

  const user = typeof submittedName === "string" ? findEditorUser(submittedName) : null;
  const isCorrect = !!user && typeof submittedPassword === "string" && checkEditorPassword(user, submittedPassword);

  const loginUrl = new URL("/editor-login", request.url);
  if (typeof redirectTarget === "string" && redirectTarget) {
    loginUrl.searchParams.set("redirect", redirectTarget);
  }

  if (!isCorrect || !user) {
    loginUrl.searchParams.set("error", "1");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  // Only ever redirect to a same-site path -- never to a URL an attacker
  // could have supplied via the redirect field.
  const destination =
    typeof redirectTarget === "string" && redirectTarget.startsWith("/") && !redirectTarget.startsWith("//")
      ? redirectTarget
      : "/collections";

  const response = NextResponse.redirect(new URL(destination, request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE_NAME, await createSessionCookieValue(user.name, user.password), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}
