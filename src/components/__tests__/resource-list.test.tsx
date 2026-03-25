import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResourceList } from "../resource-list";
import type { Resource } from "@/lib/types";

const makeResource = (overrides: Partial<Resource> = {}): Resource => ({
  title: "Test Resource",
  slug: "test-resource",
  type: "book",
  category: "primary_text",
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

  it("groups resources by category with correct headings", () => {
    const resources = [
      makeResource({ title: "Book One", category: "primary_text", slug: "book-one" }),
      makeResource({ title: "Video One", category: "academic", type: "video", slug: "video-one" }),
    ];
    render(<ResourceList resources={resources} />);

    expect(screen.getByText("Primary Texts")).toBeDefined();
    expect(screen.getByText("Academic Works")).toBeDefined();
    expect(screen.queryByText("Encyclopedias")).toBeNull();
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

  it("renders type subheadings within categories", () => {
    const resources: Resource[] = [
      makeResource({ type: "book", category: "primary_text", slug: "b1", title: "B1" }),
      makeResource({ type: "video", category: "primary_text", slug: "v1", title: "V1" }),
    ];
    render(<ResourceList resources={resources} />);

    expect(screen.getByText("Books")).toBeDefined();
    expect(screen.getByText("Videos")).toBeDefined();
  });
});
