import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/testimonies", () => ({
  updateProfile: vi.fn().mockResolvedValue({}),
}));

import { updateProfile } from "@/lib/testimonies";
import { ProfileCompletion } from "../profile-completion";

describe("ProfileCompletion", () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<ProfileCompletion userId="u1" onComplete={mockOnComplete} />);
    expect(screen.getByText("A little about you")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("How you'd like to be known")).toBeInTheDocument();
    expect(screen.getByText("Zen")).toBeInTheDocument();
    expect(screen.getByText("Vipassana")).toBeInTheDocument();
    expect(screen.getByText("10+ years")).toBeInTheDocument();
  });

  it("allows skipping without saving", () => {
    render(<ProfileCompletion userId="u1" onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText("Skip for now"));
    expect(mockOnComplete).toHaveBeenCalled();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it("saves profile with selected traditions and years", async () => {
    render(<ProfileCompletion userId="u1" onComplete={mockOnComplete} />);

    fireEvent.click(screen.getByText("Zen"));
    fireEvent.click(screen.getByText("Vipassana"));
    fireEvent.click(screen.getByText("3–10 years"));
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith("u1", {
        display_name: null,
        traditions: ["Zen", "Vipassana"],
        years_of_practice: "3-10",
      });
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it("toggles tradition selection on and off", () => {
    render(<ProfileCompletion userId="u1" onComplete={mockOnComplete} />);
    const zenButton = screen.getByText("Zen");

    fireEvent.click(zenButton);
    expect(zenButton.className).toContain("bg-terracotta");

    fireEvent.click(zenButton);
    expect(zenButton.className).not.toContain("bg-terracotta");
  });
});
