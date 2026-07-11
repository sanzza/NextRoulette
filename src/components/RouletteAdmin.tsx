"use client";

import { useCallback, useEffect, useState } from "react";
import PhotoRoulette, { type RoulettePhoto } from "@/components/PhotoRoulette";

/**
 * Vue hôte de la roulette : récupère TOUTES les photos de la partie
 * (endpoint protégé par le cookie admin) et les passe à la roue.
 */
export default function RouletteAdmin({ slug, nom }: { slug: string; nom: string }) {
  const [photos, setPhotos] = useState<RoulettePhoto[]>([]);
  const [chargement, setChargement] = useState(true);
  const [shareUrl, setShareUrl] = useState("");

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const res = await fetch(`/api/rooms/${slug}/photos/all`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos);
      }
    } finally {
      setChargement(false);
    }
  }, [slug]);

  useEffect(() => {
    void charger();
    setShareUrl(`${window.location.origin}/r/${slug}`);
  }, [charger, slug]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-widest text-fete-cyan">{nom}</p>
        <h1 className="mt-1 text-4xl font-black">
          <span className="text-gradient">La Roulette</span>
        </h1>
        <p className="mt-2 text-white/70">{photos.length} ex dans la roue</p>
      </header>

      {chargement ? (
        <p className="text-center text-white/60">Chargement…</p>
      ) : (
        <PhotoRoulette photos={photos} />
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={charger}
          className="rounded-full border border-white/30 px-6 py-2 text-sm font-semibold transition hover:bg-white/10"
        >
          🔄 Rafraîchir les photos
        </button>
        {shareUrl && (
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(shareUrl).catch(() => {})}
            className="rounded-full border border-fete-cyan px-6 py-2 text-sm font-semibold text-fete-cyan transition hover:bg-fete-cyan/10"
          >
            📋 Copier le lien de partage
          </button>
        )}
      </div>
    </main>
  );
}
