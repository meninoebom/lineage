import { useMemo } from "react";
import type { TraditionGraph, GraphNode } from "@/lib/tradition-graph";
import type { ConnectionType } from "@/lib/types";
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
  onEdgeHover: (source: string | null, target: string | null) => void;
  hoveredEdgeKey: string | null;
  isNodeHighlighted: (slug: string) => boolean;
  isNodeConnected: (slug: string) => boolean;
  isNodeDimmed: (slug: string) => boolean;
  isEdgeHighlighted: (source: string, target: string) => boolean;
  isEdgeDimmed: (source: string, target: string) => boolean;
  isEdgeHidden: (source: string, target: string, connectionType: ConnectionType) => boolean;
}

/**
 * MapCanvas — the SVG content layer for the tradition map.
 *
 * Renders edges first (behind), then time axis, then nodes (in front).
 * Computes entrance animation delays: nodes stagger top-to-bottom (by y position),
 * edges appear after both connected nodes have appeared.
 */
export function MapCanvas({
  graph,
  layout,
  zoomScale,
  onNodeHover,
  onNodeClick,
  onEdgeHover,
  hoveredEdgeKey,
  isNodeHighlighted,
  isNodeConnected,
  isNodeDimmed,
  isEdgeHighlighted,
  isEdgeDimmed,
  isEdgeHidden,
}: MapCanvasProps) {
  // Build a lookup for source nodes (for edge coloring)
  const nodeMap = new Map<string, GraphNode>();
  for (const node of graph.nodes) {
    nodeMap.set(node.slug, node);
  }

  // Compute entrance animation delays based on Y position (top = ancient, bottom = modern)
  const nodeDelays = useMemo(() => {
    const delays = new Map<string, number>();
    const yValues = graph.nodes
      .map((n) => layout[n.slug]?.y ?? 0)
      .filter((y) => y !== 0);
    if (yValues.length === 0) return delays;

    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yRange = yMax - yMin || 1;
    const maxDelay = 600; // ms total stagger duration

    for (const node of graph.nodes) {
      const pos = layout[node.slug];
      if (!pos) continue;
      const normalized = (pos.y - yMin) / yRange;
      delays.set(node.slug, normalized * maxDelay);
    }
    return delays;
  }, [graph.nodes, layout]);

  // Edge entrance delays: appear after both connected nodes
  const edgeDelays = useMemo(() => {
    const delays = new Map<string, number>();
    const extraDelay = 150; // ms after the later node appears
    for (const edge of graph.edges) {
      const sourceDelay = nodeDelays.get(edge.source) ?? 0;
      const targetDelay = nodeDelays.get(edge.target) ?? 0;
      delays.set(
        `${edge.source}--${edge.target}`,
        Math.max(sourceDelay, targetDelay) + extraDelay
      );
    }
    return delays;
  }, [graph.edges, nodeDelays]);

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
        const edgeKey = `${edge.source}--${edge.target}`;
        return (
          <MapEdge
            key={edgeKey}
            edge={edge}
            sourcePos={sourcePos}
            targetPos={targetPos}
            sourceNode={nodeMap.get(edge.source)}
            highlighted={isEdgeHighlighted(edge.source, edge.target)}
            dimmed={isEdgeDimmed(edge.source, edge.target)}
            hidden={isEdgeHidden(edge.source, edge.target, edge.connectionType)}
            showTooltip={hoveredEdgeKey === edgeKey}
            onEdgeHover={onEdgeHover}
            entranceDelay={edgeDelays.get(edgeKey) ?? 0}
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
            entranceDelay={nodeDelays.get(node.slug) ?? 0}
          />
        );
      })}
    </>
  );
}
