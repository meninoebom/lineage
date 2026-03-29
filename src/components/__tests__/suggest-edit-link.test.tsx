import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SuggestEditLink } from "../suggest-edit-link";

describe("SuggestEditLink", () => {
  it("renders the feedback text and link", () => {
    render(<SuggestEditLink traditionName="Zen Buddhism" />);
    const link = screen.getByRole("link", { name: /let us know/i });
    expect(link).toBeDefined();
    expect(screen.getByText(/see something wrong/i)).toBeDefined();
  });

  it("links to Formspree feedback form", () => {
    render(<SuggestEditLink traditionName="Zen Buddhism" />);
    const link = screen.getByRole("link", { name: /let us know/i });
    expect(link.getAttribute("href")).toContain("formspree.io");
  });

  it("opens in new tab with security attributes", () => {
    render(<SuggestEditLink traditionName="Zen Buddhism" />);
    const link = screen.getByRole("link", { name: /let us know/i });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
