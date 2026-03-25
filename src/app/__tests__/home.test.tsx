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

describe("Homepage", () => {
  it("renders hero with large title", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("The Contemplative Landscape");
  });

  it("renders 4 feature cards with correct links", () => {
    render(<Home />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/teachers");
    expect(hrefs).toContain("/masters");
    expect(hrefs).toContain("/centers");
    expect(hrefs).toContain("/traditions");
  });

  it("renders map teaser with CTA", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /Interactive Map/i })).toBeDefined();
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
    const teacherLink = screen.getAllByRole("link").find(
      (l) => l.getAttribute("href") === "/teachers"
    );
    expect(teacherLink).toBeDefined();
  });
});
