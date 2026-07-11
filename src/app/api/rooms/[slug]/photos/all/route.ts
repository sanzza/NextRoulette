import { NextResponse } from "next/server";
import { getRoomBySlug, isAdmin } from "@/lib/db/rooms";
import { listAllPhotos } from "@/lib/db/photos";
import { readAdminToken } from "@/lib/rooms/identity";

export const runtime = "nodejs";

/**
 * GET /api/rooms/[slug]/photos/all
 * Toutes les photos de la partie — RÉSERVÉ À L'ADMIN (cookie token).
 * Alimente la roulette. On ne renvoie que les métadonnées + l'URL image.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) {
    return NextResponse.json({ error: "Partie introuvable" }, { status: 404 });
  }

  const token = await readAdminToken(slug);
  if (!isAdmin(room, token ?? undefined)) {
    return NextResponse.json({ error: "Accès réservé à l'hôte" }, { status: 403 });
  }

  const photos = listAllPhotos(room.id);
  return NextResponse.json({
    room: { slug: room.slug, name: room.name },
    photos: photos.map((p) => ({
      id: p.id,
      participantName: p.participant_name,
      exLabel: p.ex_label,
      color: p.color,
      url: `/api/rooms/${slug}/photos/${p.id}/image`,
    })),
  });
}
