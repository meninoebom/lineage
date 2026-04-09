import { readFileSync } from "fs";
import { join } from "path";
import type { Taxonomy } from "./types";

const TAXONOMY_PATH = join(process.cwd(), "data", "taxonomy.json");

let cached: Taxonomy | null = null;

export function getTaxonomy(): Taxonomy {
  if (!cached) {
    cached = JSON.parse(readFileSync(TAXONOMY_PATH, "utf-8"));
  }
  return cached!;
}
