import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitFeedback, type FeedbackData } from "../feedback";

const validData: FeedbackData = {
  message: "Great site!",
  name: "Test User",
  email: "test@example.com",
  pageUrl: "/traditions",
};

describe("submitFeedback", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("NEXT_PUBLIC_FORMSPREE_ID", "mbdpjqyb");
  });

  it("POSTs JSON to the Formspree endpoint and returns ok on success", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const result = await submitFeedback(validData);

    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://formspree.io/f/mbdpjqyb",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(validData),
      }
    );
  });

  it("returns ok: false when the server responds with an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const result = await submitFeedback(validData);
    expect(result).toEqual({ ok: false });
  });

  it("returns ok: false when fetch throws a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    const result = await submitFeedback(validData);
    expect(result).toEqual({ ok: false });
  });

  it("returns ok: false when NEXT_PUBLIC_FORMSPREE_ID is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_FORMSPREE_ID", "");

    const result = await submitFeedback(validData);
    expect(result).toEqual({ ok: false });
  });

  it("includes optional fields only when provided", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const minimalData: FeedbackData = { message: "Hi", pageUrl: "/" };
    await submitFeedback(minimalData);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ message: "Hi", pageUrl: "/" });
    expect(body.name).toBeUndefined();
    expect(body.email).toBeUndefined();
  });
});
