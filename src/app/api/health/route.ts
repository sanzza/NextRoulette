import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Endpoint de santé — utile pour le monitoring / les sondes de déploiement.
 * GET /api/health
 *
 * Vérifie aussi que la base de données est accessible EN ÉCRITURE (cause
 * classique de panne : volume de données non monté ou non inscriptible).
 * L'import de la couche DB est dynamique pour que ce endpoint réponde même si
 * la configuration (env) est invalide, en expliquant pourquoi.
 */
export async function GET() {
  let db: { status: string; detail?: string };
  try {
    const { getDb } = await import("@/lib/db");
    getDb().exec("CREATE TABLE IF NOT EXISTS _health (ts TEXT)");
    getDb().prepare("INSERT INTO _health (ts) VALUES (?)").run(new Date().toISOString());
    getDb().exec("DELETE FROM _health");
    db = { status: "ok" };
  } catch (err) {
    console.error("[health] base de données indisponible :", err);
    db = { status: "error", detail: err instanceof Error ? err.message : String(err) };
  }

  const healthy = db.status === "ok";
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", service: "nextroulette", db },
    { status: healthy ? 200 : 503 },
  );
}
