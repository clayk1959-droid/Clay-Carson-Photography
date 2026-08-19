// Renders an ISO date ("YYYY-MM-DD") as "Month D, YYYY" for photo captions.
// Shared between the local sync script and the remote editor's API routes
// so a caption produced by either path always matches.
export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
