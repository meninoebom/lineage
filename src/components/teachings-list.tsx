import Link from "next/link";
import { getTradition } from "@/lib/data";
import type { Resource, ResourceType } from "@/lib/types";

const TYPE_ORDER: ResourceType[] = ["video", "podcast", "book", "article", "website"];

const TYPE_LABELS: Record<ResourceType, string> = {
  video: "Videos",
  podcast: "Podcasts",
  book: "Books",
  article: "Articles",
  website: "Websites",
};

const TYPE_BADGE: Record<ResourceType, string> = {
  video: "Video",
  podcast: "Podcast",
  book: "Book",
  article: "Article",
  website: "Website",
};

interface Props {
  resources: Resource[];
  teacherName: string;
  teacherSlug: string;
}

export function TeachingsList({ resources, teacherName, teacherSlug }: Props) {
  if (resources.length === 0) {
    return (
      <section className="mb-12" id="suggest">
        <h2 className="mb-4">Teachings</h2>
        <p className="font-sans text-sm text-muted-foreground">
          Know a video or talk by {teacherName}?{" "}
          <Link
            href={`/teachers/${teacherSlug}#suggest`}
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Suggest one &rarr;
          </Link>
        </p>
      </section>
    );
  }

  const groupedByType = TYPE_ORDER.reduce<Partial<Record<ResourceType, Resource[]>>>(
    (acc, type) => {
      const items = resources.filter((r) => r.type === type);
      if (items.length > 0) acc[type] = items;
      return acc;
    },
    {}
  );

  return (
    <section className="mb-12">
      <h2 className="mb-6">Teachings</h2>
      {TYPE_ORDER.filter((type) => groupedByType[type]).map((type) => (
        <div key={type} className="mb-8 last:mb-0">
          <h3 className="font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {TYPE_LABELS[type]}
          </h3>
          <div className="space-y-3">
            {groupedByType[type]!.map((resource) => (
              <TeachingCard key={resource.slug} resource={resource} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function TeachingCard({ resource }: { resource: Resource }) {
  const traditions = resource.traditions
    .map((s) => getTradition(s))
    .filter((t): t is NonNullable<typeof t> => t != null);

  return (
    <div className="relative rounded-lg bg-card p-4 border border-border/50 transition-colors hover:bg-accent/50">
      {/* Stretched link covers the whole card */}
      <Link
        href={`/resources/${resource.slug}`}
        className="absolute inset-0 rounded-lg"
        aria-label={resource.title}
      />
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2 mb-1">
            <span className="font-serif text-base font-medium text-foreground">
              {resource.title}
            </span>
            {resource.year && (
              <span className="font-sans text-xs text-muted-foreground">{resource.year}</span>
            )}
          </div>
          <p className="font-sans text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {resource.description}
          </p>
          {traditions.length > 0 && (
            <div className="relative z-10 flex flex-wrap gap-3 mt-2">
              {traditions.map((t) => (
                <Link
                  key={t.slug}
                  href={`/traditions/${t.slug}`}
                  className="font-sans text-xs text-primary hover:underline underline-offset-2"
                >
                  &rarr; {t.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        <span className="relative z-10 shrink-0 font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground border border-border/60 rounded px-2 py-0.5">
          {TYPE_BADGE[resource.type]}
        </span>
      </div>
    </div>
  );
}
