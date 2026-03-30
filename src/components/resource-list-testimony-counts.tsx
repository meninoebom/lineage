"use client";

import { TestimonyCountProvider } from "./testimony-count";

interface Props {
  slugs: string[];
  children: React.ReactNode;
}

export function ResourceListTestimonyCounts({ slugs, children }: Props) {
  return (
    <TestimonyCountProvider slugs={slugs}>
      {children}
    </TestimonyCountProvider>
  );
}
