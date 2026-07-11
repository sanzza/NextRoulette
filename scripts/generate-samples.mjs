// Génère des PNG d'exemple (aplats de couleur) pour tester l'upload sans avoir
// besoin de vraies photos. Encodeur PNG minimal, sans dépendance (zlib intégré).
//
// Usage : node scripts/generate-samples.mjs [dossier]
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

/** Crée un PNG truecolor (type 2) d'une couleur unie avec un disque plus clair. */
function solidPng(size, [r, g, b]) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.32;
  let pos = 0;
  for (let y = 0; y < size; y++) {
    raw[pos++] = 0; // filtre "none" en tête de ligne
    for (let x = 0; x < size; x++) {
      const inCircle = (x - cx) ** 2 + (y - cy) ** 2 < radius ** 2;
      raw[pos++] = inCircle ? Math.min(255, r + 90) : r;
      raw[pos++] = inCircle ? Math.min(255, g + 90) : g;
      raw[pos++] = inCircle ? Math.min(255, b + 90) : b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // profondeur 8 bits
  ihdr[9] = 2; // truecolor RGB
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const SAMPLES = [
  { name: "ex-magenta.png", color: [255, 46, 136] },
  { name: "ex-violet.png", color: [123, 47, 247] },
  { name: "ex-cyan.png", color: [0, 160, 200] },
  { name: "ex-jaune.png", color: [220, 170, 40] },
  { name: "ex-vert.png", color: [66, 200, 130] },
  { name: "ex-orange.png", color: [255, 120, 73] },
];

const dir = process.argv[2] ?? join(process.cwd(), "scripts", "samples");
mkdirSync(dir, { recursive: true });
for (const s of SAMPLES) {
  writeFileSync(join(dir, s.name), solidPng(300, s.color));
}
console.log(`✓ ${SAMPLES.length} photos d'exemple générées dans ${dir}`);
