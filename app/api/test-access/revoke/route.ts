import { getPool } from "../../../../lib/db";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPrivateAccessEnabled()) return new Response("Not found", { status: 404 });

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  const revoke = body?.revoke !== false; // default true; pass revoke:false to restore

  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid account id." }, { status: 400 });
  }

  const pool = getPool();
  await pool.query(`update accounts set revoked_at = $1 where id = $2`, [revoke ? new Date() : null, id]);

  return Response.json({ ok: true });
}
