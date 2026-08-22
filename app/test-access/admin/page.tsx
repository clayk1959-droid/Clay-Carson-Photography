import { notFound } from "next/navigation";
import { isPrivateAccessEnabled } from "../../../lib/private-access-mode";
import { getPool } from "../../../lib/db";
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

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  background: "#f2f2f2",
  borderBottom: "2px solid #ddd",
  fontWeight: 600,
};
const tdStyle: React.CSSProperties = { padding: "10px 12px", borderBottom: "1px solid #eee" };

export default async function AdminPage() {
  if (!isPrivateAccessEnabled()) notFound();

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
    <main style={{ maxWidth: 900, margin: "50px auto", padding: "0 20px", fontFamily: "sans-serif", color: "#222" }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Private Access — Admin</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        {accounts.length} account{accounts.length === 1 ? "" : "s"}
        {pending.length > 0 ? ` · ${pending.length} pending request${pending.length === 1 ? "" : "s"}` : ""}
      </p>

      {pending.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 16, marginBottom: 10 }}>Pending requests</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Note</th>
                <th style={thStyle}>Requested</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((row) => (
                <tr key={row.id}>
                  <td style={tdStyle}>{row.name}</td>
                  <td style={tdStyle}>{row.email}</td>
                  <td style={tdStyle}>{row.note ?? "—"}</td>
                  <td style={tdStyle}>{formatDate(row.requested_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ color: "#888", fontSize: 13, marginTop: 8 }}>
            Approve or deny these from the links in the request email.
          </p>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>Accounts</h2>
        {accounts.length === 0 ? (
          <p style={{ color: "#888" }}>No one has been approved yet.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Registered</th>
                <th style={thStyle}>Key</th>
                <th style={thStyle}>Last login</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle} />
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const revoked = Boolean(account.revoked_at);
                return (
                  <tr key={account.id} style={revoked ? { opacity: 0.55 } : undefined}>
                    <td style={tdStyle}>{account.name}</td>
                    <td style={tdStyle}>{account.email}</td>
                    <td style={tdStyle}>{formatDate(account.created_at)}</td>
                    <td style={tdStyle}>{account.session_type === "forever" ? "Forever" : "3 months"}</td>
                    <td style={tdStyle}>{formatDate(account.last_login)}</td>
                    <td style={tdStyle}>{revoked ? "Revoked" : "Active"}</td>
                    <td style={tdStyle}>
                      <RevokeButton id={account.id} revoked={revoked} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
