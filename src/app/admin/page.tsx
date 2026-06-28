import { getCurrentUser } from "@/lib/auth/session";
import { DEMO_ENTRIES } from "@/lib/fixtures";
import LogoutButton from "@/components/LogoutButton";

/**
 * Tableau de bord admin.
 * L'accès est déjà protégé par le middleware (redirige si non admin) ; on
 * relit l'utilisateur ici pour l'afficher. Server Component => pas de token
 * exposé au client.
 */
export default async function AdminDashboard() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Tableau de bord</h1>
          <p className="text-white/60">Connecté en tant que {user?.email}</p>
        </div>
        <LogoutButton />
      </div>

      {/* Statistiques de démonstration */}
      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Parties" value="1" />
        <Stat label="Ex ajoutés" value={String(DEMO_ENTRIES.length)} />
        <Stat label="Tours joués" value="—" />
      </section>

      {/* Liste des ex (démo) */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-bold">Ex de la partie de démo</h2>
        <ul className="divide-y divide-white/10">
          {DEMO_ENTRIES.map((e) => (
            <li key={e.id} className="flex items-center justify-between py-3">
              <span className="font-semibold">{e.pseudo}</span>
              <span className="text-sm text-white/60">ajouté par {e.ajoutePar}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-white/50">
          ⚙️ Données de démonstration. La gestion réelle (modération, suppression,
          export) arrive avec la persistance en base — voir docs/ROADMAP.md.
        </p>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
      <div className="text-3xl font-black text-fete-cyan">{value}</div>
      <div className="text-sm uppercase tracking-wide text-white/60">{label}</div>
    </div>
  );
}
