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
import { MapLegend } from "./map-legend";
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

      <div>
        <div>
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
            {/* Floating map legend / filter */}
            <div className="absolute bottom-3 left-3 z-10">
              <MapLegend
                families={allFamilies}
                activeFamilies={activeFamilies}
                onToggle={handleToggleFamily}
              />
            </div>
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

      </div>

      {/* Further Reading — quiet bibliography below the map */}
      {mapResources.length > 0 && (
        <details className="mt-12 border-t border-border/50 pt-8">
          <summary className="font-serif text-lg font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors list-none">
            <span>Further Reading</span>
            <span className="text-xs text-muted-foreground/50 ml-2">
              ({mapResources.length})
            </span>
          </summary>
          <p className="text-sm text-muted-foreground/70 mt-3 mb-6 max-w-xl">
            Texts, teachings, and scholarship related to the traditions on this map.
          </p>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-x-8">
            {mapResources.map((r) => (
              <a
                key={r.slug}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-3 break-inside-avoid group"
              >
                <span className="font-serif text-[13px] italic text-foreground/80 group-hover:text-primary transition-colors">
                  {r.title}
                </span>
                {r.author && (
                  <span className="font-sans text-[12px] text-muted-foreground/60 ml-1">
                    · {r.author}
                  </span>
                )}
              </a>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
