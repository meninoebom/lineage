import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import React from "react";

// Framer Motion animations don't run in jsdom — AnimatePresence mode="wait"
// would block navigation tests. Stub the library so components render instantly.
type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: unknown;
};
function MotionDiv({ children, initial: _i, animate: _a, exit: _e, transition: _t, ...props }: MotionDivProps) {
  return <div {...props}>{children}</div>;
}
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: { div: MotionDiv },
  useReducedMotion: () => false,
}));

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
import { GuidedReflection } from "../guided-reflection";

function setUrlParams(params: string) {
  window.history.replaceState({}, "", params ? `/?${params}` : "/");
}

async function recommendAndOpenReflection() {
  currentUser = mockUser;
  render(<GuidedReflection resourceSlug="zen-mind" resourceTitle="Zen Mind" />);

  await waitFor(() => expect(screen.getByText("Recommend")).toBeInTheDocument());

  await act(async () => {
    fireEvent.click(screen.getByText("Recommend"));
  });

  await waitFor(() => expect(createRecommendation).toHaveBeenCalled());

  await act(async () => {
    vi.advanceTimersByTime(300);
  });
}

describe("GuidedReflection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    currentUser = null;
    setUrlParams("");
    (getUserRecommendation as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    (getRecommendationCount as ReturnType<typeof vi.fn>).mockResolvedValue(5);
    (createRecommendation as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "r1" });
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ traditions: ["Zen"] });
    (createTestimony as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "t1" });
  });

  afterEach(() => {
    setUrlParams("");
    vi.useRealTimers();
  });

  // --- Idle state ---

  it("renders recommend button with count", async () => {
    render(<GuidedReflection resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    await waitFor(() => {
      expect(screen.getByText("Recommend")).toBeInTheDocument();
      expect(screen.getByText("5 recommendations")).toBeInTheDocument();
    });
  });

  it("shows singular 'recommendation' for count of 1", async () => {
    (getRecommendationCount as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    render(<GuidedReflection resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    await waitFor(() => {
      expect(screen.getByText("1 recommendation")).toBeInTheDocument();
    });
  });

  it("shows already-recommended state when user has existing recommendation", async () => {
    currentUser = mockUser;
    (getUserRecommendation as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    render(<GuidedReflection resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    await waitFor(() => {
      expect(screen.getByText("Recommended")).toBeInTheDocument();
      expect(screen.getByLabelText("Recommended")).toBeDisabled();
    });
  });

  // --- Auth ---

  it("shows auth panel when unauthenticated user clicks recommend", async () => {
    render(<GuidedReflection resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    await waitFor(() => expect(screen.getByText("Recommend")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Recommend"));
    expect(screen.getByText("Sign in to share your experience")).toBeInTheDocument();
    expect(window.location.search).toContain("action=recommend");
  });

  // --- Optimistic updates ---

  it("optimistically updates count and shows filled heart on recommend", async () => {
    currentUser = mockUser;
    render(<GuidedReflection resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    await waitFor(() => expect(screen.getByText("5 recommendations")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText("Recommend"));
    });

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
    render(<GuidedReflection resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
    await waitFor(() => expect(screen.getByText("5 recommendations")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText("Recommend"));
    });

    await waitFor(() => {
      expect(screen.getByText("5 recommendations")).toBeInTheDocument();
      expect(screen.getByText("Recommend")).toBeInTheDocument();
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
    });
  });

  // --- Reflection steps ---

  it("shows first reflection step with progress after recommend", async () => {
    await recommendAndOpenReflection();

    await waitFor(() => {
      expect(screen.getByText("1 of 4")).toBeInTheDocument();
      expect(screen.getByText("How did this resource touch your practice?")).toBeInTheDocument();
    });
  });

  it("uses invitational language in step prompts", async () => {
    await recommendAndOpenReflection();

    await waitFor(() => {
      const heading = screen.getByText("How did this resource touch your practice?");
      expect(heading).toBeInTheDocument();
    });
  });

  it("next button advances to step 2", async () => {
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Next"));

    await waitFor(() => {
      expect(screen.getByText("2 of 4")).toBeInTheDocument();
      expect(screen.getByText("What were you going through when you found it?")).toBeInTheDocument();
    });
  });

  it("back button returns to step 1", async () => {
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("2 of 4")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Back"));
    await waitFor(() => {
      expect(screen.getByText("1 of 4")).toBeInTheDocument();
      expect(screen.getByText("How did this resource touch your practice?")).toBeInTheDocument();
    });
  });

  it("preserves answer when navigating back and forward", async () => {
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "It transformed my morning sits." } });

    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("2 of 4")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Back"));
    await waitFor(() => {
      const restored = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(restored.value).toBe("It transformed my morning sits.");
    });
  });

  it("back button is not shown on step 1", async () => {
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("shows Submit button only on last step", async () => {
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("2 of 4")).toBeInTheDocument());
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("3 of 4")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => {
      expect(screen.getByText("4 of 4")).toBeInTheDocument();
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });
  });

  // --- Submission ---

  it("submits combined testimony content on final step", async () => {
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "It deepened my practice." },
    });

    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("2 of 4")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("3 of 4")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("4 of 4")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => {
      expect(createTestimony).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "u1",
          resource_slug: "zen-mind",
          content: expect.stringContaining("It deepened my practice."),
        })
      );
    });
  });

  it("shows thank-you screen after submit", async () => {
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    // advance through all steps
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText("Next"));
      await waitFor(() => expect(screen.getByText(`${i + 2} of 4`)).toBeInTheDocument());
    }

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("reflection-complete")).toBeInTheDocument();
    });
  });

  it("echoes back first non-empty answer on thank-you screen", async () => {
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "It transformed everything." },
    });

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText("Next"));
      await waitFor(() => expect(screen.getByText(`${i + 2} of 4`)).toBeInTheDocument());
    }

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => {
      expect(screen.getByText(/It transformed everything/)).toBeInTheDocument();
    });
  });

  // --- Profile enrichment nudge ---

  it("shows enrichment nudge on success screen when bio and practice_background are empty", async () => {
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ bio: null, practice_background: null });
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText("Next"));
      await waitFor(() => expect(screen.getByText(`${i + 2} of 4`)).toBeInTheDocument());
    }

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("reflection-complete")).toBeInTheDocument();
      expect(screen.getByTestId("profile-enrichment-nudge")).toBeInTheDocument();
    });
  });

  it("nudge does not appear when bio and practice_background are already filled", async () => {
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      bio: "A practitioner of Zen.",
      practice_background: "10 years of daily sitting.",
    });
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText("Next"));
      await waitFor(() => expect(screen.getByText(`${i + 2} of 4`)).toBeInTheDocument());
    }

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("reflection-complete")).toBeInTheDocument();
      expect(screen.queryByTestId("profile-enrichment-nudge")).not.toBeInTheDocument();
    });
  });

  it("nudge uses invitational language", async () => {
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ bio: null, practice_background: null });
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText("Next"));
      await waitFor(() => expect(screen.getByText(`${i + 2} of 4`)).toBeInTheDocument());
    }

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("profile-enrichment-nudge")).toBeInTheDocument();
    });

    const nudge = screen.getByTestId("profile-enrichment-nudge");
    expect(nudge.textContent).toMatch(/contemplative path|share a bit|optional/i);
  });

  it("expanding the nudge shows bio and practice_background fields", async () => {
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ bio: null, practice_background: null });
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText("Next"));
      await waitFor(() => expect(screen.getByText(`${i + 2} of 4`)).toBeInTheDocument());
    }

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("profile-enrichment-nudge")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("nudge-expand-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("nudge-bio-input")).toBeInTheDocument();
      expect(screen.getByTestId("nudge-background-input")).toBeInTheDocument();
    });
  });

  it("nudge save calls updateProfile and hides the nudge", async () => {
    const { updateProfile } = await import("@/lib/testimonies");
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ bio: null, practice_background: null });
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText("Next"));
      await waitFor(() => expect(screen.getByText(`${i + 2} of 4`)).toBeInTheDocument());
    }

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => expect(screen.getByTestId("profile-enrichment-nudge")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("nudge-expand-btn"));
    await waitFor(() => expect(screen.getByTestId("nudge-bio-input")).toBeInTheDocument());

    fireEvent.change(screen.getByTestId("nudge-bio-input"), { target: { value: "Zen practitioner." } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("nudge-save-btn"));
    });

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith("u1", expect.objectContaining({ bio: "Zen practitioner." }));
      expect(screen.queryByTestId("profile-enrichment-nudge")).not.toBeInTheDocument();
    });
  });

  it("nudge skip hides the nudge without saving", async () => {
    (getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ bio: null, practice_background: null });
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText("Next"));
      await waitFor(() => expect(screen.getByText(`${i + 2} of 4`)).toBeInTheDocument());
    }

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => expect(screen.getByTestId("profile-enrichment-nudge")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("nudge-skip-btn"));

    await waitFor(() => {
      expect(screen.queryByTestId("profile-enrichment-nudge")).not.toBeInTheDocument();
    });
  });

  // --- Skip ---

  it("skip button dismisses reflection and shows success without submitting testimony", async () => {
    await recommendAndOpenReflection();
    await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Skip for now"));

    await waitFor(() => {
      expect(screen.getByTestId("reflection-complete")).toBeInTheDocument();
    });

    expect(createTestimony).not.toHaveBeenCalled();
  });

  // --- Pending-action URL param ---

  describe("pending-action URL param", () => {
    it("sets ?action=recommend when unauthenticated user clicks recommend", async () => {
      render(<GuidedReflection resourceSlug="zen-mind" resourceTitle="Zen Mind" />);
      await waitFor(() => expect(screen.getByText("Recommend")).toBeInTheDocument());

      fireEvent.click(screen.getByText("Recommend"));
      expect(window.location.search).toContain("action=recommend");
    });

    it("auto-fires recommend when user is authed and ?action=recommend is present", async () => {
      setUrlParams("action=recommend");
      currentUser = mockUser;
      render(<GuidedReflection resourceSlug="zen-mind" resourceTitle="Zen Mind" />);

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
      render(<GuidedReflection resourceSlug="zen-mind" resourceTitle="Zen Mind" />);

      await waitFor(() => expect(createRecommendation).toHaveBeenCalled());
      await waitFor(() => {
        expect(window.location.search).not.toContain("action=recommend");
      });
    });
  });

  // --- Polish & transitions ---

  describe("loading state and transitions", () => {
    it("shows encouraging copy while submitting on final step", async () => {
      let resolveTestimony!: () => void;
      (createTestimony as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise<{ id: string }>((resolve) => {
          resolveTestimony = () => resolve({ id: "t1" });
        })
      );

      await recommendAndOpenReflection();
      await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "It transformed my practice." },
      });

      // Advance to last step
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByText("Next"));
        await waitFor(() => expect(screen.getByText(`${i + 2} of 4`)).toBeInTheDocument());
      }

      await act(async () => {
        fireEvent.click(screen.getByText("Submit"));
      });

      // While submitting, encouraging text is shown
      expect(screen.getByText("Sharing your reflection...")).toBeInTheDocument();

      await act(async () => {
        resolveTestimony();
      });
    });

    it("submit button returns to 'Submit' label after error", async () => {
      (createTestimony as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error")
      );

      await recommendAndOpenReflection();
      await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "Something meaningful." },
      });

      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByText("Next"));
        await waitFor(() => expect(screen.getByText(`${i + 2} of 4`)).toBeInTheDocument());
      }

      await act(async () => {
        fireEvent.click(screen.getByText("Submit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Submit")).toBeInTheDocument();
        expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
      });
    });

    it("step wrapper is present in reflecting stage for animation targeting", async () => {
      await recommendAndOpenReflection();
      await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

      expect(screen.getByTestId("reflection-step-animator")).toBeInTheDocument();
    });

    it("step animator key changes when advancing steps", async () => {
      await recommendAndOpenReflection();
      await waitFor(() => expect(screen.getByText("1 of 4")).toBeInTheDocument());

      const getKey = () =>
        screen.getByTestId("reflection-step-animator").getAttribute("data-step");

      const keyBefore = getKey();
      fireEvent.click(screen.getByText("Next"));
      await waitFor(() => expect(screen.getByText("2 of 4")).toBeInTheDocument());
      const keyAfter = getKey();

      expect(keyBefore).not.toBe(keyAfter);
    });
  });
});
