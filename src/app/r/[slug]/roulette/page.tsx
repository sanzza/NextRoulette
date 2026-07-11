import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoomBySlug, isAdmin } from "@/lib/db/rooms";
import { readAdminToken } from "@/lib/rooms/identity";
import RouletteAdmin from "@/components/RouletteAdmin";

export const runtime = "nodejs";

/**
 * Page de la roulette — RÉSERVÉE À L'HÔTE.
 * On vérifie le cookie admin (posé par le lien secret /enter-admin). Sans lui,
 * pas d'accès aux photos des autres.
 */
export default async function RoulettePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) notFound();

  const token = await readAdminToken(slug);
  if (!isAdmin(room, token ?? undefined)) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-black">🔒 Accès hôte requis</h1>
        <p className="mt-3 text-white/70">
          Cette roulette est réservée à l&apos;hôte de la partie. Ouvre ton{" "}
          <strong>lien secret d&apos;hôte</strong> (celui qui contient un token) pour y accéder.
        </p>
        <Link href="/" className="mt-6 text-fete-cyan hover:underline">
          ← Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  return <RouletteAdmin slug={room.slug} nom={room.name} />;
}
