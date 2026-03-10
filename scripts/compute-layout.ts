#!/usr/bin/env tsx
/**
 * Build-time script: computes tradition map layout using ForceAtlas2.
 *
 * Usage: tsx scripts/compute-layout.ts
 * Output: src/generated/map-layout.json
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { getAllTraditions } from "../src/lib/data";
import { computeLayout } from "../src/lib/compute-layout";

const ROOT = process.cwd();
const OUTPUT_DIR = join(ROOT, "src", "generated");
const OUTPUT_FILE = join(OUTPUT_DIR, "map-layout.json");

function main() {
  console.log("Loading traditions...");
  const traditions = getAllTraditions();
  console.log(`Found ${traditions.length} traditions.`);

  if (traditions.length === 0) {
    console.warn("No traditions found — writing empty layout.");
  }

  console.log("Computing layout...");
  const layout = computeLayout(traditions);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(layout, null, 2) + "\n");

  console.log(`Layout written to ${OUTPUT_FILE}`);
  for (const [slug, pos] of Object.entries(layout)) {
    console.log(`  ${slug}: (${pos.x}, ${pos.y})`);
  }
}

main();
