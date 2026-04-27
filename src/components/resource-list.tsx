import Link from "next/link";
import type { Resource, ResourceCategory, ResourceType } from "@/lib/types";
import { ResourceListTestimonyCounts } from "./resource-list-testimony-counts";
import { TestimonyCountBadge } from "./testimony-count";

const CATEGORY_ORDER: ResourceCategory[] = [
  "primary_text",
  "academic",
  "encyclopedia",
  "popular",
  "web_resource",
];

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  primary_text: "Primary Texts",
  academic: "Academic Works",
  encyclopedia: "Encyclopedias",
  popular: "Popular Works",
  web_resource: "Web Resources",
};

const TYPE_ORDER: ResourceType[] = ["book", "video", "podcast", "article", "website", "app"];

const TYPE_LABELS: Record<ResourceType, string> = {
  book: "Books",
  video: "Videos",
  podcast: "Podcasts",
  article: "Articles",
  website: "Websites",
  app: "Apps",
};

interface ResourceListProps {
  resources: Resource[];
}

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) return null;

  // Group resources by category, then by type within each category
  const groupedByCategory = CATEGORY_ORDER.reduce<
    Partial<Record<ResourceCategory, Partial<Record<ResourceType, Resource[]>>>>
  >((acc, category) => {
    const categoryItems = resources.filter((r) => r.category === category);
    if (categoryItems.length === 0) return acc;

    const byType = TYPE_ORDER.reduce<Partial<Record<ResourceType, Resource[]>>>(
      (typeAcc, type) => {
        const items = categoryItems.filter((r) => r.type === type);
        if (items.length > 0) typeAcc[type] = items;
        return typeAcc;
      },
      {}
    );

    if (Object.keys(byType).length > 0) acc[category] = byType;
    return acc;
  }, {});

  const allSlugs = resources.map((r) => r.slug);

  return (
    <section className="mb-12">
      <h2 className="mb-6">Resources</h2>

      <ResourceListTestimonyCounts slugs={allSlugs}>
        {CATEGORY_ORDER.filter((category) => groupedByCategory[category]).map(
          (category) => (
            <div key={category} className="mb-10 last:mb-0">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4 border-b border-border/50 pb-2">
                {CATEGORY_LABELS[category]}
              </h3>

              {TYPE_ORDER.filter(
                (type) => groupedByCategory[category]?.[type]
              ).map((type) => (
                <div key={type} className="mb-6 last:mb-0">
                  <h4 className="font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    {TYPE_LABELS[type]}
                  </h4>
                  <div className="space-y-4">
                    {groupedByCategory[category]![type]!.map((resource) => (
                      <Link
                        key={resource.slug}
                        href={`/resources/${resource.slug}`}
                        className="block rounded-lg bg-card p-4 border border-border/50 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                          <span className="font-serif text-base font-medium text-foreground">
                            {resource.title}
                          </span>
                          {resource.author && (
                            <span className="font-sans text-sm text-muted-foreground">
                              {resource.author}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <p className="font-sans text-sm leading-relaxed text-muted-foreground flex-1">
                            {resource.description}
                          </p>
                          <TestimonyCountBadge slug={resource.slug} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </ResourceListTestimonyCounts>
    </section>
  );
}
