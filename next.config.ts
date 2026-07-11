import type { NextConfig } from "next";

/**
 * Configuration Next.js.
 * Les en-têtes de sécurité sont appliqués globalement ici (défense en profondeur,
 * en complément du middleware). Voir docs/SECURITY.md.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Build autonome pour un déploiement Docker/serveur léger (voir docs/DEPLOIEMENT.md).
  output: "standalone",
  // better-sqlite3 est un module natif : ne pas le bundler, l'exécuter via Node.
  serverExternalPackages: ["better-sqlite3"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
