import { getResource } from "@/lib/data";

interface CitationLinksProps {
  sources?: string[];
}

export function CitationLinks({ sources }: CitationLinksProps) {
  if (!sources || sources.length === 0) return null;

  const resolved = sources
    .map((slug) => {
      const resource = getResource(slug);
      if (!resource) return null;
      return { slug, title: resource.title, url: resource.url };
    })
    .filter(Boolean) as { slug: string; title: string; url: string }[];

  if (resolved.length === 0) return null;

  return (
    <span className="ml-1 text-xs text-muted-foreground">
      {resolved.map((r, i) => (
        <span key={r.slug}>
          {i > 0 && ", "}
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted hover:text-primary transition-colors"
          >
            {r.title}
          </a>
        </span>
      ))}
    </span>
  );
}
