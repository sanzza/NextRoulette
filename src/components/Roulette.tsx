"use client";

import { useMemo, useRef, useState } from "react";
import type { ExEntry } from "@/types";

/**
 * Roue de la roulette — MAQUETTE jouable (sans backend).
 *
 * Fonctionnement :
 *  - la roue est divisée en N segments égaux (un par ex) ;
 *  - au clic, on tire un segment au hasard et on calcule l'angle final pour
 *    qu'il s'arrête sous le curseur du haut, avec plusieurs tours d'élan ;
 *  - à la fin de la transition CSS, on révèle le résultat.
 *
 * Tout est piloté en CSS (transform + transition), donc fluide et sans dépendance.
 */

const SPINS = 5; // nombre de tours complets avant l'arrêt, pour le suspense

interface RouletteProps {
  entries: ExEntry[];
}

function initiales(pseudo: string): string {
  return pseudo
    .split(" ")
    .map((mot) => mot.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Roulette({ entries }: RouletteProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [reveleAuteur, setReveleAuteur] = useState(false);
  const tourRef = useRef(0);

  const segment = 360 / entries.length;

  // Dégradé conique : un secteur coloré par ex, à partir du haut, sens horaire.
  const gradient = useMemo(() => {
    const stops = entries
      .map((e, i) => `${e.couleur} ${i * segment}deg ${(i + 1) * segment}deg`)
      .join(", ");
    return `conic-gradient(${stops})`;
  }, [entries, segment]);

  function lancer() {
    if (spinning || entries.length === 0) return;
    setSpinning(true);
    setResultIndex(null);
    setReveleAuteur(false);

    const cible = Math.floor(Math.random() * entries.length);
    const centreSegment = cible * segment + segment / 2;

    // Angle absolu visé : on annule la position du centre du segment et on
    // ajoute des tours complets. (rotation croissante = on continue d'avancer.)
    tourRef.current += SPINS;
    const angleFinal = tourRef.current * 360 + (360 - centreSegment);

    setRotation(angleFinal);

    // Révélation à la fin de la transition CSS (4.5s, cf. globals.css).
    window.setTimeout(() => {
      setResultIndex(cible);
      setSpinning(false);
    }, 4600);
  }

  const result = resultIndex !== null ? entries[resultIndex] : null;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* La roue + le curseur */}
      <div className="relative h-72 w-72 sm:h-96 sm:w-96">
        {/* Curseur (en haut) */}
        <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2">
          <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-fete-yellow drop-shadow-[0_0_10px_rgba(255,210,63,0.8)]" />
        </div>

        {/* Disque */}
        <div
          className="roue-spin h-full w-full rounded-full border-[6px] border-white/80 shadow-[0_0_60px_rgba(0,229,255,0.35)]"
          style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
          aria-hidden="true"
        >
          {/* Étiquettes des segments */}
          {entries.map((e, i) => {
            const angle = i * segment + segment / 2;
            return (
              <div
                key={e.id}
                className="absolute left-1/2 top-1/2 origin-left text-sm font-semibold"
                style={{
                  transform: `rotate(${angle}deg) translateX(2.5rem)`,
                }}
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-white">
                  {initiales(e.pseudo)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Moyeu central */}
        <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl shadow-lg">
          💘
        </div>
      </div>

      {/* Bouton */}
      <button
        type="button"
        onClick={lancer}
        disabled={spinning}
        className="rounded-full bg-fete-pink px-10 py-4 text-lg font-bold uppercase tracking-wide text-white shadow-[0_8px_0_rgba(0,0,0,0.25)] transition active:translate-y-1 active:shadow-[0_4px_0_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {spinning ? "Ça tourne…" : "Lancer la roulette 🎰"}
      </button>

      {/* Résultat */}
      {result && (
        <div className="w-full max-w-md animate-float rounded-3xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur">
          <p className="text-sm uppercase tracking-widest text-fete-cyan">La roulette a choisi</p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black text-white shadow-lg"
              style={{ backgroundColor: result.couleur }}
            >
              {initiales(result.pseudo)}
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold">{result.pseudo}</p>
              {result.indice && <p className="text-white/70">« {result.indice} »</p>}
            </div>
          </div>

          <div className="mt-5">
            {reveleAuteur ? (
              <p className="text-lg">
                C&apos;était l&apos;ex de <span className="font-bold text-fete-yellow">{result.ajoutePar}</span> 😱
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
