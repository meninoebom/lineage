import fs from "node:fs";
import path from "node:path";

interface TeacherPhotoInfo {
  slug: string;
  photo: string | null;
}

interface MatchResult {
  updated: { slug: string; photo: string }[];
  alreadyCorrect: string[];
  unmatched: string[];
}

export function matchPhotos(
  teachers: TeacherPhotoInfo[],
  imageFiles: string[]
): MatchResult {
  const imageMap = new Map<string, string>();
  for (const file of imageFiles) {
    const slug = path.parse(file).name;
    imageMap.set(slug, file);
  }

  const updated: { slug: string; photo: string }[] = [];
  const alreadyCorrect: string[] = [];
  const unmatched: string[] = [];

  for (const teacher of teachers) {
    const imageFile = imageMap.get(teacher.slug);
    if (imageFile) {
      const expectedPhoto = `/images/teachers/${imageFile}`;
      if (teacher.photo === expectedPhoto) {
        alreadyCorrect.push(teacher.slug);
      } else {
        updated.push({ slug: teacher.slug, photo: expectedPhoto });
      }
    } else {
      unmatched.push(teacher.slug);
    }
  }

  return { updated, alreadyCorrect, unmatched };
}

if (process.argv[1] && process.argv[1].includes("backfill-photos")) {
  const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const teachersDir = path.join(rootDir, "data", "teachers");
  const imagesDir = path.join(rootDir, "public", "images", "teachers");

  const imageFiles = fs.readdirSync(imagesDir);
  const teacherFiles = fs.readdirSync(teachersDir).filter((f) => f.endsWith(".json"));

  const teachers: TeacherPhotoInfo[] = teacherFiles.map((f) => {
    const data = JSON.parse(fs.readFileSync(path.join(teachersDir, f), "utf-8"));
    return { slug: data.slug, photo: data.photo };
  });

  const result = matchPhotos(teachers, imageFiles);

  // Write updates
  for (const { slug, photo } of result.updated) {
    const filePath = path.join(teachersDir, `${slug}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    data.photo = photo;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  }

  // Ensure unmatched have photo: null
  for (const slug of result.unmatched) {
    const filePath = path.join(teachersDir, `${slug}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (data.photo !== null) {
      data.photo = null;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    }
  }

  console.log(`\nBackfill complete:`);
  console.log(`  Updated:         ${result.updated.length}`);
  console.log(`  Already correct: ${result.alreadyCorrect.length}`);
  console.log(`  No image:        ${result.unmatched.length}`);
  console.log(`  Total teachers:  ${teachers.length}`);
}
