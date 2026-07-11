import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";

/**
 * Accès aux photos d'ex.
 *
 * Les octets de l'image sont stockés en BLOB dans la même base. On ne les
 * charge JAMAIS dans les listes (metadata only) — uniquement à la demande, via
 * `getPhotoBytes`, pour servir le fichier.
 */

/** Palette de segments de la roue (couleurs festives). */
const PALETTE = [
  "#ff2e88",
  "#7b2ff7",
  "#00e5ff",
  "#ffd23f",
  "#ff7849",
  "#42e695",
  "#f637ec",
  "#3f8cff",
];

export interface PhotoMeta {
  id: string;
  room_id: string;
  participant_id: string;
  participant_name: string;
  ex_label: string | null;
  color: string;
  created_at: string;
}

export interface NewPhoto {
  roomId: string;
  participantId: string;
  participantName: string;
  exLabel?: string | null;
  mime: string;
  bytes: Buffer;
}

export function countPhotosForParticipant(roomId: string, participantId: string): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM photos WHERE room_id = ? AND participant_id = ?`)
    .get(roomId, participantId) as { n: number };
  return row.n;
}

export function addPhoto(p: NewPhoto): PhotoMeta {
  // Couleur déterministe par position d'insertion, pour une roue équilibrée.
  const total = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM photos WHERE room_id = ?`)
    .get(p.roomId) as { n: number };
  const color = PALETTE[total.n % PALETTE.length]!;

  const meta: PhotoMeta = {
    id: randomUUID(),
    room_id: p.roomId,
    participant_id: p.participantId,
    participant_name: p.participantName,
    ex_label: p.exLabel?.trim() || null,
    color,
    created_at: new Date().toISOString(),
  };

  getDb().prepare(
    `INSERT INTO photos (id, room_id, participant_id, participant_name, ex_label, color, mime, bytes, created_at)
     VALUES (@id, @room_id, @participant_id, @participant_name, @ex_label, @color, @mime, @bytes, @created_at)`,
  ).run({ ...meta, mime: p.mime, bytes: p.bytes });

  return meta;
}

/** Photos d'UN participant (sa vue privée). */
export function listPhotosForParticipant(roomId: string, participantId: string): PhotoMeta[] {
  return getDb()
    .prepare(
      `SELECT id, room_id, participant_id, participant_name, ex_label, color, created_at
       FROM photos WHERE room_id = ? AND participant_id = ? ORDER BY created_at ASC`,
    )
    .all(roomId, participantId) as PhotoMeta[];
}

/** Toutes les photos d'une partie (réservé à l'admin, pour la roulette). */
export function listAllPhotos(roomId: string): PhotoMeta[] {
  return getDb()
    .prepare(
      `SELECT id, room_id, participant_id, participant_name, ex_label, color, created_at
       FROM photos WHERE room_id = ? ORDER BY created_at ASC`,
    )
    .all(roomId) as PhotoMeta[];
}

export function getPhotoMeta(id: string): PhotoMeta | undefined {
  return getDb()
    .prepare(
      `SELECT id, room_id, participant_id, participant_name, ex_label, color, created_at
       FROM photos WHERE id = ?`,
    )
    .get(id) as PhotoMeta | undefined;
}

export function getPhotoBytes(id: string): { mime: string; bytes: Buffer } | undefined {
  const row = getDb().prepare(`SELECT mime, bytes FROM photos WHERE id = ?`).get(id) as
    | { mime: string; bytes: Buffer }
    | undefined;
  return row;
}

export function deletePhoto(id: string, participantId: string): boolean {
  // Ne supprime que si le demandeur est le propriétaire.
  const res = getDb()
    .prepare(`DELETE FROM photos WHERE id = ? AND participant_id = ?`)
    .run(id, participantId);
  return res.changes > 0;
}
