import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ResolvedPath } from "@/lib/types";

interface PathCardProps {
  path: ResolvedPath;
}

export function PathCard({ path }: PathCardProps) {
  return (
    <Link href={`/library/${path.slug}`} className="group">
      <Card accent="terracotta" className="h-full group-hover:shadow-md">
        <CardHeader>
          <CardTitle className="group-hover:text-primary transition-colors">
            {path.title}
          </CardTitle>
          <CardDescription className="mb-3">{path.description}</CardDescription>
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
        </CardHeader>
      </Card>
    </Link>
  );
}
