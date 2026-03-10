import { teacherJsonLd, centerJsonLd, traditionJsonLd, SITE_URL } from "../seo";
import type { Teacher, Center } from "../types";
import type { ParsedTradition } from "../data";

const mockTeacher: Teacher = {
  name: "Test Teacher",
  slug: "test-teacher",
  bio: "A test bio.",
  photo: null,
  website: "https://example.com",
  city: "San Francisco",
  state: "California",
  country: "US",
  latitude: 37.7749,
  longitude: -122.4194,
  traditions: ["zen"],
  centers: [],
};

const mockCenter: Center = {
  name: "Test Center",
  slug: "test-center",
  description: "A test center.",
  website: "https://example.com",
  city: "Oakland",
  state: "California",
  country: "US",
  latitude: 37.8044,
  longitude: -122.2712,
  traditions: ["zen"],
  teachers: ["test-teacher"],
};

const mockTradition: ParsedTradition = {
  name: "Zen",
  slug: "zen",
  family: "Buddhist",
  summary: "A school of Mahayana Buddhism.",
  connections: [],
  content: "# Zen\nContent here.",
};

describe("teacherJsonLd", () => {
  it("returns Person schema with correct fields", () => {
    const result = teacherJsonLd(mockTeacher);
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("Person");
    expect(result.name).toBe("Test Teacher");
    expect(result.url).toBe(`${SITE_URL}/teachers/test-teacher`);
    expect(result.sameAs).toEqual(["https://example.com"]);
  });

  it("includes geo coordinates when available", () => {
    const result = teacherJsonLd(mockTeacher);
    expect(result.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 37.7749,
      longitude: -122.4194,
    });
  });

  it("omits sameAs when no website", () => {
    const result = teacherJsonLd({ ...mockTeacher, website: null });
    expect(result.sameAs).toBeUndefined();
  });

  it("omits geo when coordinates are null", () => {
    const result = teacherJsonLd({
      ...mockTeacher,
      latitude: null,
      longitude: null,
    });
    expect(result.geo).toBeUndefined();
  });
});

describe("centerJsonLd", () => {
  it("returns Organization schema", () => {
    const result = centerJsonLd(mockCenter);
    expect(result["@type"]).toBe("Organization");
    expect(result.name).toBe("Test Center");
    expect(result.url).toBe(`${SITE_URL}/centers/test-center`);
  });
});

describe("traditionJsonLd", () => {
  it("returns Article schema", () => {
    const result = traditionJsonLd(mockTradition);
    expect(result["@type"]).toBe("Article");
    expect(result.headline).toBe("Zen");
    expect(result.description).toBe("A school of Mahayana Buddhism.");
  });
});
