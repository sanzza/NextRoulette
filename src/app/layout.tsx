import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

/** Police ronde et festive pour les titres et l'UI. */
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NextRoulette — L'ex de qui ?",
  description:
    "Le jeu festif entre potes : chacun ajoute la photo d'un ex, la roulette désigne… et il faut deviner l'ex de qui !",
  applicationName: "NextRoulette",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#160a2b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={fredoka.variable}>
      <body className="font-display antialiased">{children}</body>
    </html>
  );
}
