/**
 * Center teacher scraper — fetches teacher/staff pages from contemplative
 * centers and extracts teacher names for the pipeline.
 *
 * Usage: npx tsx scripts/scrape-centers.ts
 *
 * Refs: #108
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CenterConfig {
  name: string;
  url: string;
  city: string;
  state: string;
  country: string;
  traditions: string[];
}

export interface ScrapedTeacher {
  name: string;
  bio: string;
  source: string; // center slug
  location: { city: string; state: string; country: string };
  website: string | null;
  traditions: string[]; // from center config as fallback
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Clean HTML: strip tags, decode common entities, collapse whitespace.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Validate that a string looks like a person's name:
 * - 2-5 words, each starting with a capital letter
 * - No numbers, no long words (likely not a name)
 */
function looksLikeName(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 3 || trimmed.length > 60) return false;

  // Must have at least two words (first + last name)
  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 6) return false;

  // Each word should start with uppercase (allow particles like "de", "van")
  const particles = new Set(["de", "del", "van", "von", "la", "le", "al", "el", "ibn"]);
  for (const word of words) {
    if (particles.has(word.toLowerCase())) continue;
    if (!/^[A-Z]/.test(word)) return false;
  }

  // No digits
  if (/\d/.test(trimmed)) return false;

  // Reject common navigation/UI text that passes other checks
  const NAV_BLOCKLIST = [
    "main menu", "mobile menu", "footer navigation", "secondary menu",
    "secondary mobile menu", "main menu mobile", "header right",
    "read more", "contact us", "ways to give", "stay connected",
    "privacy overview", "newsletter signup", "learn about", "mobile primary",
    "youtube video", "teacher background", "learn about our lineage",
    "retreat center", "forest refuge", "guiding teachers", "our guiding teachers",
    "visiting teachers", "resident teachers", "movement instructors",
    "teacher training", "teacher village", "teacher support", "teacher writings",
    "teacher dana", "staff life", "sangha program", "join our list",
    "new meditators", "beginners programs", "evening events", "creating community",
    "ongoing sittings", "what guides us", "what we teach", "who we are",
    "new york insight teachers", "guiding teacher collective",
    "retreat center teachers", "forest refuge teachers",
    "retreat center assistant teachers",
  ];
  if (NAV_BLOCKLIST.some((b) => trimmed.toLowerCase().includes(b))) return false;

  // Reject if it looks like an organization name (contains Center, Institute, etc.)
  if (/\b(center|institute|society|foundation|program|school)\b/i.test(trimmed)) return false;

  return true;
}

// ---------------------------------------------------------------------------
// Name extraction strategies
// ---------------------------------------------------------------------------

/**
 * Extract names from HTML using multiple strategies, ordered by reliability.
 * Returns deduplicated names.
 */
function extractTeacherNames(html: string): string[] {
  const names = new Set<string>();

  // Strategy 1: Look for structured teacher cards/items.
  // Many sites use h2/h3/h4 inside teacher listing elements.
  const headingPattern = /<(?:h[2-4])[^>]*class="[^"]*(?:teacher|faculty|staff|name)[^"]*"[^>]*>([\s\S]*?)<\/h[2-4]>/gi;
  for (const match of Array.from(html.matchAll(headingPattern))) {
    const name = stripHtml(match[1]);
    if (looksLikeName(name)) names.add(name);
  }

  // Strategy 2: Look for headings that contain teacher names
  // (h2/h3/h4 elements with short text that looks like names)
  const anyHeadingPattern = /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi;
  for (const match of Array.from(html.matchAll(anyHeadingPattern))) {
    const name = stripHtml(match[1]);
    if (looksLikeName(name)) names.add(name);
  }

  // Strategy 3: Links with "teacher" in the href
  const teacherLinkPattern = /<a[^>]*href="[^"]*(?:teacher|faculty|staff)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of Array.from(html.matchAll(teacherLinkPattern))) {
    const name = stripHtml(match[1]);
    if (looksLikeName(name)) names.add(name);
  }

  // Strategy 4: Look for common teacher card patterns with aria-label or title
  const ariaPattern = /(?:aria-label|title)="([^"]+)"/gi;
  for (const match of Array.from(html.matchAll(ariaPattern))) {
    const name = match[1].trim();
    if (looksLikeName(name)) names.add(name);
  }

  // Strategy 5: alt text on images that look like teacher photos
  const imgAltPattern = /<img[^>]*alt="([^"]*)"[^>]*>/gi;
  for (const match of Array.from(html.matchAll(imgAltPattern))) {
    const alt = match[1].trim();
    // Filter: alt text should not be generic ("photo", "image", "logo")
    if (looksLikeName(alt) && !/photo|image|logo|icon|banner/i.test(alt)) {
      names.add(alt);
    }
  }

  return Array.from(names).map(cleanName);
}

