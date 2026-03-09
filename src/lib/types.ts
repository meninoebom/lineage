export type TraditionFamily =
  | "Buddhist"
  | "Hindu"
  | "Modern Non-Dual"
  | "Yogic"
  | "Other";

export type ConnectionType = "influenced_by" | "branch_of" | "related_to";

export interface TraditionConnection {
  tradition_slug: string;
  connection_type: ConnectionType;
  description: string;
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
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  traditions: string[];
  centers: string[];
}

export interface Center {
  name: string;
  slug: string;
  description: string;
  website: string | null;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  traditions: string[];
  teachers: string[];
}
