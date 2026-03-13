import fs from "fs";
import path from "path";

const TEACHERS_DIR = path.resolve("data/teachers");
const IMAGES_DIR = path.resolve("public/images/teachers");

interface Teacher {
  name: string;
  slug: string;
  photo: string | null;
  death_year: number | null;
  [key: string]: unknown;
}

async function fetchJSON(url: string): Promise<unknown> {
  const res = await fetch(url);
  return res.json();
}

async function downloadFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function main() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const files = fs.readdirSync(TEACHERS_DIR).filter((f) => f.endsWith(".json"));
  let found = 0;
  let notFound = 0;
  let skipped = 0;

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (const file of files) {
    const filePath = path.join(TEACHERS_DIR, file);
    const teacher: Teacher = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (teacher.death_year === null || teacher.photo !== null) {
      skipped++;
      continue;
    }

    await delay(500);

    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(teacher.name)}&prop=pageimages&pithumbsize=400&format=json`;

    try {
      const data = (await fetchJSON(apiUrl)) as {
        query: { pages: Record<string, { thumbnail?: { source: string } }> };
      };

      const pages = data.query.pages;
      const page = Object.values(pages)[0];

      if (page?.thumbnail?.source) {
        const dest = path.join(IMAGES_DIR, `${teacher.slug}.jpg`);
        await downloadFile(page.thumbnail.source, dest);

        teacher.photo = `/images/teachers/${teacher.slug}.jpg`;
        fs.writeFileSync(filePath, JSON.stringify(teacher, null, 2) + "\n");

        console.log(`✓ ${teacher.name} — photo saved`);
        found++;
      } else {
        console.log(`✗ ${teacher.name} — no Wikipedia image found`);
        notFound++;
      }
    } catch (err) {
      console.log(`✗ ${teacher.name} — error: ${err}`);
      notFound++;
    }
  }

  console.log(`\nDone: ${found} found, ${notFound} not found, ${skipped} skipped`);
}

main();
