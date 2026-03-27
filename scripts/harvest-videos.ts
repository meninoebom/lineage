/**
 * Harvest popular YouTube videos for all teachers in the dataset.
 *
 * For each teacher, searches YouTube by name, filters for well-liked videos
 * (minimum view count), and writes candidate JSON files to data/resources/.
 *
 * Requires: YOUTUBE_API_KEY environment variable
 *
 * Usage:
 *   YOUTUBE_API_KEY=xxx npx tsx scripts/harvest-videos.ts                  # dry-run
 *   YOUTUBE_API_KEY=xxx npx tsx scripts/harvest-videos.ts --write          # write files
 *   YOUTUBE_API_KEY=xxx npx tsx scripts/harvest-videos.ts --teacher rupert-spira
 *   YOUTUBE_API_KEY=xxx npx tsx scripts/harvest-videos.ts --min-views 50000
 *   YOUTUBE_API_KEY=xxx npx tsx scripts/harvest-videos.ts --max-per-teacher 5
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TEACHERS_DIR = join(__dirname, "..", "data", "teachers");
const RESOURCES_DIR = join(__dirname, "..", "data", "resources");
const YOUTUBE_SEARCH_API = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_API = "https://www.googleapis.com/youtube/v3/videos";
const DEFAULT_MIN_VIEWS = 10_000;
const DEFAULT_MAX_PER_TEACHER = 10;
const SEARCH_RESULTS = 25; // fetch 25, filter down to top N by views
const RATE_LIMIT_MS = 200;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Teacher {
  name: string;
  slug: string;
  traditions: string[];
}

interface VideoCandidate {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
}

interface VideoStats {
  viewCount: number;
  likeCount: number;
  duration: string;
}

interface ResourceFile {
  title: string;
  slug: string;
  type: "video";
  category: "web_resource";
  url: string;
  author: string;
  year: number | null;
  description: string;
  traditions: string[];
  teachers: string[];
  centers: string[];
}

// ---------------------------------------------------------------------------
// Exclusion — filter out non-teaching content
// ---------------------------------------------------------------------------

const TITLE_EXCLUSIONS = [
  "shorts",
  "#shorts",
  "reaction",
  "reacts to",
  "parody",
  "comedy",
  "meme",
  "asmr",
  "unboxing",
  "trailer",
  "teaser",
  "promo",
  "ad ",
  "advertisement",
  "behind the scenes",
  "bloopers",
];

function isExcludedVideo(title: string): boolean {
  const lower = title.toLowerCase();
  return TITLE_EXCLUSIONS.some((ex) => lower.includes(ex));
}

/** Parse ISO 8601 duration (PT1H23M45S) to seconds */
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] ?? "0");
  const m = parseInt(match[2] ?? "0");
  const s = parseInt(match[3] ?? "0");
  return h * 3600 + m * 60 + s;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(title: string, teacherSlug: string): string {
  const base = `${teacherSlug}-${title}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base;
}

// ---------------------------------------------------------------------------
// YouTube API
// ---------------------------------------------------------------------------

async function searchVideos(
  apiKey: string,
  teacherName: string,
): Promise<VideoCandidate[]> {
  // Search for talks/teachings, not random mentions
  const query = `${teacherName} talk OR teaching OR meditation OR interview`;
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(SEARCH_RESULTS),
    order: "viewCount",
    videoDuration: "medium", // 4-20 min — filters out shorts and full retreats
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_SEARCH_API}?${params}`);
  if (!res.ok) {
    const body = await res.text();
    console.error(`  ✗ YouTube Search API error: ${res.status} ${body}`);
    return [];
  }
  const data = await res.json();

  return (data.items ?? []).map(
    (item: {
      id: { videoId: string };
      snippet: {
        title: string;
        channelTitle: string;
        publishedAt: string;
        description: string;
      };
    }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      description: item.snippet.description,
    }),
  );
}

