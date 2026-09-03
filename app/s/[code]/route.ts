import { getPool } from "../../../lib/db";

export const dynamic = "force-dynamic";

// Short redirect for links sent in text messages -- see lib/short-links.ts.
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { rows } = await getPool().query<{ target_url: string }>(
    "select target_url from short_links where code = $1",
    [code],
  );
  const targetUrl = rows[0]?.target_url;
  if (!targetUrl) return new Response("Link not found.", { status: 404 });

  return Response.redirect(targetUrl, 302);
}
