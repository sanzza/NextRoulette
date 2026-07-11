// Test de bout en bout du flux « partie » sur un serveur en cours d'exécution.
// Simule l'hôte + 2 participants, et vérifie notamment la CONFIDENTIALITÉ
// (un joueur ne voit pas les photos des autres).
//
// Usage : BASE_URL=http://localhost:3000 node scripts/smoke-test.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SAMPLES = join(process.cwd(), "scripts", "samples");

let passed = 0;
let failed = 0;
function check(label, cond) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

/** Petit client HTTP qui conserve les cookies (un « jar » par acteur). */
function actor() {
  const jar = new Map();
  return {
    async fetch(path, opts = {}) {
      const headers = new Headers(opts.headers ?? {});
      if (jar.size) {
        headers.set("cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
      }
      const res = await fetch(BASE + path, { ...opts, headers, redirect: "manual" });
      for (const c of res.headers.getSetCookie?.() ?? []) {
        const [pair] = c.split(";");
        const idx = pair.indexOf("=");
        jar.set(pair.slice(0, idx), pair.slice(idx + 1));
      }
      return res;
    },
  };
}

function photoBlob(name) {
  const bytes = readFileSync(join(SAMPLES, name));
  return new File([bytes], name, { type: "image/png" });
}

async function upload(who, slug, pseudo, file, label) {
  const form = new FormData();
  form.set("participantName", pseudo);
  form.set("exLabel", label);
  form.set("file", file);
  return who.fetch(`/api/rooms/${slug}/photos`, { method: "POST", body: form });
}

async function main() {
  console.log(`▶ Smoke test sur ${BASE}\n`);

  // 1. Création de la partie ------------------------------------------------
  const host = actor();
  const createRes = await host.fetch("/api/rooms", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nom: "Soirée test 🎉" }),
  });
  check("création de partie -> 201", createRes.status === 201);
  const room = await createRes.json();
  check("slug généré", typeof room.slug === "string" && room.slug.length > 5);
  const slug = room.slug;

  // 2. Participant A ajoute 2 ex --------------------------------------------
  const alice = actor();
  await alice.fetch(`/api/rooms/${slug}/photos`); // pose le cookie participant
  const a1 = await upload(alice, slug, "Alice", photoBlob("ex-magenta.png"), "le surfeur");
  const a2 = await upload(alice, slug, "Alice", photoBlob("ex-violet.png"), "le boulanger");
  check("Alice upload #1 -> 201", a1.status === 201);
  check("Alice upload #2 -> 201", a2.status === 201);
  const a1data = await a1.json();

  // 3. Participant B ajoute 2 ex --------------------------------------------
  const bob = actor();
  await bob.fetch(`/api/rooms/${slug}/photos`);
  const b1 = await upload(bob, slug, "Bob", photoBlob("ex-cyan.png"), "la prof de yoga");
  const b2 = await upload(bob, slug, "Bob", photoBlob("ex-jaune.png"), "la libraire");
  check("Bob upload #1 -> 201", b1.status === 201);
  check("Bob upload #2 -> 201", b2.status === 201);

  // 4. CONFIDENTIALITÉ : Alice ne voit que SES photos -----------------------
  const aliceList = await (await alice.fetch(`/api/rooms/${slug}/photos`)).json();
  check("Alice ne voit que ses 2 photos", aliceList.photos.length === 2);

  // 5. Sécurité : /photos/all interdit sans cookie admin --------------------
  const allDenied = await bob.fetch(`/api/rooms/${slug}/photos/all`);
  check("photos/all sans admin -> 403", allDenied.status === 403);

  // 6. Confidentialité : Bob ne peut pas voir une photo d'Alice -------------
  const stealAttempt = await bob.fetch(a1data.photo.url);
  check("Bob ne peut pas ouvrir la photo d'Alice -> 403", stealAttempt.status === 403);

  // 7. L'hôte entre via son lien secret (pose le cookie admin) --------------
  const adminPath = room.adminUrl.replace(BASE, "");
  const enter = await host.fetch(adminPath);
  check("enter-admin -> redirection (3xx)", enter.status >= 300 && enter.status < 400);

  // 8. L'hôte voit TOUTES les photos ----------------------------------------
  const allRes = await host.fetch(`/api/rooms/${slug}/photos/all`);
  check("hôte photos/all -> 200", allRes.status === 200);
  const all = await allRes.json();
  check("hôte voit les 4 photos", all.photos.length === 4);

  // 9. L'hôte peut afficher une image (roulette) ----------------------------
  const img = await host.fetch(all.photos[0].url);
  const buf = Buffer.from(await img.arrayBuffer());
  check("image servie -> 200", img.status === 200);
  check("Content-Type image/png", img.headers.get("content-type") === "image/png");
  check("octets non vides + signature PNG", buf.length > 100 && buf[0] === 0x89 && buf[1] === 0x50);

  // 10. Validation : refus d'un fichier non-image ---------------------------
  const badForm = new FormData();
  badForm.set("participantName", "Alice");
  badForm.set("file", new File([Buffer.from("pas une image")], "x.png", { type: "image/png" }));
  const bad = await alice.fetch(`/api/rooms/${slug}/photos`, { method: "POST", body: badForm });
  check("upload d'un faux fichier image -> 415", bad.status === 415);

  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} OK, ${failed} KO`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Erreur du smoke test :", e);
  process.exit(1);
});
