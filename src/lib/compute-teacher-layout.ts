import type { TraditionFamily } from "./types";
import { buildTeacherGraph } from "./teacher-graph";
import type { Teacher } from "./types";
import type { LayoutPosition } from "./compute-layout";

const MAP_WIDTH = 1000;
const PADDING_LEFT = 100;
const PADDING_RIGHT = 60;

// Piecewise Y scale: ancient period compressed, modern era expanded
// This keeps historical roots visible while spreading the modern cluster
const ANCIENT_END = 1800;
const ANCIENT_START = 900;
const ANCIENT_Y_START = 50;
const ANCIENT_Y_END = 450;
const MODERN_Y_END = 1080;

export function yearToY(year: number): number {
  if (year <= ANCIENT_END) {
    const ratio = (year - ANCIENT_START) / (ANCIENT_END - ANCIENT_START);
    return ANCIENT_Y_START + ratio * (ANCIENT_Y_END - ANCIENT_Y_START);
  }
  const ratio = (year - ANCIENT_END) / (2020 - ANCIENT_END);
  return ANCIENT_Y_END + ratio * (MODERN_Y_END - ANCIENT_Y_END);
}

// Column assignments per family — spreads traditions horizontally
const FAMILY_BASE_COLUMN: Record<TraditionFamily, number> = {
  "Buddhist":               2.0,
  "Vedic-Yogic":            5.5,
  "Taoist":                 0.5,
  "Christian Contemplative": 7.5,
  "Islamic Contemplative":   7.0,
  "Modern Secular":         6.5,
  "Other":                  4.0,
};

// Fine-grained sub-columns for Buddhist traditions to separate lineages
const TRADITION_COLUMN: Record<string, number> = {
  "theravada":                  0.5,
  "vipassana-movement":         0.8,
  "zen":                        2.0,
  "chan-buddhism":               1.8,
  "tibetan-buddhism-kagyu":     3.0,
  "tibetan-buddhism-nyingma":   3.4,
  "tibetan-buddhism-gelug":     3.2,
  "tibetan-buddhism":           3.2,
  "vajrayana":                  3.2,
  "dzogchen":                   3.5,
  "advaita-vedanta":            5.0,
  "vedanta":                    5.5,
  "classical-yoga":             6.0,
  "modern-non-dual":            4.5,
  "kashmir-shaivism":           5.8,
  "christian-mysticism":        7.5,
  "sufism":                     7.0,
};

const TOTAL_COLUMNS = 9;

function columnToX(column: number): number {
  const usableWidth = MAP_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  return PADDING_LEFT + (column / (TOTAL_COLUMNS - 1)) * usableWidth;
}

function teacherColumn(teacher: Teacher): number {
  for (const trad of teacher.traditions) {
    if (TRADITION_COLUMN[trad] !== undefined) return TRADITION_COLUMN[trad];
  }
  return 4.0;
}

// Hash-based X spread within a column — avoids label overlap
function hashOffset(slug: string): number {
  let hash = 0;
  for (const ch of slug) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % 80) - 40) / 10; // -4 to +4
}

// Estimate birth year from connected teachers when own birth_year is null
function estimateBirthYear(
  slug: string,
  teachers: Teacher[],
  teacherMap: Map<string, Teacher>
): number | null {
  const teacher = teacherMap.get(slug);
  if (!teacher) return null;
  if (teacher.birth_year) return teacher.birth_year;

  // Average of their teachers' birth years + 25
  const teacherYears = (teacher.teachers ?? [])
    .map((s) => teacherMap.get(s)?.birth_year)
    .filter((y): y is number => y != null);

  if (teacherYears.length > 0) {
    return Math.round(teacherYears.reduce((a, b) => a + b) / teacherYears.length) + 28;
  }
  return null;
}

export function computeTeacherLayout(teachers: Teacher[]): Record<string, LayoutPosition> {
  const graph = buildTeacherGraph(teachers);
  const teacherMap = new Map(teachers.map((t) => [t.slug, t]));
  const layout: Record<string, LayoutPosition> = {};

  for (const node of graph.nodes) {
    const teacher = teacherMap.get(node.slug);
    if (!teacher) continue;

    const year = teacher.birth_year ?? estimateBirthYear(node.slug, teachers, teacherMap);
    if (year === null) continue; // skip teachers we can't place

    const col = teacherColumn(teacher) + hashOffset(node.slug) * 0.5;
    layout[node.slug] = {
      x: Math.round(Math.max(PADDING_LEFT, columnToX(col)) * 10) / 10,
      y: Math.round(yearToY(year) * 10) / 10,
    };
  }

  return layout;
}
