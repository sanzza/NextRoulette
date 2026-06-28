import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * GET /api/auth/me
 * Renvoie l'utilisateur courant (d'après le cookie d'accès) ou 401.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: { email: user.email, role: user.role } });
}
