import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import type { Teacher, Center, Resource, Path, ResolvedPath, TraditionConnection } from "./types";

const DATA_DIR = join(process.cwd(), "data");

// -- Slug sanitization --

function validateSlug(slug: string): string {
  if (slug.includes("/") || slug.includes("\\") || slug.includes("..")) {
    throw new Error(`Invalid slug: ${slug}`);
  }
  return slug;
}

// -- Runtime shape validation --

function isTeacher(obj: unknown): obj is Teacher {
  const t = obj as Record<string, unknown>;
  return (
    typeof t.name === "string" &&
    typeof t.slug === "string" &&
    typeof t.bio === "string" &&
    (t.birth_year === null || t.birth_year === undefined || typeof t.birth_year === "number") &&
    (t.death_year === null || t.death_year === undefined || typeof t.death_year === "number") &&
    typeof t.city === "string" &&
    typeof t.state === "string" &&
    typeof t.country === "string" &&
    Array.isArray(t.traditions) &&
    Array.isArray(t.centers)
  );
}

function isCenter(obj: unknown): obj is Center {
  const c = obj as Record<string, unknown>;
  return (
    typeof c.name === "string" &&
    typeof c.slug === "string" &&
    typeof c.description === "string" &&
    typeof c.city === "string" &&
    typeof c.state === "string" &&
    typeof c.country === "string" &&
    Array.isArray(c.traditions) &&
    Array.isArray(c.teachers)
  );
}

const VALID_RESOURCE_TYPES = ["book", "podcast", "video", "article", "website"];
const VALID_RESOURCE_CATEGORIES = ["primary_text", "academic", "popular", "encyclopedia", "web_resource"];

function isResource(obj: unknown): obj is Resource {
  const r = obj as Record<string, unknown>;
  return (
    typeof r.title === "string" &&
    typeof r.slug === "string" &&
    typeof r.type === "string" &&
    VALID_RESOURCE_TYPES.includes(r.type as string) &&
    typeof r.category === "string" &&
    VALID_RESOURCE_CATEGORIES.includes(r.category as string) &&
    typeof r.url === "string" &&
    (r.author === null || typeof r.author === "string") &&
    (r.year === null || typeof r.year === "number") &&
    typeof r.description === "string" &&
    Array.isArray(r.traditions) &&
    Array.isArray(r.teachers) &&
    Array.isArray(r.centers)
  );
}

// -- Generic JSON loader --

function loadAllJson<T>(
  subdir: string,
  validate: (obj: unknown) => obj is T
): T[] {
  const dir = join(DATA_DIR, subdir);
  if (!existsSync(dir)) {
    console.warn(`Data directory not found: ${dir}`);
    return [];
  }
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => {
      try {
        const parsed = JSON.parse(readFileSync(join(dir, f), "utf-8"));
        if (!validate(parsed)) {
          console.warn(`Invalid shape in ${subdir}/${f} — skipping`);
          return [];
        }
        return [parsed];
      } catch (e) {
        console.warn(`Failed to parse ${subdir}/${f}`, e);
        return [];
      }
    });
}

function loadOneJson<T>(
  subdir: string,
  slug: string,
  validate: (obj: unknown) => obj is T
): T | undefined {
  const safeSlug = validateSlug(slug);
  const filePath = join(DATA_DIR, subdir, `${safeSlug}.json`);
  if (!existsSync(filePath)) return undefined;
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf-8"));
    if (!validate(parsed)) {
      console.warn(`Invalid shape in ${subdir}/${safeSlug}.json`);
      return undefined;
    }
    return parsed;
  } catch (e) {
    console.warn(`Failed to parse ${subdir}/${safeSlug}.json`, e);
    return undefined;
  }
}

// -- Teachers --

export function getAllTeachers(): Teacher[] {
  return loadAllJson("teachers", isTeacher);
}

export function getTeacher(slug: string): Teacher | undefined {
  return loadOneJson("teachers", slug, isTeacher);
}

// -- Centers --

export function getAllCenters(): Center[] {
  return loadAllJson("centers", isCenter);
}

export function getCenter(slug: string): Center | undefined {
  return loadOneJson("centers", slug, isCenter);
}

// -- Resources --

export function getAllResources(): Resource[] {
  return loadAllJson("resources", isResource);
}

export function getResource(slug: string): Resource | undefined {
  return loadOneJson("resources", slug, isResource);
}

