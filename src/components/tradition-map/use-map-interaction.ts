"use client";

import { useState, useMemo, useCallback, useRef } from "react";
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
  // Source bibliography hover — highlights all edges citing this resource
  const [highlightedSourceSlug, setHighlightedSourceSlug] = useState<string | null>(null);

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

  // Delayed edge unhover — gives user time to move mouse to the tooltip
  const edgeHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEdgeHover = useCallback(
    (source: string | null, target: string | null) => {
      if (edgeHideTimer.current) {
        clearTimeout(edgeHideTimer.current);
        edgeHideTimer.current = null;
      }
      if (source && target) {
        setHoveredEdgeKey(`${source}--${target}`);
      } else {
        // Delay hiding so user can move mouse to tooltip
        edgeHideTimer.current = setTimeout(() => {
          setHoveredEdgeKey(null);
        }, 300);
      }
    },
    []
  );

  // Allow tooltip itself to keep the edge hovered
  const handleTooltipEnter = useCallback(() => {
    if (edgeHideTimer.current) {
      clearTimeout(edgeHideTimer.current);
      edgeHideTimer.current = null;
    }
  }, []);

  const handleTooltipLeave = useCallback(() => {
    edgeHideTimer.current = setTimeout(() => {
      setHoveredEdgeKey(null);
    }, 200);
  }, []);

  const isNodeHighlighted = useCallback(
    (slug: string) => slug === activeSlug,
    [activeSlug]
  );

  const isNodeConnected = useCallback(
    (slug: string) => connectedSlugs.has(slug),
    [connectedSlugs]
  );

  // Nodes connected to source-cited edges
  const sourceNodeSlugs = useMemo(() => {
    if (!highlightedSourceSlug) return new Set<string>();
    const slugs = new Set<string>();
    for (const edge of graph.edges) {
      if (edge.sources?.includes(highlightedSourceSlug)) {
        slugs.add(edge.source);
        slugs.add(edge.target);
      }
    }
    return slugs;
  }, [graph, highlightedSourceSlug]);

  const isNodeDimmed = useCallback(
    (slug: string) => {
      if (highlightedSourceSlug) return !sourceNodeSlugs.has(slug);
      return activeSlug !== null && slug !== activeSlug && !connectedSlugs.has(slug);
    },
    [activeSlug, connectedSlugs, highlightedSourceSlug, sourceNodeSlugs]
  );

  // Edges that cite the highlighted source
  const sourceEdgeKeys = useMemo(() => {
    if (!highlightedSourceSlug) return new Set<string>();
    const keys = new Set<string>();
    for (const edge of graph.edges) {
      if (edge.sources?.includes(highlightedSourceSlug)) {
        keys.add(`${edge.source}--${edge.target}`);
      }
    }
    return keys;
  }, [graph, highlightedSourceSlug]);

  const isEdgeHighlighted = useCallback(
    (source: string, target: string) => {
      const key = `${source}--${target}`;
      return connectedEdgeKeys.has(key) || sourceEdgeKeys.has(key);
    },
    [connectedEdgeKeys, sourceEdgeKeys]
  );

  const isEdgeDimmed = useCallback(
    (source: string, target: string) => {
      const key = `${source}--${target}`;
      if (highlightedSourceSlug) return !sourceEdgeKeys.has(key);
      return activeSlug !== null && !connectedEdgeKeys.has(key);
    },
    [activeSlug, connectedEdgeKeys, highlightedSourceSlug, sourceEdgeKeys]
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
    handleTooltipEnter,
    handleTooltipLeave,
    highlightedSourceSlug,
    setHighlightedSourceSlug,
    isNodeHighlighted,
    isNodeConnected,
    isNodeDimmed,
    isEdgeHighlighted,
    isEdgeDimmed,
    isEdgeHidden,
  };
}
