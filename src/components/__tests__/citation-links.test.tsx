import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CitationLinks } from "../citation-links";

// Mock the data module
vi.mock("@/lib/data", () => ({
  getResource: (slug: string) => {
    const resources: Record<string, { title: string; url: string }> = {
      "way-of-zen": {
        title: "The Way of Zen",
        url: "https://bookshop.org/way-of-zen",
      },
      "i-am-that": {
        title: "I Am That",
        url: "https://bookshop.org/i-am-that",
      },
    };
    return resources[slug] ?? undefined;
  },
}));

describe("CitationLinks", () => {
  it("renders nothing when sources is undefined", () => {
    const { container } = render(<CitationLinks />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when sources is an empty array", () => {
    const { container } = render(<CitationLinks sources={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders citation links for valid sources", () => {
    render(<CitationLinks sources={["way-of-zen", "i-am-that"]} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0].textContent).toContain("The Way of Zen");
    expect(links[0].getAttribute("href")).toBe("https://bookshop.org/way-of-zen");
    expect(links[0].getAttribute("target")).toBe("_blank");
    expect(links[0].getAttribute("rel")).toContain("noopener");
  });

  it("skips sources that cannot be resolved", () => {
    render(<CitationLinks sources={["way-of-zen", "nonexistent-slug"]} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toContain("The Way of Zen");
  });

  it("renders nothing when all sources are unresolvable", () => {
    const { container } = render(<CitationLinks sources={["nonexistent"]} />);
    expect(container.innerHTML).toBe("");
  });
});
