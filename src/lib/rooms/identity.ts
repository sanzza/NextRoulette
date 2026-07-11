import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Identité des participants et de l'admin, portée par des cookies **httpOnly**
 * dédiés à chaque partie (isolés par slug).
 *
 *  - `nr_pid_{slug}`   : identifiant anonyme du contributeur → il ne voit que
 *                        SES propres photos (confidentialité entre joueurs).
 *  - `nr_admin_{slug}` : token admin → accès roulette + vue globale.
 *
 * httpOnly = illisible par le JS de la page (anti-XSS). sameSite=lax garde les
 * liens partagés cliquables.
 */

const baseCookie = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 jours
};

function participantCookieName(slug: string): string {
  return `nr_pid_${slug}`;
}
function adminCookieName(slug: string): string {
  return `nr_admin_${slug}`;
}

/** Lit l'identifiant participant, ou `null` s'il n'existe pas encore. */
export async function readParticipantId(slug: string): Promise<string | null> {
  const store = await cookies();
  return store.get(participantCookieName(slug))?.value ?? null;
}

/**
 * Renvoie l'identifiant participant existant, ou en crée un et le pose en
 * cookie. À utiliser dans les Route Handlers (peuvent écrire des cookies).
 */
export async function ensureParticipantId(slug: string): Promise<string> {
  const store = await cookies();
  const name = participantCookieName(slug);
  const existing = store.get(name)?.value;
  if (existing) return existing;

  const id = randomUUID();
  store.set(name, id, baseCookie);
  return id;
}

export async function readAdminToken(slug: string): Promise<string | null> {
  const store = await cookies();
  return store.get(adminCookieName(slug))?.value ?? null;
}

export async function setAdminToken(slug: string, token: string): Promise<void> {
  const store = await cookies();
  store.set(adminCookieName(slug), token, baseCookie);
}
