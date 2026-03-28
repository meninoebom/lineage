import Link from "next/link";
import Image from "next/image";
import type { ResolvedPath } from "@/lib/types";

/** Map path slugs to their header images */
const PATH_IMAGES: Record<string, string> = {
  // Tradition paths — reuse tradition images
  "advaita-and-self-inquiry": "/images/traditions/advaita-vedanta.jpg",
  "exploring-zen": "/images/traditions/zen.jpg",
  "the-christian-contemplative-way": "/images/traditions/christian-mysticism.jpg",
  "the-sufi-heart": "/images/traditions/sufism.jpg",
  "the-tao-in-motion": "/images/traditions/taoism.jpg",
  "the-vipassana-path": "/images/traditions/vipassana-movement.jpg",
  "tibetan-heart-practices": "/images/traditions/vajrayana.jpg",
  "yoga-beyond-asana": "/images/traditions/classical-yoga.jpg",
  // Thematic paths — dedicated images
  "contemplation-and-daily-life": "/images/paths/contemplation-daily-life.jpg",
  "the-hidden-traditions": "/images/paths/hidden-traditions.jpg",
  "where-traditions-meet": "/images/paths/where-traditions-meet.jpg",
};

interface PathCardProps {
  path: ResolvedPath;
}

export function PathCard({ path }: PathCardProps) {
  const imageSrc = PATH_IMAGES[path.slug];

  return (
    <Link href={`/library/${path.slug}`} className="group">
      <div className="h-full bg-card border border-border/50 rounded overflow-hidden transition-colors hover:bg-accent/50">
        <div className="relative h-36">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-surface-container-low to-surface-dim" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <h3 className="absolute bottom-3 left-4 right-4 font-serif text-lg text-white leading-snug">
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
