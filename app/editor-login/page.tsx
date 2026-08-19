export default async function EditorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect, error } = await searchParams;

  return (
    <main className="editor-login-page">
      <form method="POST" action="/api/editor-login" className="editor-login-form">
        <h1>Password required</h1>
        {error && <p className="editor-login-error">Wrong password. Try again.</p>}
        <input type="hidden" name="redirect" value={redirect ?? ""} />
        <label>
          Password
          <input type="password" name="password" autoFocus required />
        </label>
        <button type="submit">Continue</button>
      </form>
    </main>
  );
}
