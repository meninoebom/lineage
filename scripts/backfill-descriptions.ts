/**
 * Backfill truncated resource descriptions from Google Books API.
 *
 * Finds resources whose descriptions appear truncated (>= 295 chars,
 * no sentence-ending punctuation) and re-fetches the full description
 * from Google Books by searching for the title + author.
 *
 * Usage:
 *   npx tsx scripts/backfill-descriptions.ts          # dry run
 *   npx tsx scripts/backfill-descriptions.ts --write   # update files
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const RESOURCES_DIR = join(process.cwd(), "data", "resources");
const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const WRITE = process.argv.includes("--write");

interface Resource {
  title: string;
  slug: string;
  type: string;
  author: string | null;
  description: string;
  [key: string]: unknown;
}

function isTruncated(desc: string): boolean {
  if (!desc || desc.length < 295) return false;
  const trimmed = desc.trim();
  return !/[.!?"]$/.test(trimmed);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDescription(title: string, author: string | null): Promise<string | null> {
  const query = author ? `"${title}" ${author}` : `"${title}"`;
  const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=3&printType=books&langRestrict=en&fields=items(volumeInfo(title,description))`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  API error: ${res.status}`);
    return null;
  }

  const data = await res.json();
  if (!data.items?.length) return null;

  // Find the best match — prefer items with a description
  for (const item of data.items) {
    const desc = item.volumeInfo?.description;
    if (desc && desc.length > 50) {
      return desc.replace(/\s+/g, " ").trim();
    }
  }

  return null;
}

async function main() {
  const files = readdirSync(RESOURCES_DIR).filter((f) => f.endsWith(".json"));
  const truncated: { file: string; resource: Resource }[] = [];

  for (const file of files) {
    const raw = readFileSync(join(RESOURCES_DIR, file), "utf-8");
    const resource = JSON.parse(raw) as Resource;
    if (resource.type === "book" && isTruncated(resource.description)) {
      truncated.push({ file, resource });
    }
  }

  console.log(`Found ${truncated.length} books with truncated descriptions.\n`);

  if (!WRITE) {
    console.log("Dry run — pass --write to update files.\n");
    for (const { resource } of truncated.slice(0, 10)) {
      console.log(`  ${resource.slug}: "${resource.description.slice(-50)}..."`);
    }
    if (truncated.length > 10) console.log(`  ... and ${truncated.length - 10} more`);
    return;
  }

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < truncated.length; i++) {
    const { file, resource } = truncated[i];
    process.stdout.write(`[${i + 1}/${truncated.length}] ${resource.slug}... `);

    const fullDesc = await fetchDescription(resource.title, resource.author);

    if (fullDesc && fullDesc.length > resource.description.length) {
      resource.description = fullDesc;
      writeFileSync(join(RESOURCES_DIR, file), JSON.stringify(resource, null, 2) + "\n");
      console.log(`✓ ${resource.description.length} chars`);
      updated++;
    } else if (fullDesc) {
      console.log(`~ same length or shorter, skipped`);
      skipped++;
    } else {
      console.log(`✗ not found`);
      failed++;
    }

    // Rate limit: ~1 request per second for unauthenticated API
    if (i < truncated.length - 1) await sleep(1100);
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${failed} not found.`);
}

main().catch(console.error);
