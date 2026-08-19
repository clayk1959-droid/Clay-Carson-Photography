// Commits file changes directly to the repo's GitHub branch, used only by
// the remote editor's API routes (EDITOR_MODE === "remote"). Vercel
// serverless functions have no persistent writable filesystem, so this is
// how a remote edit becomes a real, permanent change instead of vanishing
// the moment the function instance recycles -- it's the remote equivalent
// of `npm run save` + `git push`.
//
// Plain fetch against GitHub's REST API -- for this many fixed calls with
// no pagination, a client library wouldn't meaningfully simplify anything.

const API_ROOT = "https://api.github.com";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function repoConfig() {
  return { repo: env("GITHUB_REPO"), branch: process.env.GITHUB_BRANCH || "main", token: env("GITHUB_TOKEN") };
}

async function githubRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`GitHub API ${init?.method ?? "GET"} ${path} failed: ${response.status} ${body}`);
  }
  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

type ContentsResponse = { content: string } | { content: string }[];
type RefResponse = { object: { sha: string } };
type CommitResponse = { sha: string; tree: { sha: string } };
type BlobResponse = { sha: string };
type TreeResponse = { sha: string };

// Reads a file's current content fresh from GitHub (never from this
// function's own deployed bundle) immediately before every edit, so two
// edits made close together can't silently clobber each other.
export async function getFileContent(path: string): Promise<string | null> {
  const { repo, branch, token } = repoConfig();
  try {
    const data = await githubRequest<ContentsResponse>(
      `/repos/${repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(branch)}`,
      token,
    );
    if (Array.isArray(data) || !data.content) return null;
    return Buffer.from(data.content, "base64").toString("utf8");
  } catch (error) {
    if (error instanceof Error && error.message.includes(" 404 ")) return null;
    throw error;
  }
}

export type CommitFile = { path: string; content: string };

// Commits one or more files to the branch in a single atomic commit (a new
// blob per file, one new tree, one new commit, then the ref is moved to
// point at it). Retries a few times if someone else's commit landed on the
// branch first (GitHub rejects a non-fast-forward ref update).
export async function commitFiles(files: CommitFile[], message: string): Promise<void> {
  const { repo, branch, token } = repoConfig();

  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = await githubRequest<RefResponse>(`/repos/${repo}/git/ref/heads/${branch}`, token);
    const baseCommitSha = ref.object.sha;
    const baseCommit = await githubRequest<CommitResponse>(`/repos/${repo}/git/commits/${baseCommitSha}`, token);
    const baseTreeSha = baseCommit.tree.sha;

    const blobs = await Promise.all(
      files.map(async (file) => {
        const blob = await githubRequest<BlobResponse>(`/repos/${repo}/git/blobs`, token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: file.content, encoding: "utf-8" }),
        });
        return { path: file.path, sha: blob.sha };
      }),
    );

    const tree = await githubRequest<TreeResponse>(`/repos/${repo}/git/trees`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: blobs.map((blob) => ({ path: blob.path, mode: "100644", type: "blob", sha: blob.sha })),
      }),
    });

    const commit = await githubRequest<CommitResponse>(`/repos/${repo}/git/commits`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, tree: tree.sha, parents: [baseCommitSha] }),
    });

    try {
      await githubRequest(`/repos/${repo}/git/refs/heads/${branch}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
      return;
    } catch (error) {
      const isConflict = error instanceof Error && /422/.test(error.message);
      if (!isConflict || attempt === 2) throw error;
      // Someone else's commit landed on the branch between our read and
      // write -- loop around and try again against the new tip.
    }
  }
}
