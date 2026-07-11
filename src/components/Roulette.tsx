"use client";

import { useMemo, useRef, useState } from "react";
import type { ExEntry } from "@/types";

/**
 * Roue de démonstration (page d'accueil) — données fictives, sans photos.
 *
 * Même déroulé que la vraie roulette :
 *  1. la roue tourne (secteurs colorés) ;
 *  2. à l'arrêt, la roue DISPARAÎT et le résultat s'affiche en grand
 *     (pastille couleur + pseudo + indice) ;
 *  3. révélation de « l'ex de qui ? », puis relance — un ex déjà tiré ne
 *     retombe plus (segment grisé).
 */

const SPINS = 5;

function initiales(pseudo: string): string {
  return pseudo
    .split(" ")
    .map((mot) => mot.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Version assombrie d'une couleur hex (#rrggbb) pour les segments déjà tirés. */
function assombrir(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#3a3a3a";
  const n = parseInt(m[1]!, 16);
  const f = (v: number) => Math.round(v * 0.22 + 24);
  return `rgb(${f((n >> 16) & 0xff)},${f((n >> 8) & 0xff)},${f(n & 0xff)})`;
}

export default function Roulette({ entries }: { entries: ExEntry[] }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [reveleAuteur, setReveleAuteur] = useState(false);
  const [tires, setTires] = useState<string[]>([]);
  const tourRef = useRef(0);

  const segment = 360 / entries.length;
  const restants = entries.filter((e) => !tires.includes(e.id));

  const gradient = useMemo(() => {
    const stops = entries
      .map((e, i) => {
        const couleur = tires.includes(e.id) ? assombrir(e.couleur) : e.couleur;
        return `${couleur} ${i * segment}deg ${(i + 1) * segment}deg`;
      })
      .join(", ");
    return `conic-gradient(${stops})`;
  }, [entries, segment, tires]);

  function lancer() {
    if (spinning || restants.length === 0) return;
    setSpinning(true);
    setResultIndex(null);
    setReveleAuteur(false);

    const choisi = restants[Math.floor(Math.random() * restants.length)]!;
    const cible = entries.findIndex((e) => e.id === choisi.id);

    const centreSegment = cible * segment + segment / 2;
    tourRef.current += SPINS;
    setRotation(tourRef.current * 360 + (360 - centreSegment));

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

  const result = resultIndex !== null ? entries[resultIndex] : null;

  // ---- Vue RÉSULTAT : la roue laisse place aux données en grand -------------
  if (result) {
    const dernierTour = restants.length === 0;
    return (
      <div className="flex flex-col items-center gap-5">
        <p className="text-xs uppercase tracking-[0.3em] text-fete-cyan">
          La roulette a choisi
        </p>

        <div
          className="flex h-48 w-48 items-center justify-center rounded-full text-6xl font-black text-white shadow-[0_0_60px_rgba(255,46,136,0.4)] sm:h-56 sm:w-56"
          style={{ backgroundColor: result.couleur }}
        >
          {initiales(result.pseudo)}
        </div>

        <div className="text-center">
          <p className="text-3xl font-black">{result.pseudo}</p>
          {result.indice && <p className="mt-1 text-white/70">« {result.indice} »</p>}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {reveleAuteur ? (
            <p className="text-lg">
              C&apos;était l&apos;ex de{" "}
              <span className="font-bold text-fete-yellow">{result.ajoutePar}</span> 😱
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

  // ---- Vue ROUE ---------------------------------------------------------------
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative h-72 w-72 sm:h-96 sm:w-96">
        <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2">
          <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-fete-yellow drop-shadow-[0_0_10px_rgba(255,210,63,0.8)]" />
        </div>

        <div
          className="roue-spin h-full w-full rounded-full border-[6px] border-white/80 shadow-[0_0_60px_rgba(0,229,255,0.35)]"
          style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
          aria-hidden="true"
        />

        <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl shadow-lg">
          💘
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={lancer}
          disabled={spinning || restants.length === 0}
          className="rounded-full bg-fete-pink px-10 py-4 text-lg font-bold uppercase tracking-wide text-white shadow-[0_8px_0_rgba(0,0,0,0.25)] transition active:translate-y-1 active:shadow-[0_4px_0_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
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
