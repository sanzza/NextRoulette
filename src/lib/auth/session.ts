import { cookies } from "next/headers";
import { env } from "@/lib/env";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  type AppTokenClaims,
} from "@/lib/auth/jwt";

/**
 * Gestion de la session via cookies httpOnly.
 *
 * Choix de sécurité (voir docs/SECURITY.md) :
 *  - `httpOnly`  : le JS du navigateur ne peut PAS lire les tokens (anti-XSS).
 *  - `secure`    : transmis uniquement en HTTPS (sauf en dev local).
 *  - `sameSite=lax` : limite l'exposition CSRF tout en gardant les liens cliquables.
 */

export const ACCESS_COOKIE = "nr_access";
export const REFRESH_COOKIE = "nr_refresh";

const baseCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Crée les cookies de session pour un utilisateur authentifié. */
export async function createSession(claims: Pick<AppTokenClaims, "sub" | "email" | "role">) {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(claims),
    signRefreshToken(claims),
  ]);

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, { ...baseCookieOptions, maxAge: 60 * 15 });
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Supprime la session (déconnexion). */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

/**
 * Renvoie les claims de l'utilisateur courant à partir du cookie d'accès,
 * ou `null` si non authentifié / token invalide. À utiliser dans les
 * Server Components et Route Handlers.
 */
export async function getCurrentUser(): Promise<AppTokenClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
