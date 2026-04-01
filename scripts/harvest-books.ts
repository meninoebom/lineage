/**
 * Harvest books from Google Books API for all teachers in the dataset.
 *
 * For each teacher, searches Google Books by author name, filters for
 * contemplative/spiritual content, deduplicates against existing resources,
 * and writes candidate JSON files to data/resources/.
 *
 * Usage:
 *   npx tsx scripts/harvest-books.ts                  # dry-run (preview only)
 *   npx tsx scripts/harvest-books.ts --write          # write new resource files
 *   npx tsx scripts/harvest-books.ts --teacher pema-chodron  # single teacher
 *
 * Bookshop.org affiliate links are generated from ISBNs.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TEACHERS_DIR = join(__dirname, "..", "data", "teachers");
const RESOURCES_DIR = join(__dirname, "..", "data", "resources");
const AFFILIATE_ID = "LINEAGE";
const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const MAX_RESULTS_PER_TEACHER = 20;
const RATE_LIMIT_MS = 300; // be nice to Google

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Teacher {
  name: string;
  slug: string;
  traditions: string[];
  death_year: number | null;
}

interface GoogleBookItem {
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    categories?: string[];
    industryIdentifiers?: Array<{ type: string; identifier: string }>;
    imageLinks?: { thumbnail?: string };
  };
}

interface ResourceFile {
  title: string;
  slug: string;
  type: "book";
  category: "popular" | "primary_text" | "academic";
  url: string;
  author: string;
  year: number | null;
  description: string;
  traditions: string[];
  teachers: string[];
  centers: string[];
}

// ---------------------------------------------------------------------------
// Exclusion keywords — books that aren't contemplative content
// ---------------------------------------------------------------------------

const TITLE_EXCLUSIONS = [
  // Format/edition noise
  "coloring book",
  "cookbook",
  "recipe",
  "journal",
  "planner",
  "calendar",
  "workbook",
  "activity book",
  "large print",
  "16pt",
  "children's",
  "kids",
  "word search",
  "puzzle",
  "flash cards",
  // Non-book items
  "card deck",
  "cards",
  "oracle",
  "tarot",
  // Non-contemplative
  "astrology",
  "horoscope",
  "witchcraft",
  "spell",
  "magic",
  "psychic",
  "channeling",
  "crystal healing",
  "manifesting",
  "law of attraction",
  // Unrelated subjects
  "foraminifera",
  "geology",
  "physics",
  "chemistry",
  "biology",
  "manual of the natural",
  "ceramics",
  "pottery",
  "ceramic art",
  "novel",
  "fiction",
  "thriller",
  "mystery",
  "romance",
];

const CATEGORY_EXCLUSIONS = [
  "juvenile",
  "comics",
  "games",
  "cooking",
  "science",
  "technology",
  "mathematics",
  "medical",
  "law",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(title: string, author: string): string {
  const base = `${author}-${title}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base;
}

function extractISBN13(
  identifiers?: Array<{ type: string; identifier: string }>,
): string | null {
  if (!identifiers) return null;
  const isbn13 = identifiers.find((i) => i.type === "ISBN_13");
  return isbn13?.identifier ?? null;
}

function extractYear(publishedDate?: string): number | null {
  if (!publishedDate) return null;
  const match = publishedDate.match(/^(\d{4})/);
  return match ? parseInt(match[1]) : null;
}

function bookshopUrl(isbn: string): string {
  return `https://bookshop.org/a/${AFFILIATE_ID}/${isbn}`;
}

function bookshopSearchUrl(title: string, author: string): string {
  const keywords = [title, author].filter(Boolean).join(" ");
  return `https://bookshop.org/beta-search?keywords=${encodeURIComponent(keywords)}&aid=${AFFILIATE_ID}`;
}

function isExcluded(item: GoogleBookItem): string | null {
  const title = (item.volumeInfo.title ?? "").toLowerCase();
  const categories = (item.volumeInfo.categories ?? []).map((c) =>
    c.toLowerCase(),
  );

  for (const ex of TITLE_EXCLUSIONS) {
    if (title.includes(ex)) return `title contains "${ex}"`;
  }
  for (const cat of categories) {
    for (const ex of CATEGORY_EXCLUSIONS) {
      if (cat.includes(ex)) return `category "${cat}" excluded`;
    }
  }
  // No description at all is suspicious
  if (!item.volumeInfo.description && !item.volumeInfo.categories) {
    return "no description or categories";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Google Books API
// ---------------------------------------------------------------------------

async function searchBooks(authorName: string): Promise<GoogleBookItem[]> {
  const query = `inauthor:"${authorName}"`;
  const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=${MAX_RESULTS_PER_TEACHER}&printType=books&langRestrict=en&fields=items(volumeInfo(title,authors,description,publishedDate,categories,industryIdentifiers,imageLinks))`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  ✗ Google Books API error: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.items ?? [];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const writeMode = args.includes("--write");
  const singleTeacher = args.find((a) => a !== "--write" && !a.startsWith("--"));
  const teacherFlag = args.indexOf("--teacher");
  const teacherSlug =
    teacherFlag !== -1 ? args[teacherFlag + 1] : singleTeacher;

  // Load existing resources for dedup
  const existingResources = new Set<string>();
  const existingTitles = new Set<string>();
  for (const f of readdirSync(RESOURCES_DIR).filter((f) =>
    f.endsWith(".json"),
  )) {
    existingResources.add(f.replace(".json", ""));
    const data = JSON.parse(readFileSync(join(RESOURCES_DIR, f), "utf-8"));
    existingTitles.add(data.title?.toLowerCase().trim());
  }

  // Load teachers
  let teacherFiles = readdirSync(TEACHERS_DIR).filter((f) =>
    f.endsWith(".json"),
  );
  if (teacherSlug) {
    teacherFiles = teacherFiles.filter((f) => f === `${teacherSlug}.json`);
    if (teacherFiles.length === 0) {
      console.error(`Teacher not found: ${teacherSlug}`);
      process.exit(1);
    }
  }

  const teachers: Teacher[] = teacherFiles.map((f) =>
    JSON.parse(readFileSync(join(TEACHERS_DIR, f), "utf-8")),
  );

  console.log(
    `\n📚 Book Harvester — ${writeMode ? "WRITE" : "DRY-RUN"} mode`,
  );
  console.log(`   ${teachers.length} teachers, ${existingResources.size} existing resources\n`);

  let totalNew = 0;
  let totalSkipped = 0;
  let totalExcluded = 0;
  const allCandidates: Array<ResourceFile & { _reason?: string }> = [];

  for (const teacher of teachers) {
    console.log(`\n─── ${teacher.name} (${teacher.traditions.join(", ")}) ───`);

    const books = await searchBooks(teacher.name);
    if (books.length === 0) {
      console.log("  (no results)");
      await sleep(RATE_LIMIT_MS);
      continue;
    }

    for (const book of books) {
      const title = book.volumeInfo.title;
      if (!title) continue;

      // Check exclusions
      const exclusionReason = isExcluded(book);
      if (exclusionReason) {
        console.log(`  ✗ EXCLUDED: "${title}" — ${exclusionReason}`);
        totalExcluded++;
        continue;
      }

      // Check author match (Google sometimes returns loose matches)
      const authors = book.volumeInfo.authors ?? [];
      const authorMatch = authors.some(
        (a) =>
          a.toLowerCase().includes(teacher.name.split(" ").pop()!.toLowerCase()),
      );
      if (!authorMatch) {
        console.log(`  ✗ AUTHOR MISMATCH: "${title}" by ${authors.join(", ")}`);
        totalExcluded++;
        continue;
      }

      // Dedup by title
      if (existingTitles.has(title.toLowerCase().trim())) {
        console.log(`  → EXISTING: "${title}"`);
        totalSkipped++;
        continue;
      }

      // Require ISBN for quality filtering
      const isbn = extractISBN13(book.volumeInfo.industryIdentifiers);
      if (!isbn) {
        console.log(`  ✗ NO ISBN: "${title}"`);
        totalExcluded++;
        continue;
      }
      const slug = slugify(title, teacher.name.split(" ").pop()!);

      // Dedup by slug
      if (existingResources.has(slug)) {
        console.log(`  → EXISTING (slug): "${title}"`);
        totalSkipped++;
        continue;
      }

      const resource: ResourceFile = {
        title,
        slug,
        type: "book",
        category: "popular",
        url: isbn
          ? bookshopUrl(isbn)
          : bookshopSearchUrl(title, teacher.name),
        author: teacher.name,
        year: extractYear(book.volumeInfo.publishedDate),
        description:
          book.volumeInfo.description?.replace(/\s+/g, " ").trim() ?? "",
        traditions: [...teacher.traditions],
        teachers: [teacher.slug],
        centers: [],
      };

      console.log(
        `  ✓ NEW: "${title}" (${resource.year ?? "?"}) ${isbn ? `ISBN: ${isbn}` : "(no ISBN)"}`,
      );

      allCandidates.push(resource);
      existingTitles.add(title.toLowerCase().trim());
      existingResources.add(slug);
      totalNew++;
    }

    await sleep(RATE_LIMIT_MS);
  }

  // Summary
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  New:      ${totalNew}`);
  console.log(`  Existing: ${totalSkipped}`);
  console.log(`  Excluded: ${totalExcluded}`);
  console.log(`${"═".repeat(60)}\n`);

  if (writeMode && allCandidates.length > 0) {
    for (const resource of allCandidates) {
      const filePath = join(RESOURCES_DIR, `${resource.slug}.json`);
      if (existsSync(filePath)) {
        console.log(`  ⚠ SKIP (file exists): ${resource.slug}.json`);
        continue;
      }
      writeFileSync(filePath, JSON.stringify(resource, null, 2) + "\n");
      console.log(`  ✓ WROTE: ${resource.slug}.json`);
    }
    console.log(`\nDone. Wrote ${allCandidates.length} new resource files.`);
  } else if (!writeMode && allCandidates.length > 0) {
    console.log("Dry-run complete. Run with --write to create files.");
  } else {
    console.log("No new books found.");
  }
}

main().catch(console.error);
