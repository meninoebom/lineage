import type { GraphEdge } from "@/lib/tradition-graph";

interface MapEdgeProps {
  edge: GraphEdge;
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  highlighted: boolean;
  dimmed: boolean;
  hidden: boolean;
  onEdgeHover: (source: string | null, target: string | null) => void;
  entranceDelay?: number;
}

/**
 * MapEdge — bezier curve connection between traditions.
 *
 * Renders only the path and hit area. Tooltips are rendered separately
 * in MapCanvas as a top-level layer for correct z-ordering.
 */
export function MapEdge({
  edge,
  sourcePos,
  targetPos,
  highlighted,
  dimmed,
  hidden,
  onEdgeHover,
  entranceDelay = 0,
}: MapEdgeProps) {
  if (hidden) return null;

  const isBranch = edge.connectionType === "branch_of";
  const strokeColor = isBranch ? "rgb(180, 140, 100)" : "rgb(140, 140, 160)";
  const strokeWidth = highlighted ? 2.5 : 1.5;
  const dashArray = isBranch ? undefined : "6 4";

  const midY = (sourcePos.y + targetPos.y) / 2;
  const pathD = `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x} ${midY}, ${targetPos.x} ${midY}, ${targetPos.x} ${targetPos.y}`;

  const opacity = dimmed ? 0.12 : highlighted ? 1 : 0.5;

  return (
    <g
      style={{
        transition: "opacity 0.3s ease",
        opacity,
        animationDelay: `${entranceDelay}ms`,
      }}
      className="map-edge-entrance"
    >
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        onMouseEnter={() => onEdgeHover(edge.source, edge.target)}
        onMouseLeave={() => onEdgeHover(null, null)}
        style={{ cursor: "default" }}
      />

      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        style={{ transition: "stroke-width 0.2s ease", pointerEvents: "none" }}
      />
    </g>
  );
}
