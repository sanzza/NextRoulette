import { NextResponse } from "next/server";
import { getRoomBySlug, isAdmin } from "@/lib/db/rooms";
import { getPhotoBytes, getPhotoMeta } from "@/lib/db/photos";
import { readAdminToken, readParticipantId } from "@/lib/rooms/identity";

export const runtime = "nodejs";

/**
 * GET /api/rooms/[slug]/photos/[id]/image
 * Sert les octets d'une photo.
 *
 * Confidentialité : n'est servie qu'à
 *   - l'ADMIN de la partie (cookie token) — pour la roulette ; ou
 *   - le PROPRIÉTAIRE de la photo (cookie participant) — sa vue privée.
 * Un autre joueur ne peut donc pas voir les ex des autres avant la roulette.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;

  const room = getRoomBySlug(slug);
  if (!room) return new NextResponse(null, { status: 404 });

  const meta = getPhotoMeta(id);
  if (!meta || meta.room_id !== room.id) return new NextResponse(null, { status: 404 });

  const adminToken = await readAdminToken(slug);
  const participantId = await readParticipantId(slug);

  const allowed =
    isAdmin(room, adminToken ?? undefined) || participantId === meta.participant_id;
  if (!allowed) return new NextResponse(null, { status: 403 });

  const data = getPhotoBytes(id);
  if (!data) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(data.bytes), {
    status: 200,
    headers: {
      "Content-Type": data.mime,
      // Privé : ne pas mettre en cache partagé (CDN, proxy).
      "Cache-Control": "private, max-age=3600",
      "Content-Length": String(data.bytes.length),
    },
  });
}
