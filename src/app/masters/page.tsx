import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { getAllTeachers, getTradition } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Historical Masters",
  description:
    "The great teachers whose wisdom shaped the contemplative traditions.",
  openGraph: {
    title: "Historical Masters",
    description:
      "The great teachers whose wisdom shaped the contemplative traditions.",
    url: `${SITE_URL}/masters`,
  },
};

function formatYears(birth: number | null, death: number | null): string {
  const b = birth ?? "?";
  const d = death ?? "?";
  return `(${b}\u2013${d})`;
}

function truncateBio(bio: string, maxLength = 120): string {
  if (bio.length <= maxLength) return bio;
  return bio.slice(0, maxLength).replace(/\s+\S*$/, "") + "\u2026";
}

export default function MastersPage() {
  const allTeachers = getAllTeachers();

  // Filter to deceased teachers only
  const masters = allTeachers.filter((t) => t.death_year !== null);

  // Resolve tradition info and group by family
  const mastersWithTraditions = masters.map((t) => {
    const firstTradition = t.traditions[0]
      ? getTradition(t.traditions[0])
      : undefined;
    const family = firstTradition?.family ?? "Other";
    const traditionNames = t.traditions.map((slug) => {
      const tradition = getTradition(slug);
      return { slug, name: tradition?.name ?? slug };
    });
    return { ...t, family, traditionNames };
  });

  // Group by family
  const grouped = new Map<
    string,
    typeof mastersWithTraditions
  >();
  for (const master of mastersWithTraditions) {
    const existing = grouped.get(master.family) ?? [];
    existing.push(master);
    grouped.set(master.family, existing);
  }

  // Sort families alphabetically, sort masters within each group by birth_year
  const sortedFamilies = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([family, members]) => ({
      family,
      members: members.sort(
        (a, b) => (a.birth_year ?? 0) - (b.birth_year ?? 0)
      ),
    }));

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Historical Masters" }]} />

      <header className="mb-12">
        <h1 className="mb-3">Historical Masters</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          The great teachers whose wisdom shaped the contemplative traditions.
        </p>
      </header>

      <div className="space-y-12">
        {sortedFamilies.map(({ family, members }) => (
          <section key={family}>
            <h2 className="font-serif text-2xl font-normal text-[#9e4a3a] mb-6 pb-2 border-b border-[#9e4a3a]/20">
              {family}
            </h2>

            <div className="space-y-4">
              {members.map((master) => (
                <div
                  key={master.slug}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-x-4 gap-y-1 py-2 border-b border-border/40 last:border-b-0"
                >
                  <div className="flex items-baseline gap-2 shrink-0">
                    <Link
                      href={`/teachers/${master.slug}`}
                      className="font-serif text-lg font-medium text-foreground hover:text-[#9e4a3a] transition-colors"
                    >
                      {master.name}
                    </Link>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatYears(master.birth_year, master.death_year)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {master.traditionNames.map(({ slug, name }) => (
                      <Badge key={slug} variant="tradition" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1">
                    {truncateBio(master.bio)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageLayout>
  );
}
