import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/testimonies", () => ({
  getTestimonyCounts: vi.fn(),
}));

import { getTestimonyCounts } from "@/lib/testimonies";
import { TestimonyCountProvider, TestimonyCountBadge } from "../testimony-count";

const mockGetCounts = getTestimonyCounts as ReturnType<typeof vi.fn>;

describe("TestimonyCountBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders count for a resource with recommendations", async () => {
    const counts = new Map([["book-a", 5]]);
    mockGetCounts.mockResolvedValue(counts);

    render(
      <TestimonyCountProvider slugs={["book-a"]}>
        <TestimonyCountBadge slug="book-a" />
      </TestimonyCountProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("5 recommended")).toBeInTheDocument();
    });
  });

  it("renders nothing for a resource with zero recommendations", async () => {
    mockGetCounts.mockResolvedValue(new Map());

    const { container } = render(
      <TestimonyCountProvider slugs={["book-a"]}>
        <TestimonyCountBadge slug="book-a" />
      </TestimonyCountProvider>
    );

    await waitFor(() => {
      expect(container.querySelector("span")).toBeNull();
    });
  });

  it("renders counts for multiple resources", async () => {
    const counts = new Map([
      ["book-a", 3],
      ["book-b", 7],
    ]);
    mockGetCounts.mockResolvedValue(counts);

    render(
      <TestimonyCountProvider slugs={["book-a", "book-b", "book-c"]}>
        <div>
          <TestimonyCountBadge slug="book-a" />
          <TestimonyCountBadge slug="book-b" />
          <TestimonyCountBadge slug="book-c" />
        </div>
      </TestimonyCountProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("3 recommended")).toBeInTheDocument();
      expect(screen.getByText("7 recommended")).toBeInTheDocument();
    });
  });
});
