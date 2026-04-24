interface TeacherMapEdgeProps {
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  highlighted: boolean;
  dimmed: boolean;
  edgeKey: string;
}

export function TeacherMapEdge({
  sourcePos,
  targetPos,
  highlighted,
  dimmed,
  edgeKey,
}: TeacherMapEdgeProps) {
  // Arrow from student (source) pointing up toward teacher (target)
  const midY = (sourcePos.y + targetPos.y) / 2;
  const pathD = `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x} ${midY}, ${targetPos.x} ${midY}, ${targetPos.x} ${targetPos.y}`;
  const opacity = dimmed ? 0.08 : highlighted ? 0.9 : 0.4;
  const strokeWidth = highlighted ? 2.5 : 1.5;

  return (
    <path
      key={edgeKey}
      d={pathD}
      fill="none"
      stroke="rgb(160, 115, 70)"
      strokeWidth={strokeWidth}
      markerEnd="url(#teacher-arrow)"
      style={{ transition: "opacity 0.25s ease, stroke-width 0.15s ease", opacity }}
    />
  );
}
