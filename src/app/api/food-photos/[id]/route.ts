import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getStore } from "@/lib/store";
import { photoIdSchema } from "@/lib/validation";

/**
 * Serves a user's own meal photo. Private: requires a session, and photos are
 * stored under the user's own namespace, so a photo id that is not theirs
 * (including someone else's) simply isn't found -> 404. The id is validated
 * against a strict pattern before any filesystem access (no path traversal).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!photoIdSchema.safeParse(params.id).success) {
    return new NextResponse("Not found", { status: 404 });
  }

  const photo = await getStore().getPhoto(user.id, params.id);
  if (!photo) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(photo.bytes, {
    headers: {
      "content-type": photo.mime,
      "cache-control": "private, max-age=31536000, immutable"
    }
  });
}
