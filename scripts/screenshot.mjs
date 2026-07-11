// Capture d'écran de preuve : crée une partie, uploade des photos d'exemple,
// entre en tant qu'hôte, puis photographie la page roulette.
// Usage : BASE_URL=http://localhost:3100 node scripts/screenshot.mjs
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SAMPLES = join(process.cwd(), "scripts", "samples");
const OUT = join(process.cwd(), "scripts", "roulette.png");

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

// Un participant qui ajoute quelques ex.
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
const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
// Suivre le lien d'hôte pose le cookie admin, puis on est redirigé sur la roulette.
await page.goto(room.adminUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: OUT });
await browser.close();
console.log(`✓ Capture enregistrée : ${OUT}`);

// --- Capture bonus : état "révélation" après un tour de roue ---
{
  const b2 = await chromium.launch({ executablePath: EXE });
  const p2 = await b2.newPage({ viewport: { width: 900, height: 1100 } });
  await p2.goto(room.adminUrl, { waitUntil: "networkidle" });
  await p2.getByText("Lancer la roulette", { exact: false }).click();
  await p2.waitForTimeout(5200); // laisse la roue s'arrêter (4.6s) + marge
  const revealBtn = p2.getByText("Révéler l'ex de qui", { exact: false });
  // La carte "flotte" (animation) → clic forcé pour éviter l'attente de stabilité.
  if (await revealBtn.count()) await revealBtn.click({ force: true });
  await p2.waitForTimeout(400);
  await p2.screenshot({ path: join(process.cwd(), "scripts", "roulette-reveal.png") });
  await b2.close();
  console.log("✓ Capture révélation enregistrée");
}
