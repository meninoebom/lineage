"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getTestimonyCounts } from "@/lib/testimonies";

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
  const [loading, setLoading] = useState(true);

  const slugsKey = useMemo(() => JSON.stringify(slugs), [slugs]);

  useEffect(() => {
    if (slugs.length === 0) {
      queueMicrotask(() => setLoading(false));
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

interface TestimonyCountBadgeProps {
  slug: string;
}

export function TestimonyCountBadge({ slug }: TestimonyCountBadgeProps) {
  const count = useTestimonyCount(slug);

  // Don't render anything for zero or while loading
  if (!count) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-terracotta font-medium">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta" />
      {count} recommended
    </span>
  );
}
