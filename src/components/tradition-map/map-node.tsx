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
  /** Entrance animation delay in ms — staggered by time period (top to bottom) */
  entranceDelay?: number;
}

/**
 * MapNode — text-first tradition node.
 *
 * The tradition name in italic serif IS the node. No circles.
 * A thin colored horizontal rule beneath the name acts as a visual anchor.
 * On hover: rule expands, family + century labels appear.
 *
 * CSS transitions on SVG elements replace Framer Motion for simpler,
 * more predictable animations without a runtime dependency.
 *
 * Counter-scales text by 1/zoomScale so labels stay readable at all zoom levels.
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

  const ruleWidth = highlighted ? 40 : 20;
  const opacity = dimmed ? 0.25 : 1;
  const textColor = highlighted
    ? colors.text
    : dimmed
      ? "#b5ada5"
      : "#4a4540";

  const centuryLabel = node.originCentury
    ? node.originCentury < 0
      ? `${Math.abs(node.originCentury) * 100} BCE`
      : `${node.originCentury * 100} CE`
    : "";

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
      {/* Counter-scaled group — text stays same screen size regardless of zoom */}
      <g transform={`translate(${position.x}, ${position.y}) scale(${inverseScale})`}>
        {/* Tradition name — the primary design element */}
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="auto"
          className="select-none"
          fill={textColor}
          fontSize={14}
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontWeight={highlighted ? 500 : 400}
          style={{ transition: "fill 0.2s ease, font-weight 0.2s ease" }}
        >
          {node.name}
        </text>

        {/* Colored horizontal rule beneath name */}
        <rect
          x={-ruleWidth / 2}
          y={4}
          width={ruleWidth}
          height={2}
          rx={1}
          fill={colors.fill}
          style={{
            transition: "width 0.2s ease, x 0.2s ease",
          }}
        />

        {/* Family label — visible on hover */}
        <text
          x={0}
          y={20}
          textAnchor="middle"
          fill={colors.text}
          fontSize={9}
          fontFamily="sans-serif"
          letterSpacing="0.08em"
          style={{
            textTransform: "uppercase" as const,
            transition: "opacity 0.2s ease",
            opacity: highlighted ? 0.7 : 0,
          }}
        >
          {node.family}
        </text>

        {/* Century label — visible on hover */}
        <text
          x={0}
          y={32}
          textAnchor="middle"
          fill="#8a8279"
          fontSize={9}
          fontFamily="sans-serif"
          style={{
            transition: "opacity 0.2s ease",
            opacity: highlighted ? 0.5 : 0,
          }}
        >
          {centuryLabel}
        </text>
      </g>
    </g>
  );
}
