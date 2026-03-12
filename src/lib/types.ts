export type TraditionFamily =
  | "Buddhist"
  | "Hindu"
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
}

export type ResourceType = "book" | "podcast" | "video" | "article" | "website";

export interface Resource {
  title: string;
  slug: string;
  type: ResourceType;
  url: string;
  author: string | null;
  year: number | null;
  description: string;
  traditions: string[];
  teachers: string[];
  centers: string[];
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
