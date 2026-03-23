import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
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

/** Earth-tone gradients for tradition card placeholders */
const gradientPalette = [
  "from-amber-800/60 to-amber-600/40",
  "from-stone-700/60 to-stone-500/40",
  "from-emerald-900/60 to-emerald-700/40",
  "from-orange-800/60 to-orange-600/40",
  "from-yellow-900/60 to-yellow-700/40",
  "from-lime-900/60 to-lime-700/40",
  "from-teal-800/60 to-teal-600/40",
  "from-rose-900/60 to-rose-700/40",
  "from-cyan-900/60 to-cyan-700/40",
  "from-amber-900/60 to-stone-600/40",
  "from-stone-800/60 to-amber-500/40",
  "from-emerald-800/60 to-stone-500/40",
];

function getGradient(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return gradientPalette[Math.abs(hash) % gradientPalette.length];
}

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

/* ---------- Layout components (inline) ---------- */

function SectionHeader({ index, family }: { index: number; family: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-6">
      <span className="font-serif italic text-2xl text-muted-foreground">
        {String(index + 1).padStart(2, "0")}.
      </span>
      <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">
        {family}
      </h2>
    </div>
  );
}

function ImageCard({ t }: { t: ParsedTradition }) {
  const gradient = getGradient(t.slug);
  return (
    <Link href={`/traditions/${t.slug}`} className="group block">
      <div className="border border-border/50 rounded overflow-hidden">
        <div className="relative h-40 overflow-hidden">
          <Image
            src={`/images/traditions/${t.slug}.jpg`}
            alt={t.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <p className="uppercase tracking-wider text-xs text-muted-foreground mb-1">
            {t.family}
          </p>
          <h3 className="font-serif text-lg font-medium mb-2 group-hover:text-primary transition-colors">
            {t.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{t.summary}</p>
          <p className="text-sm text-primary mt-3">Explore Archive &rarr;</p>
        </div>
      </div>
    </Link>
  );
}

function ThreeColumnImageGrid({ traditions }: { traditions: ParsedTradition[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {traditions.map((t) => (
        <ImageCard key={t.slug} t={t} />
      ))}
    </div>
  );
}

function QuoteCalloutWithGrid({ traditions }: { traditions: ParsedTradition[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <blockquote className="border-l-2 border-primary pl-4 mb-4 font-serif italic text-lg">
          &ldquo;Truth is one, though the sages speak of it by many names.&rdquo; &mdash; Rig Veda
        </blockquote>
        <p className="text-muted-foreground mb-6">
          The ancient sub-continental systems of yoga and the Vedas represent some of
          humanity&apos;s earliest systematic inquiries into the nature of the self (Atman)
          and the ultimate reality (Brahman).
        </p>
        <Link
          href={traditions[0] ? `/traditions/${traditions[0].slug}` : "/traditions"}
          className="inline-block bg-primary text-primary-foreground px-5 py-2 rounded text-sm font-medium"
        >
          Browse Vedic Library
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {traditions.map((t) => (
          <Link
            key={t.slug}
            href={`/traditions/${t.slug}`}
            className="group block border border-border/50 rounded p-4"
          >
            <h3 className="font-serif font-medium mb-1 group-hover:text-primary transition-colors">
              {t.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{t.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function HeroImageWithCards({ traditions }: { traditions: ParsedTradition[] }) {
  const taoismIndex = traditions.findIndex((t) => t.slug === "taoism");
  const hero = taoismIndex >= 0 ? traditions[taoismIndex] : traditions[0];
  const rest = traditions.filter((t) => t.slug !== hero.slug);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {hero && (
        <Link
          href={`/traditions/${hero.slug}`}
          className="group block relative rounded overflow-hidden"
        >
          <div className="relative h-64 md:h-full min-h-[280px]">
            <Image
              src={`/images/traditions/${hero.slug}.jpg`}
              alt={hero.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="font-serif text-2xl font-semibold mb-1">
                Lao Tzu&apos;s Legacy
              </h3>
              <p className="text-sm text-white/80 mb-2">
                The philosophy of &apos;Wu Wei&apos; or non-action...
              </p>
              <span className="uppercase tracking-wider text-xs">Enter the Tao</span>
            </div>
          </div>
        </Link>
      )}
      <div className="space-y-3">
        {rest.map((t) => (
          <Link
            key={t.slug}
            href={`/traditions/${t.slug}`}
            className="group block border border-border/50 rounded p-4"
          >
            <h3 className="font-serif font-medium mb-1 group-hover:text-primary transition-colors">
              {t.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{t.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------- Main page ---------- */

export default function TraditionsPage() {
  const traditions = getAllTraditions();
  const groups = groupByFamily(traditions);

  return (
    <PageLayout>
      <div className="flex gap-12">
        {/* Sidebar -- hidden on mobile, sticky on desktop */}
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
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
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

          {/* Mobile family nav -- horizontal scrollable pills */}
          <nav className="lg:hidden flex overflow-x-auto gap-2 pb-2 -mx-2 px-2 mb-8">
            {groups.map(({ family }) => (
              <a
                key={family}
                href={`#${familySlug(family)}`}
                className="shrink-0 px-3 py-1.5 text-sm border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors whitespace-nowrap"
              >
                {family}
              </a>
            ))}
          </nav>

          {/* Family sections */}
          {groups.map(({ family, traditions: familyTraditions }, index) => (
            <section key={family} id={familySlug(family)} className="mb-12 scroll-mt-24">
              <SectionHeader index={index} family={family} />
              {index === 0 ? (
                <ThreeColumnImageGrid traditions={familyTraditions} />
              ) : index === 1 ? (
                <QuoteCalloutWithGrid traditions={familyTraditions} />
              ) : index === 2 ? (
                <HeroImageWithCards traditions={familyTraditions} />
              ) : (
                <ThreeColumnImageGrid traditions={familyTraditions} />
              )}
            </section>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
