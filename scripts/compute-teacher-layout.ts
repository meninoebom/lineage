#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { getAllTeachers } from "../src/lib/data";
import { computeTeacherLayout } from "../src/lib/compute-teacher-layout";

const ROOT = process.cwd();
const OUTPUT_DIR = join(ROOT, "src", "generated");
const OUTPUT_FILE = join(OUTPUT_DIR, "teacher-map-layout.json");

function main() {
  console.log("Loading teachers...");
  const teachers = getAllTeachers();
  console.log(`Found ${teachers.length} teachers.`);

  const layout = computeTeacherLayout(teachers);
  const count = Object.keys(layout).length;

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(layout, null, 2) + "\n");

  console.log(`Teacher layout written to ${OUTPUT_FILE} (${count} nodes)`);
}

main();