async function getVideoStats(
  apiKey: string,
  videoIds: string[],
): Promise<Map<string, VideoStats>> {
  const map = new Map<string, VideoStats>();
  if (videoIds.length === 0) return map;

  const params = new URLSearchParams({
    part: "statistics,contentDetails",
    id: videoIds.join(","),
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_VIDEOS_API}?${params}`);
  if (!res.ok) return map;
  const data = await res.json();

  for (const item of data.items ?? []) {
    map.set(item.id, {
      viewCount: parseInt(item.statistics.viewCount ?? "0"),
      likeCount: parseInt(item.statistics.likeCount ?? "0"),
      duration: item.contentDetails.duration,
    });
  }
  return map;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("Error: YOUTUBE_API_KEY environment variable required.");
    console.error(
      "Get one at: https://console.cloud.google.com/apis/credentials",
    );
    console.error("Enable 'YouTube Data API v3' in your Google Cloud project.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const writeMode = args.includes("--write");
  const teacherFlag = args.indexOf("--teacher");
  const teacherSlug = teacherFlag !== -1 ? args[teacherFlag + 1] : undefined;
  const minViewsFlag = args.indexOf("--min-views");
  const minViews =
    minViewsFlag !== -1
      ? parseInt(args[minViewsFlag + 1])
      : DEFAULT_MIN_VIEWS;
  const maxFlag = args.indexOf("--max-per-teacher");
  const maxPerTeacher =
    maxFlag !== -1 ? parseInt(args[maxFlag + 1]) : DEFAULT_MAX_PER_TEACHER;

  // Load existing resources for dedup
  const existingUrls = new Set<string>();
  const existingSlugs = new Set<string>();
  for (const f of readdirSync(RESOURCES_DIR).filter((f) =>
    f.endsWith(".json"),
  )) {
    existingSlugs.add(f.replace(".json", ""));
    const data = JSON.parse(readFileSync(join(RESOURCES_DIR, f), "utf-8"));
    if (data.url) existingUrls.add(data.url);
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
    `\n🎬 Video Harvester — ${writeMode ? "WRITE" : "DRY-RUN"} mode`,
  );
  console.log(`   ${teachers.length} teachers, min ${formatViews(minViews)} views, max ${maxPerTeacher}/teacher`);
  console.log(`   ${existingSlugs.size} existing resources\n`);

  let totalNew = 0;
  let totalSkipped = 0;
  let totalFiltered = 0;
  const allCandidates: ResourceFile[] = [];

  for (const teacher of teachers) {
    console.log(`\n─── ${teacher.name} ───`);

    const candidates = await searchVideos(apiKey, teacher.name);
    if (candidates.length === 0) {
      console.log("  (no results)");
      await sleep(RATE_LIMIT_MS);
      continue;
    }

    // Get stats for all candidates in one batch call
    const stats = await getVideoStats(
      apiKey,
      candidates.map((c) => c.videoId),
    );

    // Filter, sort by views, take top N
    const scored = candidates
      .filter((c) => {
        const url = `https://www.youtube.com/watch?v=${c.videoId}`;
        if (existingUrls.has(url)) {
          console.log(`  → EXISTING: "${c.title}"`);
          totalSkipped++;
          return false;
        }
        if (isExcludedVideo(c.title)) {
          totalFiltered++;
          return false;
        }
        const s = stats.get(c.videoId);
        if (!s || s.viewCount < minViews) {
          totalFiltered++;
          return false;
        }
        // Filter out very short (<3 min) or very long (>2 hr) videos
        const seconds = parseDuration(s.duration);
        if (seconds < 180 || seconds > 7200) {
          totalFiltered++;
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const sa = stats.get(a.videoId)!;
        const sb = stats.get(b.videoId)!;
        return sb.viewCount - sa.viewCount;
      })
      .slice(0, maxPerTeacher);

    for (const video of scored) {
      const s = stats.get(video.videoId)!;
      const slug = slugify(video.title, teacher.slug);

      if (existingSlugs.has(slug)) {
        console.log(`  → EXISTING (slug): "${video.title}"`);
        totalSkipped++;
        continue;
      }

      const year = video.publishedAt
        ? parseInt(video.publishedAt.slice(0, 4))
        : null;

      const resource: ResourceFile = {
        title: video.title,
        slug,
        type: "video",
        category: "web_resource",
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
        author: teacher.name,
        year,
        description: video.description.slice(0, 300).replace(/\s+/g, " ").trim(),
        traditions: [...teacher.traditions],
        teachers: [teacher.slug],
        centers: [],
      };

      console.log(
        `  ✓ NEW: "${video.title}" (${formatViews(s.viewCount)} views, ${formatViews(s.likeCount)} likes)`,
      );

      allCandidates.push(resource);
      existingSlugs.add(slug);
      existingUrls.add(resource.url);
      totalNew++;
    }

    await sleep(RATE_LIMIT_MS);
  }

  // Summary
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  New:      ${totalNew}`);
  console.log(`  Existing: ${totalSkipped}`);
  console.log(`  Filtered: ${totalFiltered} (low views, excluded, too short/long)`);
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
    console.log("No new videos found.");
  }
}

main().catch(console.error);
