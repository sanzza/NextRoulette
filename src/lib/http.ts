import { env } from "@/lib/env";

/**
 * Détermine l'origine PUBLIQUE de l'application (https://mondomaine.fr).
 *
 * Derrière un proxy (Railway, Nginx…), `request.url` reflète l'adresse
 * d'écoute interne (ex. 0.0.0.0:8080) et non l'hôte demandé par le visiteur.
 * On reconstruit donc l'origine dans cet ordre :
 *   1. en-têtes `x-forwarded-host` / `x-forwarded-proto` (posés par le proxy) ;
 *   2. en-tête `host` s'il est exploitable ;
 *   3. `NEXT_PUBLIC_APP_URL` (config) en dernier recours.
 */
export function getPublicOrigin(request: Request): string {
  const headers = request.headers;

  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedHost) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }

  const host = headers.get("host");
  if (host && !host.startsWith("0.0.0.0") && !host.startsWith("127.0.0.1")) {
    // Sans proto forwardé : https par défaut sauf pour les hôtes locaux.
    const proto = host.startsWith("localhost") ? "http" : "https";
    return `${proto}://${host}`;
  }

  return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
}
