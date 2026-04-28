"use client";

import { TestimonyDisplay } from "./testimony-display";
import { GuidedReflection } from "./guided-reflection";
import { RecommendationCount } from "./testimony-count";

interface ResourceTestimoniesProps {
  resourceSlug: string;
  resourceTitle: string;
}

export function ResourceTestimonies({ resourceSlug, resourceTitle }: ResourceTestimoniesProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Practitioner Recommendations
        </h2>
        <RecommendationCount resourceSlug={resourceSlug} />
      </div>
      <TestimonyDisplay resourceSlug={resourceSlug} />
      <GuidedReflection resourceSlug={resourceSlug} resourceTitle={resourceTitle} />
    </section>
  );
}
