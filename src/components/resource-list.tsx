import type { Resource, ResourceType } from "@/lib/types";

const TYPE_ORDER: ResourceType[] = ["book", "video", "podcast", "article", "website"];

const TYPE_LABELS: Record<ResourceType, string> = {
  book: "Books",
  video: "Videos",
  podcast: "Podcasts",
  article: "Articles",
  website: "Websites",
};

interface ResourceListProps {
  resources: Resource[];
}

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) return null;

  const grouped = TYPE_ORDER.reduce<Partial<Record<ResourceType, Resource[]>>>(
    (acc, type) => {
      const items = resources.filter((r) => r.type === type);
      if (items.length > 0) acc[type] = items;
      return acc;
    },
    {}
  );

  return (
    <section className="mb-12">
      <h2 className="mb-6">Resources</h2>

      {TYPE_ORDER.filter((type) => grouped[type]).map((type) => (
        <div key={type} className="mb-8 last:mb-0">
          <h3 className="font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            {TYPE_LABELS[type]}
          </h3>
          <div className="space-y-4">
            {grouped[type]!.map((resource) => (
              <a
                key={resource.slug}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg bg-card p-4 shadow-ambient transition-shadow hover:shadow-md"
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
                <p className="mt-1 font-sans text-sm leading-relaxed text-muted-foreground">
                  {resource.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
