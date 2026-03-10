import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SuggestEditLink } from "../suggest-edit-link";

describe("SuggestEditLink", () => {
  it("renders the suggest-an-edit text", () => {
    render(<SuggestEditLink traditionName="Zen Buddhism" />);
    const link = screen.getByRole("link", { name: /suggest an edit/i });
    expect(link).toBeDefined();
    expect(screen.getByText(/see something wrong/i)).toBeDefined();
  });

  it("links to GitHub new issue with pre-filled title", () => {
    render(<SuggestEditLink traditionName="Zen Buddhism" />);
    const link = screen.getByRole("link", { name: /suggest an edit/i });
    const href = link.getAttribute("href");
    expect(href).toContain("github.com/meninoebom/lineage/issues/new");
    expect(href).toContain("title=Suggestion+for+Zen+Buddhism");
  });

  it("includes pre-filled body with prompts", () => {
    render(<SuggestEditLink traditionName="Zen Buddhism" />);
    const link = screen.getByRole("link", { name: /suggest an edit/i });
    const href = link.getAttribute("href");
    expect(href).toContain("What+should+be+changed");
    expect(href).toContain("What+is+the+correct+information");
    expect(href).toContain("Source");
  });

  it("includes community-suggestion label", () => {
    render(<SuggestEditLink traditionName="Zen Buddhism" />);
    const link = screen.getByRole("link", { name: /suggest an edit/i });
    const href = link.getAttribute("href");
    expect(href).toContain("labels=community-suggestion");
  });

  it("opens in new tab with security attributes", () => {
    render(<SuggestEditLink traditionName="Zen Buddhism" />);
    const link = screen.getByRole("link", { name: /suggest an edit/i });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("encodes tradition names with special characters", () => {
    render(<SuggestEditLink traditionName="Dvaita Vedānta" />);
    const link = screen.getByRole("link", { name: /suggest an edit/i });
    const href = link.getAttribute("href");
    expect(href).toContain("Suggestion+for+Dvaita+Ved");
    // Should be a valid URL (no raw spaces)
    expect(href).not.toContain(" ");
  });
});
