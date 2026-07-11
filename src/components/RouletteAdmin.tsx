"use client";

import { useCallback, useEffect, useState } from "react";
import PhotoRoulette, { type RoulettePhoto } from "@/components/PhotoRoulette";

/**
 * Vue hôte de la roulette.
 *
 * Mise en page « one-page » : tout tient dans la hauteur de l'écran sur
 * desktop (pas de scroll) — header compact, roue/photo au centre (flex-1),
 * et en bas les actions + la galerie FLOUTÉE (l'hôte voit que les photos
 * arrivent sans se spoiler, il peut donc deviner comme tout le monde).
 */
export default function RouletteAdmin({ slug, nom }: { slug: string; nom: string }) {
  const [photos, setPhotos] = useState<RoulettePhoto[]>([]);
  const [chargement, setChargement] = useState(true);
  const [shareUrl, setShareUrl] = useState("");
  const [copie, setCopie] = useState(false);

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

  function copierLien() {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopie(true);
        window.setTimeout(() => setCopie(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-3 lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      {/* Header compact */}
      <header className="shrink-0 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-fete-cyan">{nom}</p>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">
          <span className="text-gradient">La Roulette</span>
        </h1>
      </header>

      {/* Zone centrale : roue OU photo en grand */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-2">
        {chargement ? (
          <p className="text-center text-white/60">Chargement…</p>
        ) : (
          <PhotoRoulette photos={photos} />
        )}
      </div>

      {/* Pied : actions + galerie floutée */}
      <footer className="shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={charger}
            className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold transition hover:bg-white/10 sm:text-sm"
          >
            🔄 Rafraîchir ({photos.length})
          </button>
          {shareUrl && (
            <button
              type="button"
              onClick={copierLien}
              className="rounded-full border border-fete-cyan px-4 py-1.5 text-xs font-semibold text-fete-cyan transition hover:bg-fete-cyan/10 sm:text-sm"
            >
              {copie ? "Copié ✓" : "📋 Lien de partage"}
            </button>
          )}
        </div>

        {photos.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-center text-[11px] text-white/40">
              Floutées pour que tu puisses jouer aussi 😉
            </p>
            <ul className="flex justify-center gap-2 overflow-x-auto pb-1">
              {photos.map((p) => (
                <li key={p.id} className="shrink-0">
                  <div
                    className="h-11 w-11 overflow-hidden rounded-lg border-2 sm:h-12 sm:w-12"
                    style={{ borderColor: p.color }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt="Photo mystère"
                      className="h-full w-full scale-125 object-cover blur-md"
                      draggable={false}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </footer>
    </main>
  );
}
