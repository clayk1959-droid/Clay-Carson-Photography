import { cookies } from "next/headers";
import { list } from "@vercel/blob";
import { getAccountForSession, hasUploadAccess, SESSION_COOKIE_NAME } from "../../../../lib/private-access";

export const dynamic = "force-dynamic";

const SUBMISSION_LIMIT = 30;

export async function GET() {
  const cookieStore = await cookies();
  const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!account || !(await hasUploadAccess(account.account_id))) {
    return Response.json({ hasAccess: false });
  }

  const { blobs } = await list({ prefix: `submissions/${account.account_id}/` });
  return Response.json({
    hasAccess: true,
    name: account.name,
    pendingCount: blobs.length,
    limit: SUBMISSION_LIMIT,
  });
}
