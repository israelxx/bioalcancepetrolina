import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(ROOT, "temporary screenshots");

const url = process.argv[2];
const label = process.argv[3];

if (!url) {
  console.error("Uso: node screenshot.mjs <url> [label]");
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const existing = fs.readdirSync(OUT_DIR).filter((f) => /^screenshot-\d+/.test(f));
const nextN =
  existing.reduce((max, f) => {
    const m = f.match(/^screenshot-(\d+)/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0) + 1;

const fileName = label ? `screenshot-${nextN}-${label}.png` : `screenshot-${nextN}.png`;
const outPath = path.join(OUT_DIR, fileName);

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto(url, { waitUntil: "networkidle0" });
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot salvo em: ${outPath}`);
