import { yearToY } from "@/lib/compute-teacher-layout";

const ERAS = [
  { year: 1000, label: "1000 CE" },
  { year: 1200, label: "1200 CE" },
  { year: 1400, label: "1400 CE" },
  { year: 1600, label: "1600 CE" },
  { year: 1800, label: "1800 CE" },
  { year: 1850, label: "1850 CE" },
  { year: 1900, label: "1900 CE" },
  { year: 1950, label: "1950 CE" },
  { year: 2000, label: "2000 CE" },
];

interface TeacherTimeAxisProps {
  labelX: number;
  gridXStart: number;
  gridXEnd: number;
  yMin: number;
  yMax: number;
}

export function TeacherTimeAxis({ labelX, gridXStart, gridXEnd, yMin, yMax }: TeacherTimeAxisProps) {
  return (
    <g>
      {ERAS.map((era) => {
        const y = yearToY(era.year);
        if (y < yMin - 20 || y > yMax + 20) return null;
        return (
          <g key={era.year}>
            <line x1={gridXStart} y1={y} x2={gridXEnd} y2={y} stroke="#ddd8d2" strokeWidth={1} />
            <text
              x={labelX}
              y={y + 4}
              textAnchor="start"
              fill="#999"
              fontSize={11}
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
