import { FAMILY_COLORS, type GraphEdge, type GraphNode } from "@/lib/tradition-graph";
import type { ConnectionType } from "@/lib/types";
import type { ResourceMap } from "./tradition-map";

interface MapEdgeProps {
  edge: GraphEdge;
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  sourceNode?: GraphNode;
  highlighted: boolean;
  dimmed: boolean;
  hidden: boolean;
  showTooltip: boolean;
  onEdgeHover: (source: string | null, target: string | null) => void;
  /** Entrance animation delay in ms — edge draws in after connected nodes appear */
  entranceDelay?: number;
  resourceMap?: ResourceMap;
}

/**
 * Edge style configuration per connection type.
 *
 * - branch_of: solid line with arrowhead in child's family color
 * - influenced_by: dashed with small arrowhead, warm gray
 * - related_to: dotted, no arrow
 * - diverged_from: dashed with split symbol at midpoint
 */
const EDGE_STYLES: Record<
  ConnectionType,
  {
    strokeWidth: number;
    dashArray?: string;
    hasArrow: boolean;
    useSourceColor: boolean;
  }
> = {
  branch_of: { strokeWidth: 1.5, hasArrow: true, useSourceColor: true },
  influenced_by: {
    strokeWidth: 1,
    dashArray: "4 2",
    hasArrow: true,
    useSourceColor: false,
  },
  related_to: {
    strokeWidth: 0.8,
    dashArray: "1 2",
    hasArrow: false,
    useSourceColor: false,
  },
  diverged_from: {
    strokeWidth: 1,
    dashArray: "4 2",
    hasArrow: false,
    useSourceColor: false,
  },
};

const WARM_GRAY = "#b5ada5";

export function MapEdge({
  edge,
  sourcePos,
  targetPos,
  sourceNode,
  highlighted,
  dimmed,
  hidden,
  showTooltip,
  onEdgeHover,
  entranceDelay = 0,
  resourceMap = {},
}: MapEdgeProps) {
  const style = EDGE_STYLES[edge.connectionType] ?? EDGE_STYLES.related_to;

  // Determine stroke color
  const strokeColor =
    style.useSourceColor && sourceNode
      ? FAMILY_COLORS[sourceNode.family].fill
      : WARM_GRAY;

  // Subtle curve via quadratic bezier
  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const offset = Math.min(30, dist * 0.1);
  const controlX = midX - (dy * offset) / dist;
  const controlY = midY + (dx * offset) / dist;

  const pathD = `M ${sourcePos.x} ${sourcePos.y} Q ${controlX} ${controlY} ${targetPos.x} ${targetPos.y}`;

  // Unique marker ID for this edge (to avoid shared mutation across edges)
  const markerId = `arrow-${edge.source}-${edge.target}`;

  // Hidden edges are completely invisible (opacity 0, no pointer events)
  if (hidden) return null;

  const opacity = dimmed ? 0.15 : highlighted ? 1 : 0.5;

  return (
    <g
      style={{
        transition: "opacity 0.3s ease",
        opacity,
        animationDelay: `${entranceDelay}ms`,
      }}
      className="map-edge-entrance"
    >
      {/* Arrowhead marker definition (scoped to this edge for color) */}
      {style.hasArrow && (
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX={8}
            refY={5}
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} opacity={0.6} />
          </marker>
        </defs>
      )}

      {/* Invisible wider hit area for hover */}
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
        strokeWidth={highlighted ? style.strokeWidth + 0.5 : style.strokeWidth}
        strokeDasharray={style.dashArray}
        strokeLinecap="round"
        markerEnd={style.hasArrow ? `url(#${markerId})` : undefined}
        style={{ transition: "stroke-width 0.2s ease", pointerEvents: "none" }}
      />

      {/* Diverged-from split symbol at midpoint */}
      {edge.connectionType === "diverged_from" && (
        <g transform={`translate(${midX}, ${midY})`}>
          <line x1={-3} y1={-4} x2={-6} y2={4} stroke={strokeColor} strokeWidth={1} />
          <line x1={3} y1={-4} x2={6} y2={4} stroke={strokeColor} strokeWidth={1} />
        </g>
      )}

      {/* Edge tooltip — description + sources at midpoint */}
      {showTooltip && edge.description && (() => {
        const resolvedSources = (edge.sources ?? [])
          .map((slug) => resourceMap[slug])
          .filter(Boolean);
        const hasSource = resolvedSources.length > 0;
        return (
          <foreignObject
            x={midX - 160}
            y={midY - 80}
            width={320}
            height={hasSource ? 140 : 100}
            style={{ pointerEvents: "none", overflow: "visible" }}
          >
            <div
              style={{
                background: "#f5f0eb",
                border: "1px solid #d4cdc4",
                borderRadius: 6,
                padding: "10px 14px",
                fontSize: 12,
                fontFamily: "Georgia, serif",
                color: "#4a4540",
                lineHeight: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                maxWidth: 320,
              }}
            >
              <div>{edge.description}</div>
              {hasSource && (
                <div
                  style={{
                    marginTop: 6,
                    paddingTop: 6,
                    borderTop: "1px solid #d4cdc4",
                    fontSize: 11,
                    color: "#7a7570",
                    pointerEvents: "auto",
                  }}
                >
                  <span style={{ fontStyle: "italic" }}>Source: </span>
                  {resolvedSources.map((r, i) => (
                    <span key={i}>
                      {i > 0 && ", "}
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#9e4a3a",
                          textDecoration: "underline",
                          textDecorationStyle: "dotted",
                          textUnderlineOffset: "2px",
                        }}
                      >
                        {r.title}
                      </a>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </foreignObject>
        );
      })()}
    </g>
  );
}
