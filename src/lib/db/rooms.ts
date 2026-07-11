import { randomBytes, randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";

/**
 * Accès aux « parties » (rooms).
 *
 * Modèle de sécurité par **liens-capacités** (adapté à un jeu de soirée) :
 *  - `slug`        : identifiant public non devinable → sert de lien de partage
 *                    pour contribuer (ajouter ses ex).
 *  - `admin_token` : secret non devinable → donne accès à la roulette et à la
 *                    vue de toutes les photos. À ne partager qu'avec l'hôte.
 *
 * Les deux sont des chaînes aléatoires : connaître le lien = avoir le droit.
 */

export interface Room {
  id: string;
  slug: string;
  name: string;
  admin_token: string;
  created_at: string;
}

/** Génère un identifiant URL-safe court et non devinable. */
function token(bytes = 16): string {
  return randomBytes(bytes).toString("base64url");
}

export function createRoom(name: string): Room {
  const room: Room = {
    id: randomUUID(),
    slug: token(9),
    name,
    admin_token: token(24),
    created_at: new Date().toISOString(),
  };
  getDb()
    .prepare(
      `INSERT INTO rooms (id, slug, name, admin_token, created_at)
       VALUES (@id, @slug, @name, @admin_token, @created_at)`,
    )
    .run(room);
  return room;
}

export function getRoomBySlug(slug: string): Room | undefined {
  return getDb().prepare(`SELECT * FROM rooms WHERE slug = ?`).get(slug) as Room | undefined;
}

/**
 * Vérifie qu'un token admin correspond bien à la partie.
 * Comparaison simple : les tokens sont longs et aléatoires (128+ bits).
 */
export function isAdmin(room: Room, adminToken: string | undefined): boolean {
  return !!adminToken && adminToken === room.admin_token;
}
