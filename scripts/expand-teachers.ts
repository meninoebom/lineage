/**
 * Teacher expansion pipeline — CLI entry point.
 *
 * Usage:
 *   npx tsx scripts/expand-teachers.ts --source podcast
 *   npx tsx scripts/expand-teachers.ts --source all
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";
import { classifyCandidate, type RawCandidate, type Classification } from "./lib/classify";
import { generateTeacherJson, type AcceptedCandidate } from "./lib/generate-teacher";
import { scrapePodcast } from "./scrape-podcast";

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const sourceIdx = args.indexOf("--source");
const source = sourceIdx !== -1 ? args[sourceIdx + 1] : "all";

if (!["podcast", "centers", "all"].includes(source)) {
  console.error(`Unknown source: ${source}. Use --source podcast|centers|all`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = join(__dirname, "..");
const TEACHERS_DIR = join(ROOT, "data", "teachers");
const LLM_DIR = join(ROOT, ".llm");

// ---------------------------------------------------------------------------
// Load existing teacher names
// ---------------------------------------------------------------------------

function loadExistingTeacherNames(): string[] {
  const files = readdirSync(TEACHERS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const data = JSON.parse(readFileSync(join(TEACHERS_DIR, f), "utf-8"));
    return data.name as string;
  });
}

// ---------------------------------------------------------------------------
// Gather candidates from sources
// ---------------------------------------------------------------------------

function gatherCandidates(src: string): RawCandidate[] {
  const candidates: RawCandidate[] = [];

  if (src === "podcast" || src === "all") {
    candidates.push(...scrapePodcast());
  }

  if (src === "centers") {
    console.log("⚠  Centers source not yet implemented (see #108)");
  }

  return candidates;
}

// ---------------------------------------------------------------------------
// Pipeline result types
// ---------------------------------------------------------------------------

interface PipelineRow {
  index: number;
  name: string;
  status: "accepted" | "rejected" | "duplicate";
  traditions: string[];
  reason: string;
  source: string;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

function run() {
  console.log(`\nTeacher expansion pipeline — source: ${source}\n`);

  const existingNames = loadExistingTeacherNames();
  console.log(`Loaded ${existingNames.length} existing teachers for dedup.\n`);

  const candidates = gatherCandidates(source);
  console.log(`Found ${candidates.length} candidates from source(s).\n`);

  const rows: PipelineRow[] = [];
  const acceptedCandidates: { candidate: AcceptedCandidate; source: string }[] = [];
  const centerLeads: { name: string; source: string }[] = [];

  // Track names within this batch for intra-batch dedup
  const batchNames: string[] = [...existingNames];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const classification: Classification = classifyCandidate(c, batchNames);

    const row: PipelineRow = {
      index: i + 1,
      name: c.name,
      status: classification.status,
      traditions: classification.traditions,
      reason: classification.reject_reason ?? "—",
      source: c.source,
    };

    if (classification.status === "accepted") {
      // Add to batch names for intra-batch dedup
      batchNames.push(c.name);

      acceptedCandidates.push({
        candidate: {
          name: c.name,
          bio: c.bio,
          traditions: classification.traditions,
          location: null,
          website: null,
        },
        source: c.source,
      });

      // Track as potential center lead
      centerLeads.push({ name: c.name, source: c.source });
    }

    if (classification.reject_reason === "duplicate") {
      row.status = "duplicate";
    }

    rows.push(row);
  }

  // -------------------------------------------------------------------------
  // Write accepted teacher JSON files
  // -------------------------------------------------------------------------

  let written = 0;
  let skipped = 0;

  for (const { candidate } of acceptedCandidates) {
    const teacher = generateTeacherJson(candidate);
    const filePath = join(TEACHERS_DIR, `${teacher.slug}.json`);

    if (existsSync(filePath)) {
      skipped++;
      continue;
    }

    writeFileSync(filePath, JSON.stringify(teacher, null, 2) + "\n");
    written++;
  }

  // -------------------------------------------------------------------------
  // Summary table
  // -------------------------------------------------------------------------

  const accepted = rows.filter((r) => r.status === "accepted").length;
  const rejected = rows.filter((r) => r.status === "rejected").length;
  const duplicates = rows.filter((r) => r.status === "duplicate").length;

  const tableHeader = "| # | Name | Status | Traditions | Reason | Source |";
  const tableSep = "|---|------|--------|------------|--------|--------|";
  const tableRows = rows.map(
    (r) =>
      `| ${r.index} | ${r.name} | ${r.status} | ${r.traditions.join(", ") || "—"} | ${r.reason} | ${r.source} |`,
  );

  const summaryLine = `\nAccepted: ${accepted} | Rejected: ${rejected} | Duplicates: ${duplicates}`;
  const writeLine = `Written: ${written} new files | Skipped: ${skipped} (already exist)`;

  const fullTable = [tableHeader, tableSep, ...tableRows, "", summaryLine, writeLine].join("\n");

  console.log(fullTable);

  // -------------------------------------------------------------------------
  // Write pipeline results to .llm/
  // -------------------------------------------------------------------------

  if (!existsSync(LLM_DIR)) {
    mkdirSync(LLM_DIR, { recursive: true });
  }

  writeFileSync(
    join(LLM_DIR, "pipeline-results.md"),
    `# Pipeline Results — ${new Date().toISOString().slice(0, 10)}\n\nSource: ${source}\n\n${fullTable}\n`,
  );

  // -------------------------------------------------------------------------
  // Write center leads
  // -------------------------------------------------------------------------

  if (centerLeads.length > 0) {
    const leadsContent = [
      `# Center Leads — ${new Date().toISOString().slice(0, 10)}`,
      "",
      "Teachers accepted by the pipeline who may be associated with centers.",
      "Use these as starting points for center discovery (see #108).",
      "",
      ...centerLeads.map((l) => `- ${l.name} (source: ${l.source})`),
      "",
    ].join("\n");

    writeFileSync(join(LLM_DIR, "center-leads.md"), leadsContent);
  }

  console.log(`\nResults saved to .llm/pipeline-results.md`);
  console.log(`Center leads saved to .llm/center-leads.md`);
}

run();
