import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { Taxonomy, TaxonomyDimension } from "./types";

const TAXONOMY_PATH = join(process.cwd(), "data", "taxonomy.json");

function isDimension(obj: unknown): obj is TaxonomyDimension {
  const d = obj as Record<string, unknown>;
  return (
    (d.type === "single" || d.type === "multi") &&
    typeof d.description === "string" &&
    Array.isArray(d.values) &&
    d.values.every((v: unknown) => typeof v === "string")
  );
}

function isTaxonomy(obj: unknown): obj is Taxonomy {
  const t = obj as Record<string, unknown>;
  return (
    isDimension(t.experience_level) &&
    isDimension(t.topics) &&
    isDimension(t.practice_context)
  );
}

let cached: Taxonomy | null = null;

export function getTaxonomy(): Taxonomy {
  if (!cached) {
    if (!existsSync(TAXONOMY_PATH)) {
      throw new Error(`Taxonomy file not found: ${TAXONOMY_PATH}`);
    }
    const raw = JSON.parse(readFileSync(TAXONOMY_PATH, "utf-8"));
    if (!isTaxonomy(raw)) {
      throw new Error("Invalid taxonomy.json: missing or malformed dimensions");
    }
    cached = raw;
  }
  return cached!;
}
