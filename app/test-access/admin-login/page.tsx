import { notFound } from "next/navigation";
import { isPrivateAccessEnabled } from "../../../lib/private-access-mode";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  if (!isPrivateAccessEnabled()) notFound();
  const { redirect, error } = await searchParams;

  return (
    <main style={{ maxWidth: 360, margin: "80px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <form method="POST" action="/api/test-access/admin-login" style={{ display: "grid", gap: 14 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Password required</h1>
        {error && <p style={{ color: "#a33", margin: 0 }}>Wrong password. Try again.</p>}
        <input type="hidden" name="redirect" value={redirect ?? ""} />
        <label style={{ display: "grid", gap: 6 }}>
          Password
          <input type="password" name="password" autoFocus required style={{ padding: 10, border: "1px solid #999" }} />
        </label>
        <button type="submit" style={{ padding: "10px 16px", cursor: "pointer" }}>
          Continue
        </button>
      </form>
    </main>
  );
}
