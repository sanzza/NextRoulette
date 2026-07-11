import { NextResponse } from "next/server";
import { getRoomBySlug } from "@/lib/db/rooms";
import {
  addPhoto,
  countPhotosForParticipant,
  listPhotosForParticipant,
} from "@/lib/db/photos";
import { ensureParticipantId, readParticipantId } from "@/lib/rooms/identity";
import {
  MAX_PHOTOS_PER_PARTICIPANT,
  validateUpload,
} from "@/lib/rooms/upload";
import { uploadMetaSchema } from "@/lib/validation";

export const runtime = "nodejs";

/**
 * GET /api/rooms/[slug]/photos
 * Renvoie UNIQUEMENT les photos du participant courant (vue privée).
 * Crée l'identité participant si besoin.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) {
    return NextResponse.json({ error: "Partie introuvable" }, { status: 404 });
  }

  const participantId = await ensureParticipantId(slug);
  const photos = listPhotosForParticipant(room.id, participantId);
  return NextResponse.json({
    photos: photos.map((p) => ({
      id: p.id,
      exLabel: p.ex_label,
      color: p.color,
      url: `/api/rooms/${slug}/photos/${p.id}/image`,
    })),
  });
}

/**
 * POST /api/rooms/[slug]/photos   (multipart/form-data)
 * Champs : participantName, exLabel?, file
 * Ajoute une photo d'ex, visible du seul contributeur jusqu'à la roulette.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) {
    return NextResponse.json({ error: "Partie introuvable" }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const meta = uploadMetaSchema.safeParse({
    participantName: form.get("participantName"),
    exLabel: form.get("exLabel") ?? undefined,
  });
  if (!meta.success) {
    return NextResponse.json(
      { error: "Champs invalides", details: meta.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucune photo fournie" }, { status: 422 });
  }

  const participantId = await ensureParticipantId(slug);

  if (countPhotosForParticipant(room.id, participantId) >= MAX_PHOTOS_PER_PARTICIPANT) {
    return NextResponse.json(
      { error: `Limite atteinte (${MAX_PHOTOS_PER_PARTICIPANT} photos max)` },
      { status: 429 },
    );
  }

  const validated = await validateUpload(file);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: validated.status });
  }

  let saved;
  try {
    saved = addPhoto({
      roomId: room.id,
      participantId,
      participantName: meta.data.participantName,
      exLabel: meta.data.exLabel,
      mime: validated.value.mime,
      bytes: validated.value.bytes,
    });
  } catch (err) {
    console.error("[photos] échec d'enregistrement :", err);
    return NextResponse.json(
      { error: "Erreur serveur : impossible d'enregistrer la photo" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      photo: {
        id: saved.id,
        exLabel: saved.ex_label,
        color: saved.color,
        url: `/api/rooms/${slug}/photos/${saved.id}/image`,
      },
    },
    { status: 201 },
  );
}

// Empêche un participant anonyme de deviner l'API : lecture réservée au cookie.
export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const pid = await readParticipantId(slug);
  return new NextResponse(null, { status: pid ? 204 : 401 });
}
