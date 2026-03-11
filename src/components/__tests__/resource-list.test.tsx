import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResourceList } from "../resource-list";
import type { Resource } from "@/lib/types";

const makeResource = (overrides: Partial<Resource> = {}): Resource => ({
  title: "Test Resource",
  slug: "test-resource",
  type: "book",
  url: "https://example.com/book",
  author: "Test Author",
  year: 2020,
  description: "A test description.",
  traditions: ["zen"],
  teachers: [],
  centers: [],
  ...overrides,
});

describe("ResourceList", () => {
  it("renders nothing when resources array is empty", () => {
    const { container } = render(<ResourceList resources={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders section heading 'Resources'", () => {
    render(<ResourceList resources={[makeResource()]} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Resources");
  });

  it("groups resources by type with correct headings", () => {
    const resources = [
      makeResource({ title: "Book One", type: "book", slug: "book-one" }),
      makeResource({ title: "Video One", type: "video", slug: "video-one" }),
      makeResource({ title: "Book Two", type: "book", slug: "book-two" }),
    ];
    render(<ResourceList resources={resources} />);

    expect(screen.getByText("Books")).toBeDefined();
    expect(screen.getByText("Videos")).toBeDefined();
    expect(screen.queryByText("Podcasts")).toBeNull();
    expect(screen.queryByText("Articles")).toBeNull();
    expect(screen.queryByText("Websites")).toBeNull();
  });

  it("renders title, author, and description for each resource", () => {
    render(
      <ResourceList
        resources={[makeResource({ title: "My Book", author: "Jane Doe", description: "Great book." })]}
      />
    );
    expect(screen.getByText("My Book")).toBeDefined();
    expect(screen.getByText("Jane Doe")).toBeDefined();
    expect(screen.getByText("Great book.")).toBeDefined();
  });

  it("omits author when null", () => {
    render(
      <ResourceList resources={[makeResource({ author: null })]} />
    );
    expect(screen.getByText("Test Resource")).toBeDefined();
    // Should not crash or show "null"
    expect(screen.queryByText("null")).toBeNull();
  });

  it("renders external links with target and rel attributes", () => {
    render(
      <ResourceList
        resources={[makeResource({ title: "Linked Book", url: "https://example.com/linked" })]}
      />
    );
    const link = screen.getByRole("link", { name: /Linked Book/ });
    expect(link.getAttribute("href")).toBe("https://example.com/linked");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders all five type categories when present", () => {
    const resources: Resource[] = [
      makeResource({ type: "book", slug: "b1", title: "B1" }),
      makeResource({ type: "video", slug: "v1", title: "V1" }),
      makeResource({ type: "podcast", slug: "p1", title: "P1" }),
      makeResource({ type: "article", slug: "a1", title: "A1" }),
      makeResource({ type: "website", slug: "w1", title: "W1" }),
    ];
    render(<ResourceList resources={resources} />);

    expect(screen.getByText("Books")).toBeDefined();
    expect(screen.getByText("Videos")).toBeDefined();
    expect(screen.getByText("Podcasts")).toBeDefined();
    expect(screen.getByText("Articles")).toBeDefined();
    expect(screen.getByText("Websites")).toBeDefined();
  });
});
