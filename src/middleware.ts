import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/session";

/**
 * Middleware de protection des routes.
 *
 * Garde l'espace d'administration (`/admin/**`) : sans access token valide
 * portant le rôle `admin`, on redirige vers la page de connexion.
 *
 * Le middleware s'exécute sur l'Edge Runtime — d'où l'usage de `jose`
 * (Web Crypto) plutôt qu'une lib JWT Node.
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const claims = await verifyToken(token);
    if (claims.role !== "admin") {
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  // Protège /admin et ses sous-routes, mais PAS la page de login elle-même.
  matcher: ["/admin/((?!login).*)"],
};
