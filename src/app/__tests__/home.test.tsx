import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock page-layout to avoid header/footer complexity
vi.mock("@/components/page-layout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Homepage", () => {
  it("renders hero with large title", () => {
    render(<Home />);
    expect(screen.getByText("The Contemplative Landscape")).toBeDefined();
  });

  it("renders 4 feature cards with Explore links", () => {
    render(<Home />);
    expect(screen.getByText("Find a Teacher")).toBeDefined();
    expect(screen.getByText("Explore the Masters")).toBeDefined();
    expect(screen.getByText("Find a Center")).toBeDefined();
    expect(screen.getByText("Explore Traditions")).toBeDefined();
  });

  it("renders map teaser with CTA", () => {
    render(<Home />);
    expect(screen.getByText("Explore the Interactive Map")).toBeDefined();
  });

  it("renders Help Us Grow section", () => {
    render(<Home />);
    expect(screen.getByText("Help Us Grow")).toBeDefined();
  });

  it("renders newsletter signup section", () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/email/i)).toBeDefined();
  });

  it("feature cards link to correct pages", () => {
    render(<Home />);
    const teacherLink = screen.getByText("Find a Teacher").closest("a");
    expect(teacherLink?.getAttribute("href")).toBe("/teachers");
  });
});
