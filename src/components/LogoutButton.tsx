"use client";

import { useRouter } from "next/navigation";

/** Bouton de déconnexion : appelle /api/auth/logout puis renvoie au login. */
export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold transition hover:bg-white/10"
    >
      Déconnexion
    </button>
  );
}
