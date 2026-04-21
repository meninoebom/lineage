import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

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
  createRecommendation: vi.fn().mockResolvedValue({ id: "r1" }),
  getUserRecommendation: vi.fn().mockResolvedValue(false),
  getRecommendationCount: vi.fn().mockResolvedValue(5),
  createTestimony: vi.fn().mockResolvedValue({ id: "t1" }),
  getProfile: vi.fn().mockResolvedValue({ traditions: ["Zen"] }),
  updateProfile: vi.fn().mockResolvedValue({}),
}));

import {
  createRecommendation,
  getUserRecommendation,
  getRecommendationCount,
  createTestimony,
  getProfile,
} from "@/lib/testimonies";
import { RecommendationFlow } from "../recommendation-flow";

function setUrlParams(params: string) {
  window.history.replaceState({}, "", params ? `/?${params}` : "/");
}

describe("RecommendationFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    currentUser = null;
    setUrlParams("");
    (getUserRecommendation as ReturnType<typeof vi.fn>).mockResolvedValue(
      false
    );
    (getRecommendationCount as ReturnType<typeof vi.fn>).mockResolvedValue(5);
    (createRecommendation as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "r1",
    });
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      traditions: ["Zen"],
    });
    (createTestimony as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "t1",
    });
  });

  afterEach(() => {
    setUrlParams("");
    vi.useRealTimers();
  });

  it("renders recommend button with count", async () => {
    render(
      <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
    );

    await waitFor(() => {
      expect(screen.getByText("Recommend")).toBeInTheDocument();
      expect(screen.getByText("5 recommendations")).toBeInTheDocument();
    });
  });

  it("shows singular 'recommendation' for count of 1", async () => {
    (getRecommendationCount as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    render(
      <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
    );

    await waitFor(() => {
      expect(screen.getByText("1 recommendation")).toBeInTheDocument();
    });
  });

  it("shows auth panel when recommend clicked and user not signed in", async () => {
    render(
      <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
    );

    await waitFor(() => {
      expect(screen.getByText("Recommend")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Recommend"));
    expect(
      screen.getByText("Sign in to share your experience")
    ).toBeInTheDocument();
    expect(window.location.search).toContain("action=recommend");
  });

  it("calls createRecommendation when logged-in user clicks recommend", async () => {
    currentUser = mockUser;

    render(
      <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
    );

    await waitFor(() => {
      expect(screen.getByText("Recommend")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Recommend"));
    });

    await waitFor(() => {
      expect(createRecommendation).toHaveBeenCalledWith("u1", "zen-mind");
    });
  });

  it("optimistically updates count and shows filled heart on recommend", async () => {
    currentUser = mockUser;

    render(
      <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
    );

    await waitFor(() => {
      expect(screen.getByText("5 recommendations")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Recommend"));
    });

    // Count bumped optimistically
    await waitFor(() => {
      expect(screen.getByText("6 recommendations")).toBeInTheDocument();
      expect(screen.getByText("Recommended")).toBeInTheDocument();
    });
  });

  it("rolls back optimistic update on error", async () => {
    currentUser = mockUser;
    (createRecommendation as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error")
    );

    render(
      <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
    );

    await waitFor(() => {
      expect(screen.getByText("5 recommendations")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Recommend"));
    });

    await waitFor(() => {
      expect(screen.getByText("5 recommendations")).toBeInTheDocument();
      expect(screen.getByText("Recommend")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("shows 'Want to say why?' after recommend with 300ms delay", async () => {
    currentUser = mockUser;

    render(
      <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
    );

    await waitFor(() => {
      expect(screen.getByText("Recommend")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Recommend"));
    });

    // Wait for createRecommendation to resolve
    await waitFor(() => {
      expect(createRecommendation).toHaveBeenCalled();
    });

    // Not visible yet before 300ms
    expect(screen.queryByText("Want to say why?")).not.toBeInTheDocument();

    // Advance timer by 300ms
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("Want to say why?")).toBeInTheDocument();
  });

  it("shows already-recommended state when user has existing recommendation", async () => {
    currentUser = mockUser;
    (getUserRecommendation as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    render(
      <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
    );

    await waitFor(() => {
      expect(screen.getByText("Recommended")).toBeInTheDocument();
    });

    // Button should be disabled
    const button = screen.getByLabelText("Recommended");
    expect(button).toBeDisabled();
  });

  it("disables recommend button after recommending", async () => {
    currentUser = mockUser;

    render(
      <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
    );

    await waitFor(() => {
      expect(screen.getByText("Recommend")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Recommend"));
    });

    await waitFor(() => {
      const button = screen.getByLabelText("Recommended");
      expect(button).toBeDisabled();
    });
  });

  describe("pending-action URL param", () => {
    it("sets ?action=recommend when unauthenticated user clicks recommend", async () => {
      render(
        <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
      );

      await waitFor(() => {
        expect(screen.getByText("Recommend")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Recommend"));
      expect(window.location.search).toContain("action=recommend");
    });

    it("auto-fires recommend when user is authed and ?action=recommend is present", async () => {
      setUrlParams("action=recommend");
      currentUser = mockUser;

      render(
        <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
      );

      await waitFor(() => {
        expect(createRecommendation).toHaveBeenCalledWith("u1", "zen-mind");
      });

      await waitFor(() => {
        expect(screen.getByText("Recommended")).toBeInTheDocument();
      });
    });

    it("clears ?action=recommend from URL after successful recommend", async () => {
      setUrlParams("action=recommend");
      currentUser = mockUser;

      render(
        <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
      );

      await waitFor(() => {
        expect(createRecommendation).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(window.location.search).not.toContain("action=recommend");
      });
    });

    it("does not auto-fire when param absent even if user is authenticated", async () => {
      currentUser = mockUser;

      render(
        <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
      );

      await waitFor(() => {
        expect(screen.getByText("Recommend")).toBeInTheDocument();
      });

      expect(createRecommendation).not.toHaveBeenCalled();
    });
  });

  describe("testimony form", () => {
    it("allows submitting testimony after recommending", async () => {
      currentUser = mockUser;

      render(
        <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
      );

      await waitFor(() => {
        expect(screen.getByText("Recommend")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Recommend"));
      });

      await waitFor(() => {
        expect(createRecommendation).toHaveBeenCalled();
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText("Want to say why?")).toBeInTheDocument();

      // Submit testimony without filling prompts
      await act(async () => {
        fireEvent.click(screen.getByText("Share your experience"));
      });

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

      await waitFor(() => {
        expect(
          screen.getByText("Thank you for your recommendation")
        ).toBeInTheDocument();
      });
    });

    it("shows profile completion after testimony when profile is incomplete", async () => {
      currentUser = mockUser;
      (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
        traditions: [],
      });

      render(
        <RecommendationFlow resourceSlug="zen-mind" resourceTitle="Zen Mind" />
      );

      await waitFor(() => {
        expect(screen.getByText("Recommend")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Recommend"));
      });

      await waitFor(() => {
        expect(createRecommendation).toHaveBeenCalled();
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Share your experience"));
      });

      await waitFor(() => {
        expect(screen.getByText("A little about you")).toBeInTheDocument();
      });
    });
  });
});
