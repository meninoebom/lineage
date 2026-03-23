import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Breadcrumbs } from "../breadcrumbs";

// Mock next/link for test environment
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("Card", () => {
  it("renders with default styling — no borders, tonal layering", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toHaveTextContent("Content");
    expect(card.className).toContain("bg-card");
    // Stitch: no 1px borders, use shadow-ambient instead
    expect(card.className).not.toContain("border-border");
    expect(card.className).toContain("shadow-ambient");
  });

  it("renders with terracotta accent", () => {
    render(<Card data-testid="card" accent="terracotta">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("border-t-primary");
  });

  it("renders card subcomponents", () => {
    render(
      <Card>
        <CardTitle>Test Title</CardTitle>
        <CardDescription>Test Description</CardDescription>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );
    expect(screen.getByText("Test Title")).toBeDefined();
    expect(screen.getByText("Test Description")).toBeDefined();
    expect(screen.getByText("Footer content")).toBeDefined();
  });
});

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-secondary-container");
  });

  it("renders with tradition variant", () => {
    render(<Badge variant="tradition">Zen</Badge>);
    const badge = screen.getByText("Zen");
    expect(badge.className).toContain("bg-surface-container-low");
  });

  it("renders with family variant", () => {
    render(<Badge variant="family">Buddhist</Badge>);
    const badge = screen.getByText("Buddhist");
    expect(badge.className).toContain("bg-primary/10");
  });

  it("renders with pill shape per Stitch", () => {
    render(<Badge>Pill</Badge>);
    const badge = screen.getByText("Pill");
    expect(badge.className).toContain("rounded-full");
  });
});

describe("Breadcrumbs", () => {
  it("renders home link and items", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Teachers", href: "/teachers" },
          { label: "Gil Fronsdal" },
        ]}
      />
    );
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Teachers")).toBeDefined();
    expect(screen.getByText("Gil Fronsdal")).toBeDefined();
  });

  it("renders last item without link", () => {
    render(
      <Breadcrumbs items={[{ label: "Current Page" }]} />
    );
    const current = screen.getByText("Current Page");
    expect(current.tagName).toBe("SPAN");
    expect(current.getAttribute("aria-current")).toBe("page");
  });

  it("renders intermediate items as links", () => {
    render(
      <Breadcrumbs items={[{ label: "Teachers", href: "/teachers" }]} />
    );
    const link = screen.getByText("Teachers");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/teachers");
  });
});
