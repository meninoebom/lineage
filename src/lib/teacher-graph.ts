import { FAMILY_COLORS } from "./tradition-graph";
import type { TraditionFamily } from "./types";
import type { Teacher } from "./types";

export interface TeacherGraphNode {
  slug: string;
  name: string;
  family: TraditionFamily;
  bio: string;
  birth_year: number | null;
  death_year: number | null;
  photo: string | null;
}

export interface TeacherGraphEdge {
  /** slug of the student */
  source: string;
  /** slug of the teacher they studied under */
  target: string;
}

export interface TeacherGraph {
  nodes: TeacherGraphNode[];
  edges: TeacherGraphEdge[];
}

// Maps tradition slugs to their tradition family for node coloring
const TRADITION_FAMILY: Record<string, TraditionFamily> = {
  "theravada": "Buddhist",
  "vipassana-movement": "Buddhist",
  "zen": "Buddhist",
  "chan-buddhism": "Buddhist",
  "tibetan-buddhism-kagyu": "Buddhist",
  "tibetan-buddhism-nyingma": "Buddhist",
  "tibetan-buddhism-gelug": "Buddhist",
  "tibetan-buddhism": "Buddhist",
  "early-buddhism": "Buddhist",
  "mahayana": "Buddhist",
  "vajrayana": "Buddhist",
  "dzogchen": "Buddhist",
  "advaita-vedanta": "Vedic-Yogic",
  "vedanta": "Vedic-Yogic",
  "classical-yoga": "Vedic-Yogic",
  "tantra": "Vedic-Yogic",
  "modern-non-dual": "Vedic-Yogic",
  "kashmir-shaivism": "Vedic-Yogic",
  "taoism": "Taoist",
  "christian-mysticism": "Christian Contemplative",
  "sufism": "Islamic Contemplative",
  "mindfulness": "Modern Secular",
  "integral": "Modern Secular",
};

function familyForTeacher(teacher: Teacher): TraditionFamily {
  for (const trad of teacher.traditions) {
    const family = TRADITION_FAMILY[trad];
    if (family) return family;
  }
  return "Other";
}

export function buildTeacherGraph(teachers: Teacher[]): TeacherGraph {
  const slugSet = new Set(teachers.map((t) => t.slug));

  // Only include teachers who appear in the lineage graph
  const activeSet = new Set<string>();
  for (const teacher of teachers) {
    const refs = teacher.teachers ?? [];
    if (refs.length > 0) {
      activeSet.add(teacher.slug);
      for (const t of refs) {
        if (slugSet.has(t)) activeSet.add(t);
      }
    }
  }

  const nodes: TeacherGraphNode[] = teachers
    .filter((t) => activeSet.has(t.slug))
    .map((t) => ({
      slug: t.slug,
      name: t.name,
      family: familyForTeacher(t),
      bio: t.bio,
      birth_year: t.birth_year,
      death_year: t.death_year,
      photo: t.photo,
    }));

  const edges: TeacherGraphEdge[] = [];
  for (const teacher of teachers) {
    for (const teacherSlug of teacher.teachers ?? []) {
      if (slugSet.has(teacherSlug)) {
        edges.push({ source: teacher.slug, target: teacherSlug });
      }
    }
  }

  return { nodes, edges };
}

export function getTeacherConnectedSlugs(
  graph: TeacherGraph,
  slug: string
): Set<string> {
  const connected = new Set<string>();
  for (const e of graph.edges) {
    if (e.source === slug) connected.add(e.target);
    if (e.target === slug) connected.add(e.source);
  }
  return connected;
}

export { FAMILY_COLORS };
