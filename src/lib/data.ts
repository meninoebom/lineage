import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import type { Teacher, Center, Tradition, TraditionConnection } from "./types";

const DATA_DIR = join(process.cwd(), "data");

// -- Teachers --

export function getAllTeachers(): Teacher[] {
  const dir = join(DATA_DIR, "teachers");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => {
      try {
        return [JSON.parse(readFileSync(join(dir, f), "utf-8")) as Teacher];
      } catch (e) {
        console.warn(`Skipping malformed teacher file: ${f}`, e);
        return [];
      }
    });
}

export function getTeacher(slug: string): Teacher | undefined {
  const filePath = join(DATA_DIR, "teachers", `${slug}.json`);
  if (!existsSync(filePath)) return undefined;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as Teacher;
  } catch {
    return undefined;
  }
}

// -- Centers --

export function getAllCenters(): Center[] {
  const dir = join(DATA_DIR, "centers");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => {
      try {
        return [JSON.parse(readFileSync(join(dir, f), "utf-8")) as Center];
      } catch (e) {
        console.warn(`Skipping malformed center file: ${f}`, e);
        return [];
      }
    });
}

export function getCenter(slug: string): Center | undefined {
  const filePath = join(DATA_DIR, "centers", `${slug}.json`);
  if (!existsSync(filePath)) return undefined;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as Center;
  } catch {
    return undefined;
  }
}

// -- Traditions --

export interface ParsedTradition extends Tradition {
  content: string;
}

function parseTraditionFile(filePath: string): ParsedTradition | undefined {
  try {
    const raw = readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return {
      name: data.name,
      slug: data.slug,
      family: data.family,
      summary: data.summary,
      connections: (data.connections ?? []) as TraditionConnection[],
      content,
    };
  } catch (e) {
    console.warn(`Skipping malformed tradition file: ${filePath}`, e);
    return undefined;
  }
}

export function getAllTraditions(): ParsedTradition[] {
  const dir = join(DATA_DIR, "traditions");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .flatMap((f) => {
      const result = parseTraditionFile(join(dir, f));
      return result ? [result] : [];
    });
}

export function getTradition(slug: string): ParsedTradition | undefined {
  const filePath = join(DATA_DIR, "traditions", `${slug}.mdx`);
  if (!existsSync(filePath)) return undefined;
  return parseTraditionFile(filePath);
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
