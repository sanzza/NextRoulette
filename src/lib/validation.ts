import { z } from "zod";

/**
 * Schémas de validation des entrées (zod).
 * Toute donnée venant du client passe par ici avant traitement — jamais de
 * confiance aveugle dans le payload reçu. Voir docs/SECURITY.md.
 */

export const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum").max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Ajout d'un ex dans une partie (la photo est gérée à part, en upload). */
export const exEntrySchema = z.object({
  pseudo: z
    .string()
    .trim()
    .min(1, "Donne au moins un prénom ou un pseudo")
    .max(40, "40 caractères maximum"),
  indice: z.string().trim().max(120, "Indice trop long (120 max)").optional(),
});
export type ExEntryInput = z.infer<typeof exEntrySchema>;

/** Création d'une partie (room) partageable par lien. */
export const createRoomSchema = z.object({
  nom: z.string().trim().min(1).max(60).default("Soirée NextRoulette"),
});
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
