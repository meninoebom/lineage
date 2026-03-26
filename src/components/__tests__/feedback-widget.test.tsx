import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FeedbackWidget } from "../feedback-widget";

vi.mock("next/navigation", () => ({
  usePathname: () => "/traditions",
}));

vi.mock("@/lib/feedback", () => ({
  submitFeedback: vi.fn(),
}));

import { submitFeedback } from "@/lib/feedback";
const mockSubmit = vi.mocked(submitFeedback);

describe("FeedbackWidget", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSubmit.mockResolvedValue({ ok: true });
  });

  it("opens the panel when the button is clicked", () => {
    render(<FeedbackWidget />);
    const btn = screen.getByLabelText("Open feedback form");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("closes when close button is clicked", () => {
    render(<FeedbackWidget />);
    fireEvent.click(screen.getByLabelText("Open feedback form"));
    fireEvent.click(screen.getByLabelText("Close feedback"));
    expect(screen.getByLabelText("Open feedback form").getAttribute("aria-expanded")).toBe("false");
  });

  it("closes when Escape is pressed", () => {
    render(<FeedbackWidget />);
    fireEvent.click(screen.getByLabelText("Open feedback form"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByLabelText("Open feedback form").getAttribute("aria-expanded")).toBe("false");
  });

  it("closes when backdrop is clicked", () => {
    render(<FeedbackWidget />);
    fireEvent.click(screen.getByLabelText("Open feedback form"));
    fireEvent.click(screen.getByTestId("feedback-backdrop"));
    expect(screen.getByLabelText("Open feedback form").getAttribute("aria-expanded")).toBe("false");
  });

  it("submits feedback successfully and shows thank-you message", async () => {
    render(<FeedbackWidget />);
    fireEvent.click(screen.getByLabelText("Open feedback form"));

    fireEvent.change(screen.getByPlaceholderText("What's on your mind?"), {
      target: { value: "Great site!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Feedback" }));

    await waitFor(() => {
      expect(screen.getByText("Thank you — we read every message.")).toBeDefined();
    });

    expect(mockSubmit).toHaveBeenCalledWith({
      message: "Great site!",
      name: undefined,
      email: undefined,
      pageUrl: "/traditions",
    });
  });

  it("shows error message on failure and preserves input", async () => {
    mockSubmit.mockResolvedValue({ ok: false });
    render(<FeedbackWidget />);
    fireEvent.click(screen.getByLabelText("Open feedback form"));

    fireEvent.change(screen.getByPlaceholderText("What's on your mind?"), {
      target: { value: "Bug report" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Feedback" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
    });
    expect(screen.getByText(/Something went wrong/)).toBeDefined();
    // Input is preserved
    expect(screen.getByPlaceholderText("What's on your mind?")).toHaveValue("Bug report");
  });
});
