/**
 * Build-time layout computation for the tradition map.
 *
 * Uses curated column positions + century-based Y for a clean editorial layout.
 * Each tradition has a hand-assigned column (0-7) that groups by family/geography:
 *   0-1: Taoist traditions (left)
 *   2-3: Buddhist traditions (center-left)
 *   4-5: Vedic-Yogic/Hindu traditions (center-right)
 *   6-7: Christian/Islamic/Other traditions (right)
 *
 * The script in scripts/compute-layout.ts is a thin CLI wrapper.
 */
import type { ParsedTradition } from "./data";

// -- Types --

export interface LayoutPosition {
  x: number;
  y: number;
}

export type LayoutMap = Record<string, LayoutPosition>;

// -- Curated column assignments --
// column 0-7 maps to X position, year maps to Y position

const CURATED_POSITIONS: Record<string, { column: number; year: number }> = {
  // ~1000 BCE
  "jainism":              { column: 3, year: -900 },
  "vedanta":              { column: 4, year: -800 },

  // ~500 BCE
  "taoism":               { column: 1, year: -500 },
  "early-buddhism":       { column: 3, year: -450 },
  "theravada":            { column: 2, year: -300 },

  // ~1 CE
  "mahayana":             { column: 3, year: 50 },
  "classical-yoga":       { column: 4, year: 100 },
  "gnosticism":           { column: 7, year: 100 },
  "neoplatonism":         { column: 6, year: 250 },
  "christian-mysticism":  { column: 7, year: 300 },

  // ~500 CE
  "chan-buddhism":        { column: 2, year: 500 },
  "zen":                  { column: 2, year: 500 },
  "vajrayana":            { column: 3, year: 550 },
  "tantra":               { column: 3.5, year: 550 },
  "dzogchen":             { column: 3, year: 700 },
  "advaita-vedanta":      { column: 4, year: 700 },
  "sufism":               { column: 6, year: 700 },
  "kashmir-shaivism":     { column: 5, year: 750 },

  // ~1000 CE
  "tai-chi-qigong":       { column: 1, year: 1000 },
  "bhakti":               { column: 5, year: 1100 },
  "kabbalah":             { column: 6, year: 1100 },
  "hesychasm":            { column: 7, year: 1200 },

  // ~1500 CE
  "tibetan-buddhism-gelug": { column: 3, year: 1400 },

  // ~1650 CE
  "quaker-inner-light":   { column: 7, year: 1650 },

  // ~2000 CE
  "vipassana-movement":   { column: 2, year: 1900 },
  "secular-mindfulness":  { column: 3, year: 1970 },
  "modern-non-dual":      { column: 5, year: 1980 },
};

// -- Constants --

const TOTAL_COLUMNS = 8;
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 1100;
const PADDING_LEFT = 80;
const PADDING_RIGHT = 40;
const PADDING_TOP = 0;
const PADDING_BOTTOM = 0;
const MIN_YEAR = -1100;
const MAX_YEAR = 2100;

// -- Helpers --

function yearToY(year: number): number {
  const range = MAX_YEAR - MIN_YEAR;
  const ratio = (year - MIN_YEAR) / range;
  return PADDING_TOP + ratio * (MAP_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
}

function columnToX(column: number): number {
  const usableWidth = MAP_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  return PADDING_LEFT + (column / (TOTAL_COLUMNS - 1)) * usableWidth;
}

/**
 * Maps origin_century to a Y coordinate.
 * Exported for test compatibility.
 */
export function centuryToY(
  century: number,
  minCentury: number,
  maxCentury: number,
  height: number = 1000
): number {
  if (minCentury === maxCentury) return height / 2;
  return ((century - minCentury) / (maxCentury - minCentury)) * height;
}

// -- Main --

export function computeLayout(traditions: ParsedTradition[]): LayoutMap {
  if (traditions.length === 0) return {};

  const layout: LayoutMap = {};

  for (const tradition of traditions) {
    const curated = CURATED_POSITIONS[tradition.slug];

    if (curated) {
      layout[tradition.slug] = {
        x: Math.round(columnToX(curated.column) * 10) / 10,
        y: Math.round(yearToY(curated.year) * 10) / 10,
      };
    } else {
      // Fallback: use century for Y, center X with offset based on slug hash
      const y = yearToY(tradition.origin_century * 100);
      let hash = 0;
      for (const ch of tradition.slug) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
      const col = Math.abs(hash) % TOTAL_COLUMNS;
      layout[tradition.slug] = {
        x: Math.round(columnToX(col) * 10) / 10,
        y: Math.round(y * 10) / 10,
      };
    }
  }

  return layout;
}
