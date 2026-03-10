/**
 * Build-time layout computation using graphology + ForceAtlas2.
 *
 * Extracts the pure logic so it can be tested without filesystem I/O.
 * The script in scripts/compute-layout.ts is a thin CLI wrapper.
 */
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import type { ParsedTradition } from "./data";
import type { ConnectionType } from "./types";

// -- Types --

export interface LayoutPosition {
  x: number;
  y: number;
}

export type LayoutMap = Record<string, LayoutPosition>;

// -- Constants --

const DEFAULT_EDGE_WEIGHTS: Record<ConnectionType, number> = {
  branch_of: 3,
  influenced_by: 2,
  related_to: 1,
  diverged_from: 1,
};

const ITERATIONS = 500;

// -- Helpers --

/**
 * Maps origin_century to a Y coordinate.
 * Earlier centuries → smaller Y (top), later centuries → larger Y (bottom).
 * Normalizes across the range of centuries present in the data.
 */
export function centuryToY(
  century: number,
  minCentury: number,
  maxCentury: number,
  height: number = 1000
): number {
  if (minCentury === maxCentury) return height / 2;
  return ((century - minCentury) / (maxCentury - minCentury)) * height;
}

/**
 * Deterministic pseudo-random number generator (mulberry32).
 * Ensures same input → same layout every time.
 */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// -- Main --

export function computeLayout(traditions: ParsedTradition[]): LayoutMap {
  if (traditions.length === 0) return {};

  const graph = new Graph({ type: "undirected" });
  const rng = mulberry32(42);

  // Compute century range for Y mapping
  const centuries = traditions.map((t) => t.origin_century);
  const minCentury = Math.min(...centuries);
  const maxCentury = Math.max(...centuries);

  // Add nodes with initial positions
  for (const tradition of traditions) {
    const y = centuryToY(tradition.origin_century, minCentury, maxCentury);
    graph.addNode(tradition.slug, {
      x: rng() * 1000,
      y,
    });
  }

  // Add edges with weights
  const slugSet = new Set(traditions.map((t) => t.slug));
  for (const tradition of traditions) {
    for (const conn of tradition.connections) {
      if (!slugSet.has(conn.tradition_slug)) continue;

      // Avoid duplicate edges (undirected graph)
      const edgeKey = [tradition.slug, conn.tradition_slug].sort().join("--");
      if (graph.hasEdge(edgeKey)) continue;

      const weight =
        conn.strength ?? DEFAULT_EDGE_WEIGHTS[conn.connection_type] ?? 1;
      graph.addEdgeWithKey(edgeKey, tradition.slug, conn.tradition_slug, {
        weight,
      });
    }
  }

  // Build Y-constraint map (slug → fixed Y)
  const fixedY: Record<string, number> = {};
  for (const tradition of traditions) {
    fixedY[tradition.slug] = centuryToY(
      tradition.origin_century,
      minCentury,
      maxCentury
    );
  }

  // Run ForceAtlas2 with Y-constraint:
  // We run in chunks, resetting Y after each chunk to enforce the time axis.
  const CHUNK_SIZE = 10;
  const chunks = Math.ceil(ITERATIONS / CHUNK_SIZE);

  for (let i = 0; i < chunks; i++) {
    const iters = Math.min(CHUNK_SIZE, ITERATIONS - i * CHUNK_SIZE);
    forceAtlas2.assign(graph, {
      iterations: iters,
      settings: {
        gravity: 1,
        scalingRatio: 10,
        barnesHutOptimize: false,
        strongGravityMode: false,
        slowDown: 1,
      },
    });

    // Reset Y to time-derived value after each chunk
    graph.forEachNode((node) => {
      graph.setNodeAttribute(node, "y", fixedY[node]);
    });
  }

  // Extract final positions
  const layout: LayoutMap = {};
  graph.forEachNode((node) => {
    layout[node] = {
      x: Math.round(graph.getNodeAttribute(node, "x") * 10) / 10,
      y: Math.round(graph.getNodeAttribute(node, "y") * 10) / 10,
    };
  });

  return layout;
}
