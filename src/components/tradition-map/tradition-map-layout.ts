/**
 * Hand-crafted node positions for the tradition map.
 *
 * Rather than using a force-directed layout (which looks generic),
 * we place nodes intentionally — grouping by family with generous spacing.
 * Positions are in a 0-1000 coordinate space, mapped to viewport.
 *
 * The layout is designed to feel like an editorial diagram:
 * - Buddhist traditions cluster upper-left
 * - Hindu traditions cluster upper-right
 * - Cross-family connections create visual bridges
 */

export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Desktop layout: wide format, traditions spread across the canvas.
 * Coordinate space: 1000 x 600
 */
export const DESKTOP_POSITIONS: Record<string, NodePosition> = {
  // Buddhist cluster — left side
  zen: { x: 180, y: 160 },
  theravada: { x: 120, y: 380 },
  dzogchen: { x: 380, y: 270 },

  // Hindu cluster — right side
  "advaita-vedanta": { x: 650, y: 180 },
  "kashmir-shaivism": { x: 820, y: 340 },
};

/**
 * Mobile layout: vertical stack, more compact.
 * Coordinate space: 400 x 800
 */
export const MOBILE_POSITIONS: Record<string, NodePosition> = {
  // Buddhist cluster — top
  zen: { x: 120, y: 100 },
  theravada: { x: 280, y: 100 },
  dzogchen: { x: 200, y: 260 },

  // Hindu cluster — bottom
  "advaita-vedanta": { x: 120, y: 440 },
  "kashmir-shaivism": { x: 280, y: 440 },
};

export const DESKTOP_VIEWBOX = { width: 1000, height: 550 };
export const MOBILE_VIEWBOX = { width: 400, height: 580 };

/**
 * Get a fallback position for traditions not in the hand-crafted layout.
 * Distributes unknown nodes in a grid below the main layout.
 */
export function getFallbackPosition(
  index: number,
  isMobile: boolean
): NodePosition {
  const cols = isMobile ? 2 : 4;
  const startY = isMobile ? 600 : 480;
  const spacing = isMobile ? 180 : 200;
  const startX = isMobile ? 100 : 150;
  return {
    x: startX + (index % cols) * spacing,
    y: startY + Math.floor(index / cols) * 120,
  };
}
