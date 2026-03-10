"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import {
  buildTraditionGraph,
  getFamilies,
  filterByFamilies,
  type TraditionInput,
} from "@/lib/tradition-graph";
import type { TraditionFamily } from "@/lib/types";
import type { LayoutMap } from "@/lib/compute-layout";
import { FamilyFilter } from "./family-filter";
import { MapCanvas } from "./map-canvas";
import { useMapZoom } from "./use-map-zoom";
import { useMapInteraction } from "./use-map-interaction";

// Import pre-computed layout (generated at build time by `npm run prebuild`)
import layoutData from "@/generated/map-layout.json";

interface TraditionMapProps {
  traditions: TraditionInput[];
}

// Compute viewBox from layout data with padding
function computeViewBox(layout: LayoutMap) {
  const positions = Object.values(layout);
  if (positions.length === 0) return { x: 0, y: 0, width: 1000, height: 600 };

  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const padding = 120;

  const minX = Math.min(...xs) - padding;
  const minY = Math.min(...ys) - padding;
  const maxX = Math.max(...xs) + padding;
  const maxY = Math.max(...ys) + padding;

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * TraditionMap — the signature visualization of Lineage.
 *
 * Architecture:
 * - Layout positions come from pre-computed JSON (generated at build time)
 * - d3-zoom handles pan/zoom behavior, React owns all DOM rendering
 * - useMapInteraction manages hover/selection/tap state
 * - MapCanvas renders the SVG content (edges, nodes, time axis)
 * - Single responsive SVG with viewBox — works on all screen sizes
 *
 * Touch behavior: detects touch devices and switches from hover to tap-to-select.
 * Tap a node to focus, tap again or tap background to deselect.
 */
export function TraditionMap({ traditions }: TraditionMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const layout = layoutData as LayoutMap;
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device on mount
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouchDevice(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const fullGraph = useMemo(() => buildTraditionGraph(traditions), [traditions]);
  const allFamilies = useMemo(() => getFamilies(fullGraph), [fullGraph]);

  const [activeFamilies, setActiveFamilies] = useState<Set<TraditionFamily>>(
    () => new Set(allFamilies)
  );

  const graph = useMemo(
    () => filterByFamilies(fullGraph, activeFamilies),
    [fullGraph, activeFamilies]
  );

  const { transform } = useMapZoom(svgRef);
  const interaction = useMapInteraction(graph);

  const handleToggleFamily = useCallback((family: TraditionFamily) => {
    setActiveFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(family)) {
        if (next.size > 1) next.delete(family);
      } else {
        next.add(family);
      }
      return next;
    });
  }, []);

  const viewBox = useMemo(() => computeViewBox(layout), [layout]);

  // On touch devices: use tap-to-select instead of hover
  const nodeHoverHandler = isTouchDevice ? () => {} : interaction.handleNodeHover;
  const nodeClickHandler = isTouchDevice
    ? (slug: string) => {
        if (interaction.selectedSlug === slug) {
          // Second tap on same node: navigate
          interaction.handleNodeClick(slug);
        } else {
          // First tap: select/focus
          interaction.handleNodeSelect(slug);
        }
      }
    : interaction.handleNodeClick;

  // Background tap deselects on touch devices
  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isTouchDevice) return;
      // Only deselect if the tap was on the SVG background (not a node)
      if (e.target === e.currentTarget) {
        interaction.handleBackgroundTap();
      }
    },
    [isTouchDevice, interaction.handleBackgroundTap]
  );

  return (
    <div className="w-full">
      {/* Entrance animation keyframes */}
      <style>{`
        @keyframes map-node-fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes map-edge-draw-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .map-node-entrance {
          animation: map-node-fade-in 0.4s ease-out both;
        }
        .map-edge-entrance {
          animation: map-edge-draw-in 0.3s ease-out both;
        }
      `}</style>

      {/* Filters */}
      <div className="mb-8">
        <FamilyFilter
          families={allFamilies}
          activeFamilies={activeFamilies}
          onToggle={handleToggleFamily}
        />
      </div>

      {/* Single responsive SVG */}
      <svg
        ref={svgRef}
        className="w-full h-auto"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        style={{ maxHeight: "70vh", touchAction: "none" }}
        aria-label="Interactive map of contemplative traditions"
        role="img"
        onClick={handleSvgClick}
      >
        {/* Zoom/pan transform wrapper — React applies the transform from d3-zoom */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          <MapCanvas
            graph={graph}
            layout={layout}
            zoomScale={transform.k}
            onNodeHover={nodeHoverHandler}
            onNodeClick={nodeClickHandler}
            onEdgeHover={interaction.handleEdgeHover}
            hoveredEdgeKey={interaction.hoveredEdgeKey}
            isNodeHighlighted={interaction.isNodeHighlighted}
            isNodeConnected={interaction.isNodeConnected}
            isNodeDimmed={interaction.isNodeDimmed}
            isEdgeHighlighted={interaction.isEdgeHighlighted}
            isEdgeDimmed={interaction.isEdgeDimmed}
            isEdgeHidden={interaction.isEdgeHidden}
          />
        </g>
      </svg>

      {/* Summary on hover */}
      {interaction.activeSlug && (
        <div className="mt-4 text-center animate-in fade-in duration-200">
          <p className="text-sm text-muted-foreground italic max-w-md mx-auto">
            {graph.nodes.find((n) => n.slug === interaction.activeSlug)?.summary}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground font-sans">
        <span className="flex items-center gap-2">
          <svg width="20" height="8">
            <line x1="0" y1="4" x2="20" y2="4" stroke="#b5ada5" strokeWidth="1.5" />
            <polygon points="16,1 20,4 16,7" fill="#b5ada5" />
          </svg>
          Branch of
        </span>
        <span className="flex items-center gap-2">
          <svg width="20" height="8">
            <line x1="0" y1="4" x2="20" y2="4" stroke="#b5ada5" strokeWidth="1" strokeDasharray="4 2" />
          </svg>
          Influenced by
        </span>
        <span className="flex items-center gap-2">
          <svg width="20" height="8">
            <line x1="0" y1="4" x2="20" y2="4" stroke="#b5ada5" strokeWidth="0.8" strokeDasharray="1 2" />
          </svg>
          Related
        </span>
      </div>
    </div>
  );
}
