import type { TraditionFamily, ConnectionType } from "./types";

/**
 * Graph data structures for the tradition map visualization.
 * Transforms raw tradition data into nodes and edges suitable for rendering.
 */

export interface GraphNode {
  slug: string;
  name: string;
  family: TraditionFamily;
  summary: string;
  originCentury: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  connectionType: ConnectionType;
  description: string;
  strength: number;
}

export interface TraditionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Family color mapping using the Lapham's editorial palette.
 * Each family gets a distinct but harmonious color.
 */
export const FAMILY_COLORS: Record<TraditionFamily, { fill: string; stroke: string; text: string; bg: string }> = {
  Buddhist: {
    fill: "#d4a574",     // warm gold
    stroke: "#b8864a",
    text: "#6b4c2a",
    bg: "#f5ead8",
  },
  Hindu: {
    fill: "#9e4a3a",     // terracotta
    stroke: "#7d3a2e",
    text: "#5a2a20",
    bg: "#f3e8e5",
  },
  Taoist: {
    fill: "#4a7c7e",     // teal
    stroke: "#3a6264",
    text: "#2a4a4c",
    bg: "#e5eeef",
  },
  "Christian Contemplative": {
    fill: "#4a5a8a",     // deep blue
    stroke: "#3a4a7a",
    text: "#2a3560",
    bg: "#e7e9f0",
  },
  "Islamic Contemplative": {
    fill: "#3a7a5a",     // forest green
    stroke: "#2a6a4a",
    text: "#1a4a3a",
    bg: "#e5ede8",
  },
  "Modern Secular": {
    fill: "#6a7a8a",     // slate
    stroke: "#5a6a7a",
    text: "#3a4a5a",
    bg: "#eaedf0",
  },
  Other: {
    fill: "#8a8279",     // warm gray
    stroke: "#6a6259",
    text: "#4a4540",
    bg: "#ece6df",
  },
};

export interface TraditionInput {
  name: string;
  slug: string;
  family: string;
  summary: string;
  origin_century?: number;
  connections: {
    tradition_slug: string;
    connection_type: string;
    description: string;
    strength?: number;
  }[];
}

/**
 * Build a graph from raw tradition data.
 * Deduplicates bidirectional edges (A->B and B->A become one edge).
 */
export function buildTraditionGraph(traditions: TraditionInput[]): TraditionGraph {
  const slugSet = new Set(traditions.map((t) => t.slug));

  const nodes: GraphNode[] = traditions.map((t) => ({
    slug: t.slug,
    name: t.name,
    family: t.family as TraditionFamily,
    summary: t.summary,
    originCentury: t.origin_century ?? 0,
  }));

  // Deduplicate edges: use sorted slug pair as key
  const edgeMap = new Map<string, GraphEdge>();
  for (const t of traditions) {
    for (const conn of t.connections) {
      if (!slugSet.has(conn.tradition_slug)) continue;
      const key = [t.slug, conn.tradition_slug].sort().join("--");
      if (!edgeMap.has(key)) {
        edgeMap.set(key, {
          source: t.slug,
          target: conn.tradition_slug,
          connectionType: conn.connection_type as ConnectionType,
          description: conn.description,
          strength: conn.strength ?? 1,
        });
      }
    }
  }

  return { nodes, edges: Array.from(edgeMap.values()) };
}

/**
 * Get all unique families present in the graph.
 */
export function getFamilies(graph: TraditionGraph): TraditionFamily[] {
  const families = new Set(graph.nodes.map((n) => n.family));
  return Array.from(families);
}

/**
 * Filter graph to only include nodes from specified families.
 */
export function filterByFamilies(
  graph: TraditionGraph,
  families: Set<TraditionFamily>
): TraditionGraph {
  const slugs = new Set(
    graph.nodes.filter((n) => families.has(n.family)).map((n) => n.slug)
  );
  return {
    nodes: graph.nodes.filter((n) => slugs.has(n.slug)),
    edges: graph.edges.filter(
      (e) => slugs.has(e.source) && slugs.has(e.target)
    ),
  };
}

/**
 * Get edges connected to a specific node.
 */
export function getConnectedEdges(
  graph: TraditionGraph,
  slug: string
): GraphEdge[] {
  return graph.edges.filter(
    (e) => e.source === slug || e.target === slug
  );
}

/**
 * Get slugs of all nodes connected to a specific node.
 */
export function getConnectedSlugs(
  graph: TraditionGraph,
  slug: string
): Set<string> {
  const connected = new Set<string>();
  for (const e of graph.edges) {
    if (e.source === slug) connected.add(e.target);
    if (e.target === slug) connected.add(e.source);
  }
  return connected;
}
