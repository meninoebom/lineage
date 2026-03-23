import Link from "next/link";
import type { ResolvedPath } from "@/lib/types";

interface PathCardProps {
  path: ResolvedPath;
}

export function PathCard({ path }: PathCardProps) {
  return (
    <Link href={`/library/${path.slug}`} className="group">
      <div className="h-full bg-card shadow-ambient rounded transition-shadow hover:shadow-md">
        <div className="h-32 rounded-t bg-gradient-to-br from-surface-container-low to-surface-dim flex items-end p-4">
          <h3 className="font-serif text-lg text-foreground/90 leading-snug">
            {path.title}
          </h3>
        </div>
        <div className="p-5 pt-4">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {path.description}
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {path.resources.map((r) => (
              <li key={r.slug} className="truncate">
                <span className="font-medium text-foreground/80">{r.title}</span>
                {r.author && (
                  <span className="text-muted-foreground"> — {r.author}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Link>
  );
}
