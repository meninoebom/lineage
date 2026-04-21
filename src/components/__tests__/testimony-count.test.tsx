import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/testimonies", () => ({
  getTestimonyCounts: vi.fn(),
  getRecommendationCount: vi.fn(),
}));

import { getTestimonyCounts, getRecommendationCount } from "@/lib/testimonies";
import {
  TestimonyCountProvider,
  TestimonyCountBadge,
  RecommendationCount,
} from "../testimony-count";

const mockGetCounts = getTestimonyCounts as ReturnType<typeof vi.fn>;
const mockGetRecommendationCount = getRecommendationCount as ReturnType<typeof vi.fn>;

describe("TestimonyCountBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heart icon and count for a resource with recommendations", async () => {
    const counts = new Map([["book-a", 5]]);
    mockGetCounts.mockResolvedValue(counts);

    render(
      <TestimonyCountProvider slugs={["book-a"]}>
        <TestimonyCountBadge slug="book-a" />
      </TestimonyCountProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    // Should have an SVG heart icon
    const badge = screen.getByText("5").closest("span");
    expect(badge?.querySelector("svg")).toBeTruthy();
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
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument();
    });
  });
});

describe("RecommendationCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton while fetching", () => {
    mockGetRecommendationCount.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<RecommendationCount resourceSlug="zen-mind" />);
    expect(screen.getByLabelText("Loading recommendation count")).toBeInTheDocument();
  });

  it("renders nothing for zero recommendations", async () => {
    mockGetRecommendationCount.mockResolvedValue(0);
    const { container } = render(<RecommendationCount resourceSlug="zen-mind" />);
    await waitFor(() => {
      expect(container.querySelector("p")).toBeNull();
      expect(container.querySelector(".animate-pulse")).toBeNull();
    });
  });

  it("renders singular form for 1 recommendation", async () => {
    mockGetRecommendationCount.mockResolvedValue(1);
    render(<RecommendationCount resourceSlug="zen-mind" />);
    await waitFor(() => {
      expect(screen.getByText("1 recommendation")).toBeInTheDocument();
    });
  });

  it("renders plural form for multiple recommendations", async () => {
    mockGetRecommendationCount.mockResolvedValue(12);
    render(<RecommendationCount resourceSlug="zen-mind" />);
    await waitFor(() => {
      expect(screen.getByText("12 recommendations")).toBeInTheDocument();
    });
  });

  it("handles fetch errors gracefully by showing nothing", async () => {
    mockGetRecommendationCount.mockRejectedValue(new Error("Network error"));
    const { container } = render(<RecommendationCount resourceSlug="zen-mind" />);
    await waitFor(() => {
      expect(container.querySelector("p")).toBeNull();
      expect(container.querySelector(".animate-pulse")).toBeNull();
    });
  });
});
