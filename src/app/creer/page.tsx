"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Page de création d'une partie.
 * Génère deux liens :
 *   - un lien de PARTAGE (pour tous les potes → ajouter leurs ex) ;
 *   - un lien SECRET d'hôte (→ la roulette). À garder pour soi.
 */
interface CreatedRoom {
  slug: string;
  name: string;
  shareUrl: string;
  adminUrl: string;
}

export default function CreerPage() {
  const [nom, setNom] = useState("");
  const [room, setRoom] = useState<CreatedRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErreur(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim() || "Soirée NextRoulette" }),
      });
      if (!res.ok) {
        setErreur("Création impossible, réessaie.");
        return;
      }
      setRoom(await res.json());
    } catch {
      setErreur("Erreur réseau, réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-12">
      <Link href="/" className="mb-6 text-sm text-white/60 hover:text-white">
        ← Accueil
      </Link>

      {!room ? (
        <form onSubmit={creer} className="rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur">
          <h1 className="text-3xl font-black">Nouvelle partie 🎉</h1>
          <p className="mt-1 text-white/70">Donne un nom à ta soirée, puis partage le lien.</p>

          <label className="mb-1 mt-6 block text-sm font-semibold" htmlFor="nom">
            Nom de la soirée
          </label>
          <input
            id="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            maxLength={60}
            placeholder="Soirée VJF 🔥"
            className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 outline-none focus:border-fete-cyan"
          />

          {erreur && <p className="mt-4 text-sm text-fete-pink">{erreur}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-fete-purple px-4 py-3 font-bold text-white transition hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Création…" : "Créer la partie 🚀"}
          </button>
        </form>
      ) : (
        <div className="rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur">
          <h1 className="text-2xl font-black">C&apos;est prêt ! 🎊</h1>
          <p className="mt-1 text-white/70">« {room.name} »</p>

          <LienACopier
            titre="🔗 Lien à partager avec tes potes"
            aide="Chacun ajoute ses ex en privé (personne ne voit les photos des autres)."
            valeur={room.shareUrl}
          />
          <LienACopier
            titre="🔒 Ton lien secret d'hôte (la roulette)"
            aide="Ne le partage PAS : il donne accès à toutes les photos et à la roulette."
            valeur={room.adminUrl}
          />

          <a
            href={room.adminUrl}
            className="mt-6 inline-block w-full rounded-xl bg-fete-pink px-4 py-3 text-center font-bold text-white transition hover:scale-[1.02]"
          >
            Ouvrir la roulette 🎰
          </a>
        </div>
      )}
    </main>
  );
}

function LienACopier({ titre, aide, valeur }: { titre: string; aide: string; valeur: string }) {
  const [copie, setCopie] = useState(false);

  async function copier() {
    try {
      await navigator.clipboard.writeText(valeur);
      setCopie(true);
      window.setTimeout(() => setCopie(false), 2000);
    } catch {
      // clipboard indisponible : l'utilisateur peut copier manuellement.
    }
  }

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold">{titre}</p>
      <p className="mb-2 text-xs text-white/50">{aide}</p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={valeur}
          onFocus={(e) => e.target.select()}
          className="w-full truncate rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={copier}
          className="shrink-0 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25"
        >
          {copie ? "Copié ✓" : "Copier"}
        </button>
      </div>
    </div>
  );
}
