"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { TraditionGraph } from "@/lib/tradition-graph";
import type { ConnectionType } from "@/lib/types";
import { getConnectedSlugs } from "@/lib/tradition-graph";

/**
 * Manages map interaction state: hover, selection, tap, and edge visibility.
 *
 * Key behaviors:
 * - `related_to` edges are hidden by default, revealed on hover/select of connected node
 * - `branch_of` and `influenced_by` edges are always visible
 * - Touch devices use tap-to-select instead of hover
 * - Edge hover state tracks which edge to show a tooltip for
 */
export function useMapInteraction(graph: TraditionGraph) {
  const router = useRouter();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [hoveredEdgeKey, setHoveredEdgeKey] = useState<string | null>(null);

  const activeSlug = hoveredSlug ?? selectedSlug;

  const connectedSlugs = useMemo(
    () => (activeSlug ? getConnectedSlugs(graph, activeSlug) : new Set<string>()),
    [graph, activeSlug]
  );

  const connectedEdgeKeys = useMemo(() => {
    if (!activeSlug) return new Set<string>();
    const keys = new Set<string>();
    for (const edge of graph.edges) {
      if (edge.source === activeSlug || edge.target === activeSlug) {
        keys.add(`${edge.source}--${edge.target}`);
      }
    }
    return keys;
  }, [graph, activeSlug]);

  const handleNodeHover = useCallback((slug: string | null) => {
    setHoveredSlug(slug);
  }, []);

  const handleNodeClick = useCallback(
    (slug: string) => {
      router.push(`/traditions/${slug}`);
    },
    [router]
  );

  const handleNodeSelect = useCallback((slug: string) => {
    setSelectedSlug((prev) => (prev === slug ? null : slug));
  }, []);

  const handleBackgroundTap = useCallback(() => {
    setSelectedSlug(null);
  }, []);

  const handleEdgeHover = useCallback(
    (source: string | null, target: string | null) => {
      if (source && target) {
        setHoveredEdgeKey(`${source}--${target}`);
      } else {
        setHoveredEdgeKey(null);
      }
    },
    []
  );

  const isNodeHighlighted = useCallback(
    (slug: string) => slug === activeSlug,
    [activeSlug]
  );

  const isNodeConnected = useCallback(
    (slug: string) => connectedSlugs.has(slug),
    [connectedSlugs]
  );

  const isNodeDimmed = useCallback(
    (slug: string) =>
      activeSlug !== null && slug !== activeSlug && !connectedSlugs.has(slug),
    [activeSlug, connectedSlugs]
  );

  const isEdgeHighlighted = useCallback(
    (source: string, target: string) =>
      connectedEdgeKeys.has(`${source}--${target}`),
    [connectedEdgeKeys]
  );

  const isEdgeDimmed = useCallback(
    (source: string, target: string) =>
      activeSlug !== null && !connectedEdgeKeys.has(`${source}--${target}`),
    [activeSlug, connectedEdgeKeys]
  );

  /**
   * Determines if an edge should be hidden (not rendered at all).
   * `related_to` edges are hidden unless a connected node is active.
   */
  const isEdgeHidden = useCallback(
    (source: string, target: string, connectionType: ConnectionType) => {
      if (connectionType !== "related_to") return false;
      // Show related_to only when either endpoint is active
      if (!activeSlug) return true;
      return source !== activeSlug && target !== activeSlug;
    },
    [activeSlug]
  );

  return {
    hoveredSlug,
    selectedSlug,
    activeSlug,
    hoveredEdgeKey,
    handleNodeHover,
    handleNodeClick,
    handleNodeSelect,
    handleBackgroundTap,
    handleEdgeHover,
    isNodeHighlighted,
    isNodeConnected,
    isNodeDimmed,
    isEdgeHighlighted,
    isEdgeDimmed,
    isEdgeHidden,
  };
}
