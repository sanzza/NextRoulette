import { z } from "zod";

/**
 * Validation centralisée des variables d'environnement.
 *
 * On échoue volontairement au démarrage (fail-fast) si une variable critique
 * est absente ou invalide : mieux vaut une erreur claire au boot qu'un bug
 * de sécurité silencieux en production. Voir docs/SECURITY.md.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Le secret JWT doit être suffisamment long pour HS256.
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET doit faire au moins 32 caractères (openssl rand -base64 48)"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),

  ADMIN_EMAIL: z.string().email().default("admin@nextroulette.local"),
  ADMIN_PASSWORD_HASH: z.string().default(""),
});

/**
 * En production on parse strictement. En dev/test on tolère l'absence de
 * JWT_SECRET pour permettre `next build` sans `.env.local`, en injectant une
 * valeur factice CLAIREMENT non secrète (jamais utilisée pour de vrais users).
 */
function loadEnv() {
  const isProd = process.env.NODE_ENV === "production";

  const raw = {
    ...process.env,
    JWT_SECRET:
      process.env.JWT_SECRET ??
      (isProd ? undefined : "dev-only-insecure-secret-please-override-32chars"),
  };

  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Variables d'environnement invalides :\n${issues}`);
  }

  return parsed.data;
}

export const env = loadEnv();
export type Env = typeof env;
