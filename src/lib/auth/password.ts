import bcrypt from "bcryptjs";

/**
 * Hachage de mots de passe avec bcrypt.
 * Coût 12 : bon compromis sécurité / latence en 2026. À réévaluer dans le temps.
 */
const BCRYPT_COST = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(plain, hash);
}
