import { describe, it, expect } from "vitest";
import { inferType } from "../add-resource";

describe("inferType", () => {
  it("infers video for YouTube URLs", () => {
    expect(inferType("https://www.youtube.com/watch?v=abc")).toBe("video");
    expect(inferType("https://youtu.be/abc123")).toBe("video");
  });

  it("infers podcast for Spotify and Apple Podcasts episode URLs", () => {
    expect(inferType("https://open.spotify.com/episode/xyz")).toBe("podcast");
    expect(inferType("https://podcasts.apple.com/us/podcast/xyz")).toBe("podcast");
  });

  it("infers book for Bookshop and Amazon product URLs", () => {
    expect(inferType("https://bookshop.org/p/books/the-way/1234")).toBe("book");
    expect(inferType("https://www.amazon.com/dp/B08XYZ")).toBe("book");
    expect(inferType("https://www.amazon.com/gp/product/B08XYZ")).toBe("book");
  });

  it("falls back to article for unrecognized URLs", () => {
    expect(inferType("https://dharmaocean.org/some-talk")).toBe("article");
    expect(inferType("https://example.com")).toBe("article");
  });
});
