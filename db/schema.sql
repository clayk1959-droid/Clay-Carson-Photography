-- Private gallery access system: requests, accounts, sessions, login log.
-- Safe to re-run -- every statement is idempotent.

CREATE TABLE IF NOT EXISTS access_requests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  -- Unguessable random token so the approve/deny links in the owner's email
  -- can't be guessed or replayed by anyone else.
  action_token TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('3_months', 'forever')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  -- One-time magic-link login. Hashed like session tokens; cleared after use.
  magic_token_hash TEXT,
  magic_token_expires_at TIMESTAMPTZ
);

-- Login tokens are stored hashed, never raw -- the raw token only ever
-- lives in the person's browser cookie and the one-time email link.
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL means "forever" (session_type = forever)
  -- Set once the owner has been notified this session reached the
  -- protected test page, so a page refresh doesn't re-notify every time.
  notified_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS login_log (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  logged_in_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_account_id ON sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_login_log_account_id ON login_log(account_id);

-- Additive changes for tables that may already exist from an earlier run.
ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS action_token TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS magic_token_hash TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS magic_token_expires_at TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;
