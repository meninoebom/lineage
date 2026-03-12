import type { GraphEdge } from "@/lib/tradition-graph";
import type { ResourceMap } from "./tradition-map";

interface MapEdgeProps {
  edge: GraphEdge;
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  highlighted: boolean;
  dimmed: boolean;
  hidden: boolean;
  showTooltip: boolean;
  onEdgeHover: (source: string | null, target: string | null) => void;
  onTooltipEnter: () => void;
  onTooltipLeave: () => void;
  entranceDelay?: number;
  resourceMap?: ResourceMap;
}

/**
 * MapEdge — bezier curve connection between traditions.
 *
 * Matches Figma's TimelineMap: vertical S-curves using cubic bezier
 * with control points at the vertical midpoint.
 * - branch_of: solid line, rgba(180, 140, 100)
 * - influenced_by: dashed (6 4), rgba(140, 140, 160)
 * - related_to / diverged_from: dotted, warm gray
 */
export function MapEdge({
  edge,
  sourcePos,
  targetPos,
  highlighted,
  dimmed,
  hidden,
  showTooltip,
  onEdgeHover,
  onTooltipEnter,
  onTooltipLeave,
  entranceDelay = 0,
  resourceMap = {},
}: MapEdgeProps) {
  if (hidden) return null;

  const isBranch = edge.connectionType === "branch_of";
  const strokeColor = isBranch ? "rgb(180, 140, 100)" : "rgb(140, 140, 160)";
  const strokeWidth = highlighted ? 2.5 : 1.5;
  const dashArray = isBranch ? undefined : "6 4";

  // Figma-style vertical bezier: control points at midY
  const midY = (sourcePos.y + targetPos.y) / 2;
  const pathD = `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x} ${midY}, ${targetPos.x} ${midY}, ${targetPos.x} ${targetPos.y}`;

  const opacity = dimmed ? 0.12 : highlighted ? 1 : 0.5;

  const midX = (sourcePos.x + targetPos.x) / 2;

  return (
    <g
      style={{
        transition: "opacity 0.3s ease",
        opacity,
        animationDelay: `${entranceDelay}ms`,
      }}
      className="map-edge-entrance"
    >
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
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        style={{ transition: "stroke-width 0.2s ease", pointerEvents: "none" }}
      />

      {/* Edge tooltip */}
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
            style={{ overflow: "visible" }}
          >
            <div
              onMouseEnter={onTooltipEnter}
              onMouseLeave={onTooltipLeave}
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
