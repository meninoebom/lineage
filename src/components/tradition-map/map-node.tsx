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
  // Scale font with zoom so labels stay proportional to circles
  const fontSize = Math.round(12 * Math.max(1, Math.pow(zoomScale, 0.65)));
  const radius = highlighted ? 8 : 6;
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
      {/* Colored circle with stroke for contrast */}
      <circle
        cx={position.x}
        cy={position.y}
        r={radius}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={1.5}
        style={{ transition: "r 0.2s ease" }}
      />

      {/* Counter-scaled text label */}
      <g transform={`translate(${position.x}, ${position.y}) scale(${inverseScale})`}>
        <text
          x={10}
          y={4}
          textAnchor="start"
          className="select-none"
          fill={highlighted ? colors.text : dimmed ? "rgba(51,51,51,0.2)" : colors.text}
          fontSize={fontSize}
          fontFamily="system-ui, sans-serif"
          fontWeight={highlighted ? 600 : 500}
          style={{ transition: "fill 0.2s ease, font-weight 0.2s ease" }}
        >
          {node.name}
        </text>
      </g>
    </g>
  );
}
