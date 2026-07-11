"use client";

import { useMemo, useRef, useState } from "react";

/**
 * Roulette « photo » — la vraie roue du jeu.
 *
 * La roue n'affiche que des **secteurs colorés** (pas de texte, pour préserver
 * le suspense). Quand elle s'arrête, la **photo de l'ex** tirée apparaît en
 * grand, avec le prénom de qui l'a ajouté et l'indice.
 */

export interface RoulettePhoto {
  id: string;
  url: string;
  participantName: string;
  exLabel: string | null;
  color: string;
}

const SPINS = 6;

export default function PhotoRoulette({ photos }: { photos: RoulettePhoto[] }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [reveleAuteur, setReveleAuteur] = useState(false);
  const tourRef = useRef(0);

  const segment = photos.length > 0 ? 360 / photos.length : 360;

  const gradient = useMemo(() => {
    if (photos.length === 0) return "conic-gradient(#333 0deg 360deg)";
    if (photos.length === 1) return photos[0]!.color;
    const stops = photos
      .map((p, i) => `${p.color} ${i * segment}deg ${(i + 1) * segment}deg`)
      .join(", ");
    return `conic-gradient(${stops})`;
  }, [photos, segment]);

  function lancer() {
    if (spinning || photos.length === 0) return;
    setSpinning(true);
    setResultIndex(null);
    setReveleAuteur(false);

    const cible = Math.floor(Math.random() * photos.length);
    const centreSegment = cible * segment + segment / 2;
    tourRef.current += SPINS;
    const angleFinal = tourRef.current * 360 + (360 - centreSegment);
    setRotation(angleFinal);

    window.setTimeout(() => {
      setResultIndex(cible);
      setSpinning(false);
    }, 4600);
  }

  const result = resultIndex !== null ? photos[resultIndex] : null;

  if (photos.length === 0) {
    return (
      <div className="rounded-3xl border border-white/15 bg-white/5 p-10 text-center">
        <p className="text-xl">😴 Aucune photo pour l&apos;instant.</p>
        <p className="mt-2 text-white/60">
          Partage le lien de contribution pour que les potes ajoutent leurs ex !
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative h-72 w-72 sm:h-96 sm:w-96">
        <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2">
          <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-fete-yellow drop-shadow-[0_0_10px_rgba(255,210,63,0.9)]" />
        </div>

        <div
          className="roue-spin h-full w-full rounded-full border-[6px] border-white/80 shadow-[0_0_70px_rgba(255,46,136,0.45)]"
          style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
          aria-hidden="true"
        />

        <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl shadow-lg">
          💘
        </div>
      </div>

      <button
        type="button"
        onClick={lancer}
        disabled={spinning}
        className="rounded-full bg-fete-pink px-10 py-4 text-lg font-bold uppercase tracking-wide text-white shadow-[0_8px_0_rgba(0,0,0,0.3)] transition active:translate-y-1 active:shadow-[0_4px_0_rgba(0,0,0,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {spinning ? "Ça tourne…" : "Lancer la roulette 🎰"}
      </button>

      {result && (
        <div className="w-full max-w-md animate-float rounded-3xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur">
          <p className="text-sm uppercase tracking-widest text-fete-cyan">La roulette a choisi</p>

          <div className="mx-auto mt-4 h-56 w-56 overflow-hidden rounded-2xl border-4 shadow-xl" style={{ borderColor: result.color }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.url} alt="Photo de l'ex tiré au sort" className="h-full w-full object-cover" />
          </div>

          {result.exLabel && <p className="mt-4 text-xl font-bold">« {result.exLabel} »</p>}

          <div className="mt-5">
            {reveleAuteur ? (
              <p className="text-lg">
                C&apos;était l&apos;ex de{" "}
                <span className="font-bold text-fete-yellow">{result.participantName}</span> 😱
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setReveleAuteur(true)}
                className="rounded-full border border-fete-cyan px-6 py-2 font-semibold text-fete-cyan transition hover:bg-fete-cyan/10"
              >
                Révéler l&apos;ex de qui ? 👀
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
