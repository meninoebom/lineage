import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockSignInWithMagicLink = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockSignInWithApple = vi.fn();

vi.mock("../supabase-provider", () => ({
  useSupabase: () => ({
    user: null,
    loading: false,
    signInWithMagicLink: mockSignInWithMagicLink,
    signInWithGoogle: mockSignInWithGoogle,
    signInWithApple: mockSignInWithApple,
    signOut: vi.fn(),
  }),
}));

import { AuthPanel } from "../auth-panel";

describe("AuthPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithMagicLink.mockResolvedValue({ error: null });
  });

  it("renders sign-in prompt and email input", () => {
    render(<AuthPanel />);
    expect(screen.getByText("Sign in to share your experience")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("renders Google and Apple sign-in buttons", () => {
    render(<AuthPanel />);
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("sends magic link on form submit", async () => {
    render(<AuthPanel />);
    const input = screen.getByPlaceholderText("your@email.com");
    const button = screen.getByText("Email me a link");

    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignInWithMagicLink).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("shows confirmation after magic link sent", async () => {
    render(<AuthPanel />);
    const input = screen.getByPlaceholderText("your@email.com");

    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByText("Email me a link"));

    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("shows error message on magic link failure", async () => {
    mockSignInWithMagicLink.mockResolvedValue({ error: new Error("Rate limited") });

    render(<AuthPanel />);
    fireEvent.change(screen.getByPlaceholderText("your@email.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText("Email me a link"));

    await waitFor(() => {
      expect(screen.getByText("Rate limited")).toBeInTheDocument();
    });
  });

  it("calls signInWithGoogle on Google button click", () => {
    render(<AuthPanel />);
    fireEvent.click(screen.getByText("Google"));
    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it("calls signInWithApple on Apple button click", () => {
    render(<AuthPanel />);
    fireEvent.click(screen.getByText("Apple"));
    expect(mockSignInWithApple).toHaveBeenCalled();
  });
});
