import Link from "next/link";
import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { SITE_URL } from "@/lib/seo";

const description =
  "An editorial guide to contemplative traditions, teachers, and meditation centers. Explore how Buddhist, Vedic-Yogic, Christian, Sufi, and secular paths connect.";

export const metadata: Metadata = {
  title: { absolute: "Lineage — A Map of Contemplative Traditions" },
  description,
  openGraph: {
    title: "Lineage — A Map of Contemplative Traditions",
    description,
    url: SITE_URL,
  },
};

const sections = [
  {
    title: "Find a Teacher",
    description:
      "Discover living teachers you can study with across traditions.",
    href: "/teachers",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Explore the Masters",
    description:
      "The great teachers whose wisdom shaped the contemplative paths.",
    href: "/masters",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 28c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 6l6-3 6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Find a Center",
    description:
      "Meditation centers and practice communities near you.",
    href: "/centers",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="6" y="12" width="20" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 12l10-8 10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="13" y="20" width="6" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Explore Traditions",
    description:
      "How contemplative paths connect, diverge, and speak to one another.",
    href: "/map",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="10" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="4" width="10" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 22v6M23 22v6M9 28h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <PageLayout>
      {/* Hero */}
      <header className="mt-6 mb-12 text-center">
        <h1 className="mb-4">The Contemplative Landscape</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Explore how the world&apos;s great contemplative traditions connect,
          diverge, and speak to one another across time.
        </p>
      </header>

      {/* Navigation cards — primary CTA */}
      <section className="grid gap-6 sm:grid-cols-2 mb-16">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="group">
            <div className="h-full rounded-lg border border-border bg-card p-6 transition-shadow group-hover:shadow-md">
              <div className="text-primary mb-4">{section.icon}</div>
              <h3 className="text-xl mb-2 group-hover:text-primary transition-colors">
                {section.title}
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-4">
                {section.description}
              </p>
              <span className="font-sans text-sm text-primary">
                Explore &rarr;
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Map teaser */}
      <section className="py-16 -mx-6 px-6 border-t border-border bg-warm-gray-light/30">
        <div className="max-w-2xl mx-auto">
          <Link href="/map" className="group block">
            <div className="rounded-lg bg-card border border-border overflow-hidden transition-shadow group-hover:shadow-md">
              {/* Static decorative SVG */}
              <div className="px-8 pt-8 pb-4">
                <svg
                  viewBox="0 0 500 280"
                  className="w-full h-auto"
                  aria-hidden="true"
                >
                  {/* Connecting lines */}
                  <line x1="200" y1="120" x2="120" y2="60" stroke="#e2dbd3" strokeWidth="1.5" />
                  <line x1="200" y1="120" x2="310" y2="70" stroke="#d4a899" strokeWidth="1.5" />
                  <line x1="200" y1="120" x2="160" y2="210" stroke="#d4a899" strokeWidth="1" strokeDasharray="4 2" />
                  <line x1="200" y1="120" x2="260" y2="220" stroke="#e2dbd3" strokeWidth="1" strokeDasharray="4 2" />
                  <line x1="310" y1="70" x2="400" y2="100" stroke="#d4a899" strokeWidth="1.5" />
                  <line x1="310" y1="70" x2="340" y2="170" stroke="#e2dbd3" strokeWidth="1" strokeDasharray="4 2" />
                  <line x1="340" y1="170" x2="400" y2="100" stroke="#e2dbd3" strokeWidth="1" />
                  <line x1="160" y1="210" x2="260" y2="220" stroke="#e2dbd3" strokeWidth="1" strokeDasharray="1 3" />

                  {/* Nodes */}
                  <circle cx="120" cy="60" r="6" fill="#8a8279" />
                  <text x="120" y="46" textAnchor="middle" fontSize="12" fill="#8a8279" fontFamily="Georgia, serif">Vedanta</text>

                  <circle cx="200" cy="120" r="8" fill="#6b6560" />
                  <text x="200" y="106" textAnchor="middle" fontSize="13" fill="#4a4540" fontFamily="Georgia, serif">Buddhism</text>

                  <circle cx="310" cy="70" r="7" fill="#6b6560" />
                  <text x="310" y="56" textAnchor="middle" fontSize="12" fill="#8a8279" fontFamily="Georgia, serif">Chan</text>

                  <circle cx="400" cy="100" r="7" fill="#6b6560" />
                  <text x="400" y="86" textAnchor="middle" fontSize="12" fill="#8a8279" fontFamily="Georgia, serif">Zen</text>

                  <circle cx="340" cy="170" r="6" fill="#b5ada5" />
                  <text x="340" y="156" textAnchor="middle" fontSize="12" fill="#8a8279" fontFamily="Georgia, serif">Tibetan</text>

                  <circle cx="160" cy="210" r="6" fill="#b5ada5" />
                  <text x="160" y="196" textAnchor="middle" fontSize="12" fill="#8a8279" fontFamily="Georgia, serif">Tantra</text>

                  <circle cx="260" cy="220" r="6" fill="#b5ada5" />
                  <text x="260" y="206" textAnchor="middle" fontSize="12" fill="#8a8279" fontFamily="Georgia, serif">Vajrayana</text>
                </svg>
              </div>

              {/* CTA row */}
              <div className="px-8 pb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl mb-1 group-hover:text-primary transition-colors">
                    Explore the Interactive Map
                  </h2>
                  <p className="font-sans text-sm text-muted-foreground">
                    See how traditions connect across history
                  </p>
                </div>
                <span className="text-primary text-2xl shrink-0 ml-4 group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* About blurb */}
      <section className="py-16 max-w-2xl mx-auto">
        <blockquote className="border-l-3 border-primary/40 pl-6 space-y-4">
          <p className="text-secondary-foreground leading-relaxed">
            <em>Lineage</em> is a first attempt at mapping the world&apos;s contemplative
            traditions — their historical connections, living teachers, and practice
            communities. It&apos;s a community project, and we know we&apos;re just getting started.
          </p>
          <p className="text-secondary-foreground leading-relaxed">
            If you see something missing or wrong, we&apos;d love your help.
            This resource grows with input from practitioners, scholars, and curious
            people like you.{" "}
            <a
              href="https://github.com/meninoebom/lineage/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Suggest an edit &rarr;
            </a>
          </p>
        </blockquote>
      </section>
    </PageLayout>
  );
}
