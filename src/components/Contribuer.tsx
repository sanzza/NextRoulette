"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * UI de contribution privée.
 *
 * Confidentialité : les photos listées ici sont UNIQUEMENT celles de ce
 * navigateur (cookie participant côté serveur). Personne ne voit les ex des
 * autres avant la roulette.
 */

interface MyPhoto {
  id: string;
  exLabel: string | null;
  color: string;
  url: string;
}

const NAME_KEY = "nr_participant_name";

export default function Contribuer({
  slug,
  nom,
  adminRefuse,
}: {
  slug: string;
  nom: string;
  adminRefuse: boolean;
}) {
  const [participantName, setParticipantName] = useState("");
  const [exLabel, setExLabel] = useState("");
  const [photos, setPhotos] = useState<MyPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const charger = useCallback(async () => {
    const res = await fetch(`/api/rooms/${slug}/photos`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setPhotos(data.photos);
    }
  }, [slug]);

  useEffect(() => {
    setParticipantName(localStorage.getItem(NAME_KEY) ?? "");
    void charger();
  }, [charger]);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setErreur("Choisis une photo.");
      return;
    }
    if (!participantName.trim()) {
      setErreur("Indique ton prénom / pseudo.");
      return;
    }

    localStorage.setItem(NAME_KEY, participantName.trim());
    setUploading(true);
    try {
      const form = new FormData();
      form.set("participantName", participantName.trim());
      form.set("exLabel", exLabel.trim());
      form.set("file", file);

      const res = await fetch(`/api/rooms/${slug}/photos`, { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreur(data.error ?? "Envoi impossible.");
        return;
      }
      setExLabel("");
      if (fileRef.current) fileRef.current.value = "";
      await charger();
    } catch {
      setErreur("Erreur réseau, réessaie.");
    } finally {
      setUploading(false);
    }
  }

  async function supprimer(id: string) {
    const res = await fetch(`/api/rooms/${slug}/photos/${id}`, { method: "DELETE" });
    if (res.ok) setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <header className="mb-6 text-center">
        <p className="text-sm uppercase tracking-widest text-fete-cyan">{nom}</p>
        <h1 className="mt-1 text-3xl font-black">Ajoute tes ex 📸</h1>
        <p className="mt-2 text-white/70">
          🔒 Tes photos restent <strong>privées</strong> jusqu&apos;à la roulette — personne
          d&apos;autre ne les voit ici.
        </p>
      </header>

      {adminRefuse && (
        <p className="mb-6 rounded-xl bg-fete-pink/20 px-4 py-3 text-center text-sm text-fete-pink">
          Lien d&apos;hôte invalide ou expiré — tu es sur la page de contribution.
        </p>
      )}

      <form onSubmit={envoyer} className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
        <label className="mb-1 block text-sm font-semibold" htmlFor="pseudo">
          Ton prénom / pseudo
        </label>
        <input
          id="pseudo"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          maxLength={40}
          placeholder="Ex : Lisly"
          className="mb-4 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 outline-none focus:border-fete-cyan"
        />

        <label className="mb-1 block text-sm font-semibold" htmlFor="indice">
          Petit indice (facultatif)
        </label>
        <input
          id="indice"
          value={exLabel}
          onChange={(e) => setExLabel(e.target.value)}
          maxLength={60}
          placeholder="Ex : le DJ du camping"
          className="mb-4 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 outline-none focus:border-fete-cyan"
        />

        <label className="mb-1 block text-sm font-semibold" htmlFor="photo">
          Photo de l&apos;ex
        </label>
        <input
          id="photo"
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mb-4 w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-fete-purple file:px-4 file:py-2 file:font-semibold file:text-white"
        />

        {erreur && <p className="mb-4 text-sm text-fete-pink">{erreur}</p>}

        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-xl bg-fete-pink px-4 py-3 font-bold text-white transition hover:scale-[1.02] disabled:opacity-60"
        >
          {uploading ? "Envoi…" : "Ajouter cet ex 💥"}
        </button>
      </form>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Mes ex ajoutés ({photos.length})</h2>
        {photos.length === 0 ? (
          <p className="text-white/50">Rien pour l&apos;instant.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((p) => (
              <li key={p.id} className="group relative">
                <div className="aspect-square overflow-hidden rounded-xl border-2" style={{ borderColor: p.color }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.exLabel ?? "Ex"} className="h-full w-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => supprimer(p.id)}
                  aria-label="Supprimer"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-xs opacity-0 transition group-hover:opacity-100"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 text-center text-sm text-white/50">
          Quand tout le monde a ajouté ses ex, c&apos;est à l&apos;hôte de lancer la roulette 🎰
        </p>
      </section>
    </main>
  );
}
