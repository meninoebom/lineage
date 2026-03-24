import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "../site-header";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/teachers",
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("SiteHeader", () => {
  it("renders logo in serif font", () => {
    render(<SiteHeader />);
    const logo = screen.getByText("Lineage.guide");
    expect(logo.className).toContain("font-serif");
  });

  it("renders nav links: Traditions, Teachers, Masters, Centers, Map", () => {
    render(<SiteHeader />);
    expect(screen.getByText("Traditions")).toBeDefined();
    expect(screen.getByText("Teachers")).toBeDefined();
    expect(screen.getByText("Masters")).toBeDefined();
    expect(screen.getByText("Centers")).toBeDefined();
    expect(screen.getByText("Map")).toBeDefined();
  });

  it("does not render Library in nav", () => {
    render(<SiteHeader />);
    expect(screen.queryByText("Library")).toBeNull();
  });

  it("highlights active page", () => {
    render(<SiteHeader />);
    const activeLink = screen.getByText("Teachers");
    expect(activeLink.className).toContain("text-primary");
  });

  it("uses glassmorphism background (backdrop-blur)", () => {
    render(<SiteHeader />);
    const header = screen.getByRole("banner");
    expect(header.className).toContain("backdrop-blur");
  });

  it("has no border-border (Stitch: tonal layering)", () => {
    render(<SiteHeader />);
    const header = screen.getByRole("banner");
    expect(header.className).not.toContain("border-border");
  });

  it("has mobile menu button", () => {
    render(<SiteHeader />);
    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toBeDefined();
  });
});
