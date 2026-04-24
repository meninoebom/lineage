import { describe, it, expect } from "vitest";
import type { Teacher, Center } from "../types";
import {
  filterTeachers,
  filterCenters,
  searchAll,
  getUniqueStates,
  getUniqueTraditions,
} from "../search";

const mockTeachers: Teacher[] = [
  {
    name: "Gil Fronsdal",
    slug: "gil-fronsdal",
    bio: "Theravada teacher",
    photo: null,
    website: null,
    city: "Redwood City",
    state: "California",
    country: "US",
    latitude: 37.48,
    longitude: -122.24,
    traditions: ["theravada", "zen"],
    centers: ["insight-meditation-center"],
    birth_year: null,
    death_year: null,
    teachers: [],
  },
  {
    name: "Rupert Spira",
    slug: "rupert-spira",
    bio: "Non-dual teacher",
    photo: null,
    website: null,
    city: "Oxford",
    state: "Oxfordshire",
    country: "UK",
    latitude: 51.75,
    longitude: -1.25,
    traditions: ["advaita-vedanta"],
    centers: [],
    birth_year: null,
    death_year: null,
    teachers: [],
  },
  {
    name: "Sally Kempton",
    slug: "sally-kempton",
    bio: "Kashmir Shaivism teacher",
    photo: null,
    website: null,
    city: "Big Sur",
    state: "California",
    country: "US",
    latitude: 36.27,
    longitude: -121.81,
    traditions: ["kashmir-shaivism"],
    centers: [],
    birth_year: null,
    death_year: null,
    teachers: [],
  },
];

const mockCenters: Center[] = [
  {
    name: "Spirit Rock Meditation Center",
    slug: "spirit-rock",
    description: "Retreat center in Marin County",
    photo: null,
    website: null,
    city: "Woodacre",
    state: "California",
    country: "US",
    latitude: 38.01,
    longitude: -122.65,
    traditions: ["theravada"],
    teachers: [],
  },
  {
    name: "Dzogchen Center",
    slug: "dzogchen-center",
    description: "Tibetan Buddhist center",
    photo: null,
    website: null,
    city: "Cambridge",
    state: "Massachusetts",
    country: "US",
    latitude: 42.37,
    longitude: -71.11,
    traditions: ["tibetan"],
    teachers: [],
  },
];

describe("filterTeachers", () => {
  it("returns all teachers when no filters applied", () => {
    const result = filterTeachers(mockTeachers, {
      query: "",
      traditions: [],
      state: "",
    });
    expect(result).toHaveLength(3);
  });

  it("filters by name substring (case-insensitive)", () => {
    const result = filterTeachers(mockTeachers, {
      query: "gil",
      traditions: [],
      state: "",
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Gil Fronsdal");
  });

  it("filters by tradition", () => {
    const result = filterTeachers(mockTeachers, {
      query: "",
      traditions: ["zen"],
      state: "",
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("gil-fronsdal");
  });

  it("filters by multiple traditions (AND logic)", () => {
    const result = filterTeachers(mockTeachers, {
      query: "",
      traditions: ["theravada", "zen"],
      state: "",
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("gil-fronsdal");
  });

  it("filters by state", () => {
    const result = filterTeachers(mockTeachers, {
      query: "",
      traditions: [],
      state: "California",
    });
    expect(result).toHaveLength(2);
  });

  it("combines all filters", () => {
    const result = filterTeachers(mockTeachers, {
      query: "sal",
      traditions: ["kashmir-shaivism"],
      state: "California",
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("sally-kempton");
  });

  it("returns empty array when nothing matches", () => {
    const result = filterTeachers(mockTeachers, {
      query: "nonexistent",
      traditions: [],
      state: "",
    });
    expect(result).toHaveLength(0);
  });
});

describe("filterCenters", () => {
  it("returns all centers when no filters applied", () => {
    const result = filterCenters(mockCenters, {
      query: "",
      traditions: [],
      state: "",
    });
    expect(result).toHaveLength(2);
  });

  it("filters by name and state", () => {
    const result = filterCenters(mockCenters, {
      query: "spirit",
      traditions: [],
      state: "California",
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("spirit-rock");
  });
});

describe("searchAll", () => {
  it("returns combined results with type labels", () => {
    const results = searchAll(mockTeachers, mockCenters, {
      query: "",
      traditions: ["theravada"],
      state: "",
    });
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      type: "teacher",
      item: mockTeachers[0],
    });
    expect(results[1]).toEqual({
      type: "center",
      item: mockCenters[0],
    });
  });
});

describe("getUniqueStates", () => {
  it("returns sorted unique states from both teachers and centers", () => {
    const states = getUniqueStates(mockTeachers, mockCenters);
    expect(states).toEqual(["California", "Massachusetts", "Oxfordshire"]);
  });
});

describe("getUniqueTraditions", () => {
  it("returns sorted unique tradition slugs", () => {
    const traditions = getUniqueTraditions(mockTeachers, mockCenters);
    expect(traditions).toEqual([
      "advaita-vedanta",
      "kashmir-shaivism",
      "theravada",
      "tibetan",
      "zen",
    ]);
  });
});
