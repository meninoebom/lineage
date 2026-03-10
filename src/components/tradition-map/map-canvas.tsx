import type { TraditionGraph, GraphNode } from "@/lib/tradition-graph";
import type { LayoutMap } from "@/lib/compute-layout";
import { MapEdge } from "./map-edge";
import { MapNode } from "./map-node";
import { MapTimeAxis } from "./map-time-axis";

interface MapCanvasProps {
  graph: TraditionGraph;
  layout: LayoutMap;
  zoomScale: number;
  onNodeHover: (slug: string | null) => void;
  onNodeClick: (slug: string) => void;
  isNodeHighlighted: (slug: string) => boolean;
  isNodeConnected: (slug: string) => boolean;
  isNodeDimmed: (slug: string) => boolean;
  isEdgeHighlighted: (source: string, target: string) => boolean;
  isEdgeDimmed: (source: string, target: string) => boolean;
}

/**
 * MapCanvas — the SVG content layer for the tradition map.
 *
 * Renders edges first (behind), then time axis, then nodes (in front).
 * Separated from zoom logic so the rendering is independently testable.
 *
 * This is a pure rendering component — all state and interaction logic
 * lives in the parent (TraditionMap) and its hooks.
 */
export function MapCanvas({
  graph,
  layout,
  zoomScale,
  onNodeHover,
  onNodeClick,
  isNodeHighlighted,
  isNodeConnected,
  isNodeDimmed,
  isEdgeHighlighted,
  isEdgeDimmed,
}: MapCanvasProps) {
  // Build a lookup for source nodes (for edge coloring)
  const nodeMap = new Map<string, GraphNode>();
  for (const node of graph.nodes) {
    nodeMap.set(node.slug, node);
  }

  // Compute time axis parameters from node data
  const centuries = graph.nodes
    .map((n) => n.originCentury)
    .filter((c) => c !== 0);
  const uniqueCenturies = Array.from(new Set(centuries)).sort((a, b) => a - b);

  // Y range from layout positions
  const yValues = Object.values(layout).map((p) => p.y);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const xMin = Math.min(...Object.values(layout).map((p) => p.x));

  // Map century to Y based on the layout range
  const minCentury = uniqueCenturies.length > 0 ? uniqueCenturies[0] : 0;
  const maxCentury =
    uniqueCenturies.length > 0 ? uniqueCenturies[uniqueCenturies.length - 1] : 0;

  const centuryToY = (century: number): number => {
    if (minCentury === maxCentury) return (yMin + yMax) / 2;
    return yMin + ((century - minCentury) / (maxCentury - minCentury)) * (yMax - yMin);
  };

  return (
    <>
      {/* Edges — rendered first (behind nodes) */}
      {graph.edges.map((edge) => {
        const sourcePos = layout[edge.source];
        const targetPos = layout[edge.target];
        if (!sourcePos || !targetPos) return null;
        return (
          <MapEdge
            key={`${edge.source}--${edge.target}`}
            edge={edge}
            sourcePos={sourcePos}
            targetPos={targetPos}
            sourceNode={nodeMap.get(edge.source)}
            highlighted={isEdgeHighlighted(edge.source, edge.target)}
            dimmed={isEdgeDimmed(edge.source, edge.target)}
          />
        );
      })}

      {/* Time axis */}
      {uniqueCenturies.length > 1 && (
        <MapTimeAxis
          x={xMin - 60}
          yMin={yMin - 20}
          yMax={yMax + 20}
          centuries={uniqueCenturies}
          centuryToY={centuryToY}
        />
      )}

      {/* Nodes — rendered on top */}
      {graph.nodes.map((node) => {
        const pos = layout[node.slug];
        if (!pos) return null;
        return (
          <MapNode
            key={node.slug}
            node={node}
            position={pos}
            highlighted={isNodeHighlighted(node.slug)}
            connected={isNodeConnected(node.slug)}
            dimmed={isNodeDimmed(node.slug)}
            zoomScale={zoomScale}
            onHover={onNodeHover}
            onClick={onNodeClick}
          />
        );
      })}
    </>
  );
}
