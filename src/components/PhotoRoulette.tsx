"use client";

import { useMemo, useRef, useState } from "react";

/**
 * Roulette « photo » — la vraie roue du jeu.
 *
 * Déroulé :
 *  1. la roue (secteurs colorés, sans texte : suspense) tourne au clic ;
 *  2. à l'arrêt, la roue DISPARAÎT et la photo tirée s'affiche en GRAND ;
 *  3. on révèle « l'ex de qui ? », puis on relance.
 *
 * Règle : un ex déjà tiré NE PEUT PLUS retomber. Son secteur est grisé sur la
 * roue, et le tirage se fait uniquement parmi les restants. Quand tous les ex
 * sont passés, écran de fin avec possibilité de rejouer de zéro.
 *
 * Le composant remplit la hauteur de son parent (h-full) pour tenir dans un
 * écran desktop sans scroll.
 */

export interface RoulettePhoto {
  id: string;
  url: string;
  participantName: string;
  exLabel: string | null;
  color: string;
}

const SPINS = 6;

/** Version assombrie d'une couleur hex (#rrggbb) pour les segments déjà tirés. */
function assombrir(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#3a3a3a";
  const n = parseInt(m[1]!, 16);
  const f = (v: number) => Math.round(v * 0.22 + 24);
  const r = f((n >> 16) & 0xff);
  const g = f((n >> 8) & 0xff);
  const b = f(n & 0xff);
  return `rgb(${r},${g},${b})`;
}

export default function PhotoRoulette({ photos }: { photos: RoulettePhoto[] }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [reveleAuteur, setReveleAuteur] = useState(false);
  // Identifiants des ex déjà tirés : ils ne peuvent plus retomber.
  const [tires, setTires] = useState<string[]>([]);
  const tourRef = useRef(0);

  const segment = photos.length > 0 ? 360 / photos.length : 360;
  const restants = photos.filter((p) => !tires.includes(p.id));

  const gradient = useMemo(() => {
    if (photos.length === 0) return "conic-gradient(#333 0deg 360deg)";
    if (photos.length === 1) return photos[0]!.color;
    const stops = photos
      .map((p, i) => {
        const couleur = tires.includes(p.id) ? assombrir(p.color) : p.color;
        return `${couleur} ${i * segment}deg ${(i + 1) * segment}deg`;
      })
      .join(", ");
    return `conic-gradient(${stops})`;
  }, [photos, segment, tires]);

  function lancer() {
    if (spinning || restants.length === 0) return;
    setSpinning(true);
    setResultIndex(null);
    setReveleAuteur(false);

    // Tirage uniquement parmi les ex non encore tombés.
    const choisi = restants[Math.floor(Math.random() * restants.length)]!;
    const cible = photos.findIndex((p) => p.id === choisi.id);

    const centreSegment = cible * segment + segment / 2;
    tourRef.current += SPINS;
    const angleFinal = tourRef.current * 360 + (360 - centreSegment);
    setRotation(angleFinal);

    window.setTimeout(() => {
      setResultIndex(cible);
      setTires((prev) => [...prev, choisi.id]);
      setSpinning(false);
    }, 4600);
  }

  function relancer() {
    setResultIndex(null);
    setReveleAuteur(false);
  }

  function rejouerDeZero() {
    setTires([]);
    setResultIndex(null);
    setReveleAuteur(false);
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

  // ---- Vue RÉSULTAT : la roue laisse place à la photo en grand -------------
  if (result) {
    const dernierTour = restants.length === 0;
    return (
      <div className="flex h-full w-full min-h-0 flex-col items-center justify-center gap-3">
        <p className="shrink-0 text-xs uppercase tracking-[0.3em] text-fete-cyan">
          La roulette a choisi
        </p>

        <div className="flex w-full min-h-0 flex-1 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.url}
            alt="Photo de l'ex tiré au sort"
            className="max-h-full max-w-full rounded-3xl border-4 object-contain shadow-[0_0_60px_rgba(255,46,136,0.35)]"
            style={{ borderColor: result.color }}
          />
        </div>

        {result.exLabel && (
          <p className="shrink-0 text-lg font-bold sm:text-xl">« {result.exLabel} »</p>
        )}

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
          {reveleAuteur ? (
            <p className="text-lg">
              C&apos;était l&apos;ex de{" "}
              <span className="font-bold text-fete-yellow">{result.participantName}</span> 😱
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setReveleAuteur(true)}
              className="rounded-full bg-fete-cyan/15 border border-fete-cyan px-6 py-2 font-semibold text-fete-cyan transition hover:bg-fete-cyan/25"
            >
              Révéler l&apos;ex de qui ? 👀
            </button>
          )}
          {dernierTour ? (
            <button
              type="button"
              onClick={rejouerDeZero}
              className="rounded-full bg-fete-purple px-6 py-2 font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.3)] transition active:translate-y-0.5"
            >
              🎉 C&apos;était le dernier ! Rejouer
            </button>
          ) : (
            <button
              type="button"
              onClick={relancer}
              className="rounded-full bg-fete-pink px-6 py-2 font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.3)] transition active:translate-y-0.5"
            >
              🔄 Relancer ({restants.length} restant{restants.length > 1 ? "s" : ""})
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---- Vue ROUE -------------------------------------------------------------
  return (
    <div className="flex h-full w-full min-h-0 flex-col items-center justify-center gap-5">
      <div className="relative aspect-square h-[min(52dvh,80vw)] shrink-0">
        <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2">
          <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-fete-yellow drop-shadow-[0_0_10px_rgba(255,210,63,0.9)]" />
        </div>

        <div
          className="roue-spin h-full w-full rounded-full border-[6px] border-white/80 shadow-[0_0_70px_rgba(255,46,136,0.45)]"
          style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
          aria-hidden="true"
        />

        <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl shadow-lg">
          💘
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2">
        <button
          type="button"
          onClick={lancer}
          disabled={spinning || restants.length === 0}
          className="rounded-full bg-fete-pink px-8 py-3 text-base font-bold uppercase tracking-wide text-white shadow-[0_6px_0_rgba(0,0,0,0.3)] transition active:translate-y-1 active:shadow-[0_3px_0_rgba(0,0,0,0.3)] disabled:cursor-not-allowed disabled:opacity-60 sm:px-10 sm:py-4 sm:text-lg"
        >
          {spinning ? "Ça tourne…" : "Lancer la roulette 🎰"}
        </button>
        {tires.length > 0 && (
          <p className="text-xs text-white/50">
            {restants.length} restant{restants.length > 1 ? "s" : ""} · les grisés sont déjà passés
          </p>
        )}
      </div>
    </div>
  );
}
