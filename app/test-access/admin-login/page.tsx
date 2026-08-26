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
    <main className="private-access-inner">
      <form method="POST" action="/api/test-access/admin-login" className="private-access-form">
        <h1>Password required</h1>
        {error && <p className="private-access-error">Wrong password. Try again.</p>}
        <input type="hidden" name="redirect" value={redirect ?? ""} />
        <label className="private-access-field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoFocus
            required
            autoComplete="off"
            className="private-access-input"
          />
        </label>
        <button type="submit" className="private-access-button">
          Continue
        </button>
      </form>
    </main>
  );
}
