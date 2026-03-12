"use client";

import { FAMILY_COLORS, type GraphNode } from "@/lib/tradition-graph";

interface MapNodeProps {
  node: GraphNode;
  position: { x: number; y: number };
  highlighted: boolean;
  connected: boolean;
  dimmed: boolean;
  zoomScale: number;
  onHover: (slug: string | null) => void;
  onClick: (slug: string) => void;
  entranceDelay?: number;
}

/**
 * MapNode — colored circle with text label.
 *
 * Matches the Figma design: small colored dot (radius 5, 7 when highlighted)
 * with the tradition name as a text label to the right.
 * Counter-scales by 1/zoomScale so labels stay readable at all zoom levels.
 */
export function MapNode({
  node,
  position,
  highlighted,
  connected,
  dimmed,
  zoomScale,
  onHover,
  onClick,
  entranceDelay = 0,
}: MapNodeProps) {
  const colors = FAMILY_COLORS[node.family];
  const inverseScale = 1 / zoomScale;
  const radius = highlighted ? 7 : 5;
  const opacity = dimmed ? 0.2 : 1;

  return (
    <g
      className="cursor-pointer map-node-entrance"
      style={{
        transition: "opacity 0.3s ease",
        opacity,
        animationDelay: `${entranceDelay}ms`,
      }}
      onMouseEnter={() => onHover(node.slug)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(node.slug)}
      role="link"
      aria-label={`${node.name} — ${node.family} tradition`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(node.slug);
        }
      }}
    >
      {/* Colored circle */}
      <circle
        cx={position.x}
        cy={position.y}
        r={radius}
        fill={colors.fill}
        style={{ transition: "r 0.2s ease" }}
      />

      {/* Counter-scaled text label */}
      <g transform={`translate(${position.x}, ${position.y}) scale(${inverseScale})`}>
        <text
          x={10}
          y={4}
          textAnchor="start"
          className="select-none"
          fill={highlighted ? "#333" : dimmed ? "rgba(51,51,51,0.2)" : "#333"}
          fontSize={12}
          fontFamily="system-ui, sans-serif"
          fontWeight={highlighted ? 600 : 400}
          style={{ transition: "fill 0.2s ease, font-weight 0.2s ease" }}
        >
          {node.name}
        </text>
      </g>
    </g>
  );
}
