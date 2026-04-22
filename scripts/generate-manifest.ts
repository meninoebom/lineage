#!/usr/bin/env tsx
/**
 * Build-time script: generates data/manifest.json — a single-file content
 * registry designed for agent consumption.
 *
 * An agent can read this one file to answer:
 *   - "Is X on the site?" (search names, alternate names, key figures)
 *   - "What do we have about tradition Y?" (entity counts, connections)
 *   - "Which teachers are associated with Z center?"
 *
 * Usage: tsx scripts/generate-manifest.ts
 * Output: data/manifest.json
 */
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { getAllTeachers, getAllCenters, getAllResources, getAllPaths } from "../src/lib/data";

const ROOT = process.cwd();
const OUTPUT_FILE = join(ROOT, "data", "manifest.json");

interface ManifestTradition {
  slug: string;
  name: string;
  family: string;
  alternate_names: string[];
  key_figures: string[];
  key_texts: string[];
  related_practices: string[];
  connected_traditions: string[];
}

interface ManifestTeacher {
  slug: string;
  name: string;
  traditions: string[];
  centers: string[];
  living: boolean;
  location: string;
}

interface ManifestCenter {
  slug: string;
  name: string;
  traditions: string[];
  teachers: string[];
  location: string;
}

interface ManifestResource {
  slug: string;
  title: string;
  type: string;
  author: string | null;
  traditions: string[];
  teachers: string[];
}

interface ManifestPath {
  slug: string;
  title: string;
  type: string;
  tradition: string | null;
  resource_count: number;
}

interface Manifest {
  generated_at: string;
  counts: Record<string, number>;
  traditions: ManifestTradition[];
  teachers: ManifestTeacher[];
  centers: ManifestCenter[];
  resources: ManifestResource[];
  paths: ManifestPath[];
}

function formatLocation(city: string, state: string, country: string): string {
  return [city, state, country].filter(Boolean).join(", ");
}

function main() {
  console.log("Generating content manifest...");

  const traditionsDir = join(ROOT, "data", "traditions");
  const traditionFiles = readdirSync(traditionsDir).filter((f) => f.endsWith(".mdx"));
  const traditions = traditionFiles.map((f) => {
    const raw = readFileSync(join(traditionsDir, f), "utf-8");
    return matter(raw).data as Record<string, unknown>;
  });
  const teachers = getAllTeachers();
  const centers = getAllCenters();
  const resources = getAllResources();
  const paths = getAllPaths();

  const manifest: Manifest = {
    generated_at: new Date().toISOString(),
    counts: {
      traditions: traditions.length,
      teachers: teachers.length,
      centers: centers.length,
      resources: resources.length,
      paths: paths.length,
    },
    traditions: traditions.map((t) => ({
      slug: t.slug as string,
      name: t.name as string,
      family: t.family as string,
      alternate_names: (t.alternate_names as string[]) || [],
      key_figures: (t.key_figures as string[]) || [],
      key_texts: (t.key_texts as string[]) || [],
      related_practices: (t.related_practices as string[]) || [],
      connected_traditions: ((t.connections as Array<{ tradition_slug: string }>) || []).map(
        (c) => c.tradition_slug
      ),
    })),
    teachers: teachers.map((t) => ({
      slug: t.slug,
      name: t.name,
      traditions: t.traditions,
      centers: t.centers,
      living: t.death_year === null,
      location: formatLocation(t.city, t.state, t.country),
    })),
    centers: centers.map((c) => ({
      slug: c.slug,
      name: c.name,
      traditions: c.traditions,
      teachers: c.teachers,
      location: formatLocation(c.city, c.state, c.country),
    })),
    resources: resources.map((r) => ({
      slug: r.slug,
      title: r.title,
      type: r.type,
      author: r.author,
      traditions: r.traditions,
      teachers: r.teachers,
    })),
    paths: paths.map((p) => ({
      slug: p.slug,
      title: p.title,
      type: p.type,
      tradition: p.tradition,
      resource_count: p.resources.length,
    })),
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`Manifest written to ${OUTPUT_FILE}`);
  console.log(`  ${manifest.counts.traditions} traditions`);
  console.log(`  ${manifest.counts.teachers} teachers`);
  console.log(`  ${manifest.counts.centers} centers`);
  console.log(`  ${manifest.counts.resources} resources`);
  console.log(`  ${manifest.counts.paths} paths`);
}

main();
