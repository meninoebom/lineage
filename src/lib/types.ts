export type TraditionFamily =
  | "Buddhist"
  | "Vedic-Yogic"
  | "Taoist"
  | "Christian Contemplative"
  | "Islamic Contemplative"
  | "Modern Secular"
  | "Other";

export type ConnectionType = "influenced_by" | "branch_of" | "related_to" | "diverged_from";

export interface TraditionConnection {
  tradition_slug: string;
  connection_type: ConnectionType;
  description: string;
  strength?: 1 | 2 | 3;
  sources?: string[];
}

export interface Tradition {
  name: string;
  slug: string;
  family: TraditionFamily;
  summary: string;
  connections: TraditionConnection[];
}

export interface Teacher {
  name: string;
  slug: string;
  bio: string;
  photo: string | null;
  website: string | null;
  birth_year: number | null;
  death_year: number | null;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  traditions: string[];
  centers: string[];
  teachers: string[];
}

export type ResourceType = "book" | "podcast" | "video" | "article" | "website";

export type ResourceCategory =
  | "primary_text"
  | "academic"
  | "popular"
  | "encyclopedia"
  | "web_resource";

export interface Resource {
  title: string;
  slug: string;
  type: ResourceType;
  category: ResourceCategory;
  url: string;
  author: string | null;
  year: number | null;
  description: string;
  traditions: string[];
  teachers: string[];
  centers: string[];
  experience_level?: ExperienceLevel;
  topics?: string[];
  practice_context?: string[];
}

// -- Taxonomy types --

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface TaxonomyDimension {
  type: "single" | "multi";
  description: string;
  values: string[];
}

export interface Taxonomy {
  experience_level: TaxonomyDimension;
  topics: TaxonomyDimension;
  practice_context: TaxonomyDimension;
}

export type PathType = "tradition" | "thematic";

export interface Path {
  slug: string;
  title: string;
  description: string;
  type: PathType;
  tradition: string | null;
  resources: string[];
}

export interface ResolvedPath extends Omit<Path, "resources"> {
  resources: Resource[];
}

export type YearsOfPractice = "<1" | "1-3" | "3-10" | "10+";

export interface Profile {
  id: string;
  display_name: string | null;
  bio: string | null;
  practice_background: string | null;
  traditions: string[];
  years_of_practice: YearsOfPractice | null;
  banned: boolean;
  created_at: string;
}

export interface Testimony {
  id: string;
  user_id: string;
  resource_slug: string;
  impact: string | null;
  context: string | null;
  who_for: string | null;
  freeform: string | null;
  recommended_at: string;
  created_at: string;
  profiles?: Pick<Profile, "display_name" | "traditions" | "years_of_practice">;
}

export interface TestimonyCount {
  resource_slug: string;
  count: number;
}

export interface Center {
  name: string;
  slug: string;
  description: string;
  photo: string | null;
  website: string | null;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  traditions: string[];
  teachers: string[];
}
