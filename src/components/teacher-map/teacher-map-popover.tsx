import { useEffect, useRef } from "react";
import type { TeacherGraphNode } from "@/lib/teacher-graph";

interface TeacherMapPopoverProps {
  node: TeacherGraphNode;
  position: { x: number; y: number };
  onClose: () => void;
  onPopoverEnter: () => void;
  onPopoverLeave: () => void;
}

const MAX_BIO = 160;

function truncateBio(text: string): string {
  if (text.length <= MAX_BIO) return text;
  return text.slice(0, MAX_BIO).replace(/\s+\S*$/, "") + "…";
}

export function TeacherMapPopover({
  node,
  position,
  onClose,
  onPopoverEnter,
  onPopoverLeave,
}: TeacherMapPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = 260;
  const height = 190;
  const x = position.x - width / 2;
  const y = position.y - height - 14;

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const years = node.birth_year
    ? node.death_year
      ? `${node.birth_year}–${node.death_year}`
      : `b. ${node.birth_year}`
    : null;

  return (
    <foreignObject x={x} y={y} width={width} height={height} style={{ overflow: "visible" }}>
      <div
        ref={containerRef}
        tabIndex={-1}
        onMouseEnter={onPopoverEnter}
        onMouseLeave={onPopoverLeave}
        role="dialog"
        aria-label={`${node.name} details`}
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
        style={{
          background: "#faf8f5",
          border: "1px solid #d4cdc4",
          borderRadius: 8,
          padding: "12px 14px",
          fontFamily: "Georgia, serif",
          color: "#3a3632",
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          maxWidth: width,
          outline: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{node.name}</div>
            {years && (
              <div style={{ fontSize: 11, color: "#8a7e74", fontFamily: "system-ui, sans-serif", marginTop: 2 }}>
                {years}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16, lineHeight: 1, padding: "0 0 0 8px" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p style={{ fontSize: 11.5, lineHeight: 1.55, color: "#5a5248", margin: "0 0 10px 0", fontFamily: "system-ui, sans-serif" }}>
          {truncateBio(node.bio)}
        </p>
        <a
          href={`/teachers/${node.slug}`}
          style={{ fontSize: 11.5, color: "#8b4513", textDecoration: "underline", fontFamily: "system-ui, sans-serif" }}
        >
          View profile →
        </a>
      </div>
    </foreignObject>
  );
}
