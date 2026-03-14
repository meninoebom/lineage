/**
 * Insights at the Edge podcast scraper.
 *
 * Loads guest data from a curated seed file (scripts/data/iate-episodes.json)
 * and returns RawCandidate objects for the classification pipeline.
 *
 * The seed approach was chosen because the Sounds True website is JS-rendered
 * and difficult to scrape reliably. The seed file can be expanded over time.
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { RawCandidate } from "./lib/classify";

interface IATEEpisode {
  guest: string;
  description: string;
}

export function scrapePodcast(): RawCandidate[] {
  const seedPath = join(__dirname, "data", "iate-episodes.json");
  const raw = readFileSync(seedPath, "utf-8");
  const episodes: IATEEpisode[] = JSON.parse(raw);

  return episodes.map((ep) => ({
    name: ep.guest,
    bio: ep.description,
    source: "iate",
  }));
}