/**
 * Strip credential suffixes from names (PhD, MD, LCSW, etc.)
 * Only strips after a comma or at the end of the string preceded by a space.
 */
function cleanName(name: string): string {
  // Strip credentials: ", PhD" or " PhD" at end, or "MD, PhD" chains
  const cleaned = name
    .replace(/,?\s*(PhD|MD|EdD|LCSW|RN|DO|PsyD|LMFT|LPC|MSW)\b[\s,.]*/g, "")
    // Only strip short credentials (MA, MS, etc.) after comma to avoid false positives
    .replace(/,\s*(MA|MS|MFA|MEd|JD)\b[\s,.]*/g, "")
    .trim();
  return cleaned;
}

// ---------------------------------------------------------------------------
// Main scraper
// ---------------------------------------------------------------------------

export async function scrapeCenterTeachers(
  centers: CenterConfig[],
): Promise<ScrapedTeacher[]> {
  const allTeachers: ScrapedTeacher[] = [];

  for (const center of centers) {
    const slug = toSlug(center.name);
    console.log(`\n--- Scraping: ${center.name} (${center.url})`);

    try {
      const response = await fetch(center.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) lineage-guide-scraper/1.0",
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        console.warn(
          `  SKIP: HTTP ${response.status} for ${center.name}`,
        );
        continue;
      }

      const html = await response.text();
      const names = extractTeacherNames(html);

      if (names.length === 0) {
        console.warn(`  SKIP: No teacher names found for ${center.name}`);
        continue;
      }

      console.log(`  Found ${names.length} teacher names`);

      for (const name of names) {
        allTeachers.push({
          name,
          bio: `${name} is a teacher at ${center.name} in ${center.city}, ${center.state}.`,
          source: slug,
          location: {
            city: center.city,
            state: center.state,
            country: center.country,
          },
          website: null,
          traditions: center.traditions,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  SKIP: Error fetching ${center.name}: ${msg}`);
    }
  }

  return allTeachers;
}

// ---------------------------------------------------------------------------
// Load existing teacher names from data/teachers/
// ---------------------------------------------------------------------------

function loadExistingTeacherNames(): string[] {
  const teachersDir = join(__dirname, "..", "data", "teachers");
  const names: string[] = [];
  try {
    const files = readdirSync(teachersDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const data = JSON.parse(readFileSync(join(teachersDir, file), "utf-8"));
      if (data.name) names.push(data.name);
    }
  } catch {
    console.warn("Could not read data/teachers/, continuing with empty list");
  }
  return names;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main() {
  const centersPath = join(__dirname, "data", "center-urls.json");
  const centers: CenterConfig[] = JSON.parse(
    readFileSync(centersPath, "utf-8"),
  );

  console.log(`Scraping ${centers.length} centers...`);

  const scraped = await scrapeCenterTeachers(centers);

  console.log(`\n=== Results ===`);
  console.log(`Total scraped teachers: ${scraped.length}`);

  // Show per-center breakdown
  const byCenter = new Map<string, number>();
  for (const t of scraped) {
    byCenter.set(t.source, (byCenter.get(t.source) ?? 0) + 1);
  }
  for (const [center, count] of Array.from(byCenter)) {
    console.log(`  ${center}: ${count} teachers`);
  }

  // Quick classification preview using existing modules
  const existingNames = loadExistingTeacherNames();
  console.log(`\nExisting teachers in dataset: ${existingNames.length}`);

  // Import classifier dynamically to keep the module boundary clean
  const { classifyCandidate } = await import("./lib/classify");

  let accepted = 0;
  let rejected = 0;
  const rejectionReasons = new Map<string, number>();

  for (const teacher of scraped) {
    const classification = classifyCandidate(
      { name: teacher.name, bio: teacher.bio, source: teacher.source },
      existingNames,
    );
    if (classification.status === "accepted") {
      accepted++;
    } else {
      rejected++;
      const reason = classification.reject_reason ?? "unknown";
      rejectionReasons.set(reason, (rejectionReasons.get(reason) ?? 0) + 1);
    }
  }

  console.log(`\nClassification preview:`);
  console.log(`  Accepted: ${accepted}`);
  console.log(`  Rejected: ${rejected}`);
  for (const [reason, count] of Array.from(rejectionReasons)) {
    console.log(`    ${reason}: ${count}`);
  }
}

// Run if executed directly
const isDirectRun =
  typeof require !== "undefined" && require.main === module;
if (isDirectRun || process.argv[1]?.endsWith("scrape-centers.ts")) {
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
