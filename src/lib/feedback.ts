export interface FeedbackData {
  message: string;
  name?: string;
  email?: string;
  pageUrl: string;
}

export async function submitFeedback(
  data: FeedbackData
): Promise<{ ok: boolean }> {
  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
  if (!formspreeId) {
    console.warn("NEXT_PUBLIC_FORMSPREE_ID is not set — feedback not submitted");
    return { ok: false };
  }

  try {
    const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    return { ok: response.ok };
  } catch {
    return { ok: false };
  }
}
