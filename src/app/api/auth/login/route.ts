import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { authenticate } from "@/lib/auth/users";
import { createSession } from "@/lib/auth/session";

/**
 * POST /api/auth/login
 * Body JSON : { email, password }
 * En cas de succès, pose les cookies de session (access + refresh).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    // Message volontairement générique (anti-énumération de comptes).
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  await createSession({ sub: user.id, email: user.email, role: user.role });

  return NextResponse.json({ user: { email: user.email, role: user.role } });
}
