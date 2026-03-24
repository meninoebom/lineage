import Link from "next/link";
import Image from "next/image";
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
    href: "/traditions",
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
    <PageLayout
      heroContent={
        <>
          {/* Hero image + headline */}
          <section className="relative flex items-center justify-center text-center overflow-hidden pt-24 md:pt-32 pb-36 md:pb-40">
            <Image
              src="/images/hero-bg.jpg"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-background/40" />
            <div className="relative z-10 px-6">
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight mb-6">
                The Contemplative Landscape
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
                Explore how the world&apos;s great contemplative traditions connect,
                diverge, and speak to one another across time.
              </p>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-primary-foreground px-6 py-3 rounded font-sans text-sm hover:opacity-90 transition-opacity"
              >
                Explore the Map &rarr;
              </Link>
            </div>
          </section>
          {/* Feature cards — pulled up to overlap the hero */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 -mt-24">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {sections.map((section) => (
                <Link key={section.href} href={section.href} className="group">
                  <div className="h-full rounded-lg bg-card p-6 border border-border/50 shadow-lg transition-colors group-hover:bg-accent/50 text-center">
                    <div className="text-muted-foreground mb-4 flex justify-center">{section.icon}</div>
                    <h3 className="font-serif text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                      {section.title}
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-5">
                      {section.description}
                    </p>
                    <span className="inline-flex items-center gap-1 bg-gradient-to-br from-primary to-primary-container text-primary-foreground px-4 py-2 rounded font-sans text-sm hover:opacity-90 transition-opacity">
                      Explore &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      }
    >

      {/* Map teaser */}
      <section className="py-20 -mx-6 px-6 bg-surface-container-low/40 mb-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          {/* Map preview */}
          <div className="flex-1 w-full">
            <div className="rounded bg-card border border-border/50 overflow-hidden p-6">
              <svg
                viewBox="0 0 500 280"
                className="w-full h-auto"
                aria-hidden="true"
              >
                <line x1="200" y1="120" x2="120" y2="60" stroke="#d9c2b9" strokeWidth="1.5" />
                <line x1="200" y1="120" x2="310" y2="70" stroke="#a96242" strokeWidth="1.5" />
                <line x1="200" y1="120" x2="160" y2="210" stroke="#a96242" strokeWidth="1" strokeDasharray="4 2" />
                <line x1="200" y1="120" x2="260" y2="220" stroke="#d9c2b9" strokeWidth="1" strokeDasharray="4 2" />
                <line x1="310" y1="70" x2="400" y2="100" stroke="#a96242" strokeWidth="1.5" />
                <line x1="310" y1="70" x2="340" y2="170" stroke="#d9c2b9" strokeWidth="1" strokeDasharray="4 2" />
                <line x1="340" y1="170" x2="400" y2="100" stroke="#d9c2b9" strokeWidth="1" />
                <line x1="160" y1="210" x2="260" y2="220" stroke="#d9c2b9" strokeWidth="1" strokeDasharray="1 3" />
                <circle cx="120" cy="60" r="6" fill="#656261" />
                <text x="120" y="46" textAnchor="middle" fontSize="12" fill="#656261" fontFamily="'Noto Serif', Georgia, serif">Vedanta</text>
                <circle cx="200" cy="120" r="8" fill="#1c1c18" />
                <text x="200" y="106" textAnchor="middle" fontSize="13" fill="#1c1c18" fontFamily="'Noto Serif', Georgia, serif">Buddhism</text>
                <circle cx="310" cy="70" r="7" fill="#1c1c18" />
                <text x="310" y="56" textAnchor="middle" fontSize="12" fill="#656261" fontFamily="'Noto Serif', Georgia, serif">Chan</text>
                <circle cx="400" cy="100" r="7" fill="#1c1c18" />
                <text x="400" y="86" textAnchor="middle" fontSize="12" fill="#656261" fontFamily="'Noto Serif', Georgia, serif">Zen</text>
                <circle cx="340" cy="170" r="6" fill="#d9c2b9" />
                <text x="340" y="156" textAnchor="middle" fontSize="12" fill="#656261" fontFamily="'Noto Serif', Georgia, serif">Tibetan</text>
                <circle cx="160" cy="210" r="6" fill="#d9c2b9" />
                <text x="160" y="196" textAnchor="middle" fontSize="12" fill="#656261" fontFamily="'Noto Serif', Georgia, serif">Tantra</text>
                <circle cx="260" cy="220" r="6" fill="#d9c2b9" />
                <text x="260" y="206" textAnchor="middle" fontSize="12" fill="#656261" fontFamily="'Noto Serif', Georgia, serif">Vajrayana</text>
              </svg>
            </div>
          </div>

          {/* CTA */}
          <div className="flex-1">
            <h2 className="text-3xl mb-4">Explore the Interactive Map</h2>
            <p className="font-sans text-muted-foreground leading-relaxed mb-6">
              See how 27 contemplative traditions connect across history — from ancient
              Vedic roots to modern secular mindfulness.
            </p>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-primary-foreground px-6 py-3 rounded font-sans text-sm hover:opacity-90 transition-opacity"
            >
              Open the Map &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Help Us Grow */}
      <section className="py-16 max-w-2xl mx-auto mb-20">
        <h2 className="text-3xl text-center mb-6">Help Us Grow</h2>
        <p className="text-center text-muted-foreground leading-relaxed mb-4">
          <em>Lineage</em> is a community project mapping the world&apos;s contemplative
          traditions — their historical connections, living teachers, and practice
          communities. We know we&apos;re just getting started.
        </p>
        <p className="text-center text-muted-foreground leading-relaxed">
          If you see something missing or wrong, we&apos;d love your help.{" "}
          <a
            href="https://github.com/meninoebom/lineage/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            Suggest an edit &rarr;
          </a>
        </p>
      </section>

      {/* Newsletter signup (layout only) */}
      <section className="py-16 -mx-6 px-6 bg-surface-container-low/40">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl mb-3">Stay Connected</h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            Get updates as we add new traditions, teachers, and resources.
          </p>
          <form
            action="#"
            className="flex gap-3"
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Your email address"
              className="flex-1 h-10 rounded border border-transparent bg-surface-container-highest px-3 py-2 font-sans text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:bg-white focus-visible:border-outline-variant/20 focus-visible:ring-2 focus-visible:ring-ring/30 transition-colors"
            />
            <button
              type="submit"
              className="bg-gradient-to-br from-primary to-primary-container text-primary-foreground px-5 py-2 rounded font-sans text-sm hover:opacity-90 transition-opacity"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </PageLayout>
  );
}
