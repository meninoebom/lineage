import type { GraphEdge } from "@/lib/tradition-graph";
import type { ResourceMap } from "./tradition-map";

interface MapEdgeTooltipProps {
  edge: GraphEdge;
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  onTooltipEnter: () => void;
  onTooltipLeave: () => void;
  resourceMap: ResourceMap;
}

/**
 * Edge tooltip — rendered in a separate SVG layer above nodes
 * for correct z-ordering.
 */
export function MapEdgeTooltip({
  edge,
  sourcePos,
  targetPos,
  onTooltipEnter,
  onTooltipLeave,
  resourceMap,
}: MapEdgeTooltipProps) {
  if (!edge.description) return null;

  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;

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
          background: "rgba(245, 240, 235, 0.92)",
          border: "1px solid #e0dad3",
          borderRadius: 4,
          padding: "5px 9px",
          fontSize: 10,
          fontFamily: "system-ui, sans-serif",
          color: "#8a8580",
          lineHeight: 1.4,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          maxWidth: 280,
        }}
      >
        <div>{edge.description}</div>
        {hasSource && (
          <div
            style={{
              marginTop: 4,
              paddingTop: 4,
              borderTop: "1px solid #d4cdc4",
              fontSize: 9,
              color: "#8a8580",
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
}
