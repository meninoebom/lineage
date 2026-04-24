import { FAMILY_COLORS } from "@/lib/tradition-graph";
import type { TeacherGraphNode } from "@/lib/teacher-graph";

interface TeacherMapNodeProps {
  node: TeacherGraphNode;
  position: { x: number; y: number };
  highlighted: boolean;
  dimmed: boolean;
  zoomScale: number;
  onHover: (slug: string | null) => void;
  onClick: (slug: string) => void;
}

export function TeacherMapNode({
  node,
  position,
  highlighted,
  dimmed,
  zoomScale,
  onHover,
  onClick,
}: TeacherMapNodeProps) {
  const colors = FAMILY_COLORS[node.family as keyof typeof FAMILY_COLORS];
  const inverseScale = 1 / zoomScale;
  const fontSize = Math.round(11 * Math.max(1, Math.pow(zoomScale, 0.6)));
  const radius = highlighted ? 7 : 5;
  const opacity = dimmed ? 0.2 : 1;

  return (
    <g
      className="cursor-pointer"
      style={{ transition: "opacity 0.25s ease", opacity }}
      onMouseEnter={() => onHover(node.slug)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(node.slug)}
      role="button"
      aria-label={node.name}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(node.slug);
        }
      }}
    >
      <circle
        cx={position.x}
        cy={position.y}
        r={radius}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={1.5}
        style={{ transition: "r 0.15s ease" }}
      />
      <g transform={`translate(${position.x}, ${position.y}) scale(${inverseScale})`}>
        <text
          x={9}
          y={4}
          textAnchor="start"
          className="select-none"
          fill={highlighted ? colors.text : dimmed ? "rgba(80,60,40,0.15)" : colors.text}
          fontSize={fontSize}
          fontFamily="Georgia, serif"
          fontWeight={highlighted ? 600 : 400}
          style={{ transition: "fill 0.2s ease" }}
        >
          {node.name}
        </text>
      </g>
    </g>
  );
}
