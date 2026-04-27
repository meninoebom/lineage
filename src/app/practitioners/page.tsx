import { Suspense } from "react";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PractitionerProfileLoader } from "@/components/practitioner-profile-loader";

export const metadata = {
  title: "Practitioner Profile",
  description: "A contemplative practitioner's reading reflections and recommendations.",
};

export default function PractitionersPage() {
  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Practitioners" }]} />
      <div className="max-w-2xl">
        <Suspense fallback={<div className="h-8 w-48 rounded bg-muted animate-pulse" />}>
          <PractitionerProfileLoader />
        </Suspense>
      </div>
    </PageLayout>
  );
}
