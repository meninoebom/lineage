#!/usr/bin/env tsx
import { writeFileSync } from "fs";
import { join } from "path";
import { getAllResources } from "../src/lib/data";

const OUTPUT = join(process.cwd(), "public", "resources-index.json");

const resources = getAllResources()
  .sort((a, b) => a.title.localeCompare(b.title))
  .map((r) => ({
    slug: r.slug,
    title: r.title,
    author: r.author ?? null,
    type: r.type,
    traditions: r.traditions,
    teachers: r.teachers,
    experience_level: r.experience_level ?? null,
    topics: r.topics ?? [],
    practice_context: r.practice_context ?? [],
    description: r.description.length > 120 ? r.description.slice(0, 117) + "…" : r.description,
    url: r.url,
    year: r.year ?? null,
  }));

writeFileSync(OUTPUT, JSON.stringify(resources, null, 0));
console.log(`✓ Wrote ${resources.length} resources to public/resources-index.json (${(Buffer.byteLength(JSON.stringify(resources)) / 1024).toFixed(0)}KB)`);
