import Link from "next/link";
import Roulette from "@/components/Roulette";
import { DEMO_ENTRIES } from "@/lib/fixtures";

/**
 * Page d'accueil — expérience « one-page » festive.
 * Hero + démonstration jouable de la roulette + explication du concept.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-12 sm:py-20">
      {/* HERO ---------------------------------------------------------------- */}
      <header className="mb-12 text-center">
        <p className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-sm uppercase tracking-widest text-fete-cyan">
          🎉 Jeu de soirée entre potes
        </p>
        <h1 className="text-5xl font-black leading-tight sm:text-7xl">
          <span className="text-gradient">NextRoulette</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
          Chacun ajoute la photo d&apos;un ex via un simple lien. La roulette en
          désigne un… et tout le monde doit deviner : <strong>c&apos;est l&apos;ex de qui&nbsp;?</strong>
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#roulette"
            className="rounded-full bg-fete-purple px-8 py-3 font-bold text-white shadow-lg transition hover:scale-105"
          >
            Tester la roulette 🎰
          </a>
          <Link
            href="/admin/login"
            className="rounded-full border border-white/30 px-8 py-3 font-semibold text-white/90 transition hover:bg-white/10"
          >
            Espace admin
          </Link>
        </div>
      </header>

      {/* COMMENT ÇA MARCHE --------------------------------------------------- */}
      <section className="mb-16 grid w-full gap-4 sm:grid-cols-3">
        {[
          { emoji: "🔗", titre: "Partage le lien", texte: "Crée une partie et envoie le lien à tes potes." },
          { emoji: "📸", titre: "Chacun ajoute un ex", texte: "Une photo, un pseudo, un petit indice croustillant." },
          { emoji: "🎡", titre: "On lance la roue", texte: "La roulette désigne, vous devinez l'ex de qui !" },
        ].map((etape) => (
          <div
            key={etape.titre}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur"
          >
            <div className="text-4xl">{etape.emoji}</div>
            <h3 className="mt-3 text-xl font-bold">{etape.titre}</h3>
            <p className="mt-1 text-white/70">{etape.texte}</p>
          </div>
        ))}
      </section>

      {/* ROULETTE JOUABLE ---------------------------------------------------- */}
      <section id="roulette" className="w-full scroll-mt-8 text-center">
        <h2 className="mb-2 text-3xl font-extrabold">La roulette (démo)</h2>
        <p className="mb-10 text-white/70">
          Données de démonstration — lance pour voir le concept en action.
        </p>
        <Roulette entries={DEMO_ENTRIES} />
      </section>

      {/* PIED DE PAGE -------------------------------------------------------- */}
      <footer className="mt-20 text-center text-sm text-white/50">
        <p>NextRoulette — prototype festif. À jouer entre potes consentants 💜</p>
      </footer>
    </main>
  );
}
