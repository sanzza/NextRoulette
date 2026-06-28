import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "@/lib/env";

/**
 * Gestion des JSON Web Tokens (signature HS256 via `jose`).
 *
 * `jose` est compatible Edge Runtime (Web Crypto), ce qui permet de vérifier
 * les tokens dans le middleware Next.js sans dépendance Node native.
 */

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ISSUER = "nextroulette";
const AUDIENCE = "nextroulette-app";

export type AppRole = "admin" | "player";

export interface AppTokenClaims extends JWTPayload {
  sub: string; // identifiant utilisateur
  email: string;
  role: AppRole;
}

/** Signe un access token court (par défaut 15 min). */
export function signAccessToken(claims: Omit<AppTokenClaims, "iss" | "aud">): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(env.JWT_ACCESS_TTL)
    .sign(secret);
}

/** Signe un refresh token long (par défaut 7 jours). */
export function signRefreshToken(claims: Pick<AppTokenClaims, "sub" | "email" | "role">): Promise<string> {
  return new SignJWT({ ...claims, typ: "refresh" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(env.JWT_REFRESH_TTL)
    .sign(secret);
}

/**
 * Vérifie un token et renvoie ses claims typés.
 * Lève une erreur si la signature, l'émetteur, l'audience ou l'expiration
 * sont invalides — à attraper côté appelant.
 */
export async function verifyToken(token: string): Promise<AppTokenClaims> {
  const { payload } = await jwtVerify(token, secret, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  return payload as AppTokenClaims;
}
