// One-time script: compresses and resizes every image in /public down to
// web-appropriate dimensions and file size, overwriting in place so no
// code references need to change.
//
// Run with: node compress-images.js

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, "public");
const MAX_WIDTH = 800;
const JPEG_QUALITY = 75;
const WEBP_QUALITY = 75;

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (![".jpg", ".jpeg", ".webp", ".png"].includes(ext)) return;

  const originalSize = fs.statSync(filePath).size;
  const buffer = fs.readFileSync(filePath);

  let pipeline = sharp(buffer).resize({ width: MAX_WIDTH, withoutEnlargement: true });

  if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  } else if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: WEBP_QUALITY });
  } else if (ext === ".png") {
    pipeline = pipeline.png({ quality: JPEG_QUALITY, compressionLevel: 9 });
  }

  const outputBuffer = await pipeline.toBuffer();

  if (outputBuffer.length < originalSize) {
    fs.writeFileSync(filePath, outputBuffer);
    console.log(
      `${path.basename(filePath)}: ${Math.round(originalSize / 1024)}KB -> ${Math.round(outputBuffer.length / 1024)}KB`
    );
  } else {
    console.log(`${path.basename(filePath)}: already optimal, skipped`);
  }
}

async function main() {
  const files = fs.readdirSync(PUBLIC_DIR);
  for (const file of files) {
    const fullPath = path.join(PUBLIC_DIR, file);
    if (fs.statSync(fullPath).isFile()) {
      await compressImage(fullPath);
    }
  }
  console.log("Done.");
}

main();