import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Mock page-layout to avoid header/footer complexity
vi.mock("@/components/page-layout", () => ({
  PageLayout: ({ children, heroContent }: { children: React.ReactNode; heroContent?: React.ReactNode }) => (
    <div>{heroContent}{children}</div>
  ),
}));

// Mock home-search to avoid portal complexity in tests
vi.mock("@/components/home-search", () => ({
  HomeSearch: () => <div data-testid="home-search" />,
}));

describe("Homepage", () => {
  it("renders Kabir quote as heading", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("Wherever you are is the entry point");
  });

  it("renders 4 feature cards with correct links", () => {
    render(<Home />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/teachers");
    expect(hrefs).toContain("/resources");
    expect(hrefs).toContain("/centers");
    expect(hrefs).toContain("/traditions");
  });

  it("renders map teaser with CTA", () => {
    render(<Home />);
    expect(screen.getByText("See How Traditions Connect")).toBeDefined();
  });

  it("renders reading paths section", () => {
    render(<Home />);
    expect(screen.getByText("Not sure where to start?")).toBeDefined();
  });

  it("renders newsletter signup section", () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/email/i)).toBeDefined();
  });

  it("renders tradition quick-link pills", () => {
    render(<Home />);
    expect(screen.getAllByText("Zen").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Vipassana").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sufism").length).toBeGreaterThan(0);
  });
});
