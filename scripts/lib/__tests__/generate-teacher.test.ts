import { describe, it, expect } from "vitest";
import { generateTeacherJson } from "../generate-teacher";
import type { AcceptedCandidate } from "../generate-teacher";

function isTeacher(obj: unknown): obj is Record<string, unknown> {
  const t = obj as Record<string, unknown>;
  return (
    typeof t.name === "string" &&
    typeof t.slug === "string" &&
    typeof t.bio === "string" &&
    (t.birth_year === null || t.birth_year === undefined || typeof t.birth_year === "number") &&
    (t.death_year === null || t.death_year === undefined || typeof t.death_year === "number") &&
    typeof t.city === "string" &&
    typeof t.state === "string" &&
    typeof t.country === "string" &&
    Array.isArray(t.traditions) &&
    Array.isArray(t.centers)
  );
}

const fullCandidate: AcceptedCandidate = {
  name: "Ram Dass",
  bio: "American spiritual teacher and author of Be Here Now.",
  traditions: ["hinduism", "bhakti"],
  location: { city: "Maui", state: "HI", country: "US" },
  website: "https://ramdass.org",
};

describe("generateTeacherJson", () => {
  it("generates a complete teacher with all fields", () => {
    const teacher = generateTeacherJson(fullCandidate);
    expect(teacher.name).toBe("Ram Dass");
    expect(teacher.bio).toBe("American spiritual teacher and author of Be Here Now.");
    expect(teacher.website).toBe("https://ramdass.org");
    expect(teacher.city).toBe("Maui");
    expect(teacher.state).toBe("HI");
    expect(teacher.country).toBe("US");
    expect(teacher.photo).toBeNull();
    expect(teacher.birth_year).toBeNull();
    expect(teacher.death_year).toBeNull();
    expect(teacher.latitude).toBeNull();
    expect(teacher.longitude).toBeNull();
    expect(teacher.centers).toEqual([]);
  });

  it("generates slug: spaces to hyphens, lowercase", () => {
    const teacher = generateTeacherJson(fullCandidate);
    expect(teacher.slug).toBe("ram-dass");
  });

  it("generates slug: strips diacritics", () => {
    const teacher = generateTeacherJson({
      ...fullCandidate,
      name: "Thích Nhất Hạnh",
    });
    expect(teacher.slug).toBe("thich-nhat-hanh");
  });

  it("generates slug: removes apostrophes", () => {
    const teacher = generateTeacherJson({
      ...fullCandidate,
      name: "Christopher 'Hareesh' Wallis",
    });
    expect(teacher.slug).toBe("christopher-hareesh-wallis");
  });

  it("uses empty strings when location is null", () => {
    const teacher = generateTeacherJson({
      ...fullCandidate,
      location: null,
    });
    expect(teacher.city).toBe("");
    expect(teacher.state).toBe("");
    expect(teacher.country).toBe("");
  });

  it("passes the isTeacher validator", () => {
    const teacher = generateTeacherJson(fullCandidate);
    expect(isTeacher(teacher)).toBe(true);
  });

  it("passes traditions array through correctly", () => {
    const teacher = generateTeacherJson(fullCandidate);
    expect(teacher.traditions).toEqual(["hinduism", "bhakti"]);
  });
});
