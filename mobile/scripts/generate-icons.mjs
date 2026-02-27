import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assets = join(__dirname, "../assets");

const SVG_RAW = readFileSync(join(assets, "logo.svg"), "utf8");
const BG        = { r: 8, g: 11, b: 20, alpha: 1 };    // #080B14 — opaque
const BG_TRANSP = { r: 8, g: 11, b: 20, alpha: 0 };    // transparent — for splash

// Original viewBox is 38×48 — scale to target width keeping aspect ratio
function makeSvg(targetW) {
  const targetH = Math.round(targetW * (48 / 38));
  return {
    buf: Buffer.from(
      SVG_RAW.replace(/width="38"/, `width="${targetW}"`)
             .replace(/height="48"/, `height="${targetH}"`)
    ),
    w: targetW,
    h: targetH,
  };
}

async function generate(outFile, canvasSize, logoWidth, transparent = false) {
  const { buf, w, h } = makeSvg(logoWidth);
  const top  = Math.round((canvasSize - h) / 2);
  const left = Math.round((canvasSize - w) / 2);

  await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background: transparent ? BG_TRANSP : BG },
  })
    .composite([{ input: buf, top, left }])
    .png()
    .toFile(join(assets, outFile));

  console.log(`✓ ${outFile} (${canvasSize}×${canvasSize}, logo ${w}×${h})`);
}

// icon.png          — 1024×1024, opaque dark bg
// adaptive-icon.png — 1024×1024, opaque dark bg, logo in safe zone
// splash-icon.png   — transparent bg, logo large — app.json backgroundColor fills the screen
// favicon.png       — 196×196, opaque
await generate("icon.png",          1024, 560);
await generate("adaptive-icon.png", 1024, 420);
await generate("splash-icon.png",    512, 400, true);   // transparent bg, big logo
await generate("favicon.png",        196,  96);

console.log("\nAll icons generated!");
