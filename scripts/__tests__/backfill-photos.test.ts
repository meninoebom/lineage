import { describe, it, expect } from "vitest";
import { matchPhotos } from "../backfill-photos";

describe("matchPhotos", () => {
  it("matches teacher slugs to image files", () => {
    const teachers = [
      { slug: "jack-kornfield", photo: null },
      { slug: "no-image-teacher", photo: null },
      { slug: "already-set", photo: "/images/teachers/already-set.jpg" },
    ];
    const imageFiles = ["jack-kornfield.jpg", "already-set.jpg"];

    const result = matchPhotos(teachers, imageFiles);

    expect(result.updated).toEqual([
      { slug: "jack-kornfield", photo: "/images/teachers/jack-kornfield.jpg" },
    ]);
    expect(result.alreadyCorrect).toEqual(["already-set"]);
    expect(result.unmatched).toEqual(["no-image-teacher"]);
  });

  it("is idempotent - does not re-update already correct photos", () => {
    const teachers = [
      { slug: "pema-chodron", photo: "/images/teachers/pema-chodron.jpg" },
    ];
    const imageFiles = ["pema-chodron.jpg"];

    const result = matchPhotos(teachers, imageFiles);

    expect(result.updated).toEqual([]);
    expect(result.alreadyCorrect).toEqual(["pema-chodron"]);
  });

  it("handles multiple image extensions", () => {
    const teachers = [{ slug: "rumi", photo: null }];
    const imageFiles = ["rumi.png"];

    const result = matchPhotos(teachers, imageFiles);

    expect(result.updated).toEqual([
      { slug: "rumi", photo: "/images/teachers/rumi.png" },
    ]);
  });
});
