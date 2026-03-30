import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before importing the module
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();
const mockOrder = vi.fn();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();

function chainable(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    ...overrides,
  };
  // Make each method return the chain
  for (const [key, val] of Object.entries(chain)) {
    if (typeof val === "function" && !overrides[key]) {
      (chain[key] as ReturnType<typeof vi.fn>).mockReturnValue(chain);
    }
  }
  return chain;
}

vi.mock("../supabase", () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

import { supabase } from "../supabase";
import {
  getTestimonies,
  getTestimonyCounts,
  createTestimony,
  getUserTestimony,
  updateProfile,
  getProfile,
} from "../testimonies";

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

describe("testimonies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTestimonies", () => {
    it("fetches testimonies with profiles for a resource slug", async () => {
      const testimonies = [
        {
          id: "t1",
          user_id: "u1",
          resource_slug: "zen-mind",
          impact: "Changed my practice",
          profiles: { display_name: "Jo", traditions: ["Zen"], years_of_practice: "3-10" },
        },
      ];

      const chain = chainable({ order: vi.fn().mockResolvedValue({ data: testimonies, error: null }) });
      mockFrom.mockReturnValue(chain);

      const result = await getTestimonies("zen-mind");

      expect(mockFrom).toHaveBeenCalledWith("testimonies");
      expect(chain.select).toHaveBeenCalledWith("*, profiles(display_name, traditions, years_of_practice)");
      expect(chain.eq).toHaveBeenCalledWith("resource_slug", "zen-mind");
      expect(result).toEqual(testimonies);
    });

    it("returns empty array when no testimonies exist", async () => {
      const chain = chainable({ order: vi.fn().mockResolvedValue({ data: [], error: null }) });
      mockFrom.mockReturnValue(chain);

      const result = await getTestimonies("unknown-book");
      expect(result).toEqual([]);
    });

    it("throws on supabase error", async () => {
      const chain = chainable({ order: vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } }) });
      mockFrom.mockReturnValue(chain);

      await expect(getTestimonies("zen-mind")).rejects.toEqual({ message: "fail" });
    });
  });

  describe("getTestimonyCounts", () => {
    it("returns a map of slug to count", async () => {
      const counts = [
        { resource_slug: "book-a", count: 5 },
        { resource_slug: "book-b", count: 12 },
      ];

      const chain = chainable({ in: vi.fn().mockResolvedValue({ data: counts, error: null }) });
      mockFrom.mockReturnValue(chain);

      const result = await getTestimonyCounts(["book-a", "book-b", "book-c"]);

      expect(result.get("book-a")).toBe(5);
      expect(result.get("book-b")).toBe(12);
      expect(result.has("book-c")).toBe(false);
    });

    it("returns empty map for empty input", async () => {
      const result = await getTestimonyCounts([]);
      expect(result.size).toBe(0);
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe("createTestimony", () => {
    it("inserts a testimony and returns it", async () => {
      const testimony = {
        id: "t1",
        user_id: "u1",
        resource_slug: "zen-mind",
        impact: "Life-changing",
      };

      const chain = chainable({ single: vi.fn().mockResolvedValue({ data: testimony, error: null }) });
      mockFrom.mockReturnValue(chain);

      const result = await createTestimony({
        user_id: "u1",
        resource_slug: "zen-mind",
        impact: "Life-changing",
      });

      expect(mockFrom).toHaveBeenCalledWith("testimonies");
      expect(chain.insert).toHaveBeenCalled();
      expect(result).toEqual(testimony);
    });
  });

  describe("getUserTestimony", () => {
    it("returns null when no testimony exists", async () => {
      const chain = chainable({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) });
      mockFrom.mockReturnValue(chain);

      const result = await getUserTestimony("u1", "zen-mind");
      expect(result).toBeNull();
    });

    it("returns existing testimony", async () => {
      const testimony = { id: "t1", user_id: "u1", resource_slug: "zen-mind" };
      const chain = chainable({ maybeSingle: vi.fn().mockResolvedValue({ data: testimony, error: null }) });
      mockFrom.mockReturnValue(chain);

      const result = await getUserTestimony("u1", "zen-mind");
      expect(result).toEqual(testimony);
    });
  });

  describe("updateProfile", () => {
    it("updates profile fields", async () => {
      const updated = { id: "u1", traditions: ["Zen", "Vipassana"], years_of_practice: "3-10" };
      const chain = chainable({ single: vi.fn().mockResolvedValue({ data: updated, error: null }) });
      mockFrom.mockReturnValue(chain);

      const result = await updateProfile("u1", {
        traditions: ["Zen", "Vipassana"],
        years_of_practice: "3-10",
      });

      expect(chain.update).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith("id", "u1");
      expect(result).toEqual(updated);
    });
  });

  describe("getProfile", () => {
    it("returns profile when found", async () => {
      const profile = { id: "u1", display_name: "Jo", traditions: ["Zen"], banned: false };
      const chain = chainable({ maybeSingle: vi.fn().mockResolvedValue({ data: profile, error: null }) });
      mockFrom.mockReturnValue(chain);

      const result = await getProfile("u1");
      expect(result).toEqual(profile);
    });

    it("returns null when not found", async () => {
      const chain = chainable({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) });
      mockFrom.mockReturnValue(chain);

      const result = await getProfile("unknown");
      expect(result).toBeNull();
    });
  });
});
