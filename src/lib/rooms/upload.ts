import { env } from "@/lib/env";

/**
 * Validation des fichiers uploadés.
 *
 * Règles de sécurité :
 *  - liste blanche stricte de types d'images (pas de SVG → risque de XSS) ;
 *  - taille maximale (MAX_UPLOAD_MB) ;
 *  - vérification de la « signature » (magic bytes) et pas seulement du
 *    Content-Type déclaré, qui est falsifiable.
 */

export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export type AllowedMime = (typeof ALLOWED_MIME)[number];

export const MAX_UPLOAD_BYTES = env.MAX_UPLOAD_MB * 1024 * 1024;

export const MAX_PHOTOS_PER_PARTICIPANT = 12;

/** Détecte le type réel d'après les premiers octets (magic bytes). */
export function sniffImageMime(buf: Buffer): AllowedMime | null {
  if (buf.length < 12) return null;

  // JPEG : FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";

  // PNG : 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }

  // GIF : "GIF87a" ou "GIF89a"
  if (buf.toString("ascii", 0, 6) === "GIF87a" || buf.toString("ascii", 0, 6) === "GIF89a") {
    return "image/gif";
  }

  // WEBP : "RIFF"…."WEBP"
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }

  return null;
}

export interface ValidatedImage {
  mime: AllowedMime;
  bytes: Buffer;
}

export type ValidationError =
  | { ok: false; error: string; status: number }
  | { ok: true; value: ValidatedImage };

export async function validateUpload(file: File): Promise<ValidationError> {
  if (file.size === 0) {
    return { ok: false, error: "Fichier vide", status: 422 };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `Photo trop lourde (max ${env.MAX_UPLOAD_MB} Mo)`,
      status: 413,
    };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = sniffImageMime(bytes);
  if (!mime) {
    return {
      ok: false,
      error: "Format non supporté (JPEG, PNG, WEBP ou GIF uniquement)",
      status: 415,
    };
  }

  return { ok: true, value: { mime, bytes } };
}
