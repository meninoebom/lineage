import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { Teacher, Center, Tradition, TraditionFamily, ConnectionType } from "../types";

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
    }
  );

  it("slugs match filenames", () => {
    for (const { name, data } of centers) {
      expect(data.slug).toBe(name.replace(".json", ""));
    }
  });
});

describe("Tradition seed data", () => {
  it("has at least 5 tradition MDX files", () => {
    const dir = join(DATA_DIR, "traditions");
    const files = readdirSync(dir).filter((f) => f.endsWith(".mdx"));
    expect(files.length).toBeGreaterThanOrEqual(5);
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

  it("teacher-center cross-references are consistent", () => {
    const centerMap = new Map(centers.map((c) => [c.data.slug, c.data]));
    for (const { data: teacher } of teachers) {
      for (const centerSlug of teacher.centers) {
        const center = centerMap.get(centerSlug);
        expect(center).toBeDefined();
        expect(center!.teachers).toContain(teacher.slug);
      }
    }
  });
});
