"use client";

import { motion } from "framer-motion";
import { FAMILY_COLORS, type GraphNode } from "@/lib/tradition-graph";
import type { NodePosition } from "./tradition-map-layout";

interface MapNodeProps {
  node: GraphNode;
  position: NodePosition;
  highlighted: boolean;
  connected: boolean;
  dimmed: boolean;
  onHover: (slug: string | null) => void;
  onClick: (slug: string) => void;
  index: number;
}

/**
 * A single tradition node in the map.
 *
 * Design: small filled circle with the tradition name as a typographic label.
 * The name IS the design element — large, serif, editorial.
 * The circle is a subtle anchor point, not a dominant shape.
 */
export function MapNode({
  node,
  position,
  highlighted,
  connected,
  dimmed,
  onHover,
  onClick,
  index,
}: MapNodeProps) {
  const colors = FAMILY_COLORS[node.family];
  const circleRadius = highlighted ? 8 : 6;

  return (
    <motion.g
      className="cursor-pointer"
      onMouseEnter={() => onHover(node.slug)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(node.slug)}
      role="button"
      aria-label={`${node.name} — ${node.family} tradition`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(node.slug);
        }
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: dimmed ? 0.25 : 1,
        scale: 1,
      }}
      transition={{
        opacity: { duration: 0.3 },
        scale: { duration: 0.5, delay: index * 0.08, ease: "easeOut" },
      }}
    >
      {/* Background glow on highlight */}
      {highlighted && (
        <motion.circle
          cx={position.x}
          cy={position.y}
          r={20}
          fill={colors.fill}
          opacity={0.12}
          initial={{ r: 8 }}
          animate={{ r: 20 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main circle */}
      <motion.circle
        cx={position.x}
        cy={position.y}
        r={circleRadius}
        fill={highlighted || connected ? colors.fill : colors.fill}
        stroke={highlighted ? colors.stroke : "transparent"}
        strokeWidth={highlighted ? 2 : 0}
        animate={{ r: circleRadius }}
        transition={{ duration: 0.2 }}
      />

      {/* Tradition name — the primary design element */}
      <motion.text
        x={position.x}
        y={position.y - 16}
        textAnchor="middle"
        className="font-serif select-none pointer-events-none"
        fill={highlighted ? colors.text : dimmed ? "#b5ada5" : "#4a4540"}
        fontSize={highlighted ? 16 : 14}
        fontWeight={highlighted ? 500 : 400}
        fontStyle="italic"
        animate={{
          fontSize: highlighted ? 16 : 14,
          fill: highlighted ? colors.text : dimmed ? "#b5ada5" : "#4a4540",
        }}
        transition={{ duration: 0.2 }}
      >
        {node.name}
      </motion.text>

      {/* Family label — subtle, only visible on highlight */}
      {highlighted && (
        <motion.text
          x={position.x}
          y={position.y + 24}
          textAnchor="middle"
          className="font-sans select-none pointer-events-none"
          fill={colors.text}
          fontSize={10}
          letterSpacing="0.08em"
          style={{ textTransform: "uppercase" }}
          initial={{ opacity: 0, y: position.y + 18 }}
          animate={{ opacity: 0.7, y: position.y + 24 }}
          transition={{ duration: 0.2 }}
        >
          {node.family}
        </motion.text>
      )}
    </motion.g>
  );
}
