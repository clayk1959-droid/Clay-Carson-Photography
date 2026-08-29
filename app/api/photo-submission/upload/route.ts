import { cookies } from "next/headers";
import { put, list } from "@vercel/blob";
import { Resend } from "resend";
import {
  getAccountForSession,
  hasUploadAccess,
  SESSION_COOKIE_NAME,
  FROM_ADDRESS,
  OWNER_EMAIL,
  escapeHtml,
} from "../../../../lib/private-access";
import { isRecognizedImage } from "../../../../lib/image-signature";

export const dynamic = "force-dynamic";

const SUBMISSION_LIMIT = 30;
const MAX_FILE_BYTES = 75 * 1024 * 1024; // generous for a full-size TIFF

function blobPrefix(accountId: number) {
  return `submissions/${accountId}/`;
}

async function pendingCount(accountId: number): Promise<number> {
  const { blobs } = await list({ prefix: blobPrefix(accountId) });
  return blobs.length;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!account || !(await hasUploadAccess(account.account_id))) {
    return new Response("Not found", { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return Response.json({ error: "No files submitted." }, { status: 400 });
  }

  const currentCount = await pendingCount(account.account_id);
  if (currentCount + files.length > SUBMISSION_LIMIT) {
    return Response.json(
      {
        error: `That's ${files.length} photo(s), but only ${SUBMISSION_LIMIT - currentCount} slot(s) are left (${currentCount} already submitted, awaiting review).`,
      },
      { status: 400 },
    );
  }

  // Validate everything before uploading anything -- a partial batch with
  // an unclear failure is worse than a clear "fix this one and resubmit."
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return Response.json({ error: `"${file.name}" is too large (over 75MB).` }, { status: 400 });
    }
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (!isRecognizedImage(head)) {
      return Response.json({ error: `"${file.name}" doesn't look like a real image file.` }, { status: 400 });
    }
  }

  const uploaded: string[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `${blobPrefix(account.account_id)}${Date.now()}-${safeName}`;
    await put(pathname, file, { access: "private", addRandomSuffix: false });
    uploaded.push(file.name);
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: OWNER_EMAIL,
      subject: `${account.name} submitted ${uploaded.length} photo(s)`,
      html: `<p><strong>${escapeHtml(account.name)}</strong> (${escapeHtml(account.email)}) submitted ${uploaded.length} photo(s):</p><ul>${uploaded
        .map((name) => `<li>${escapeHtml(name)}</li>`)
        .join("")}</ul><p>Run <code>npm run submissions:pull</code> to bring them down for review.</p>`,
    });
  }

  return Response.json({ ok: true, uploaded: uploaded.length, pendingCount: currentCount + uploaded.length });
}
