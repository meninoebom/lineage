"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { select } from "d3-selection";

export interface MapTransform {
  x: number;
  y: number;
  k: number;
}

const INITIAL_TRANSFORM: MapTransform = { x: 0, y: 0, k: 1 };

/**
 * Custom hook wrapping d3-zoom for the tradition map.
 *
 * D3 handles zoom behavior ONLY — React owns all DOM rendering.
 * The hook attaches d3-zoom to an SVG ref and provides a `transform`
 * that React applies as `<g transform={...}>`.
 *
 * Pattern: D3 as a state machine, React as the renderer.
 * This keeps the component tree predictable and testable.
 */
export function useMapZoom(
  svgRef: React.RefObject<SVGSVGElement | null>,
  options: { minZoom?: number; maxZoom?: number } = {}
) {
  const { minZoom = 1, maxZoom = 3 } = options;
  const [transform, setTransform] = useState<MapTransform>(INITIAL_TRANSFORM);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([minZoom, maxZoom])
      .on("zoom", (event) => {
        const { x, y, k } = event.transform;
        setTransform({ x, y, k });
      });

    zoomBehaviorRef.current = zoomBehavior;
    select(svg).call(zoomBehavior);

    return () => {
      select(svg).on(".zoom", null);
    };
  }, [svgRef, minZoom, maxZoom]);

  const resetZoom = useCallback(() => {
    const svg = svgRef.current;
    const zoomBehavior = zoomBehaviorRef.current;
    if (!svg || !zoomBehavior) return;
    select(svg).call(zoomBehavior.transform, zoomIdentity);
  }, [svgRef]);

  return { transform, resetZoom };
}
