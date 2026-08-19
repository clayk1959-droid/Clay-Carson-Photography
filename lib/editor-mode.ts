// Whether the pencil-icon editor should be shown/allowed to write.
// True locally under `next dev` (NODE_ENV==="development"), and true on
// exactly one deployment: the password-protected remote-editor Vercel
// project, which sets EDITOR_MODE=remote. Never true on production, since
// that variable is never set there.
export function isEditorEnabled(): boolean {
  return process.env.NODE_ENV === "development" || process.env.EDITOR_MODE === "remote";
}

export function isRemoteEditorMode(): boolean {
  return process.env.EDITOR_MODE === "remote";
}
