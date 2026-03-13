/**
 * One-shot script: Replace broken bookshop.org product URLs with search URLs.
 *
 * Usage: npx tsx scripts/fix-bookshop-urls.ts
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const RESOURCES_DIR = join(__dirname, "..", "data", "resources");
const AFFILIATE_ID = "LINEAGE";

const files = readdirSync(RESOURCES_DIR).filter((f) => f.endsWith(".json"));

let updated = 0;
let skipped = 0;

for (const file of files) {
  const path = join(RESOURCES_DIR, file);
  const data = JSON.parse(readFileSync(path, "utf-8"));

  if (!data.url?.includes("bookshop.org")) {
    skipped++;
    continue;
  }

  const keywords = [data.title, data.author].filter(Boolean).join(" ");
  const searchUrl = `https://bookshop.org/beta-search?keywords=${encodeURIComponent(keywords)}&aid=${AFFILIATE_ID}`;

  const oldUrl = data.url;
  data.url = searchUrl;

  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`✓ ${file}`);
  console.log(`  OLD: ${oldUrl}`);
  console.log(`  NEW: ${searchUrl}\n`);
  updated++;
}

console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
