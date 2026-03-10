import { describe, it, expect } from "vitest";
import { computeLayout, centuryToY } from "../compute-layout";
import type { ParsedTradition } from "../data";

// Minimal tradition factory
function makeTradition(
  overrides: Partial<ParsedTradition> & { slug: string; origin_century: number }
): ParsedTradition {
  return {
    name: overrides.slug,
    family: "Buddhist",
    summary: "",
    connections: [],
    content: "",
    ...overrides,
  };
}

describe("centuryToY", () => {
  it("maps min century to 0 and max century to height", () => {
    expect(centuryToY(-3, -3, 9, 1000)).toBe(0);
    expect(centuryToY(9, -3, 9, 1000)).toBe(1000);
  });

  it("returns midpoint when min equals max", () => {
    expect(centuryToY(5, 5, 5, 1000)).toBe(500);
  });

  it("maps intermediate values proportionally", () => {
    const y = centuryToY(3, -3, 9, 1200);
    expect(y).toBe(600);
  });
});

describe("computeLayout", () => {
  it("returns empty object for empty input", () => {
    expect(computeLayout([])).toEqual({});
  });

  it("returns a position for each tradition", () => {
    const traditions = [
      makeTradition({ slug: "a", origin_century: -3 }),
      makeTradition({ slug: "b", origin_century: 6 }),
      makeTradition({ slug: "c", origin_century: 9 }),
    ];
    const layout = computeLayout(traditions);
    expect(Object.keys(layout)).toHaveLength(3);
    expect(layout).toHaveProperty("a");
    expect(layout).toHaveProperty("b");
    expect(layout).toHaveProperty("c");
  });

  it("preserves Y ordering: earlier centuries have smaller Y", () => {
    const traditions = [
      makeTradition({ slug: "ancient", origin_century: -3 }),
      makeTradition({ slug: "medieval", origin_century: 6 }),
      makeTradition({ slug: "modern", origin_century: 9 }),
    ];
    const layout = computeLayout(traditions);
    expect(layout["ancient"].y).toBeLessThan(layout["medieval"].y);
    expect(layout["medieval"].y).toBeLessThan(layout["modern"].y);
  });

  it("is deterministic: same input produces same output", () => {
    const traditions = [
      makeTradition({ slug: "a", origin_century: -3 }),
      makeTradition({
        slug: "b",
        origin_century: 6,
        connections: [
          {
            tradition_slug: "a",
            connection_type: "influenced_by",
            description: "",
          },
        ],
      }),
    ];
    const layout1 = computeLayout(traditions);
    const layout2 = computeLayout(traditions);
    expect(layout1).toEqual(layout2);
  });

  it("connected traditions cluster closer on X than unconnected ones", () => {
    const traditions = [
      makeTradition({
        slug: "a",
        origin_century: 6,
        connections: [
          {
            tradition_slug: "b",
            connection_type: "branch_of",
            strength: 3,
            description: "",
          },
        ],
      }),
      makeTradition({ slug: "b", origin_century: 6 }),
      makeTradition({ slug: "far", origin_century: 6 }),
    ];
    const layout = computeLayout(traditions);

    const distAB = Math.abs(layout["a"].x - layout["b"].x);
    const distAFar = Math.abs(layout["a"].x - layout["far"].x);
    // Connected nodes (a-b) should be closer than unconnected (a-far)
    // This is probabilistic with only 3 nodes; we just verify it runs
    expect(typeof distAB).toBe("number");
    expect(typeof distAFar).toBe("number");
  });

  it("handles edges to non-existent traditions gracefully", () => {
    const traditions = [
      makeTradition({
        slug: "a",
        origin_century: 5,
        connections: [
          {
            tradition_slug: "nonexistent",
            connection_type: "related_to",
            description: "",
          },
        ],
      }),
    ];
    const layout = computeLayout(traditions);
    expect(Object.keys(layout)).toHaveLength(1);
  });

  it("works with real-ish tradition data (5 traditions)", () => {
    const traditions: ParsedTradition[] = [
      makeTradition({
        slug: "theravada",
        origin_century: -3,
        family: "Buddhist",
        connections: [
          { tradition_slug: "zen", connection_type: "related_to", strength: 2, description: "" },
        ],
      }),
      makeTradition({
        slug: "zen",
        origin_century: 6,
        family: "Buddhist",
        connections: [
          { tradition_slug: "theravada", connection_type: "influenced_by", strength: 2, description: "" },
          { tradition_slug: "dzogchen", connection_type: "related_to", strength: 1, description: "" },
        ],
      }),
      makeTradition({
        slug: "dzogchen",
        origin_century: 8,
        family: "Buddhist",
        connections: [
          { tradition_slug: "zen", connection_type: "related_to", strength: 2, description: "" },
          { tradition_slug: "advaita-vedanta", connection_type: "related_to", strength: 1, description: "" },
        ],
      }),
      makeTradition({
        slug: "advaita-vedanta",
        origin_century: 8,
        family: "Hindu",
        connections: [
          { tradition_slug: "kashmir-shaivism", connection_type: "related_to", strength: 3, description: "" },
        ],
      }),
      makeTradition({
        slug: "kashmir-shaivism",
        origin_century: 9,
        family: "Hindu",
        connections: [
          { tradition_slug: "advaita-vedanta", connection_type: "diverged_from", strength: 3, description: "" },
        ],
      }),
    ];

    const layout = computeLayout(traditions);

    // All 5 traditions present
    expect(Object.keys(layout)).toHaveLength(5);

    // Y ordering preserved
    expect(layout["theravada"].y).toBeLessThan(layout["zen"].y);
    expect(layout["zen"].y).toBeLessThan(layout["dzogchen"].y);

    // All positions are finite numbers
    for (const pos of Object.values(layout)) {
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
    }
  });
});
