"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { TraditionGraph } from "@/lib/tradition-graph";
import { getConnectedSlugs } from "@/lib/tradition-graph";

/**
 * Manages map interaction state: hover, selection, and navigation.
 *
 * Extracted from TraditionMap so the interaction logic is independently testable
 * and decoupled from rendering concerns.
 */
export function useMapInteraction(graph: TraditionGraph) {
  const router = useRouter();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

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

  return {
    hoveredSlug,
    selectedSlug,
    activeSlug,
    handleNodeHover,
    handleNodeClick,
    handleNodeSelect,
    isNodeHighlighted,
    isNodeConnected,
    isNodeDimmed,
    isEdgeHighlighted,
    isEdgeDimmed,
  };
}
