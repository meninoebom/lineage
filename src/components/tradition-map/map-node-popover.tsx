import { useEffect, useRef } from "react";
import type { GraphNode } from "@/lib/tradition-graph";

interface MapNodePopoverProps {
  node: GraphNode;
  position: { x: number; y: number };
  onClose: () => void;
  onPopoverEnter: () => void;
  onPopoverLeave: () => void;
}

const MAX_SUMMARY_LENGTH = 140;

function truncateSummary(text: string): string {
  if (text.length <= MAX_SUMMARY_LENGTH) return text;
  return text.slice(0, MAX_SUMMARY_LENGTH).replace(/\s+\S*$/, "") + "…";
}

/**
 * MapNodePopover — floating panel shown when a tradition is selected.
 *
 * Rendered as a foreignObject in SVG Layer 5 (above edge tooltips)
 * for correct z-ordering. Positioned above the node by default.
 */
export function MapNodePopover({
  node,
  position,
  onClose,
  onPopoverEnter,
  onPopoverLeave,
}: MapNodePopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = 260;
  const height = 180;
  // Position above the node, centered horizontally
  const x = position.x - width / 2;
  const y = position.y - height - 10;

  // Auto-focus for keyboard dismiss
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        onMouseEnter={onPopoverEnter}
        onMouseLeave={onPopoverLeave}
        role="dialog"
        aria-label={`${node.name} details`}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        style={{
          background: "#faf8f5",
          border: "1px solid #d4cdc4",
          borderRadius: 8,
          padding: "12px 16px",
          fontFamily: "Georgia, serif",
          color: "#3a3632",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          maxWidth: width,
          outline: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 6,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.3,
              color: "#2a2a2a",
            }}
          >
            {node.name}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close popover"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              color: "#999",
              padding: "0 0 0 8px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        {node.summary && (
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 12,
              lineHeight: 1.5,
              color: "#6a6560",
            }}
          >
            {truncateSummary(node.summary)}
          </p>
        )}
        {/* Plain <a> instead of next/link — Link doesn't work inside SVG foreignObject */}
        <a
          href={`/traditions/${node.slug}`}
          style={{
            fontSize: 12,
            color: "#c0553a",
            textDecoration: "none",
          }}
        >
          Explore this tradition →
        </a>
      </div>
    </foreignObject>
  );
}
