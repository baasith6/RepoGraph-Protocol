/**
 * Builds docs/assets/demo.gif from demo-flow.svg (animated highlight cycle).
 * Run: node scripts/generate-demo-gif.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import gifenc from "gifenc";

const { GIFEncoder, quantize, applyPalette } = gifenc;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "docs/assets/demo-flow.svg");
const outPath = path.join(root, "docs/assets/demo.gif");

const baseSvg = fs.readFileSync(svgPath, "utf-8");
const boxes = [
  { x: 24, w: 200 },
  { x: 260, w: 200 },
  { x: 496, w: 200 },
  { x: 732, w: 164 },
];

function svgWithHighlight(active) {
  let svg = baseSvg.replace(
    /Replace this SVG with a recorded demo\.gif[^<]*/,
    "Animated preview — record a terminal demo per RECORD_DEMO.md"
  );
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    const stroke = i === active ? "#fbbf24" : "#38bdf8";
    const sw = i === active ? 3 : 2;
    const re = new RegExp(
      `<rect class="box" x="${b.x}" y="88" width="${b.w}" height="88"/>`,
      "g"
    );
    svg = svg.replace(
      re,
      `<rect class="box" x="${b.x}" y="88" width="${b.w}" height="88" style="stroke:${stroke};stroke-width:${sw}"/>`
    );
  }
  return svg;
}

const width = 920;
const height = 320;
const gif = GIFEncoder();

for (let frame = 0; frame < 16; frame++) {
  const active = frame % 4;
  const { data, info } = await sharp(Buffer.from(svgWithHighlight(active)))
    .resize(width, height)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = new Uint8ClampedArray(data);
  const palette = quantize(rgba, 256);
  const index = applyPalette(rgba, palette);
  gif.writeFrame(index, info.width, info.height, {
    palette,
    delay: 400,
    first: frame === 0,
  });
}

gif.finish();
fs.writeFileSync(outPath, Buffer.from(gif.bytes()));
console.log("Wrote", outPath, `(${fs.statSync(outPath).size} bytes)`);
