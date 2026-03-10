"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  buildTraditionGraph,
  getFamilies,
  filterByFamilies,
  getConnectedSlugs,
  type TraditionInput,
} from "@/lib/tradition-graph";
import type { TraditionFamily } from "@/lib/types";
import { MapNode } from "./map-node";
import { MapEdge } from "./map-edge";
import { FamilyFilter } from "./family-filter";
import {
  DESKTOP_POSITIONS,
  MOBILE_POSITIONS,
  DESKTOP_VIEWBOX,
  MOBILE_VIEWBOX,
  getFallbackPosition,
} from "./tradition-map-layout";

interface TraditionMapProps {
  traditions: TraditionInput[];
}

/**
 * TraditionMap — the signature visualization of Lineage.
 *
 * An editorial, hand-crafted SVG map showing contemplative traditions
 * as typographic nodes with subtle connecting lines. Designed to feel
 * like a beautiful diagram from a Lapham's Quarterly feature, not a
 * tech dashboard.
 *
 * Architecture notes:
 * - Receives tradition data as props (server component passes data down)
 * - All interactivity is client-side (hover, click, filter)
 * - Positions are hand-crafted, not force-directed
 * - Framer Motion handles entrance animations and hover transitions
 * - Responsive: different layouts for desktop and mobile
 */
