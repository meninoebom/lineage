import { describe, it, expect } from "vitest";
import {
  buildTraditionGraph,
  getFamilies,
  filterByFamilies,
  getConnectedEdges,
  getConnectedSlugs,
  type TraditionInput,
} from "../tradition-graph";

const sampleTraditions: TraditionInput[] = [
  {
    name: "Zen",
    slug: "zen",
    family: "Buddhist",
    summary: "A school of Mahayana Buddhism",
    connections: [
      {
        tradition_slug: "theravada",
        connection_type: "related_to",
        description: "Both emphasize meditation",
      },
      {
        tradition_slug: "dzogchen",
        connection_type: "related_to",
        description: "Both point to nature of mind",
      },
    ],
  },
  {
    name: "Theravada",
    slug: "theravada",
    family: "Buddhist",
    summary: "The Way of the Elders",
    connections: [
      {
        tradition_slug: "zen",
        connection_type: "related_to",
        description: "Both emphasize meditation",
      },
    ],
  },
  {
    name: "Advaita Vedanta",
    slug: "advaita-vedanta",
    family: "Hindu",
    summary: "Non-dual Hindu philosophy",
    connections: [
      {
        tradition_slug: "kashmir-shaivism",
        connection_type: "related_to",
        description: "Both non-dual Hindu traditions",
      },
    ],
  },
  {
    name: "Kashmir Shaivism",
    slug: "kashmir-shaivism",
    family: "Hindu",
    summary: "Non-dual tantric tradition",
    connections: [
      {
        tradition_slug: "advaita-vedanta",
        connection_type: "related_to",
        description: "Both non-dual Hindu traditions",
      },
    ],
  },
  {
    name: "Dzogchen",
    slug: "dzogchen",
    family: "Buddhist",
    summary: "The Great Perfection",
    connections: [
      {
        tradition_slug: "zen",
        connection_type: "related_to",
        description: "Both point to nature of mind",
      },
      {
        tradition_slug: "advaita-vedanta",
        connection_type: "related_to",
        description: "Both emphasize recognizing true nature",
      },
    ],
  },
];

describe("buildTraditionGraph", () => {
  it("creates nodes for all traditions", () => {
    const graph = buildTraditionGraph(sampleTraditions);
    expect(graph.nodes).toHaveLength(5);
    expect(graph.nodes.map((n) => n.slug).sort()).toEqual([
      "advaita-vedanta",
      "dzogchen",
      "kashmir-shaivism",
      "theravada",
      "zen",
    ]);
  });

  it("deduplicates bidirectional edges", () => {
    const graph = buildTraditionGraph(sampleTraditions);
    // zen<->theravada, zen<->dzogchen, advaita<->kashmir, dzogchen<->advaita = 4 unique
    expect(graph.edges).toHaveLength(4);
  });

  it("excludes edges to non-existent traditions", () => {
    const traditions: TraditionInput[] = [
      {
        name: "Zen",
        slug: "zen",
        family: "Buddhist",
        summary: "test",
        connections: [
          { tradition_slug: "nonexistent", connection_type: "related_to", description: "test" },
        ],
      },
    ];
    const graph = buildTraditionGraph(traditions);
    expect(graph.edges).toHaveLength(0);
  });

  it("assigns correct family to nodes", () => {
    const graph = buildTraditionGraph(sampleTraditions);
    const zen = graph.nodes.find((n) => n.slug === "zen");
    expect(zen?.family).toBe("Buddhist");
    const advaita = graph.nodes.find((n) => n.slug === "advaita-vedanta");
    expect(advaita?.family).toBe("Hindu");
  });
});

describe("getFamilies", () => {
  it("returns unique families", () => {
    const graph = buildTraditionGraph(sampleTraditions);
    const families = getFamilies(graph);
    expect(families.sort()).toEqual(["Buddhist", "Hindu"]);
  });
});

describe("filterByFamilies", () => {
  it("filters nodes and edges by family", () => {
    const graph = buildTraditionGraph(sampleTraditions);
    const filtered = filterByFamilies(graph, new Set(["Buddhist"]));
    expect(filtered.nodes).toHaveLength(3);
    // Only zen<->theravada, zen<->dzogchen remain (dzogchen<->advaita is cross-family)
    expect(filtered.edges).toHaveLength(2);
  });

  it("returns empty graph for no matching families", () => {
    const graph = buildTraditionGraph(sampleTraditions);
    const filtered = filterByFamilies(graph, new Set(["Taoist"]));
    expect(filtered.nodes).toHaveLength(0);
    expect(filtered.edges).toHaveLength(0);
  });
});

describe("getConnectedEdges", () => {
  it("returns edges connected to a node", () => {
    const graph = buildTraditionGraph(sampleTraditions);
    const edges = getConnectedEdges(graph, "zen");
    expect(edges).toHaveLength(2);
  });
});

describe("getConnectedSlugs", () => {
  it("returns connected node slugs", () => {
    const graph = buildTraditionGraph(sampleTraditions);
    const slugs = getConnectedSlugs(graph, "zen");
    expect(slugs).toEqual(new Set(["theravada", "dzogchen"]));
  });

  it("returns empty set for unconnected node", () => {
    const traditions: TraditionInput[] = [
      { name: "Zen", slug: "zen", family: "Buddhist", summary: "test", connections: [] },
    ];
    const graph = buildTraditionGraph(traditions);
    expect(getConnectedSlugs(graph, "zen").size).toBe(0);
  });
});
