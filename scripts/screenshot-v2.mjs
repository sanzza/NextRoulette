// Captures de la nouvelle UX roulette : desktop (vérif absence de scroll),
// résultat plein écran, et mobile.
// Usage : BASE_URL=http://localhost:3500 node scripts/screenshot-v2.mjs
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3500";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SAMPLES = join(process.cwd(), "scripts", "samples");

async function upload(slug, cookieHeader, pseudo, file, label) {
  const bytes = readFileSync(join(SAMPLES, file));
  const form = new FormData();
  form.set("participantName", pseudo);
  form.set("exLabel", label);
  form.set("file", new File([bytes], file, { type: "image/png" }));
  await fetch(`${BASE}/api/rooms/${slug}/photos`, {
    method: "POST",
    headers: { cookie: cookieHeader },
    body: form,
  });
}

const room = await (
  await fetch(`${BASE}/api/rooms`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nom: "Soirée VJF 🔥" }),
  })
).json();

const pidRes = await fetch(`${BASE}/api/rooms/${room.slug}/photos`);
const pidCookie = (pidRes.headers.getSetCookie?.() ?? [])
  .map((c) => c.split(";")[0])
  .join("; ");
await upload(room.slug, pidCookie, "Lisly", "ex-magenta.png", "le surfeur");
await upload(room.slug, pidCookie, "Lisly", "ex-violet.png", "le DJ");
await upload(room.slug, pidCookie, "Sanzza", "ex-cyan.png", "la prof de yoga");
await upload(room.slug, pidCookie, "Sanzza", "ex-jaune.png", "le crypto bro");
await upload(room.slug, pidCookie, "Lisly", "ex-vert.png", "la libraire");

const browser = await chromium.launch({ executablePath: EXE });

// ---- Desktop 1280x800 : roue + vérification "pas de scroll" ----------------
const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await desktop.goto(room.adminUrl, { waitUntil: "networkidle" });
await desktop.waitForTimeout(600);
const scrollInfo = await desktop.evaluate(() => ({
  scrollHeight: document.documentElement.scrollHeight,
  innerHeight: window.innerHeight,
}));
console.log(
  `Desktop scroll : contenu=${scrollInfo.scrollHeight}px, écran=${scrollInfo.innerHeight}px → ${scrollInfo.scrollHeight <= scrollInfo.innerHeight ? "✅ AUCUN scroll" : "❌ SCROLL présent"}`,
);
await desktop.screenshot({ path: "scripts/v2-desktop-roue.png" });

// ---- Desktop : lancer -> photo en grand (la roue disparaît) -----------------
await desktop.getByText("Lancer la roulette", { exact: false }).click();
await desktop.waitForTimeout(5200);
await desktop.screenshot({ path: "scripts/v2-desktop-resultat.png" });
const scrollInfo2 = await desktop.evaluate(() => ({
  scrollHeight: document.documentElement.scrollHeight,
  innerHeight: window.innerHeight,
}));
console.log(
  `Desktop résultat : contenu=${scrollInfo2.scrollHeight}px → ${scrollInfo2.scrollHeight <= scrollInfo2.innerHeight ? "✅ AUCUN scroll" : "❌ SCROLL présent"}`,
);

// ---- Desktop : relancer -> le segment tiré est grisé ------------------------
await desktop.getByText("Relancer", { exact: false }).click({ force: true });
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: "scripts/v2-desktop-roue-grisee.png" });

// ---- Mobile 390x844 (iPhone) : roue -----------------------------------------
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(room.adminUrl.replace(/token=.*/, "") ? room.adminUrl : room.adminUrl, {
  waitUntil: "networkidle",
});
await mobile.waitForTimeout(600);
await mobile.screenshot({ path: "scripts/v2-mobile-roue.png" });

await browser.close();
console.log("✓ Captures v2 enregistrées");