export function TraditionMap({ traditions }: TraditionMapProps) {
  const router = useRouter();
  const fullGraph = useMemo(() => buildTraditionGraph(traditions), [traditions]);
  const allFamilies = useMemo(() => getFamilies(fullGraph), [fullGraph]);

  const [activeFamilies, setActiveFamilies] = useState<Set<TraditionFamily>>(
    () => new Set(allFamilies)
  );
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const graph = useMemo(
    () => filterByFamilies(fullGraph, activeFamilies),
    [fullGraph, activeFamilies]
  );

  const connectedToHovered = useMemo(
    () => (hoveredSlug ? getConnectedSlugs(fullGraph, hoveredSlug) : new Set<string>()),
    [fullGraph, hoveredSlug]
  );

  const handleToggleFamily = useCallback((family: TraditionFamily) => {
    setActiveFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(family)) {
        // Don't allow deselecting all families
        if (next.size > 1) next.delete(family);
      } else {
        next.add(family);
      }
      return next;
    });
  }, []);

  const handleNodeClick = useCallback(
    (slug: string) => {
      router.push(`/traditions/${slug}`);
    },
    [router]
  );

  const handleNodeHover = useCallback((slug: string | null) => {
    setHoveredSlug(slug);
  }, []);

  // Pre-compute position maps for all visible nodes (avoids O(n^2) lookups)
  const { desktopPositions, mobilePositions } = useMemo(() => {
    const desktop: Record<string, { x: number; y: number }> = {};
    const mobile: Record<string, { x: number; y: number }> = {};
    let desktopFallbackIdx = 0;
    let mobileFallbackIdx = 0;
    for (const node of graph.nodes) {
      desktop[node.slug] = DESKTOP_POSITIONS[node.slug] ?? getFallbackPosition(desktopFallbackIdx++, false);
      mobile[node.slug] = MOBILE_POSITIONS[node.slug] ?? getFallbackPosition(mobileFallbackIdx++, true);
      // Only increment fallback index for unknown slugs
      if (DESKTOP_POSITIONS[node.slug]) desktopFallbackIdx--;
      if (MOBILE_POSITIONS[node.slug]) mobileFallbackIdx--;
    }
    return { desktopPositions: desktop, mobilePositions: mobile };
  }, [graph.nodes]);

  const getPosition = useCallback(
    (slug: string, isMobile: boolean) => {
      const positions = isMobile ? mobilePositions : desktopPositions;
      return positions[slug] ?? { x: 500, y: 275 };
    },
    [desktopPositions, mobilePositions]
  );

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="mb-8">
        <FamilyFilter
          families={allFamilies}
          activeFamilies={activeFamilies}
          onToggle={handleToggleFamily}
        />
      </div>

      {/* Desktop SVG — hidden on mobile */}
      <svg
        className="hidden sm:block w-full h-auto"
        viewBox={`0 0 ${DESKTOP_VIEWBOX.width} ${DESKTOP_VIEWBOX.height}`}
        aria-label="Interactive map of contemplative traditions"
        role="img"
      >
        {/* Edges first (behind nodes) */}
        {graph.edges.map((edge) => (
          <MapEdge
            key={`${edge.source}--${edge.target}`}
            edge={edge}
            sourcePos={getPosition(edge.source, false)}
            targetPos={getPosition(edge.target, false)}
            highlighted={
              hoveredSlug === edge.source || hoveredSlug === edge.target
            }
            dimmed={
              hoveredSlug !== null &&
              hoveredSlug !== edge.source &&
              hoveredSlug !== edge.target
            }
          />
        ))}

        {/* Family region labels — subtle background text */}
        {allFamilies
          .filter((f) => activeFamilies.has(f))
          .map((family) => {
            const familyNodes = graph.nodes.filter((n) => n.family === family);
            if (familyNodes.length === 0) return null;
            const positions = familyNodes.map((n) => getPosition(n.slug, false));
            const avgX = positions.reduce((s, p) => s + p.x, 0) / positions.length;
            const minY = Math.min(...positions.map((p) => p.y));
            return (
              <text
                key={family}
                x={avgX}
                y={minY - 45}
                textAnchor="middle"
                className="font-sans select-none pointer-events-none"
                fill="#d4c8bc"
                fontSize={11}
                letterSpacing="0.15em"
                textDecoration="none"
              >
                {family.toUpperCase()}
              </text>
            );
          })}

        {/* Nodes */}
        {graph.nodes.map((node, i) => (
          <MapNode
            key={node.slug}
            node={node}
            position={getPosition(node.slug, false)}
            highlighted={hoveredSlug === node.slug}
            connected={connectedToHovered.has(node.slug)}
            dimmed={
              hoveredSlug !== null &&
              hoveredSlug !== node.slug &&
              !connectedToHovered.has(node.slug)
            }
            onHover={handleNodeHover}
            onClick={handleNodeClick}
            index={i}
          />
        ))}
      </svg>

      {/* Mobile SVG — hidden on desktop */}
      <svg
        className="block sm:hidden w-full h-auto"
        viewBox={`0 0 ${MOBILE_VIEWBOX.width} ${MOBILE_VIEWBOX.height}`}
        aria-label="Interactive map of contemplative traditions"
        role="img"
      >
        {graph.edges.map((edge) => (
          <MapEdge
            key={`m-${edge.source}--${edge.target}`}
            edge={edge}
            sourcePos={getPosition(edge.source, true)}
            targetPos={getPosition(edge.target, true)}
            highlighted={
              hoveredSlug === edge.source || hoveredSlug === edge.target
            }
            dimmed={
              hoveredSlug !== null &&
              hoveredSlug !== edge.source &&
              hoveredSlug !== edge.target
            }
          />
        ))}

        {allFamilies
          .filter((f) => activeFamilies.has(f))
          .map((family) => {
            const familyNodes = graph.nodes.filter((n) => n.family === family);
            if (familyNodes.length === 0) return null;
            const positions = familyNodes.map((n) => getPosition(n.slug, true));
            const avgX = positions.reduce((s, p) => s + p.x, 0) / positions.length;
            const minY = Math.min(...positions.map((p) => p.y));
            return (
              <text
                key={family}
                x={avgX}
                y={minY - 35}
                textAnchor="middle"
                className="font-sans select-none pointer-events-none"
                fill="#d4c8bc"
                fontSize={10}
                letterSpacing="0.15em"
              >
                {family.toUpperCase()}
              </text>
            );
          })}

        {graph.nodes.map((node, i) => (
          <MapNode
            key={node.slug}
            node={node}
            position={getPosition(node.slug, true)}
            highlighted={hoveredSlug === node.slug}
            connected={connectedToHovered.has(node.slug)}
            dimmed={
              hoveredSlug !== null &&
              hoveredSlug !== node.slug &&
              !connectedToHovered.has(node.slug)
            }
            onHover={handleNodeHover}
            onClick={handleNodeClick}
            index={i}
          />
        ))}
      </svg>

      {/* Tooltip / detail on hover */}
      {hoveredSlug && (
        <div className="mt-4 text-center animate-in fade-in duration-200">
          <p className="text-sm text-muted-foreground italic max-w-md mx-auto">
            {graph.nodes.find((n) => n.slug === hoveredSlug)?.summary}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground font-sans">
        <span className="flex items-center gap-2">
          <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#d4c8bc" strokeWidth="1.2" strokeDasharray="6 4" /></svg>
          Related
        </span>
        <span className="flex items-center gap-2">
          <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#d4c8bc" strokeWidth="1.2" strokeDasharray="2 3" /></svg>
          Influenced by
        </span>
        <span className="flex items-center gap-2">
          <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#d4c8bc" strokeWidth="1.2" /></svg>
          Branch of
        </span>
      </div>
    </div>
  );
}
