import { env } from "@/lib/env";
import { verifyPassword } from "@/lib/auth/password";
import type { AppRole } from "@/lib/auth/jwt";

/**
 * Magasin d'utilisateurs — FONDATION / DÉMO.
 *
 * Pour l'instant, un unique compte admin est dérivé des variables
 * d'environnement (ADMIN_EMAIL + ADMIN_PASSWORD_HASH). C'est volontairement
 * minimal : l'objectif de cette étape est une fondation saine, pas la
 * persistance complète.
 *
 * ➜ Prochaine étape (docs/ROADMAP.md) : remplacer ce module par un accès
 *   base de données (Prisma + PostgreSQL) sans toucher au reste du code,
 *   grâce à l'interface `authenticate()` ci-dessous.
 */

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: AppRole;
}

/**
 * Vérifie les identifiants. Renvoie l'utilisateur si OK, sinon `null`.
 * On ne révèle jamais si c'est l'e-mail ou le mot de passe qui est faux
 * (anti-énumération de comptes).
 */
export async function authenticate(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  const matchesAdmin = email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();

  // Compare toujours un hash pour éviter une fuite de timing révélant
  // l'existence du compte.
  const hash = matchesAdmin ? env.ADMIN_PASSWORD_HASH : "";
  const ok = await verifyPassword(password, hash);

  if (matchesAdmin && ok) {
    return { id: "admin", email: env.ADMIN_EMAIL, role: "admin" };
  }
  return null;
}
