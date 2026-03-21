import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(__dirname, "..", "data");
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "lineage.guide geocoder (https://lineage.guide)";
const RATE_LIMIT_MS = 1000;

interface Entry {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: unknown;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(
  city: string,
  state: string | null | undefined,
  country: string | null | undefined
): Promise<{ lat: number; lng: number } | null> {
  const parts = [city, state, country].filter(Boolean).join(",");
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(parts)}&format=json&limit=1`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    console.error(`  HTTP ${res.status} for "${parts}"`);
    return null;
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

async function processDirectory(dirName: string): Promise<{
  geocoded: number;
  skippedCoords: number;
  skippedNoCity: number;
  failed: number;
}> {
  const dir = path.join(DATA_DIR, dirName);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const stats = { geocoded: 0, skippedCoords: 0, skippedNoCity: 0, failed: 0 };
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(dir, files[i]);
    const raw = fs.readFileSync(filePath, "utf-8");
    const entry: Entry = JSON.parse(raw);

    if (entry.latitude != null && entry.longitude != null) {
      stats.skippedCoords++;
      continue;
    }

    if (!entry.city) {
      stats.skippedNoCity++;
      continue;
    }

    await sleep(RATE_LIMIT_MS);
    const result = await geocode(entry.city, entry.state, entry.country);

    if (result) {
      entry.latitude = result.lat;
      entry.longitude = result.lng;
      fs.writeFileSync(filePath, JSON.stringify(entry, null, 2) + "\n");
      console.log(
        `Geocoding ${dirName} ${i + 1}/${total}: ${entry.name ?? files[i]} → ${result.lat}, ${result.lng}`
      );
      stats.geocoded++;
    } else {
      console.log(
        `Geocoding ${dirName} ${i + 1}/${total}: ${entry.name ?? files[i]} → FAILED`
      );
      stats.failed++;
    }
  }

  return stats;
}

async function main() {
  console.log("Starting geocoding...\n");

  const teacherStats = await processDirectory("teachers");
  console.log("\n--- Teachers ---");
  console.log(`  Geocoded: ${teacherStats.geocoded}`);
  console.log(`  Skipped (already have coords): ${teacherStats.skippedCoords}`);
  console.log(`  Skipped (no city): ${teacherStats.skippedNoCity}`);
  console.log(`  Failed: ${teacherStats.failed}`);

  const centerStats = await processDirectory("centers");
  console.log("\n--- Centers ---");
  console.log(`  Geocoded: ${centerStats.geocoded}`);
  console.log(`  Skipped (already have coords): ${centerStats.skippedCoords}`);
  console.log(`  Skipped (no city): ${centerStats.skippedNoCity}`);
  console.log(`  Failed: ${centerStats.failed}`);

  const total = {
    geocoded: teacherStats.geocoded + centerStats.geocoded,
    skippedCoords: teacherStats.skippedCoords + centerStats.skippedCoords,
    skippedNoCity: teacherStats.skippedNoCity + centerStats.skippedNoCity,
    failed: teacherStats.failed + centerStats.failed,
  };

  console.log("\n=== TOTAL ===");
  console.log(`  Geocoded: ${total.geocoded}`);
  console.log(`  Skipped (already have coords): ${total.skippedCoords}`);
  console.log(`  Skipped (no city): ${total.skippedNoCity}`);
  console.log(`  Failed: ${total.failed}`);
}

main().catch(console.error);
