"use client";

import { TestimonyDisplay } from "./testimony-display";
import { RecommendationFlow } from "./recommendation-flow";

interface ResourceTestimoniesProps {
  resourceSlug: string;
  resourceTitle: string;
}

export function ResourceTestimonies({ resourceSlug, resourceTitle }: ResourceTestimoniesProps) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-xl font-semibold text-foreground">
        Practitioner Recommendations
      </h2>
      <TestimonyDisplay resourceSlug={resourceSlug} />
      <RecommendationFlow resourceSlug={resourceSlug} resourceTitle={resourceTitle} />
    </section>
  );
}
