import { describe, it, expect } from "vitest";
import { classifyCandidate } from "../classify";

const existingTeachers = [
  "Jack Kornfield",
  "Thich Nhat Hanh",
  "Pema Chödrön",
  "Sharon Salzberg",
];

describe("classifyCandidate", () => {
  it("accepts Jon Kabat-Zinn as secular-mindfulness", () => {
    const result = classifyCandidate(
      {
        name: "Jon Kabat-Zinn",
        bio: "Jon Kabat-Zinn is the creator of Mindfulness-Based Stress Reduction (MBSR) and founder of the Center for Mindfulness in Medicine.",
        source: "wikipedia",
      },
      existingTeachers,
    );
    expect(result.status).toBe("accepted");
    expect(result.traditions).toContain("secular-mindfulness");
  });

  it("rejects Richard Schwartz as therapist", () => {
    const result = classifyCandidate(
      {
        name: "Richard Schwartz",
        bio: "Richard Schwartz is a psychotherapist and the developer of Internal Family Systems (IFS), a form of psychotherapy.",
        source: "wikipedia",
      },
      existingTeachers,
    );
    expect(result.status).toBe("rejected");
    expect(result.reject_reason).toBe("therapist");
  });

  it("rejects Brené Brown", () => {
    const result = classifyCandidate(
      {
        name: "Brené Brown",
        bio: "Brené Brown is a research professor and motivational speaker known for her work on vulnerability, courage, and personal development.",
        source: "wikipedia",
      },
      existingTeachers,
    );
    expect(result.status).toBe("rejected");
    expect(["self-help", "no-tradition-match"]).toContain(result.reject_reason);
  });

  it("accepts Pema Chödrön as vajrayana/tibetan-buddhism-gelug", () => {
    const result = classifyCandidate(
      {
        name: "Pema Chödrön",
        bio: "Pema Chödrön is an American Tibetan Buddhist nun and author. She is a student of Chögyam Trungpa and practices in the Vajrayana tradition.",
        source: "wikipedia",
      },
      [], // empty list so no duplicate detection
    );
    expect(result.status).toBe("accepted");
    expect(
      result.traditions.some((t) =>
        ["vajrayana", "tibetan-buddhism-gelug"].includes(t),
      ),
    ).toBe(true);
  });

  it("rejects a vinyasa yoga instructor with no meditation context", () => {
    const result = classifyCandidate(
      {
        name: "Jane Smith",
        bio: "Jane Smith is a certified vinyasa yoga instructor and fitness trainer specializing in power yoga and hot yoga classes.",
        source: "website",
      },
      existingTeachers,
    );
    expect(result.status).toBe("rejected");
    expect(result.reject_reason).toBe("yoga-non-contemplative");
  });

  it("accepts a yoga teacher who teaches meditation and yoga philosophy", () => {
    const result = classifyCandidate(
      {
        name: "Dr. Yoga Teacher",
        bio: "A renowned teacher of classical yoga philosophy and meditation, specializing in the yoga sutras and pranayama techniques.",
        source: "website",
      },
      existingTeachers,
    );
    expect(result.status).toBe("accepted");
    expect(result.traditions).toContain("classical-yoga");
  });

  it("rejects duplicate: Jack Kornfield when he already exists", () => {
    const result = classifyCandidate(
      {
        name: "Jack Kornfield",
        bio: "Jack Kornfield is a vipassana meditation teacher and author.",
        source: "wikipedia",
      },
      existingTeachers,
    );
    expect(result.status).toBe("rejected");
    expect(result.reject_reason).toBe("duplicate");
  });

  it("detects duplicate with diacritics: Thích Nhất Hạnh matches Thich Nhat Hanh", () => {
    const result = classifyCandidate(
      {
        name: "Thích Nhất Hạnh",
        bio: "Thích Nhất Hạnh is a Vietnamese Zen Buddhist monk and peace activist.",
        source: "wikipedia",
      },
      existingTeachers,
    );
    expect(result.status).toBe("rejected");
    expect(result.reject_reason).toBe("duplicate");
  });
});
