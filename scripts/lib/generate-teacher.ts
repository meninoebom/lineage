import type { Teacher } from "../../src/lib/types";

export interface AcceptedCandidate {
  name: string;
  bio: string;
  traditions: string[];
  location: { city: string; state: string; country: string } | null;
  website: string | null;
}

function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/['']/g, "")           // remove apostrophes
    .replace(/[^a-z0-9\s-]/g, "")   // remove other special chars
    .trim()
    .replace(/\s+/g, "-");          // spaces to hyphens
}

export function generateTeacherJson(candidate: AcceptedCandidate): Teacher {
  return {
    name: candidate.name,
    slug: toSlug(candidate.name),
    bio: candidate.bio,
    photo: null,
    website: candidate.website,
    birth_year: null,
    death_year: null,
    city: candidate.location?.city ?? "",
    state: candidate.location?.state ?? "",
    country: candidate.location?.country ?? "",
    latitude: null,
    longitude: null,
    traditions: candidate.traditions,
    centers: [],
  };
}
