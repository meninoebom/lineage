#!/usr/bin/env npx tsx
/**
 * Claude-assisted taxonomy tagging for resources.
 *
 * Uses hand-tagged exemplars as few-shot examples to tag remaining resources
 * with experience_level, topics, and practice_context.
 *
 * Usage:
 *   npx tsx scripts/tag-resources.ts              # dry run (default)
 *   npx tsx scripts/tag-resources.ts --write       # write changes to files
 *   npx tsx scripts/tag-resources.ts --limit 10    # process only 10 resources
 */

import Anthropic from "@anthropic-ai/sdk";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// -- Types --

interface Resource {
  title: string;
  slug: string;
  type: string;
  category: string;
  description: string;
  traditions: string[];
  author: string | null;
  experience_level?: string;
  topics?: string[];
  practice_context?: string[];
  [key: string]: unknown;
}

interface TagResult {
  experience_level: string;
  topics: string[];
  practice_context: string[];
}

interface ProcessedResource {
  slug: string;
  title: string;
  tags: TagResult;
  confidence: "high" | "medium" | "low";
}

// -- Config --

const DATA_DIR = join(process.cwd(), "data");
const RESOURCES_DIR = join(DATA_DIR, "resources");
const TAXONOMY_PATH = join(DATA_DIR, "taxonomy.json");

const BATCH_SIZE = 10;
const RATE_LIMIT_DELAY_MS = 500;

// -- Parse args --

const args = process.argv.slice(2);
const dryRun = !args.includes("--write");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

// -- Load data --

function loadTaxonomy() {
  return JSON.parse(readFileSync(TAXONOMY_PATH, "utf-8"));
}

function loadAllResources(): Resource[] {
  return readdirSync(RESOURCES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(RESOURCES_DIR, f), "utf-8")));
}

function getExemplars(resources: Resource[]): Resource[] {
  return resources.filter(
    (r) => r.experience_level && r.topics?.length && r.practice_context?.length
  );
}

function getUntagged(resources: Resource[]): Resource[] {
  return resources.filter((r) => !r.experience_level);
}

// -- Prompt construction --

function buildSystemPrompt(
  taxonomy: Record<string, unknown>,
  exemplars: Resource[]
): string {
  const exemplarText = exemplars
    .map(
      (e) =>
        `Title: ${e.title}
Type: ${e.type} | Category: ${e.category}
Traditions: ${e.traditions.join(", ")}
Description: ${e.description.slice(0, 200)}
→ experience_level: ${e.experience_level}
→ topics: ${JSON.stringify(e.topics)}
→ practice_context: ${JSON.stringify(e.practice_context)}`
    )
    .join("\n\n");

  return `You are a taxonomy tagger for a contemplative traditions directory. Tag each resource with:

TAXONOMY SCHEMA:
${JSON.stringify(taxonomy, null, 2)}

RULES:
- experience_level: exactly one value. "beginner" = accessible to newcomers, "intermediate" = assumes some practice/study, "advanced" = requires significant background.
- topics: 1-4 values from the topics list. Pick what the resource is primarily ABOUT.
- practice_context: 1-3 values from the practice_context list. Pick WHO or WHEN this resource is for.
- For encyclopedia/academic articles, lean toward "academic" practice_context and "intermediate" experience_level.
- For primary texts, consider the original difficulty, not modern translations.
- When unsure, pick the more accessible level.

TAGGED EXAMPLES:
${exemplarText}

RESPONSE FORMAT:
Respond with ONLY valid JSON. For each resource, output:
{
  "results": [
    {
      "slug": "resource-slug",
      "experience_level": "beginner|intermediate|advanced",
      "topics": ["topic1", "topic2"],
      "practice_context": ["context1"],
      "confidence": "high|medium|low"
    }
  ]
}

Set confidence to "low" if the description is too short or vague to tag reliably.`;
}

function buildUserPrompt(batch: Resource[]): string {
  return (
    "Tag these resources:\n\n" +
    batch
      .map(
        (r) =>
          `slug: ${r.slug}
title: ${r.title}
type: ${r.type} | category: ${r.category}
traditions: ${r.traditions.join(", ")}
author: ${r.author ?? "unknown"}
description: ${r.description.slice(0, 300)}`
      )
      .join("\n---\n")
  );
}

// -- API call --

async function tagBatch(
  client: Anthropic,
  systemPrompt: string,
  batch: Resource[]
): Promise<ProcessedResource[]> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: buildUserPrompt(batch) }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Failed to parse response:", text.slice(0, 200));
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    console.error("Invalid JSON in response:", jsonMatch[0].slice(0, 200));
    return [];
  }
  if (!Array.isArray(parsed.results)) {
    console.error("Response missing 'results' array:", Object.keys(parsed));
    return [];
  }
  return parsed.results.map(
    (r: {
      slug: string;
      experience_level: string;
      topics: string[];
      practice_context: string[];
      confidence: string;
    }) => ({
      slug: r.slug,
      title: batch.find((b) => b.slug === r.slug)?.title ?? r.slug,
      tags: {
        experience_level: r.experience_level,
        topics: r.topics,
        practice_context: r.practice_context,
      },
      confidence: r.confidence as "high" | "medium" | "low",
    })
  );
}

// -- Validation --

