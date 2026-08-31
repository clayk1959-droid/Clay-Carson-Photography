import { cookies } from "next/headers";
import { Resend } from "resend";
import {
  getAccountForSession,
  hasUploadAccess,
  SESSION_COOKIE_NAME,
  FROM_ADDRESS,
  OWNER_EMAIL,
  escapeHtml,
} from "../../../../lib/private-access";
import { sendSms } from "../../../../lib/sms";

export const dynamic = "force-dynamic";

// Called once by the client after a whole batch of files has finished
// uploading directly to Blob storage -- keeps this as one summary email per
// submission, not one per file (which onUploadCompleted firing per-file
// would otherwise produce).
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!account || !(await hasUploadAccess(account.account_id))) {
    return new Response("Not found", { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const filenames = Array.isArray(body?.filenames) ? body.filenames.filter((f: unknown) => typeof f === "string") : [];
  if (filenames.length === 0) {
    return Response.json({ error: "No filenames given." }, { status: 400 });
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: OWNER_EMAIL,
      subject: `${account.name} submitted ${filenames.length} photo(s)`,
      html: `<p><strong>${escapeHtml(account.name)}</strong> (${escapeHtml(account.email)}) submitted ${filenames.length} photo(s):</p><ul>${filenames
        .map((name: string) => `<li>${escapeHtml(name)}</li>`)
        .join("")}</ul><p>Run <code>npm run submissions:pull</code> to bring them down for review.</p>`,
    });
  }

  await sendSms(`${account.name} submitted ${filenames.length} photo(s) to your site. Run submissions:pull to review.`);

  return Response.json({ ok: true });
}
