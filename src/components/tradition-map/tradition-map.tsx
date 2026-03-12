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

export type ResourceMap = Record<string, { title: string; url: string; author?: string | null; description?: string }>;

interface TraditionMapProps {
  traditions: TraditionInput[];
  resourceMap?: ResourceMap;
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
export function TraditionMap({ traditions, resourceMap = {} }: TraditionMapProps) {
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

  // Collect all sources cited by edges, with the connections they support
  const sourcedEdges = useMemo(() => {
    const sourceMap = new Map<string, { edgeKeys: string[]; connections: string[] }>();
    for (const edge of fullGraph.edges) {
      if (!edge.sources) continue;
      const sourceNode = fullGraph.nodes.find((n) => n.slug === edge.source);
      const targetNode = fullGraph.nodes.find((n) => n.slug === edge.target);
      const connectionLabel = sourceNode && targetNode
        ? `${sourceNode.name} → ${targetNode.name}`
        : `${edge.source} → ${edge.target}`;
      for (const slug of edge.sources) {
        const existing = sourceMap.get(slug);
        const edgeKey = `${edge.source}--${edge.target}`;
        if (existing) {
          existing.edgeKeys.push(edgeKey);
          existing.connections.push(connectionLabel);
        } else {
          sourceMap.set(slug, { edgeKeys: [edgeKey], connections: [connectionLabel] });
        }
      }
    }
    return sourceMap;
  }, [fullGraph]);
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
      <div className="mb-6">
        <FamilyFilter
          families={allFamilies}
          activeFamilies={activeFamilies}
          onToggle={handleToggleFamily}
        />
      </div>

      {/* Legend — between filters and map */}
      <div className="mb-6 flex items-center justify-center gap-6 text-sm text-[#888] font-sans">
        <span className="flex items-center gap-2">
          <svg width="40" height="2">
            <line x1="0" y1="1" x2="40" y2="1" stroke="#b48c64" strokeWidth="2" />
          </svg>
          Branch of
        </span>
        <span className="flex items-center gap-2">
          <svg width="40" height="2">
            <line x1="0" y1="1" x2="40" y2="1" stroke="#8c8ca0" strokeWidth="2" strokeDasharray="6 4" />
          </svg>
          Influenced by
        </span>
      </div>

      {/* Two-column layout: map + sources sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map column */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#faf8f5] rounded-lg border border-[#e8e4df]">
            <svg
              ref={svgRef}
              className="w-full h-auto"
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
              style={{ maxHeight: "70vh", touchAction: "none" }}
              aria-label="Interactive map of contemplative traditions"
              role="img"
              onClick={handleSvgClick}
            >
              <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
                <MapCanvas
                  graph={graph}
                  layout={layout}
                  zoomScale={transform.k}
                  resourceMap={resourceMap}
                  onNodeHover={nodeHoverHandler}
                  onNodeClick={nodeClickHandler}
                  onEdgeHover={interaction.handleEdgeHover}
                  onTooltipEnter={interaction.handleTooltipEnter}
                  onTooltipLeave={interaction.handleTooltipLeave}
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
          </div>

          {/* Summary on hover */}
          {interaction.activeSlug && (
            <div className="mt-4 text-center animate-in fade-in duration-200">
              <p className="text-sm text-muted-foreground italic max-w-md mx-auto">
                {graph.nodes.find((n) => n.slug === interaction.activeSlug)?.summary}
              </p>
            </div>
          )}
        </div>

        {/* Key Sources sidebar */}
        {sourcedEdges.size > 0 && (
          <aside className="w-full lg:w-[320px] lg:shrink-0">
            <div className="lg:sticky lg:top-20 overflow-y-auto max-h-[800px]">
              <h2 className="font-serif text-xl font-normal mb-2">Key Sources</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Hover over a source below to illuminate the specific connections it
                supports on the landscape map.
              </p>
              <div className="space-y-4">
                {Array.from(sourcedEdges.entries()).map(([slug, info]) => {
                  const resource = resourceMap[slug];
                  if (!resource) return null;
                  const isActive = interaction.highlightedSourceSlug === slug;
                  return (
                    <div
                      key={slug}
                      className="bg-white border border-[#e8e4df] rounded-lg p-4 hover:shadow-md transition-shadow cursor-default"
                      style={{
                        background: isActive ? "#f0e8df" : undefined,
                        borderColor: isActive ? "#d4cdc4" : undefined,
                      }}
                      onMouseEnter={() => interaction.setHighlightedSourceSlug(slug)}
                      onMouseLeave={() => interaction.setHighlightedSourceSlug(null)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[15px] hover:text-primary transition-colors"
                          style={{ color: "#2a2a2a" }}
                        >
                          {resource.title}{" "}
                          <span className="text-[#aaa] text-xs">↗</span>
                        </a>
                      </div>
                      {resource.author && (
                        <p className="text-sm mt-0.5" style={{ color: "#c0553a" }}>
                          {resource.author}
                        </p>
                      )}
                      {resource.description && (
                        <p className="text-sm text-[#666] mt-2">
                          {resource.description}
                        </p>
                      )}
                      <div className="mt-3 pt-3 border-t border-[#f0ece7]">
                        <p className="text-xs text-[#999] tracking-wide uppercase mb-1.5">
                          Supports Connection
                        </p>
                        {info.connections.map((conn) => (
                          <div
                            key={conn}
                            className="flex items-center gap-1.5 text-sm text-[#555]"
                          >
                            <span className="text-[#999]">→</span>
                            <span>{conn}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center pt-4 mt-4 border-t border-[#e8e4df]">
                <p className="text-sm text-[#999] mb-2">
                  Explore the full editorial directory to suggest edits or additions
                  to the lineage.
                </p>
                <a
                  href="https://github.com/meninoebom/lineage/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: "#c0553a" }}
                >
                  Suggest an Edit
                </a>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
