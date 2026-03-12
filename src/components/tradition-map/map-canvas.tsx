import { useMemo } from "react";
import type { TraditionGraph, GraphNode } from "@/lib/tradition-graph";
import type { ConnectionType } from "@/lib/types";
import type { LayoutMap } from "@/lib/compute-layout";
import { MapEdge } from "./map-edge";
import { MapNode } from "./map-node";
import { MapTimeAxis } from "./map-time-axis";
import type { ResourceMap } from "./tradition-map";

interface MapCanvasProps {
  graph: TraditionGraph;
  layout: LayoutMap;
  zoomScale: number;
  onNodeHover: (slug: string | null) => void;
  onNodeClick: (slug: string) => void;
  onEdgeHover: (source: string | null, target: string | null) => void;
  onTooltipEnter: () => void;
  onTooltipLeave: () => void;
  hoveredEdgeKey: string | null;
  isNodeHighlighted: (slug: string) => boolean;
  isNodeConnected: (slug: string) => boolean;
  isNodeDimmed: (slug: string) => boolean;
  isEdgeHighlighted: (source: string, target: string) => boolean;
  isEdgeDimmed: (source: string, target: string) => boolean;
  isEdgeHidden: (source: string, target: string, connectionType: ConnectionType) => boolean;
  resourceMap?: ResourceMap;
}

// Layout constants matching compute-layout.ts
const MIN_YEAR = -1100;
const MAX_YEAR = 2100;
const MAP_HEIGHT = 1100;
const PADDING_TOP = 0;
const PADDING_BOTTOM = 0;

function yearToY(year: number): number {
  const range = MAX_YEAR - MIN_YEAR;
  const ratio = (year - MIN_YEAR) / range;
  return PADDING_TOP + ratio * (MAP_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
}

export function MapCanvas({
  graph,
  layout,
  zoomScale,
  onNodeHover,
  onNodeClick,
  onEdgeHover,
  onTooltipEnter,
  onTooltipLeave,
  hoveredEdgeKey,
  isNodeHighlighted,
  isNodeConnected,
  isNodeDimmed,
  isEdgeHighlighted,
  isEdgeDimmed,
  isEdgeHidden,
  resourceMap = {},
}: MapCanvasProps) {
  const nodeMap = new Map<string, GraphNode>();
  for (const node of graph.nodes) {
    nodeMap.set(node.slug, node);
  }

  // Entrance animation delays based on Y position
  const nodeDelays = useMemo(() => {
    const delays = new Map<string, number>();
    const yValues = graph.nodes
      .map((n) => layout[n.slug]?.y ?? 0)
      .filter((y) => y !== 0);
    if (yValues.length === 0) return delays;

    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yRange = yMax - yMin || 1;
    const maxDelay = 600;

    for (const node of graph.nodes) {
      const pos = layout[node.slug];
      if (!pos) continue;
      const normalized = (pos.y - yMin) / yRange;
      delays.set(node.slug, normalized * maxDelay);
    }
    return delays;
  }, [graph.nodes, layout]);

  const edgeDelays = useMemo(() => {
    const delays = new Map<string, number>();
    const extraDelay = 150;
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

  // Compute bounds for time axis
  const positions = Object.values(layout);
  const yValues = positions.map((p) => p.y);
  const xValues = positions.map((p) => p.x);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);

  return (
    <>
      {/* Time axis with era labels and grid lines — rendered first (behind everything) */}
      <MapTimeAxis
        x={xMin - 110}
        yMin={yMin - 20}
        yMax={yMax + 20}
        yearToY={yearToY}
        xGridStart={xMin - 10}
        xMax={xMax + 60}
      />

      {/* Edges */}
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
            onTooltipEnter={onTooltipEnter}
            onTooltipLeave={onTooltipLeave}
            entranceDelay={edgeDelays.get(edgeKey) ?? 0}
            resourceMap={resourceMap}
          />
        );
      })}

      {/* Nodes */}
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
