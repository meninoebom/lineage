"use client";

import { ReactCusdis } from "react-cusdis";

const CUSDIS_APP_ID = process.env.NEXT_PUBLIC_CUSDIS_APP_ID ?? "";
const CUSDIS_HOST = process.env.NEXT_PUBLIC_CUSDIS_HOST ?? "https://cusdis.com";

interface CommentsProps {
  pageId: string;
  pageTitle: string;
}

export function Comments({ pageId, pageTitle }: CommentsProps) {
  return (
    <section className="mb-12 max-w-2xl">
      <h2 className="mb-2">Community Notes</h2>
      <p className="font-sans text-sm text-muted-foreground mb-6">
        Share your experience, ask a question, or suggest a correction.
        All comments are reviewed before appearing.
      </p>

      {/* Honeypot — hidden from humans, filled by bots */}
      <div className="absolute -left-[9999px] overflow-hidden" aria-hidden="true">
        <label htmlFor="website-hp">Website</label>
        <input type="text" id="website-hp" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <ReactCusdis
        attrs={{
          host: CUSDIS_HOST,
          appId: CUSDIS_APP_ID,
          pageId,
          pageTitle,
        }}
      />
    </section>
  );
}