export function getResourcesByTradition(traditionSlug: string): Resource[] {
  return getAllResources().filter((r) => r.traditions.includes(traditionSlug));
}

export function getResourcesByTeacher(teacherSlug: string): Resource[] {
  return getAllResources().filter((r) => r.teachers.includes(teacherSlug));
}

export function getResourcesByCenter(centerSlug: string): Resource[] {
  return getAllResources().filter((r) => r.centers.includes(centerSlug));
}

// -- Traditions --

export interface ParsedTradition {
  name: string;
  slug: string;
  family: string;
  summary: string;
  origin_century: number;
  connections: TraditionConnection[];
  content: string;
}

function isValidTraditionFrontmatter(
  data: Record<string, unknown>
): boolean {
  return (
    typeof data.name === "string" &&
    typeof data.slug === "string" &&
    typeof data.family === "string" &&
    typeof data.summary === "string" &&
    typeof data.origin_century === "number" &&
    Array.isArray(data.connections) &&
    (data.connections as Record<string, unknown>[]).every(
      (c) =>
        c.sources === undefined ||
        (Array.isArray(c.sources) &&
          (c.sources as unknown[]).every((s) => typeof s === "string"))
    )
  );
}

function parseTraditionFile(filePath: string): ParsedTradition | undefined {
  try {
    const raw = readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    if (!isValidTraditionFrontmatter(data as Record<string, unknown>)) {
      console.warn(`Invalid frontmatter in ${filePath} — skipping`);
      return undefined;
    }
    return {
      name: data.name,
      slug: data.slug,
      family: data.family,
      summary: data.summary,
      origin_century: data.origin_century,
      connections: (data.connections ?? []) as TraditionConnection[],
      content,
    };
  } catch (e) {
    console.warn(`Failed to load tradition file: ${filePath}`, e);
    return undefined;
  }
}

export function getAllTraditions(): ParsedTradition[] {
  const dir = join(DATA_DIR, "traditions");
  if (!existsSync(dir)) {
    console.warn(`Data directory not found: ${dir}`);
    return [];
  }
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .flatMap((f) => {
      const result = parseTraditionFile(join(dir, f));
      return result ? [result] : [];
    });
}

export function getTradition(slug: string): ParsedTradition | undefined {
  const safeSlug = validateSlug(slug);
  const filePath = join(DATA_DIR, "traditions", `${safeSlug}.mdx`);
  if (!existsSync(filePath)) return undefined;
  return parseTraditionFile(filePath);
}

// -- Paths --

const VALID_PATH_TYPES = ["tradition", "thematic"];

function isPath(obj: unknown): obj is Path {
  const p = obj as Record<string, unknown>;
  return (
    typeof p.slug === "string" &&
    typeof p.title === "string" &&
    typeof p.description === "string" &&
    typeof p.type === "string" &&
    VALID_PATH_TYPES.includes(p.type as string) &&
    (p.tradition === null || typeof p.tradition === "string") &&
    Array.isArray(p.resources) &&
    (p.resources as unknown[]).every((r) => typeof r === "string")
  );
}

function resolvePath(path: Path): ResolvedPath {
  const resources = path.resources.flatMap((slug) => {
    const r = getResource(slug);
    return r ? [r] : [];
  });
  return { ...path, resources };
}

export function getAllPaths(): ResolvedPath[] {
  const paths = loadAllJson("paths", isPath);
  // Sort: tradition paths first, then thematic
  paths.sort((a, b) => {
    if (a.type === b.type) return a.title.localeCompare(b.title);
    return a.type === "tradition" ? -1 : 1;
  });
  return paths.map(resolvePath);
}

export function getPathBySlug(slug: string): ResolvedPath | undefined {
  const path = loadOneJson("paths", slug, isPath);
  return path ? resolvePath(path) : undefined;
}

// -- Cross-reference queries --

export function getTeachersByTradition(traditionSlug: string): Teacher[] {
  return getAllTeachers().filter((t) => t.traditions.includes(traditionSlug));
}

export function getCentersByTradition(traditionSlug: string): Center[] {
  return getAllCenters().filter((c) => c.traditions.includes(traditionSlug));
}

export function getRelatedTraditions(
  traditionSlug: string
): (ParsedTradition & { connection: TraditionConnection })[] {
  const tradition = getTradition(traditionSlug);
  if (!tradition) return [];
  return tradition.connections.flatMap((conn) => {
    const related = getTradition(conn.tradition_slug);
    return related ? [{ ...related, connection: conn }] : [];
  });
}
