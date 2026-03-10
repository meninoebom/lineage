"use client";

import { motion } from "framer-motion";
import type { GraphEdge } from "@/lib/tradition-graph";
import type { NodePosition } from "./tradition-map-layout";

interface MapEdgeProps {
  edge: GraphEdge;
  sourcePos: NodePosition;
  targetPos: NodePosition;
  highlighted: boolean;
  dimmed: boolean;
}

/**
 * A single connection line between two tradition nodes.
 *
 * Uses a subtle curved path (quadratic bezier) rather than a straight line
 * for a more organic, editorial feel. The curve direction alternates
 * to avoid overlapping edges.
 */
export function MapEdge({
  edge,
  sourcePos,
  targetPos,
  highlighted,
  dimmed,
}: MapEdgeProps) {
  // Create a subtle curve using a control point offset from midpoint
  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  // Perpendicular offset for curve — subtle, not dramatic
  const offset = Math.min(30, Math.sqrt(dx * dx + dy * dy) * 0.1);
  const controlX = midX - dy * offset / Math.sqrt(dx * dx + dy * dy + 1);
  const controlY = midY + dx * offset / Math.sqrt(dx * dx + dy * dy + 1);

  const pathD = `M ${sourcePos.x} ${sourcePos.y} Q ${controlX} ${controlY} ${targetPos.x} ${targetPos.y}`;

  // Connection type determines dash pattern
  const dashArray =
    edge.connectionType === "related_to"
      ? "6 4"
      : edge.connectionType === "influenced_by"
        ? "2 3"
        : undefined;

  return (
    <motion.path
      d={pathD}
      fill="none"
      stroke={highlighted ? "#9e4a3a" : "#d4c8bc"}
      strokeWidth={highlighted ? 2 : 1.2}
      strokeDasharray={dashArray}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{
        pathLength: 1,
        opacity: dimmed ? 0.15 : highlighted ? 1 : 0.5,
      }}
      transition={{
        pathLength: { duration: 1.2, ease: "easeInOut" },
        opacity: { duration: 0.3 },
      }}
    />
  );
}
