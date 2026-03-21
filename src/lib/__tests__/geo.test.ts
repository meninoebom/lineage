import { describe, it, expect, vi } from "vitest";
import { haversineDistance, sortByDistance, geocodeLocation } from "../geo";

describe("haversineDistance", () => {
  it("returns 0 for the same point", () => {
    expect(haversineDistance(40.7128, -74.006, 40.7128, -74.006)).toBe(0);
  });

  it("calculates New York to Los Angeles ≈ 2,451 miles", () => {
    const distance = haversineDistance(40.7128, -74.006, 34.0522, -118.2437);
    expect(distance).toBeGreaterThan(2400);
    expect(distance).toBeLessThan(2500);
  });

  it("calculates London to Paris ≈ 213 miles", () => {
    const distance = haversineDistance(51.5074, -0.1278, 48.8566, 2.3522);
    expect(distance).toBeGreaterThan(193);
    expect(distance).toBeLessThan(233);
  });

  it("handles short distances", () => {
    // ~1 mile apart (approximately 0.0145 degrees latitude)
    const distance = haversineDistance(40.0, -74.0, 40.0145, -74.0);
    expect(distance).toBeGreaterThan(0.8);
    expect(distance).toBeLessThan(1.2);
  });
});

describe("sortByDistance", () => {
  const items = [
    { name: "Far", latitude: 34.0522, longitude: -118.2437 },
    { name: "Near", latitude: 40.73, longitude: -73.99 },
    { name: "Mid", latitude: 39.9526, longitude: -75.1652 },
  ];

  it("sorts items nearest-first", () => {
    const sorted = sortByDistance(items, 40.7128, -74.006);
    expect(sorted[0].name).toBe("Near");
    expect(sorted[1].name).toBe("Mid");
    expect(sorted[2].name).toBe("Far");
    expect(sorted[0].distance).toBeGreaterThan(0);
  });

  it("pushes items with null coords to the end", () => {
    const withNulls = [
      { name: "Null", latitude: null, longitude: null },
      { name: "Near", latitude: 40.73, longitude: -73.99 },
    ];
    const sorted = sortByDistance(withNulls, 40.7128, -74.006);
    expect(sorted[0].name).toBe("Near");
    expect(sorted[0].distance).not.toBeNull();
    expect(sorted[1].name).toBe("Null");
    expect(sorted[1].distance).toBeNull();
  });

  it("returns empty array for empty input", () => {
    expect(sortByDistance([], 0, 0)).toEqual([]);
  });

  it("returns all items when all have null coords", () => {
    const allNull = [
      { name: "A", latitude: null, longitude: null },
      { name: "B", latitude: null, longitude: null },
    ];
    const sorted = sortByDistance(allNull, 0, 0);
    expect(sorted).toHaveLength(2);
    expect(sorted[0].name).toBe("A");
    expect(sorted[1].name).toBe("B");
  });
});

describe("geocodeLocation", () => {
  it("returns lat/lng on success", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ lat: "40.7128", lon: "-74.006" }]),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await geocodeLocation("New York");
    expect(result).toEqual({ lat: 40.7128, lng: -74.006 });

    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.hostname).toBe("nominatim.openstreetmap.org");
    expect(url.searchParams.get("q")).toBe("New York");

    const headers = mockFetch.mock.calls[0][1]?.headers;
    expect(headers?.["User-Agent"]).toBe(
      "lineage.guide (https://lineage.guide)"
    );

    vi.unstubAllGlobals();
  });

  it("returns null on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await geocodeLocation("New York");
    expect(result).toBeNull();
    vi.unstubAllGlobals();
  });

  it("returns null on empty results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );
    const result = await geocodeLocation("xyznonexistent");
    expect(result).toBeNull();
    vi.unstubAllGlobals();
  });
});
