import { cookies } from "next/headers";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { list, del } from "@vercel/blob";
import { getAccountForSession, hasUploadAccess, SESSION_COOKIE_NAME } from "../../../../lib/private-access";
import { isRecognizedImage } from "../../../../lib/image-signature";

export const dynamic = "force-dynamic";

const SUBMISSION_LIMIT = 30;
const MAX_FILE_BYTES = 75 * 1024 * 1024; // generous for a full-size TIFF

function blobPrefix(accountId: number) {
  return `submissions/${accountId}/`;
}

// Files upload directly from the browser to Blob storage -- Vercel Functions
// cap request bodies at 4.5MB, far too small for real photos, so this route
// never sees file bytes at all. It only (1) authorizes each upload before a
// token is issued, cookies() still works here since it's bound to the
// request context, not an explicit param -- and (2) double-checks the
// actual file content after the fact, since allowedContentTypes only checks
// what the browser *claims* a file is, not what it actually contains.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => {
      const cookieStore = await cookies();
      const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
      if (!account || !(await hasUploadAccess(account.account_id))) {
        throw new Error("Not authorized.");
      }
      // The client can only ever write into its own account's folder --
      // otherwise a malicious client could pass any pathname it wants.
      if (pathname !== `${blobPrefix(account.account_id)}${pathname.split("/").pop()}`) {
        throw new Error("Invalid path.");
      }
      const { blobs } = await list({ prefix: blobPrefix(account.account_id) });
      if (blobs.length >= SUBMISSION_LIMIT) {
        throw new Error(`You're at the ${SUBMISSION_LIMIT}-photo limit until Clay reviews what's already submitted.`);
      }

      return {
        allowedContentTypes: ["image/jpeg", "image/png", "image/tiff"],
        maximumSizeInBytes: MAX_FILE_BYTES,
        addRandomSuffix: false,
      };
    },
    onUploadCompleted: async ({ blob }) => {
      // allowedContentTypes only checked what the browser claimed the file
      // was -- this checks what it actually is, and removes it if it lied.
      try {
        const response = await fetch(blob.url, { headers: { Range: "bytes=0-15" } });
        const head = new Uint8Array(await response.arrayBuffer());
        if (!isRecognizedImage(head)) {
          await del(blob.url);
        }
      } catch {
        // If this check itself fails for some reason, err on the side of
        // leaving the file for Clay to review manually rather than losing it.
      }
    },
  });

  return Response.json(jsonResponse);
}
