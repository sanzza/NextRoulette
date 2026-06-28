import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

/**
 * POST /api/auth/logout
 * Supprime les cookies de session.
 */
export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
