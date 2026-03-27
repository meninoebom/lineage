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

export type ResourceMap = Record<string, { title: string; url: string; author?: string | null; description?: string; traditions?: string[] }>;

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

export function TraditionMap({ traditions, resourceMap = {} }: TraditionMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const layout = layoutData as LayoutMap;
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device on mount — subscribe pattern satisfies react-hooks/set-state-in-effect
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    handler({ matches: mq.matches } as MediaQueryListEvent);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const fullGraph = useMemo(() => buildTraditionGraph(traditions), [traditions]);

  // Collect all resources that relate to traditions on the map
  const mapResources = useMemo(() => {
    const traditionSlugs = new Set(fullGraph.nodes.map((n) => n.slug));
    return Object.entries(resourceMap)
      .filter(([, r]) => r.traditions?.some((t) => traditionSlugs.has(t)))
      .map(([slug, r]) => {
        const matched = (r.traditions ?? [])
          .filter((t) => traditionSlugs.has(t))
          .map((t) => ({ slug: t, name: fullGraph.nodes.find((n) => n.slug === t)?.name }))
          .filter((t): t is { slug: string; name: string } => !!t.name);
        return {
          slug,
          ...r,
          traditions: matched,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [fullGraph, resourceMap]);

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

  // Click a node → select it (filter sidebar + focus map). Same on desktop and touch.
  // On touch, second tap on same node navigates. On desktop, use the link in summary.
  const { selectedSlug, handleNodeClick, handleNodeSelect, handleNodeHover, handleBackgroundTap } = interaction;
  const nodeHoverHandler = isTouchDevice ? () => {} : handleNodeHover;
  const nodeClickHandler = useCallback(
    (slug: string) => {
      if (isTouchDevice && selectedSlug === slug) {
        handleNodeClick(slug);
      } else {
        handleNodeSelect(slug);
      }
    },
    [isTouchDevice, selectedSlug, handleNodeClick, handleNodeSelect]
  );

  // Background click deselects on all devices
  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (e.target === e.currentTarget) {
        handleBackgroundTap();
      }
    },
    [handleBackgroundTap]
  );

  // Build a slug→family lookup for filtering resources by active families
  const slugToFamily = useMemo(() => {
    const map = new Map<string, TraditionFamily>();
    for (const node of fullGraph.nodes) {
      map.set(node.slug, node.family);
    }
    return map;
  }, [fullGraph]);

  // Auto-clear selectedSlug when its family is toggled off
  useEffect(() => {
    if (selectedSlug) {
      const family = slugToFamily.get(selectedSlug);
      if (family && !activeFamilies.has(family)) {
        handleBackgroundTap();
      }
    }
  }, [selectedSlug, activeFamilies, slugToFamily, handleBackgroundTap]);

  // Filter sidebar resources by active families AND selected tradition
  const filteredResources = useMemo(() => {
    let resources = mapResources.filter((r) =>
      r.traditions.some((t) => {
        const family = slugToFamily.get(t.slug);
        return family && activeFamilies.has(family);
      })
    );
    if (selectedSlug) {
      resources = resources.filter((r) =>
        r.traditions.some((t) => t.slug === selectedSlug)
      );
    }
    return resources;
  }, [mapResources, selectedSlug, activeFamilies, slugToFamily]);

  const selectedTraditionName = selectedSlug
    ? graph.nodes.find((n) => n.slug === selectedSlug)?.name
    : null;

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
        @keyframes fade-out-delayed {
          0%, 70% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-out-delayed {
          animation: fade-out-delayed 4s ease-out forwards;
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

      {/* Legend */}
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
          <div className="relative bg-white rounded-lg shadow-sm">
            <svg
              ref={svgRef}
              className="w-full h-auto"
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
              style={{ maxHeight: "80vh", minHeight: "60vh", touchAction: "none" }}
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
                  activeSlug={interaction.activeSlug}
                  onNodeDeselect={handleBackgroundTap}
                  onPopoverEnter={interaction.handlePopoverEnter}
                  onPopoverLeave={interaction.handlePopoverLeave}
                />
              </g>
            </svg>
            {/* Mobile hint — fades out after first interaction */}
            {isTouchDevice && (
              <div
                className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none
                  bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-sans
                  animate-fade-out-delayed"
              >
                Pinch to zoom &middot; Drag to explore
              </div>
            )}
          </div>
        </div>

        {/* Sources sidebar */}
        {mapResources.length > 0 && (
          <aside className="w-full lg:w-[320px] lg:shrink-0">
            <div className="lg:sticky lg:top-20 overflow-y-auto max-h-[800px]">
              {/* Header with optional filter label and count */}
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="font-serif text-xl font-normal">
                  {selectedTraditionName
                    ? `Sources for ${selectedTraditionName}`
                    : "Sources"}
                  {filteredResources.length !== mapResources.length && (
                    <span className="text-sm font-sans font-normal text-[#999] ml-2">
                      ({filteredResources.length} of {mapResources.length})
                    </span>
                  )}
                </h2>
                {selectedSlug && (
                  <button
                    onClick={() => handleBackgroundTap()}
                    className="text-xs hover:underline"
                    style={{ color: "#c0553a" }}
                  >
                    Show all
                  </button>
                )}
              </div>

              {/* Fixed-height intro area — content swaps but height stays stable */}
              <div className="mb-4 min-h-[3.5rem]">
                {selectedSlug ? (
                  <p className="text-sm text-muted-foreground">
                    Showing sources related to {selectedTraditionName}. Click another tradition or &ldquo;Show all&rdquo; to change.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    These are the texts, teachings, and references we drew on to build
                    this map. Click a tradition to filter.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {filteredResources.length === 0 && selectedSlug && (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#999] mb-2">
                      No sources yet for {selectedTraditionName}.
                    </p>
                    <p className="text-sm" style={{ color: "#c0553a" }}>
                      Use the feedback button to suggest sources
                    </p>
                  </div>
                )}
                {filteredResources.map((r) => (
                  <div
                    key={r.slug}
                    className="bg-white border border-[#e8e4df] rounded-lg p-3 hover:bg-accent/50 transition-all duration-200"
                  >
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] font-semibold leading-snug hover:text-primary transition-colors"
                      style={{ color: "#1a1a1a" }}
                    >
                      {r.title}{" "}
                      <span className="text-[#aaa] text-xs">↗</span>
                    </a>
                    {r.author && (
                      <p className="text-[13px] mt-0.5" style={{ color: "#9e4a3a" }}>
                        {r.author}
                      </p>
                    )}
                    {r.traditions.length > 0 && (
                      <p className="text-xs mt-1.5 flex flex-wrap gap-x-1.5 gap-y-0.5">
                        {r.traditions.map((t) => (
                          <button
                            key={t.slug}
                            onClick={() => handleNodeSelect(t.slug)}
                            aria-label={`Filter by ${t.name}`}
                            aria-pressed={t.slug === selectedSlug}
                            className="hover:underline transition-colors cursor-pointer"
                            style={{
                              color: t.slug === selectedSlug ? "#9e4a3a" : "#777",
                            }}
                          >
                            {t.name}
                          </button>
                        ))}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center pt-4 mt-4 border-t border-[#e8e4df]">
                <p className="text-sm text-[#999]">
                  This map is a living document. Use the feedback button to
                  suggest sources, corrections, or new connections.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
