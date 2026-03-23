import Link from "next/link";
import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAllTraditions } from "@/lib/data";
import type { ParsedTradition } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Traditions",
  description:
    "Explore contemplative traditions — Buddhist, Vedic-Yogic, Taoist, Christian, Islamic, and more.",
  openGraph: {
    title: "Traditions",
    description:
      "Explore contemplative traditions — Buddhist, Vedic-Yogic, Taoist, Christian, Islamic, and more.",
    url: `${SITE_URL}/traditions`,
  },
};

const familyOrder = ["Buddhist", "Vedic-Yogic", "Taoist", "Christian Contemplative", "Islamic Contemplative", "Modern Secular", "Other"];

/** Map family names to short emoji-style icons for sidebar nav */
const familyIcons: Record<string, string> = {
  "Buddhist": "\u{1F4FF}",
  "Vedic-Yogic": "\u{1F549}\uFE0F",
  "Taoist": "\u{2622}\uFE0F",
  "Christian Contemplative": "\u{271E}",
  "Islamic Contemplative": "\u{2B50}",
  "Modern Secular": "\u{1F52C}",
  "Other": "\u{1F30D}",
};

function familySlug(family: string): string {
  return family.toLowerCase().replace(/\s+/g, "-");
}

function groupByFamily(traditions: ParsedTradition[]) {
  const grouped = new Map<string, ParsedTradition[]>();
  for (const t of traditions) {
    const group = grouped.get(t.family) ?? [];
    group.push(t);
    grouped.set(t.family, group);
  }
  const remaining = [...grouped.keys()].filter((f) => !familyOrder.includes(f));
  return [...familyOrder, ...remaining]
    .filter((f) => grouped.has(f))
    .map((f) => ({ family: f, traditions: grouped.get(f)! }));
}

export default function TraditionsPage() {
  const traditions = getAllTraditions();
  const groups = groupByFamily(traditions);

  return (
    <PageLayout>
      <div className="flex gap-12">
        {/* Sidebar — hidden on mobile, sticky on desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="sticky top-24">
            <h2 className="font-serif text-lg font-semibold mb-1">Traditions</h2>
            <p className="uppercase tracking-wider text-xs text-muted-foreground mb-6">
              The Digital Archivist
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="#overview"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Overview
                </a>
              </li>
              {groups.map(({ family }) => (
                <li key={family}>
                  <a
                    href={`#${familySlug(family)}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <span className="text-base" aria-hidden="true">
                      {familyIcons[family] ?? "\u{1F4D6}"}
                    </span>
                    {family}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Hero */}
          <header id="overview" className="mb-16">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              The Tapestry of Ancestral Wisdom
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Explore the foundational currents of human thought. This directory
              serves as a scholarly preservation of lineages that have shaped
              consciousness for millennia.
            </p>
          </header>

          {/* Family sections — kept intact for #160 to restyle */}
          {groups.map(({ family, traditions }) => (
            <section key={family} id={familySlug(family)} className="mb-12 scroll-mt-24">
              <h2 className="mb-4 flex items-center gap-3">
                {family}
                <Badge variant="family">{traditions.length}</Badge>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {traditions.map((t) => (
                  <Link key={t.slug} href={`/traditions/${t.slug}`} className="group">
                    <Card accent="terracotta" className="h-full group-hover:bg-accent/50">
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
        </div>
      </div>
    </PageLayout>
  );
}
