/**
 * MapTimeAxis — era labels with horizontal grid lines.
 *
 * Matches the Figma design: era labels on the left (1000 BCE, 500 BCE, etc.)
 * with light horizontal lines extending across the map width.
 */

interface TimelineEra {
  year: number;
  label: string;
}

const TIMELINE_ERAS: TimelineEra[] = [
  { year: -1000, label: "1000 BCE" },
  { year: -500, label: "500 BCE" },
  { year: 0, label: "1 CE" },
  { year: 500, label: "500 CE" },
  { year: 1000, label: "1000 CE" },
  { year: 1500, label: "1500 CE" },
  { year: 2000, label: "2000 CE" },
];

interface MapTimeAxisProps {
  /** X position for labels */
  x: number;
  /** Y range: top of the map content area */
  yMin: number;
  /** Y range: bottom of the map content area */
  yMax: number;
  /** Maps a year to a Y coordinate */
  yearToY: (year: number) => number;
  /** Right edge of the map for grid lines */
  xMax: number;
  /** Left edge of the grid lines */
  xGridStart: number;
}

export function MapTimeAxis({
  x,
  yMin,
  yMax,
  yearToY,
  xMax,
  xGridStart,
}: MapTimeAxisProps) {
  return (
    <g className="map-time-axis">
      {TIMELINE_ERAS.map((era) => {
        const y = yearToY(era.year);
        // Only render if within the visible Y range (with some padding)
        if (y < yMin - 40 || y > yMax + 40) return null;
        return (
          <g key={era.year}>
            {/* Horizontal grid line */}
            <line
              x1={xGridStart}
              y1={y}
              x2={xMax}
              y2={y}
              stroke="#d8d4ce"
              strokeWidth={1}
            />
            {/* Era label */}
            <text
              x={x}
              y={y + 4}
              textAnchor="start"
              fill="#777"
              fontSize={13}
              fontWeight={500}
              fontFamily="system-ui, sans-serif"
            >
              {era.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
