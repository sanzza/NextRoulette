import { NextResponse } from "next/server";
import { getRoomBySlug } from "@/lib/db/rooms";

export const runtime = "nodejs";

/**
 * GET /api/rooms/[slug]
 * Infos publiques minimales d'une partie (juste le nom) — pour afficher un
 * titre sur la page de contribution. Ne divulgue aucune donnée sensible.
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
  return NextResponse.json({ slug: room.slug, name: room.name });
}
