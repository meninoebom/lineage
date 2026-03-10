import Link from "next/link";
import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAllTraditions } from "@/lib/data";
import type { ParsedTradition } from "@/lib/data";

export const metadata: Metadata = {
  title: "Traditions — Lineage",
  description:
    "Explore contemplative traditions — Buddhist, Hindu, Modern Non-Dual, Yogic, and more.",
};

const familyOrder = ["Buddhist", "Hindu", "Modern Non-Dual", "Yogic", "Other"];

function groupByFamily(traditions: ParsedTradition[]) {
  const grouped = new Map<string, ParsedTradition[]>();
  for (const t of traditions) {
    const group = grouped.get(t.family) ?? [];
    group.push(t);
    grouped.set(t.family, group);
  }
  return familyOrder
    .filter((f) => grouped.has(f))
    .map((f) => ({ family: f, traditions: grouped.get(f)! }));
}

export default function TraditionsPage() {
  const traditions = getAllTraditions();
  const groups = groupByFamily(traditions);

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Traditions" }]} />

      <header className="mb-10">
        <h1 className="mb-3">Contemplative Traditions</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          An overview of the contemplative paths — how they connect, where they
          diverge, and what practice looks like in each.
        </p>
      </header>

      {groups.map(({ family, traditions }) => (
        <section key={family} className="mb-12">
          <h2 className="mb-4 flex items-center gap-3">
            {family}
            <Badge variant="family">{traditions.length}</Badge>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {traditions.map((t) => (
              <Link key={t.slug} href={`/traditions/${t.slug}`} className="group">
                <Card accent="terracotta" className="h-full group-hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {t.name}
                    </CardTitle>
                    <CardDescription>{t.summary}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </PageLayout>
  );
}
