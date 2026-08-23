import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isPrivateAccessEnabled } from "../../../lib/private-access-mode";
import { getPool } from "../../../lib/db";
import { SESSION_COOKIE_NAME, isValidSessionCookieValue } from "../../../lib/session-cookie";
import { RevokeButton } from "./RevokeButton";

export const dynamic = "force-dynamic";

type Account = {
  id: number;
  name: string;
  email: string;
  session_type: "3_months" | "forever";
  created_at: string;
  revoked_at: string | null;
  last_login: string | null;
};

type PendingRequest = {
  id: number;
  name: string;
  email: string;
  note: string | null;
  requested_at: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminPage() {
  if (!isPrivateAccessEnabled()) notFound();

  const cookieStore = await cookies();
  const loggedIn = await isValidSessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!loggedIn) redirect("/test-access/admin-login?redirect=/test-access/admin");

  const pool = getPool();
  const [accountsResult, pendingResult] = await Promise.all([
    pool.query(
      `select accounts.id, accounts.name, accounts.email, accounts.session_type,
              accounts.created_at, accounts.revoked_at,
              (select max(logged_in_at) from login_log where login_log.account_id = accounts.id) as last_login
         from accounts
        order by accounts.created_at desc`,
    ),
    pool.query(
      `select id, name, email, note, requested_at
         from access_requests
        where status = 'pending'
        order by requested_at desc`,
    ),
  ]);

  const accounts = accountsResult.rows as Account[];
  const pending = pendingResult.rows as PendingRequest[];

  return (
    <main className="private-access-inner wide">
      <h1>Private Access — Admin</h1>
      <p className="private-access-summary">
        {accounts.length} account{accounts.length === 1 ? "" : "s"}
        {pending.length > 0 ? ` · ${pending.length} pending request${pending.length === 1 ? "" : "s"}` : ""}
      </p>

      {pending.length > 0 && (
        <section className="private-access-section">
          <h2>Pending requests</h2>
          <div className="private-access-table-wrap">
            <table className="private-access-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Note</th>
                  <th>Requested</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.email}</td>
                    <td>{row.note ?? "—"}</td>
                    <td>{formatDate(row.requested_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="private-access-note">Approve or deny these from the links in the request email.</p>
        </section>
      )}

      <section className="private-access-section">
        <h2>Accounts</h2>
        {accounts.length === 0 ? (
          <p className="private-access-note">No one has been approved yet.</p>
        ) : (
          <div className="private-access-table-wrap">
            <table className="private-access-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th>Key</th>
                  <th>Last login</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => {
                  const revoked = Boolean(account.revoked_at);
                  return (
                    <tr key={account.id} className={revoked ? "revoked" : undefined}>
                      <td>{account.name}</td>
                      <td>{account.email}</td>
                      <td>{formatDate(account.created_at)}</td>
                      <td>{account.session_type === "forever" ? "Forever" : "3 months"}</td>
                      <td>{formatDate(account.last_login)}</td>
                      <td>{revoked ? "Revoked" : "Active"}</td>
                      <td>
                        <RevokeButton id={account.id} revoked={revoked} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
