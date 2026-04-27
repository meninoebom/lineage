"use client";

import { useSearchParams } from "next/navigation";
import { PractitionerProfile } from "./practitioner-profile";

export function PractitionerProfileLoader() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground mb-2">No practitioner specified.</p>
        <p className="text-sm text-muted-foreground">
          Visit this page with a practitioner ID: <code>/practitioners?id=...</code>
        </p>
      </div>
    );
  }

  return <PractitionerProfile userId={id} />;
}
