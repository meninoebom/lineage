import { describe, it, expect } from "vitest";
import { getAllTraditions, getTradition, getTeachersByTradition, getCentersByTradition, getRelatedTraditions } from "@/lib/data";

describe("Tradition pages data", () => {
  it("generateStaticParams would return all tradition slugs", () => {
    const traditions = getAllTraditions();
    const params = traditions.map((t) => ({ slug: t.slug }));
    expect(params.length).toBeGreaterThanOrEqual(5);
    expect(params).toContainEqual({ slug: "advaita-vedanta" });
    expect(params).toContainEqual({ slug: "zen" });
  });

  it("tradition detail page has all required data", () => {
    const tradition = getTradition("advaita-vedanta");
    expect(tradition).toBeDefined();
    expect(tradition!.name).toBe("Advaita Vedanta");
    expect(tradition!.family).toBe("Vedic-Yogic");
    expect(tradition!.summary.length).toBeGreaterThan(0);
    expect(tradition!.content).toContain("# Advaita Vedanta");
  });

  it("tradition page can resolve teachers in tradition", () => {
    const teachers = getTeachersByTradition("theravada");
    expect(teachers.length).toBeGreaterThanOrEqual(1);
    expect(teachers[0].name).toBeDefined();
    expect(teachers[0].slug).toBeDefined();
  });

  it("tradition page can resolve centers in tradition", () => {
    const centers = getCentersByTradition("theravada");
    expect(centers.length).toBeGreaterThanOrEqual(1);
  });

  it("tradition page can resolve related traditions", () => {
    const related = getRelatedTraditions("advaita-vedanta");
    expect(related.length).toBeGreaterThan(0);
    const first = related[0];
    expect(first.name).toBeDefined();
    expect(first.slug).toBeDefined();
    expect(first.connection.connection_type).toBeDefined();
    expect(first.connection.description.length).toBeGreaterThan(0);
  });

  it("traditions index can group by family", () => {
    const traditions = getAllTraditions();
    const grouped = new Map<string, typeof traditions>();
    for (const t of traditions) {
      const group = grouped.get(t.family) ?? [];
      group.push(t);
      grouped.set(t.family, group);
    }
    expect(grouped.size).toBeGreaterThanOrEqual(2);
    expect(grouped.has("Buddhist")).toBe(true);
    expect(grouped.has("Vedic-Yogic")).toBe(true);
  });
});
