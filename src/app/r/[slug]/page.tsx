import { notFound } from "next/navigation";
import { getRoomBySlug } from "@/lib/db/rooms";
import Contribuer from "@/components/Contribuer";

export const runtime = "nodejs";

/**
 * Page de contribution : chaque personne ajoute ses ex, en privé.
 * Server Component → récupère le nom de la partie, délègue l'UI au client.
 */
export default async function ContribuerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ admin?: string }>;
}) {
  const { slug } = await params;
  const { admin } = await searchParams;

  const room = getRoomBySlug(slug);
  if (!room) notFound();

  return <Contribuer slug={room.slug} nom={room.name} adminRefuse={admin === "refused"} />;
}
