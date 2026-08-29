import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isPrivateAccessEnabled } from "../../../lib/private-access-mode";
import { getPool } from "../../../lib/db";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "../../../lib/session-cookie";
import { RevokeButton } from "./RevokeButton";
import { GalleryAccessGrid } from "./GalleryAccessGrid";
import { UploadAccessToggle } from "./UploadAccessToggle";
import { NotifyGalleryLiveButton } from "./NotifyGalleryLiveButton";
import { InviteUploadAccessForm } from "./InviteUploadAccessForm";
import collectionIndex from "../../../data/photo-data/_index.json";

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
  const loggedIn = await verifySessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!loggedIn) redirect("/test-access/admin-login?redirect=/test-access/admin");

  const privateGalleries = (collectionIndex.cards as Array<{ slug: string; title: string; private: boolean }>)
    .filter((card) => card.private)
    .map((card) => ({ slug: card.slug, title: card.title }));

  const pool = getPool();
  const [accountsResult, pendingResult, grantsResult, uploadGrantsResult] = await Promise.all([
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
    privateGalleries.length > 0
      ? pool.query(`select account_id, gallery_slug from gallery_access`)
      : Promise.resolve({ rows: [] }),
    pool.query(`select account_id from upload_access`),
  ]);

  const accounts = accountsResult.rows as Account[];
  const pending = pendingResult.rows as PendingRequest[];
  const grants = new Set(
    (grantsResult.rows as Array<{ account_id: number; gallery_slug: string }>).map(
      (row) => `${row.account_id}:${row.gallery_slug}`,
    ),
  );
  const uploadGrants = new Set(
    (uploadGrantsResult.rows as Array<{ account_id: number }>).map((row) => row.account_id),
  );

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
                  <th>Can submit photos</th>
                  <th />
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
                        <UploadAccessToggle accountId={account.id} granted={uploadGrants.has(account.id)} />
                      </td>
                      <td>
                        <NotifyGalleryLiveButton accountId={account.id} />
                      </td>
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
        <p className="private-access-note">
          For someone who&apos;s never requested access before — no account to toggle above yet —
          invite them for upload access directly. This creates their account and emails them a
          real login link, no gallery access implied.
        </p>
        <InviteUploadAccessForm />
      </section>

      <section className="private-access-section">
        <h2>Private gallery access</h2>
        <p className="private-access-note">
          One row per account, one column per private gallery. Check a box to grant that person
          access immediately — no email round trip needed.
        </p>
        <GalleryAccessGrid
          accounts={accounts.filter((account) => !account.revoked_at)}
          privateGalleries={privateGalleries}
          grants={grants}
        />
      </section>
    </main>
  );
}
