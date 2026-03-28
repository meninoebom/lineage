import type { Teacher, Center, Resource } from "./types";

export interface SearchFilters {
  query: string;
  traditions: string[];
  state: string;
}

export type SearchResult =
  | { type: "teacher"; item: Teacher }
  | { type: "center"; item: Center };

/**
 * Case-insensitive substring match on name.
 */
function normalize(s: string): string {
  return s.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
}

function matchesQuery(name: string, query: string): boolean {
  if (!query.trim()) return true;
  return normalize(name).includes(normalize(query));
}

/**
 * Returns true if the item's traditions include ALL selected traditions.
 * Empty filter means no filtering.
 */
function matchesTraditions(
  itemTraditions: string[],
  filterTraditions: string[]
): boolean {
  if (filterTraditions.length === 0) return true;
  return filterTraditions.every((t) => itemTraditions.includes(t));
}

/**
 * Case-insensitive match on state field.
 * Empty string means no filtering.
 */
function matchesState(itemState: string, filterState: string): boolean {
  if (!filterState) return true;
  return itemState.toLowerCase() === filterState.toLowerCase();
}

export function filterTeachers(
  teachers: Teacher[],
  filters: SearchFilters
): Teacher[] {
  return teachers.filter(
    (t) =>
      matchesQuery(t.name, filters.query) &&
      matchesTraditions(t.traditions, filters.traditions) &&
      matchesState(t.state, filters.state)
  );
}

export function filterCenters(
  centers: Center[],
  filters: SearchFilters
): Center[] {
  return centers.filter(
    (c) =>
      matchesQuery(c.name, filters.query) &&
      matchesTraditions(c.traditions, filters.traditions) &&
      matchesState(c.state, filters.state)
  );
}

export function searchAll(
  teachers: Teacher[],
  centers: Center[],
  filters: SearchFilters
): SearchResult[] {
  const teacherResults: SearchResult[] = filterTeachers(teachers, filters).map(
    (item) => ({ type: "teacher", item })
  );
  const centerResults: SearchResult[] = filterCenters(centers, filters).map(
    (item) => ({ type: "center", item })
  );
  return [...teacherResults, ...centerResults];
}

// -- Resource filtering --

export interface ResourceSearchFilters {
  query: string;
  traditions: string[];
  type: string; // empty string = all types
}

/**
 * Filter resources by title/author query, tradition, and type.
 */
export function filterResources(
  resources: Resource[],
  filters: ResourceSearchFilters
): Resource[] {
  return resources.filter((r) => {
    if (!matchesQuery(r.title, filters.query) &&
        !(r.author && matchesQuery(r.author, filters.query))) {
      return false;
    }
    if (!matchesTraditions(r.traditions, filters.traditions)) return false;
    if (filters.type && r.type !== filters.type) return false;
    return true;
  });
}

/**
 * Extract unique states from teachers and centers, sorted alphabetically.
 */
export function getUniqueStates(
  teachers: Teacher[],
  centers: Center[]
): string[] {
  const states = new Set<string>();
  for (const t of teachers) states.add(t.state);
  for (const c of centers) states.add(c.state);
  return Array.from(states).sort();
}

/**
 * Extract unique tradition slugs from teachers and centers.
 */
export function getUniqueTraditions(
  teachers: Teacher[],
  centers: Center[]
): string[] {
  const traditions = new Set<string>();
  for (const t of teachers) t.traditions.forEach((tr) => traditions.add(tr));
  for (const c of centers) c.traditions.forEach((tr) => traditions.add(tr));
  return Array.from(traditions).sort();
}
