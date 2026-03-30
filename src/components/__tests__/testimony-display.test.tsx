import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/testimonies", () => ({
  getTestimonies: vi.fn(),
}));

import { getTestimonies } from "@/lib/testimonies";
import { TestimonyDisplay } from "../testimony-display";

const mockGetTestimonies = getTestimonies as ReturnType<typeof vi.fn>;

describe("TestimonyDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows skeleton while loading", () => {
    mockGetTestimonies.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<TestimonyDisplay resourceSlug="zen-mind" />);
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders nothing when no testimonies exist", async () => {
    mockGetTestimonies.mockResolvedValue([]);
    const { container } = render(<TestimonyDisplay resourceSlug="zen-mind" />);
    await waitFor(() => {
      expect(container.querySelector("section")).toBeNull();
    });
  });

  it("renders testimony count and cards", async () => {
    mockGetTestimonies.mockResolvedValue([
      {
        id: "t1",
        impact: "Changed my understanding of emptiness",
        context: "Going through a difficult time",
        who_for: "Beginning meditators",
        freeform: null,
        created_at: new Date().toISOString(),
        profiles: {
          display_name: "Jo",
          traditions: ["Zen"],
          years_of_practice: "3-10",
        },
      },
    ]);

    render(<TestimonyDisplay resourceSlug="zen-mind" />);

    await waitFor(() => {
      expect(screen.getByText("1 practitioner recommends this")).toBeInTheDocument();
      expect(screen.getByText("Jo")).toBeInTheDocument();
      expect(screen.getByText(/Zen/)).toBeInTheDocument();
      expect(screen.getByText("Changed my understanding of emptiness")).toBeInTheDocument();
      expect(screen.getByText(/Going through a difficult time/)).toBeInTheDocument();
      expect(screen.getByText(/Beginning meditators/)).toBeInTheDocument();
    });
  });

  it("shows 'recommended this' for bare recommendations", async () => {
    mockGetTestimonies.mockResolvedValue([
      {
        id: "t2",
        impact: null,
        context: null,
        who_for: null,
        freeform: null,
        created_at: new Date().toISOString(),
        profiles: { display_name: null, traditions: [], years_of_practice: null },
      },
    ]);

    render(<TestimonyDisplay resourceSlug="zen-mind" />);

    await waitFor(() => {
      expect(screen.getByText("A practitioner")).toBeInTheDocument();
      expect(screen.getByText("recommended this")).toBeInTheDocument();
    });
  });

  it("pluralizes correctly for multiple testimonies", async () => {
    mockGetTestimonies.mockResolvedValue([
      {
        id: "t1", impact: "Great", context: null, who_for: null, freeform: null,
        created_at: new Date().toISOString(),
        profiles: { display_name: "A", traditions: [], years_of_practice: null },
      },
      {
        id: "t2", impact: "Amazing", context: null, who_for: null, freeform: null,
        created_at: new Date().toISOString(),
        profiles: { display_name: "B", traditions: [], years_of_practice: null },
      },
    ]);

    render(<TestimonyDisplay resourceSlug="zen-mind" />);

    await waitFor(() => {
      expect(screen.getByText("2 practitioners recommend this")).toBeInTheDocument();
    });
  });
});
