import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Comments } from "../comments";

// Mock react-cusdis since it loads external scripts
vi.mock("react-cusdis", () => ({
  ReactCusdis: ({ attrs }: { attrs: Record<string, string> }) => (
    <div data-testid="cusdis-widget" data-page-id={attrs.pageId} data-page-title={attrs.pageTitle} />
  ),
}));

describe("Comments", () => {
  it("renders the Community Notes heading", () => {
    render(<Comments pageId="teacher/thich-nhat-hanh" pageTitle="Thich Nhat Hanh" />);
    expect(screen.getByRole("heading", { name: /Community Notes/i })).toBeDefined();
  });

  it("renders the Cusdis widget with correct pageId and pageTitle", () => {
    render(<Comments pageId="teacher/thich-nhat-hanh" pageTitle="Thich Nhat Hanh" />);
    const widget = screen.getByTestId("cusdis-widget");
    expect(widget.getAttribute("data-page-id")).toBe("teacher/thich-nhat-hanh");
    expect(widget.getAttribute("data-page-title")).toBe("Thich Nhat Hanh");
  });

  it("renders a honeypot field that is hidden", () => {
    render(<Comments pageId="test" pageTitle="Test" />);
    const honeypot = document.querySelector('input[name="website"]');
    expect(honeypot).toBeDefined();
    // Should be visually hidden (off-screen positioning)
    expect(honeypot?.closest("div")?.className).toContain("absolute");
  });

  it("renders introductory text", () => {
    render(<Comments pageId="test" pageTitle="Test" />);
    expect(screen.getByText(/share your experience/i)).toBeDefined();
  });
});
