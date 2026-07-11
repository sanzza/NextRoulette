import { NextResponse } from "next/server";
import { getRoomBySlug } from "@/lib/db/rooms";
import { deletePhoto } from "@/lib/db/photos";
import { readParticipantId } from "@/lib/rooms/identity";

export const runtime = "nodejs";

/**
 * DELETE /api/rooms/[slug]/photos/[id]
 * Un participant supprime UNE de SES photos (contrôle de propriété côté SQL).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;

  const room = getRoomBySlug(slug);
  if (!room) return NextResponse.json({ error: "Partie introuvable" }, { status: 404 });

  const participantId = await readParticipantId(slug);
  if (!participantId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const deleted = deletePhoto(id, participantId);
  if (!deleted) {
    return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
