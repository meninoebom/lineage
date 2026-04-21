"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getTestimonyCounts, getRecommendationCount } from "@/lib/testimonies";

interface TestimonyCountContextValue {
  counts: Map<string, number>;
  loading: boolean;
}

const TestimonyCountContext = createContext<TestimonyCountContextValue>({
  counts: new Map(),
  loading: true,
});

interface TestimonyCountProviderProps {
  slugs: string[];
  children: React.ReactNode;
}

export function TestimonyCountProvider({ slugs, children }: TestimonyCountProviderProps) {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(slugs.length > 0);

  const slugsKey = useMemo(() => JSON.stringify(slugs), [slugs]);

  useEffect(() => {
    if (slugs.length === 0) {
      return;
    }

    getTestimonyCounts(slugs)
      .then(setCounts)
      .catch(() => {}) // Fail silently
      .finally(() => setLoading(false));
  }, [slugsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TestimonyCountContext.Provider value={{ counts, loading }}>
      {children}
    </TestimonyCountContext.Provider>
  );
}

export function useTestimonyCount(slug: string): number | null {
  const { counts, loading } = useContext(TestimonyCountContext);
  if (loading) return null;
  return counts.get(slug) ?? 0;
}

/**
 * Heart icon for list/card views.
 * Shows: heart icon + number (no label). Hidden when count is 0 or loading.
 */
interface TestimonyCountBadgeProps {
  slug: string;
}

export function TestimonyCountBadge({ slug }: TestimonyCountBadgeProps) {
  const count = useTestimonyCount(slug);

  // Don't render anything for zero or while loading
  if (!count) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "#c9ad9e" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.765-2.033C3.981 12.695 2 10.577 2 7.75 2 5.478 3.791 3.5 6.05 3.5c1.278 0 2.435.592 3.2 1.52.017.02.033.04.05.06a4.19 4.19 0 01.05-.06C10.115 4.092 11.272 3.5 12.55 3.5 14.809 3.5 16.6 5.478 16.6 7.75c0 2.827-1.981 4.945-3.702 6.437a22.043 22.043 0 01-2.765 2.033 20.741 20.741 0 01-1.162.682l-.019.01-.005.003h-.002a.739.739 0 01-.69 0l-.003-.001z" />
      </svg>
      {count}
    </span>
  );
}

/**
 * Recommendation count display for resource detail pages.
 * Fetches count client-side for a single resource slug.
 *
 * - 0 recommendations: renders nothing (empty-state prompt is in the CTA button)
 * - 1+ recommendations: muted editorial count text
 */
interface RecommendationCountProps {
  resourceSlug: string;
}

export function RecommendationCount({ resourceSlug }: RecommendationCountProps) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendationCount(resourceSlug)
      .then(setCount)
      .catch(() => setCount(0))
      .finally(() => setLoading(false));
  }, [resourceSlug]);

  if (loading) {
    return (
      <div className="h-5 w-32 animate-pulse rounded bg-muted" aria-label="Loading recommendation count" />
    );
  }

  if (!count) return null;

  return (
    <p className="text-sm font-serif" style={{ color: "#c9ad9e" }}>
      {count} {count === 1 ? "recommendation" : "recommendations"}
    </p>
  );
}
