import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import {
  getAllTeachers,
  getTeacher,
  getAllCenters,
  getCenter,
  getAllTraditions,
  getTradition,
  getTeachersByTradition,
  getCentersByTradition,
  getRelatedTraditions,
} from "../data";

describe("getAllTeachers", () => {
  it("returns all teachers as typed array", () => {
    const teachers = getAllTeachers();
    expect(teachers.length).toBeGreaterThanOrEqual(3);
    for (const t of teachers) {
      expect(t.slug).toBeDefined();
      expect(t.name).toBeDefined();
      expect(Array.isArray(t.traditions)).toBe(true);
    }
  });
});

describe("getTeacher", () => {
  it("returns a teacher by slug", () => {
    const teacher = getTeacher("gil-fronsdal");
    expect(teacher).toBeDefined();
    expect(teacher!.name).toBe("Gil Fronsdal");
    expect(teacher!.traditions).toContain("theravada");
  });

  it("returns undefined for unknown slug", () => {
    expect(getTeacher("nonexistent")).toBeUndefined();
  });
});

describe("getAllCenters", () => {
  it("returns all centers as typed array", () => {
    const centers = getAllCenters();
    expect(centers.length).toBeGreaterThanOrEqual(3);
    for (const c of centers) {
      expect(c.slug).toBeDefined();
      expect(c.name).toBeDefined();
    }
  });
});

describe("getCenter", () => {
  it("returns a center by slug", () => {
    const center = getCenter("spirit-rock");
    expect(center).toBeDefined();
    expect(center!.name).toBe("Spirit Rock Meditation Center");
  });

  it("returns undefined for unknown slug", () => {
    expect(getCenter("nonexistent")).toBeUndefined();
  });
});

describe("getAllTraditions", () => {
  it("returns all traditions with parsed frontmatter and content", () => {
    const traditions = getAllTraditions();
    expect(traditions.length).toBeGreaterThanOrEqual(5);
    for (const t of traditions) {
      expect(t.slug).toBeDefined();
      expect(t.name).toBeDefined();
      expect(t.family).toBeDefined();
      expect(t.summary).toBeDefined();
      expect(t.content.length).toBeGreaterThan(0);
      expect(Array.isArray(t.connections)).toBe(true);
    }
  });
});

describe("getTradition", () => {
  it("returns a tradition with MDX content", () => {
    const tradition = getTradition("advaita-vedanta");
    expect(tradition).toBeDefined();
    expect(tradition!.name).toBe("Advaita Vedanta");
    expect(tradition!.family).toBe("Hindu");
    expect(tradition!.content).toContain("# Advaita Vedanta");
    expect(tradition!.connections.length).toBeGreaterThan(0);
  });

  it("returns undefined for unknown slug", () => {
    expect(getTradition("nonexistent")).toBeUndefined();
  });
});

describe("getTeachersByTradition", () => {
  it("returns teachers matching a tradition slug", () => {
    const teachers = getTeachersByTradition("theravada");
    expect(teachers.length).toBeGreaterThanOrEqual(1);
    expect(teachers.some((t) => t.slug === "gil-fronsdal")).toBe(true);
  });

  it("returns empty array for tradition with no teachers", () => {
    expect(getTeachersByTradition("nonexistent")).toEqual([]);
  });
});

describe("getCentersByTradition", () => {
  it("returns centers matching a tradition slug", () => {
    const centers = getCentersByTradition("theravada");
    expect(centers.length).toBeGreaterThanOrEqual(1);
    expect(centers.some((c) => c.slug === "spirit-rock")).toBe(true);
  });
});

describe("getRelatedTraditions", () => {
  it("returns connected traditions with connection metadata", () => {
    const related = getRelatedTraditions("advaita-vedanta");
    expect(related.length).toBeGreaterThan(0);
    const kashmir = related.find((r) => r.slug === "kashmir-shaivism");
    expect(kashmir).toBeDefined();
    expect(kashmir!.connection.connection_type).toBe("related_to");
    expect(kashmir!.connection.description.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown tradition", () => {
    expect(getRelatedTraditions("nonexistent")).toEqual([]);
  });
});

// -- Security & Error Handling --

describe("slug validation", () => {
  it("rejects path traversal attempts", () => {
    expect(() => getTeacher("../../etc/passwd")).toThrow("Invalid slug");
    expect(() => getCenter("../teachers/gil-fronsdal")).toThrow("Invalid slug");
    expect(() => getTradition("foo/bar")).toThrow("Invalid slug");
  });
});

describe("malformed file handling", () => {
  const tmpDir = join(process.cwd(), "data", "teachers");
  const malformedFile = join(tmpDir, "_test-malformed.json");
  const invalidShapeFile = join(tmpDir, "_test-invalid-shape.json");

  beforeEach(() => {
    writeFileSync(malformedFile, "{ not valid json !!!");
    writeFileSync(invalidShapeFile, JSON.stringify({ name: 123, oops: true }));
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    try { rmSync(malformedFile); } catch {}
    try { rmSync(invalidShapeFile); } catch {}
    vi.restoreAllMocks();
  });

  it("skips malformed JSON files and still returns valid ones", () => {
    const teachers = getAllTeachers();
    expect(teachers.length).toBeGreaterThanOrEqual(3);
    expect(teachers.every((t) => !t.slug.startsWith("_test"))).toBe(true);
    expect(console.warn).toHaveBeenCalled();
  });

  it("returns undefined for malformed single file", () => {
    // _test-malformed exists but is not valid JSON
    expect(getTeacher("_test-malformed")).toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });

  it("returns undefined for file with invalid shape", () => {
    expect(getTeacher("_test-invalid-shape")).toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });
});
