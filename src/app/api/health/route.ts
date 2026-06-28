import { NextResponse } from "next/server";

/**
 * Endpoint de santé — utile pour le monitoring / les sondes de déploiement.
 * GET /api/health
 */
export function GET() {
  return NextResponse.json({ status: "ok", service: "nextroulette" });
}
