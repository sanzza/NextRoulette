import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { env } from "@/lib/env";

/**
 * Accès à la base SQLite.
 *
 * Choix « soirée » : une seule base SQLite, avec les photos stockées en BLOB.
 * Avantage → **un seul fichier à persister** (aucun service externe, aucun
 * compte, aucun token cloud). Il suffit d'un disque persistant sur l'hébergeur.
 * Voir docs/DEPLOIEMENT.md.
 *
 * L'instance est mise en cache sur le `globalThis` pour survivre au
 * hot-reload de Next en développement (évite d'ouvrir 50 connexions).
 */

function createDb(): Database.Database {
  const path = env.DATABASE_PATH;

  // S'assure que le dossier existe (ex. ./data).
  const dir = dirname(path);
  if (dir && dir !== "." && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const db = new Database(path);
  db.pragma("journal_mode = WAL"); // meilleures perfs en écritures concurrentes
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id           TEXT PRIMARY KEY,
      slug         TEXT NOT NULL UNIQUE,
      name         TEXT NOT NULL,
      admin_token  TEXT NOT NULL,
      created_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS photos (
      id               TEXT PRIMARY KEY,
      room_id          TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      participant_id   TEXT NOT NULL,
      participant_name TEXT NOT NULL,
      ex_label         TEXT,
      color            TEXT NOT NULL,
      mime             TEXT NOT NULL,
      bytes            BLOB NOT NULL,
      created_at       TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_photos_room ON photos(room_id);
    CREATE INDEX IF NOT EXISTS idx_photos_participant ON photos(room_id, participant_id);
  `);

  return db;
}

const globalForDb = globalThis as unknown as { __nrDb?: Database.Database };

/**
 * Renvoie l'instance SQLite (créée à la première utilisation, pas à l'import).
 * L'initialisation paresseuse évite de créer le fichier de base pendant
 * `next build` (aucune route n'est exécutée à ce moment-là).
 */
export function getDb(): Database.Database {
  if (!globalForDb.__nrDb) {
    globalForDb.__nrDb = createDb();
  }
  return globalForDb.__nrDb;
}
