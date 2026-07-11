import { NextResponse } from "next/server";
import { createRoomSchema } from "@/lib/validation";
import { createRoom } from "@/lib/db/rooms";
import { getPublicOrigin } from "@/lib/http";

export const runtime = "nodejs";

/**
 * POST /api/rooms
 * Crée une partie et renvoie les liens (partage + admin).
 * Body JSON : { nom }
 */
export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // Corps vide accepté : on utilisera le nom par défaut.
  }

  const parsed = createRoomSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  let room;
  try {
    room = createRoom(parsed.data.nom);
  } catch (err) {
    // Trace explicite pour les logs de l'hébergeur (souvent : volume de données
    // non inscriptible → SQLITE_CANTOPEN / EACCES).
    console.error("[rooms] échec de création de partie :", err);
    return NextResponse.json(
      { error: "Erreur serveur : impossible d'enregistrer la partie" },
      { status: 500 },
    );
  }
  const origin = getPublicOrigin(request);

  return NextResponse.json(
    {
      slug: room.slug,
      name: room.name,
      // Lien à partager avec tous les potes pour ajouter leurs ex.
      shareUrl: `${origin}/r/${room.slug}`,
      // Lien secret de l'hôte : donne accès à la roulette. À ne pas diffuser.
      adminUrl: `${origin}/api/rooms/${room.slug}/enter-admin?token=${room.admin_token}`,
    },
    { status: 201 },
  );
}
