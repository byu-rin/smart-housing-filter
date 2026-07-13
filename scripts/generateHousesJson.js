import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parseHousingHtml } from "./parseHousing.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.join(__dirname, "..", "data", "sample.html");
const OUT_PATH = path.join(__dirname, "..", "src", "data", "houses.json");

const html = readFileSync(HTML_PATH, "utf-8");
const data = parseHousingHtml(html);

mkdirSync(path.dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(data.listings, null, 2) + "\n", "utf-8");

console.log(`Wrote ${data.listings.length} houses to ${path.relative(process.cwd(), OUT_PATH)}`);
