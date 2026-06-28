"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Page de connexion admin.
 * Poste les identifiants à /api/auth/login ; en cas de succès, les cookies de
 * session sont posés et on redirige vers la page demandée (ou /admin).
 *
 * `useSearchParams` impose une frontière <Suspense> en Next 15.
 */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErreur(data.error ?? "Connexion impossible");
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setErreur("Erreur réseau, réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur"
      >
        <h1 className="mb-1 text-2xl font-black">Espace admin</h1>
        <p className="mb-6 text-sm text-white/60">Connecte-toi pour gérer les parties.</p>

        <label className="mb-1 block text-sm font-semibold" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 outline-none focus:border-fete-cyan"
        />

        <label className="mb-1 block text-sm font-semibold" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 outline-none focus:border-fete-cyan"
        />

        {erreur && (
          <p className="mb-4 rounded-lg bg-fete-pink/20 px-3 py-2 text-sm text-fete-pink">{erreur}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-fete-purple px-4 py-3 font-bold text-white transition hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
