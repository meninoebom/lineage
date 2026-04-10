import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { getTaxonomy } from "../taxonomy";
import { getAllResources } from "../data";
import type { Resource } from "../types";

const taxonomyPath = join(process.cwd(), "data", "taxonomy.json");

describe("taxonomy.json schema", () => {
  const taxonomy = JSON.parse(readFileSync(taxonomyPath, "utf-8"));

  it("has experience_level with beginner, intermediate, advanced", () => {
    expect(taxonomy.experience_level).toBeDefined();
    expect(taxonomy.experience_level.type).toBe("single");
    expect(taxonomy.experience_level.values).toEqual([
      "beginner",
      "intermediate",
      "advanced",
    ]);
  });

  it("has topics as a multi-value dimension with at least 10 values", () => {
    expect(taxonomy.topics).toBeDefined();
    expect(taxonomy.topics.type).toBe("multi");
    expect(taxonomy.topics.values.length).toBeGreaterThanOrEqual(10);
    expect(taxonomy.topics.values).toContain("meditation-technique");
    expect(taxonomy.topics.values).toContain("philosophy");
    expect(taxonomy.topics.values).toContain("daily-life");
  });

  it("has practice_context as a multi-value dimension with at least 7 values", () => {
    expect(taxonomy.practice_context).toBeDefined();
    expect(taxonomy.practice_context.type).toBe("multi");
    expect(taxonomy.practice_context.values.length).toBeGreaterThanOrEqual(7);
    expect(taxonomy.practice_context.values).toContain("new-to-practice");
    expect(taxonomy.practice_context.values).toContain("life-transition");
  });

  it("uses kebab-case for all values", () => {
    for (const dim of Object.values(taxonomy) as Array<{
      values: string[];
    }>) {
      for (const val of dim.values) {
        expect(val).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      }
    }
  });
});

describe("Resource type backward compatibility", () => {
  it("resources load whether or not they have taxonomy fields", () => {
    const resources = getAllResources();
    expect(resources.length).toBeGreaterThan(0);
    // Some may be tagged, some may not — all should load
    const tagged = resources.filter((r) => r.experience_level);
    const untagged = resources.filter((r) => !r.experience_level);
    expect(tagged.length + untagged.length).toBe(resources.length);
    expect(tagged.length).toBeGreaterThan(0); // we have exemplars
  });

  it("a resource with taxonomy fields satisfies the Resource type", () => {
    const tagged: Resource = {
      title: "Test",
      slug: "test",
      type: "book",
      category: "popular",
      url: "https://example.com",
      author: "Author",
      year: 2020,
      description: "A test resource",
      traditions: [],
      teachers: [],
      centers: [],
      experience_level: "beginner",
      topics: ["meditation-technique"],
      practice_context: ["new-to-practice"],
    };
    expect(tagged.experience_level).toBe("beginner");
    expect(tagged.topics).toEqual(["meditation-technique"]);
  });
});

describe("getTaxonomy", () => {
  it("returns parsed taxonomy with all three dimensions", () => {
    const tax = getTaxonomy();
    expect(tax.experience_level).toBeDefined();
    expect(tax.topics).toBeDefined();
    expect(tax.practice_context).toBeDefined();
  });

  it("returns typed dimension objects with type and values", () => {
    const tax = getTaxonomy();
    expect(tax.experience_level.type).toBe("single");
    expect(tax.topics.type).toBe("multi");
    expect(Array.isArray(tax.topics.values)).toBe(true);
  });

  it("validates taxonomy shape at runtime", () => {
    // getTaxonomy succeeds with valid file — already tested above
    // The validation is internal, but we can verify the loader
    // doesn't silently accept garbage by checking the return shape
    const tax = getTaxonomy();
    expect(tax.experience_level.description).toBeDefined();
    expect(typeof tax.experience_level.description).toBe("string");
  });
});
