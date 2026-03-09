import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import type { Teacher, Center, TraditionFamily, ConnectionType } from "../types";

const DATA_DIR = join(process.cwd(), "data");
const VALID_FAMILIES: TraditionFamily[] = [
  "Buddhist",
  "Hindu",
  "Modern Non-Dual",
  "Yogic",
  "Other",
];
const VALID_CONNECTION_TYPES: ConnectionType[] = [
  "influenced_by",
  "branch_of",
  "related_to",
];

function readJsonFiles<T>(subdir: string): { name: string; data: T }[] {
  const dir = join(DATA_DIR, subdir);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      name: f,
      data: JSON.parse(readFileSync(join(dir, f), "utf-8")) as T,
    }));
}

describe("Teacher seed data", () => {
  const teachers = readJsonFiles<Teacher>("teachers");

  it("has at least 3 teachers", () => {
    expect(teachers.length).toBeGreaterThanOrEqual(3);
  });

  it.each(teachers.map((t) => [t.name, t.data]))(
    "%s has all required fields",
    (_name, teacher) => {
      expect(typeof teacher.name).toBe("string");
      expect(typeof teacher.slug).toBe("string");
      expect(typeof teacher.bio).toBe("string");
      expect(teacher.bio.length).toBeGreaterThan(0);
      expect(typeof teacher.city).toBe("string");
      expect(typeof teacher.state).toBe("string");
      expect(typeof teacher.country).toBe("string");
      expect(Array.isArray(teacher.traditions)).toBe(true);
      expect(teacher.traditions.length).toBeGreaterThan(0);
      expect(Array.isArray(teacher.centers)).toBe(true);
      // Nullable fields
      expect(
        teacher.photo === null || typeof teacher.photo === "string"
      ).toBe(true);
      expect(
        teacher.website === null || typeof teacher.website === "string"
      ).toBe(true);
      expect(
        teacher.latitude === null || typeof teacher.latitude === "number"
      ).toBe(true);
      expect(
        teacher.longitude === null || typeof teacher.longitude === "number"
      ).toBe(true);
      // lat/lng must both be present or both be null
      expect(teacher.latitude === null).toBe(teacher.longitude === null);
    }
  );

  it("slugs match filenames", () => {
    for (const { name, data } of teachers) {
      expect(data.slug).toBe(name.replace(".json", ""));
    }
  });
});

describe("Center seed data", () => {
  const centers = readJsonFiles<Center>("centers");

  it("has at least 3 centers", () => {
    expect(centers.length).toBeGreaterThanOrEqual(3);
  });

  it.each(centers.map((c) => [c.name, c.data]))(
    "%s has all required fields",
    (_name, center) => {
      expect(typeof center.name).toBe("string");
      expect(typeof center.slug).toBe("string");
      expect(typeof center.description).toBe("string");
      expect(center.description.length).toBeGreaterThan(0);
      expect(typeof center.city).toBe("string");
      expect(typeof center.state).toBe("string");
      expect(typeof center.country).toBe("string");
      expect(Array.isArray(center.traditions)).toBe(true);
      expect(center.traditions.length).toBeGreaterThan(0);
      expect(Array.isArray(center.teachers)).toBe(true);
      // Nullable fields
      expect(
        center.website === null || typeof center.website === "string"
      ).toBe(true);
      expect(
        center.latitude === null || typeof center.latitude === "number"
      ).toBe(true);
      expect(
        center.longitude === null || typeof center.longitude === "number"
      ).toBe(true);
      // lat/lng must both be present or both be null
      expect(center.latitude === null).toBe(center.longitude === null);
    }
  );

  it("slugs match filenames", () => {
    for (const { name, data } of centers) {
      expect(data.slug).toBe(name.replace(".json", ""));
    }
  });
});

function readTraditionFrontmatter() {
  const dir = join(DATA_DIR, "traditions");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf-8");
      const { data, content } = matter(raw);
      return { name: f, data, content };
    });
}

describe("Tradition seed data", () => {
  const traditions = readTraditionFrontmatter();

  it("has at least 5 tradition MDX files", () => {
    expect(traditions.length).toBeGreaterThanOrEqual(5);
  });

  it.each(traditions.map((t) => [t.name, t.data]))(
    "%s has valid frontmatter",
    (_name, data) => {
      expect(typeof data.name).toBe("string");
      expect(typeof data.slug).toBe("string");
      expect(VALID_FAMILIES).toContain(data.family);
      expect(typeof data.summary).toBe("string");
      expect(Array.isArray(data.connections)).toBe(true);
      for (const conn of data.connections) {
        expect(typeof conn.tradition_slug).toBe("string");
        expect(VALID_CONNECTION_TYPES).toContain(conn.connection_type);
        expect(typeof conn.description).toBe("string");
      }
    }
  );

  it("slugs match filenames", () => {
    for (const { name, data } of traditions) {
      expect(data.slug).toBe(name.replace(".mdx", ""));
    }
  });

  it("editorial content is substantial (500+ words)", () => {
    for (const { name, content } of traditions) {
      const wordCount = content.trim().split(/\s+/).length;
      expect(wordCount, `${name} has only ${wordCount} words`).toBeGreaterThanOrEqual(500);
    }
  });

  it("connection slugs reference existing traditions", () => {
    const slugs = traditions.map((t) => t.data.slug);
    for (const { data } of traditions) {
      for (const conn of data.connections) {
        expect(slugs, `${data.slug} references unknown tradition ${conn.tradition_slug}`).toContain(conn.tradition_slug);
      }
    }
  });
});

describe("Cross-references", () => {
  const teachers = readJsonFiles<Teacher>("teachers");
  const centers = readJsonFiles<Center>("centers");
  const traditionDir = join(DATA_DIR, "traditions");
  const traditionSlugs = readdirSync(traditionDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""));

  it("teacher tradition slugs reference existing traditions", () => {
    for (const { data } of teachers) {
      for (const tSlug of data.traditions) {
        expect(traditionSlugs).toContain(tSlug);
      }
    }
  });

  it("center tradition slugs reference existing traditions", () => {
    for (const { data } of centers) {
      for (const tSlug of data.traditions) {
        expect(traditionSlugs).toContain(tSlug);
      }
    }
  });

  it("teacher→center references are reciprocated", () => {
    const centerMap = new Map(centers.map((c) => [c.data.slug, c.data]));
    for (const { data: teacher } of teachers) {
      for (const centerSlug of teacher.centers) {
        const center = centerMap.get(centerSlug);
        expect(center, `teacher ${teacher.slug} references unknown center ${centerSlug}`).toBeDefined();
        expect(center!.teachers).toContain(teacher.slug);
      }
    }
  });

  it("center→teacher references are reciprocated", () => {
    const teacherMap = new Map(teachers.map((t) => [t.data.slug, t.data]));
    for (const { data: center } of centers) {
      for (const teacherSlug of center.teachers) {
        const teacher = teacherMap.get(teacherSlug);
        expect(teacher, `center ${center.slug} references unknown teacher ${teacherSlug}`).toBeDefined();
        expect(teacher!.centers).toContain(center.slug);
      }
    }
  });
});
