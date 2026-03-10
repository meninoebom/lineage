import { describe, it, expect } from "vitest";
import { getAllTeachers, getTeacher, getTradition } from "@/lib/data";

describe("Teacher pages data", () => {
  it("generateStaticParams would return all teacher slugs", () => {
    const teachers = getAllTeachers();
    const params = teachers.map((t) => ({ slug: t.slug }));
    expect(params.length).toBeGreaterThanOrEqual(3);
    expect(params).toContainEqual({ slug: "gil-fronsdal" });
  });

  it("teacher detail page has all required data", () => {
    const teacher = getTeacher("gil-fronsdal");
    expect(teacher).toBeDefined();
    expect(teacher!.name).toBe("Gil Fronsdal");
    expect(teacher!.bio.length).toBeGreaterThan(0);
    expect(teacher!.city).toBe("Redwood City");
    expect(teacher!.state).toBe("California");
    expect(teacher!.traditions.length).toBeGreaterThan(0);
  });

  it("teacher tradition slugs resolve to real traditions", () => {
    const teacher = getTeacher("gil-fronsdal")!;
    for (const slug of teacher.traditions) {
      const tradition = getTradition(slug);
      expect(tradition, `tradition ${slug} not found`).toBeDefined();
    }
  });

  it("handles teacher with no centers", () => {
    const teacher = getTeacher("rupert-spira");
    expect(teacher).toBeDefined();
    expect(teacher!.centers).toEqual([]);
  });

  it("handles teacher with no photo", () => {
    const teacher = getTeacher("gil-fronsdal");
    expect(teacher).toBeDefined();
    expect(teacher!.photo).toBeNull();
  });
});
