import { getAllTeachers } from "./data";
import type { Teacher } from "./types";

export interface StateGroup {
  state: string;
  slug: string;
  teachers: Teacher[];
}

function toSlug(state: string): string {
  return state.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Groups all teachers by state and returns one entry per state.
 * Used for generating location-based landing pages like /teachers/california.
 */
export function getTeachersByState(): StateGroup[] {
  const teachers = getAllTeachers();
  const byState = new Map<string, Teacher[]>();

  for (const t of teachers) {
    if (!t.state) continue;
    const group = byState.get(t.state) ?? [];
    group.push(t);
    byState.set(t.state, group);
  }

  return Array.from(byState.entries())
    .map(([state, teachers]) => ({
      state,
      slug: toSlug(state),
      teachers,
    }))
    .sort((a, b) => a.state.localeCompare(b.state));
}

export function getTeacherLocationStates(): { state: string; slug: string }[] {
  return getTeachersByState().map(({ state, slug }) => ({ state, slug }));
}

export function getTeachersForState(
  stateSlug: string
): StateGroup | undefined {
  return getTeachersByState().find((s) => s.slug === stateSlug);
}
