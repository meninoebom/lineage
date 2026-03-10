/**
 * MapTimeAxis — a subtle vertical ruler on the left side of the map
 * showing century markers from the earliest to latest traditions.
 *
 * Styled like a margin ruler in a Lapham's Quarterly feature — faint,
 * informational, never competing with the content.
 */

interface MapTimeAxisProps {
  /** X position for the axis line */
  x: number;
  /** Y range: top of the map content area */
  yMin: number;
  /** Y range: bottom of the map content area */
  yMax: number;
  /** Centuries to display as labels */
  centuries: number[];
  /** Maps a century value to a Y coordinate */
  centuryToY: (century: number) => number;
}

function formatCentury(century: number): string {
  if (century < 0) return `${Math.abs(century) * 100} BCE`;
  if (century === 0) return "1 CE";
  return `${century * 100} CE`;
}

export function MapTimeAxis({
  x,
  yMin,
  yMax,
  centuries,
  centuryToY,
}: MapTimeAxisProps) {
  return (
    <g className="map-time-axis" opacity={0.3}>
      {/* Main vertical line */}
      <line
        x1={x}
        y1={yMin}
        x2={x}
        y2={yMax}
        stroke="#b5ada5"
        strokeWidth={0.5}
      />
      {/* Century tick marks and labels */}
      {centuries.map((century) => {
        const y = centuryToY(century);
        return (
          <g key={century}>
            <line
              x1={x - 4}
              y1={y}
              x2={x + 4}
              y2={y}
              stroke="#b5ada5"
              strokeWidth={0.5}
            />
            <text
              x={x - 8}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#b5ada5"
              fontSize={9}
              fontFamily="sans-serif"
            >
              {formatCentury(century)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
