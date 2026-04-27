/**
 * Generate a resource JSON stub from a URL.
 *
 * Usage:
 *   npm run add-resource -- --url https://www.youtube.com/watch?v=abc123
 *   npm run add-resource -- --url https://bookshop.org/p/... --teacher thich-nhat-hanh --tradition zen
 */
import { existsSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

const RESOURCES_DIR = join(__dirname, "..", "data", "resources");
const TEACHERS_DIR = join(__dirname, "..", "data", "teachers");
const TRADITIONS_DIR = join(__dirname, "..", "data", "traditions");

// -- Arg parsing -------------------------------------------------------------

function parseArgs(): { url: string; teacher: string | null; tradition: string | null } {
  const args = process.argv.slice(2);
  const get = (flag: string): string | null => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : null;
  };
  const url = get("--url");
  if (!url) {
    console.error("Error: --url is required");
    console.error("Usage: npm run add-resource -- --url <url> [--teacher <slug>] [--tradition <slug>]");
    process.exit(1);
  }
  return { url, teacher: get("--teacher"), tradition: get("--tradition") };
}

// -- Type inference ----------------------------------------------------------

export function inferType(url: string): "video" | "podcast" | "book" | "article" {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "video";
  if (u.includes("spotify.com/episode") || u.includes("podcasts.apple.com")) return "podcast";
  if (u.includes("bookshop.org") || u.includes("amazon.com/dp") || u.includes("amazon.com/gp/product")) return "book";
  return "article";
}

// -- Slug generation ---------------------------------------------------------

function generateSlug(): string {
  const existing = new Set(
    readdirSync(RESOURCES_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
  );
  const base = `resource-${Date.now()}`;
  // Ensure uniqueness (extremely unlikely collision, but safe)
  let slug = base;
  let i = 1;
  while (existing.has(slug)) slug = `${base}-${i++}`;
  return slug;
}

// -- Validation --------------------------------------------------------------

function validateTeacher(slug: string): void {
  const path = join(TEACHERS_DIR, `${slug}.json`);
  if (!existsSync(path)) {
    console.error(`Error: teacher slug "${slug}" not found in data/teachers/`);
    process.exit(1);
  }
}

function validateTradition(slug: string): void {
  const mdxPath = join(TRADITIONS_DIR, `${slug}.mdx`);
  const mdPath = join(TRADITIONS_DIR, `${slug}.md`);
  if (!existsSync(mdxPath) && !existsSync(mdPath)) {
    console.error(`Error: tradition slug "${slug}" not found in data/traditions/`);
    process.exit(1);
  }
}

// -- Main --------------------------------------------------------------------

function main() {
  const { url, teacher, tradition } = parseArgs();

  if (teacher) validateTeacher(teacher);
  if (tradition) validateTradition(tradition);

  const type = inferType(url);
  const slug = generateSlug();
  const category = type === "book" ? "popular" : "web_resource";

  const stub = {
    title: "TODO",
    slug,
    type,
    category,
    url,
    author: null as string | null,
    year: null as number | null,
    description: "TODO",
    traditions: tradition ? [tradition] : [],
    teachers: teacher ? [teacher] : [],
    centers: [] as string[],
  };

  const outPath = join(RESOURCES_DIR, `${slug}.json`);
  writeFileSync(outPath, JSON.stringify(stub, null, 2) + "\n");

  console.log(`\nCreated: data/resources/${slug}.json`);
  console.log(`  type: ${type}`);
  if (teacher) console.log(`  teacher: ${teacher}`);
  if (tradition) console.log(`  tradition: ${tradition}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Open data/resources/${slug}.json`);
  console.log(`  2. Fill in "title", "description", and optionally "author" and "year"`);
  console.log(`  3. Rename the file to match the title slug (e.g. my-great-talk.json)`);
  console.log(`  4. Update "slug" in the JSON to match the filename`);
  console.log(`  5. git add data/resources/${slug}.json && git commit\n`);
}

if (require.main === module) {
  main();
}
