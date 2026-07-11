import { NextResponse } from "next/server";
import { getRoomBySlug, isAdmin } from "@/lib/db/rooms";
import { setAdminToken } from "@/lib/rooms/identity";

export const runtime = "nodejs";

/**
 * GET /api/rooms/[slug]/enter-admin?token=...
 * Valide le token admin, le pose en cookie httpOnly, puis redirige vers la
 * roulette. C'est la cible du « lien secret de l'hôte ». Poser le cookie ici
 * garde le token hors des URLs des pages et des balises <img>.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = new URL(request.url).searchParams.get("token") ?? undefined;

  const room = getRoomBySlug(slug);
  if (!room || !isAdmin(room, token)) {
    return NextResponse.redirect(new URL(`/r/${slug}?admin=refused`, request.url));
  }

  await setAdminToken(slug, room.admin_token);
  return NextResponse.redirect(new URL(`/r/${slug}/roulette`, request.url));
}
