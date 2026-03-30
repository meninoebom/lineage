import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockUser = { id: "u1", email: "test@example.com" };

let currentUser: typeof mockUser | null = null;

vi.mock("../supabase-provider", () => ({
  useSupabase: () => ({
    user: currentUser,
    loading: false,
    signInWithMagicLink: vi.fn().mockResolvedValue({ error: null }),
    signInWithGoogle: vi.fn(),
    signInWithApple: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("@/lib/testimonies", () => ({
  createTestimony: vi.fn().mockResolvedValue({ id: "t1" }),
  getUserTestimony: vi.fn().mockResolvedValue(null),
  getProfile: vi.fn().mockResolvedValue({ traditions: [] }),
  updateProfile: vi.fn().mockResolvedValue({}),
}));

import { createTestimony, getUserTestimony, getProfile } from "@/lib/testimonies";
import { RecommendationFlow } from "../recommendation-flow";

describe("RecommendationFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = null;
    // Restore default mock implementations after clearAllMocks
    (getUserTestimony as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ traditions: [] });
    (createTestimony as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "t1" });
  });

  it("renders CTA when not signed in", () => {
    render(<RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    expect(screen.getByText(/Have you read Zen Mind/)).toBeInTheDocument();
    expect(screen.getByText("Share how it impacted your practice")).toBeInTheDocument();
  });

  it("shows auth panel when CTA clicked and user not signed in", () => {
    render(<RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    fireEvent.click(screen.getByText(/Have you read Zen Mind/));
    expect(screen.getByText("Sign in to share your experience")).toBeInTheDocument();
  });

  it("shows form directly when CTA clicked and user is signed in", async () => {
    currentUser = mockUser;
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ traditions: ["Zen"] });

    render(<RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    fireEvent.click(screen.getByText(/Have you read Zen Mind/));

    await waitFor(() => {
      expect(screen.getByText("Recommend Zen Mind")).toBeInTheDocument();
    });
  });

  it("shows already-recommended message if user has existing testimony", async () => {
    currentUser = mockUser;
    (getUserTestimony as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "t1" });

    render(<RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    fireEvent.click(screen.getByText(/Have you read Zen Mind/));

    await waitFor(() => {
      expect(screen.getByText("You've already recommended this resource")).toBeInTheDocument();
    });
  });

  it("renders all optional prompts in form", async () => {
    currentUser = mockUser;
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ traditions: ["Zen"] });

    render(<RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    fireEvent.click(screen.getByText(/Have you read Zen Mind/));

    await waitFor(() => {
      expect(screen.getByText("How did this resource impact you?")).toBeInTheDocument();
      expect(screen.getByText("What were you going through at the time?")).toBeInTheDocument();
      expect(screen.getByText("Who would benefit most from this?")).toBeInTheDocument();
      expect(screen.getByText("Anything else you'd like to share?")).toBeInTheDocument();
    });
  });

  it("shows textarea when prompt is toggled", async () => {
    currentUser = mockUser;
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ traditions: ["Zen"] });

    render(<RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    fireEvent.click(screen.getByText(/Have you read Zen Mind/));

    await waitFor(() => {
      expect(screen.getByText("How did this resource impact you?")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("How did this resource impact you?"));
    expect(screen.getByPlaceholderText(/What shifted for you/)).toBeInTheDocument();
  });

  it("allows submitting with no prompts answered (bare recommendation)", async () => {
    currentUser = mockUser;
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ traditions: ["Zen"] });

    render(<RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    fireEvent.click(screen.getByText(/Have you read Zen Mind/));

    await waitFor(() => {
      expect(screen.getByText("Recommend this resource")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Recommend this resource"));

    await waitFor(() => {
      expect(createTestimony).toHaveBeenCalledWith({
        user_id: "u1",
        resource_slug: "zen-mind",
        impact: null,
        context: null,
        who_for: null,
        freeform: null,
      });
    });
  });

  it("shows success after submission when profile is complete", async () => {
    currentUser = mockUser;
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ traditions: ["Zen"] });

    render(<RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    fireEvent.click(screen.getByText(/Have you read Zen Mind/));

    await waitFor(() => {
      expect(screen.getByText("Recommend this resource")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Recommend this resource"));

    await waitFor(() => {
      expect(screen.getByText("Thank you for your recommendation")).toBeInTheDocument();
    });
  });

  it("shows profile completion after submission when profile is empty", async () => {
    currentUser = mockUser;
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ traditions: [] });

    render(<RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    fireEvent.click(screen.getByText(/Have you read Zen Mind/));

    await waitFor(() => {
      expect(screen.getByText("Recommend this resource")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Recommend this resource"));

    await waitFor(() => {
      expect(screen.getByText("A little about you")).toBeInTheDocument();
    });
  });
});
