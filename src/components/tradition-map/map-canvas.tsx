import { useMemo } from "react";
import type { TraditionGraph } from "@/lib/tradition-graph";
import type { ConnectionType } from "@/lib/types";
import { yearToY, type LayoutMap } from "@/lib/compute-layout";
import { MapEdge } from "./map-edge";
import { MapEdgeTooltip } from "./map-edge-tooltip";
import { MapNode } from "./map-node";
import { MapNodePopover } from "./map-node-popover";
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
  activeSlug: string | null;
  onNodeDeselect: () => void;
  onPopoverEnter: () => void;
  onPopoverLeave: () => void;
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
  activeSlug,
  onNodeDeselect,
  onPopoverEnter,
  onPopoverLeave,
}: MapCanvasProps) {
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
  if (positions.length === 0) return null;
  const yValues = positions.map((p) => p.y);
  const xValues = positions.map((p) => p.x);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);

  // Find the hovered edge for tooltip rendering
  const hoveredEdge = hoveredEdgeKey
    ? graph.edges.find((e) => `${e.source}--${e.target}` === hoveredEdgeKey)
    : null;

  return (
    <>
      {/* Layer 1: Time axis (behind everything) */}
      <MapTimeAxis
        x={xMin - 110}
        yMin={yMin - 20}
        yMax={yMax + 20}
        yearToY={yearToY}
        xGridStart={xMin - 10}
        xMax={xMax + 60}
      />

      {/* Layer 2: Edge paths */}
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
            highlighted={isEdgeHighlighted(edge.source, edge.target)}
            dimmed={isEdgeDimmed(edge.source, edge.target)}
            hidden={isEdgeHidden(edge.source, edge.target, edge.connectionType)}
            onEdgeHover={onEdgeHover}
            entranceDelay={edgeDelays.get(edgeKey) ?? 0}
          />
        );
      })}

      {/* Layer 3: Nodes */}
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

      {/* Layer 4: Edge tooltips */}
      {hoveredEdge && (() => {
        const sourcePos = layout[hoveredEdge.source];
        const targetPos = layout[hoveredEdge.target];
        if (!sourcePos || !targetPos) return null;
        return (
          <MapEdgeTooltip
            edge={hoveredEdge}
            sourcePos={sourcePos}
            targetPos={targetPos}
            onTooltipEnter={onTooltipEnter}
            onTooltipLeave={onTooltipLeave}
            resourceMap={resourceMap}
          />
        );
      })()}

      {/* Layer 5: Node popover (topmost) — shows on hover or selection */}
      {activeSlug && (() => {
        const node = graph.nodes.find((n) => n.slug === activeSlug);
        const pos = node ? layout[node.slug] : null;
        if (!node || !pos) return null;
        return (
          <MapNodePopover
            node={node}
            position={pos}
            onClose={onNodeDeselect}
            onPopoverEnter={onPopoverEnter}
            onPopoverLeave={onPopoverLeave}
          />
        );
      })()}
    </>
  );
}