function validateTags(
  result: ProcessedResource,
  taxonomy: Record<string, { values: string[] }>
): string[] {
  const errors: string[] = [];

  if (!taxonomy.experience_level.values.includes(result.tags.experience_level)) {
    errors.push(
      `Invalid experience_level "${result.tags.experience_level}" for ${result.slug}`
    );
  }

  for (const t of result.tags.topics) {
    if (!taxonomy.topics.values.includes(t)) {
      errors.push(`Invalid topic "${t}" for ${result.slug}`);
    }
  }

  for (const c of result.tags.practice_context) {
    if (!taxonomy.practice_context.values.includes(c)) {
      errors.push(`Invalid practice_context "${c}" for ${result.slug}`);
    }
  }

  if (result.tags.topics.length === 0) {
    errors.push(`No topics for ${result.slug}`);
  }

  if (result.tags.practice_context.length === 0) {
    errors.push(`No practice_context for ${result.slug}`);
  }

  return errors;
}

// -- Write back --

function writeResource(slug: string, tags: TagResult): void {
  const filePath = join(RESOURCES_DIR, `${slug}.json`);
  const resource = JSON.parse(readFileSync(filePath, "utf-8"));
  resource.experience_level = tags.experience_level;
  resource.topics = tags.topics;
  resource.practice_context = tags.practice_context;
  writeFileSync(filePath, JSON.stringify(resource, null, 2) + "\n");
}

// -- Main --

async function main() {
  console.log(`Mode: ${dryRun ? "DRY RUN" : "WRITE"}`);
  console.log();

  const taxonomy = loadTaxonomy();
  const allResources = loadAllResources();
  const exemplars = getExemplars(allResources);
  const untagged = getUntagged(allResources).slice(0, limit);

  console.log(`Total resources: ${allResources.length}`);
  console.log(`Already tagged (exemplars): ${exemplars.length}`);
  console.log(`To process: ${untagged.length}`);
  console.log();

  if (untagged.length === 0) {
    console.log("Nothing to tag!");
    return;
  }

  const client = new Anthropic();
  const systemPrompt = buildSystemPrompt(taxonomy, exemplars);

  const allResults: ProcessedResource[] = [];
  const allErrors: string[] = [];
  let lowConfidenceCount = 0;

  // Process in batches
  for (let i = 0; i < untagged.length; i += BATCH_SIZE) {
    const batch = untagged.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(untagged.length / BATCH_SIZE);

    console.log(
      `Batch ${batchNum}/${totalBatches} (${batch.length} resources)...`
    );

    try {
      const results = await tagBatch(client, systemPrompt, batch);

      for (const result of results) {
        const errors = validateTags(result, taxonomy);
        if (errors.length > 0) {
          allErrors.push(...errors);
          continue;
        }

        allResults.push(result);

        if (result.confidence === "low") {
          lowConfidenceCount++;
        }

        if (!dryRun) {
          writeResource(result.slug, result.tags);
        }
      }

      // Check for resources that weren't returned
      const returnedSlugs = new Set(results.map((r) => r.slug));
      for (const r of batch) {
        if (!returnedSlugs.has(r.slug)) {
          allErrors.push(`Missing from response: ${r.slug}`);
        }
      }
    } catch (err) {
      console.error(`  Error processing batch: ${err}`);
      allErrors.push(`Batch ${batchNum} failed: ${err}`);
    }

    // Rate limiting between batches
    if (i + BATCH_SIZE < untagged.length) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }
  }

  // -- Coverage report --

  console.log("\n========== COVERAGE REPORT ==========\n");

  const totalProcessed = allResults.length + exemplars.length;
  const totalResources = allResources.length;

  // Experience level coverage
  const withLevel = allResults.filter((r) => r.tags.experience_level).length + exemplars.length;
  console.log(
    `experience_level: ${withLevel}/${totalResources} (${((withLevel / totalResources) * 100).toFixed(1)}%)`
  );

  // Topics coverage
  const withTopics = allResults.filter((r) => r.tags.topics.length > 0).length + exemplars.length;
  console.log(
    `topics:           ${withTopics}/${totalResources} (${((withTopics / totalResources) * 100).toFixed(1)}%)`
  );

  // Practice context coverage
  const withContext =
    allResults.filter((r) => r.tags.practice_context.length > 0).length + exemplars.length;
  console.log(
    `practice_context: ${withContext}/${totalResources} (${((withContext / totalResources) * 100).toFixed(1)}%)`
  );

  console.log(`\nTotal processed: ${totalProcessed}/${totalResources}`);
  console.log(`Low confidence: ${lowConfidenceCount}`);

  if (lowConfidenceCount > 0) {
    console.log("\n--- Low confidence resources (review manually) ---");
    for (const r of allResults.filter((r) => r.confidence === "low")) {
      console.log(`  ${r.slug}: ${JSON.stringify(r.tags)}`);
    }
  }

  if (allErrors.length > 0) {
    console.log(`\n--- Errors (${allErrors.length}) ---`);
    for (const e of allErrors) {
      console.log(`  ${e}`);
    }
  }

  if (dryRun) {
    console.log("\n[DRY RUN] No files were modified. Use --write to apply.");

    // Show sample of what would be written
    console.log("\n--- Sample tagged resources ---");
    for (const r of allResults.slice(0, 5)) {
      console.log(`  ${r.title}`);
      console.log(`    level: ${r.tags.experience_level} | confidence: ${r.confidence}`);
      console.log(`    topics: ${r.tags.topics.join(", ")}`);
      console.log(`    context: ${r.tags.practice_context.join(", ")}`);
    }
  } else {
    console.log(`\n[WRITE] Updated ${allResults.length} resource files.`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
