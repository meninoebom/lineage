import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { HomeSearch } from "@/components/home-search";
import {
  getAllTeachers,
  getAllCenters,
  getAllResources,
  getAllTraditions,
  getAllPaths,
} from "@/lib/data";
import { PathCard } from "@/components/path-card";
import { SITE_URL } from "@/lib/seo";

const description =
  "Discover meditation teachers, books, practice centers, and contemplative traditions from Buddhist, Vedic, Christian, Sufi, and secular lineages.";

export const metadata: Metadata = {
  title: { absolute: "Lineage — Contemplative Traditions, Teachers, Books & Centers" },
  description,
  openGraph: {
    title: "Lineage — Contemplative Traditions, Teachers, Books & Centers",
    description,
    url: SITE_URL,
  },
};

const quickLinks = [
  { label: "Zen", href: "/traditions/zen" },
  { label: "Vipassana", href: "/traditions/vipassana-movement" },
  { label: "Advaita Vedanta", href: "/traditions/advaita-vedanta" },
  { label: "Sufism", href: "/traditions/sufism" },
  { label: "Contemplative Prayer", href: "/traditions/christian-mysticism" },
  { label: "Secular Mindfulness", href: "/traditions/secular-mindfulness" },
];

const sections = [
  {
    title: "Find a Teacher",
    description: "Living teachers you can study with, across traditions.",
    href: "/teachers",
    image: "/images/cards/teacher.jpg",
  },
  {
    title: "Browse Resources",
    description: "Resources on meditation, philosophy, and inner life.",
    href: "/resources",
    image: "/images/cards/books.jpg",
  },
  {
    title: "Find a Center",
    description: "Meditation centers and practice communities you can visit.",
    href: "/centers",
    image: "/images/traditions/tibetan-buddhism-gelug.jpg",
  },
  {
    title: "Explore Traditions",
    description: "How contemplative traditions connect and diverge across time.",
    href: "/traditions",
    image: "/images/cards/bell.jpg",
  },
];

export default function Home() {
  const teachers = getAllTeachers();
  const centers = getAllCenters();
  const resources = getAllResources();
  const traditions = getAllTraditions();

  const paths = getAllPaths();
  const featuredPaths = paths.slice(0, 4);

  const traditionNames: Record<string, string> = {};
  for (const t of traditions) {
    traditionNames[t.slug] = t.name;
  }

  return (
    <PageLayout
      heroContent={
        <>
          <section className="relative flex items-center justify-center text-center overflow-hidden pt-20 md:pt-28 pb-32 md:pb-36">
            <Image
              src="/images/hero-bg.jpg"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-background/50" />
            <div className="relative z-20 px-6 w-full">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl italic tracking-tight text-foreground mb-8">
                Wherever you are is the entry point.
              </h1>
              <p className="font-sans text-sm text-muted-foreground/80 mb-8">
                — Kabir
              </p>

              <HomeSearch
                teachers={teachers}
                centers={centers}
                resources={resources}
                traditionNames={traditionNames}
              />

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-sans text-xs px-3 py-1.5 rounded-full bg-white/60 backdrop-blur text-muted-foreground hover:text-foreground hover:bg-white/80 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 -mt-16">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {sections.map((section) => (
                <Link key={section.href} href={section.href} className="group">
                  <div className="overflow-hidden rounded-xl">
                    <div className="relative h-40">
                      <Image
                        src={section.image}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  </div>
                  <div className="pt-3">
                    <h3 className="font-serif text-base font-medium group-hover:text-primary transition-colors">
                      {section.title}
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      }
    >
      {/* Quick-start paths */}
      <section className="py-16 mb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl mb-3">Where are you right now?</h2>
          <p className="font-sans text-muted-foreground max-w-md mx-auto">
            Find resources matched to where you are in practice — not just what tradition you belong to.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              heading: "I&rsquo;m new to practice",
              body: "First steps into meditation, mindfulness, or contemplative life — accessible teachers and beginner texts.",
              href: "/discover?experience_level=beginner&practice_context=new-to-practice",
              accent: "bg-[#eaf2ea] border-[#3d6b3d]/15",
              headingColor: "text-[#3d6b3d]",
            },
            {
              heading: "I want to go deeper",
              body: "You&rsquo;ve been at this a while. Time to move from the shallows into sustained study and practice.",
              href: "/discover?experience_level=intermediate&practice_context=deepening",
              accent: "bg-[#f3ede8] border-[#9e4a3a]/15",
              headingColor: "text-[#9e4a3a]",
            },
            {
              heading: "I&rsquo;m going through something",
              body: "Loss, change, uncertainty. Resources for practice in the middle of life, not apart from it.",
              href: "/discover?practice_context=life-transition",
              accent: "bg-[#f0ece6] border-[#6b5c3d]/15",
              headingColor: "text-[#6b5c3d]",
            },
          ].map(({ heading, body, href, accent, headingColor }) => (
            <Link
              key={href}
              href={href}
              className={`group rounded-xl border p-6 transition-all hover:shadow-md hover:-translate-y-0.5 ${accent}`}
            >
              <h3
                className={`font-serif text-lg font-semibold mb-2 group-hover:underline underline-offset-2 ${headingColor}`}
                dangerouslySetInnerHTML={{ __html: heading }}
              />
              <p className="font-sans text-sm text-foreground/70 leading-relaxed">{body}</p>
              <span className="mt-4 inline-block font-sans text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                Browse resources →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Map teaser */}
      <section className="py-20 -mx-6 px-6 bg-surface-container mb-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 w-full">
            <div className="rounded bg-card border border-border/50 overflow-hidden p-6">
              <svg viewBox="0 0 500 280" className="w-full h-auto" aria-hidden="true">
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

          <div className="flex-1">
            <h2 className="text-3xl mb-4">See How Traditions Connect</h2>
            <p className="font-sans text-muted-foreground leading-relaxed mb-6">
              An interactive map showing how contemplative traditions have
              shaped, challenged, and built on one another across centuries.
            </p>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-primary-foreground px-6 py-3 rounded font-sans text-sm hover:opacity-90 transition-opacity"
            >
              Explore the Map &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Learning paths */}
      <section className="pt-4 pb-6 mb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl mb-4">Not sure where to start?</h2>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Curated learning paths through traditions and themes, each 3-5 resources deep.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {featuredPaths.map((path) => (
            <PathCard key={path.slug} path={path} compact />
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/paths"
            className="font-sans text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            View all learning paths &rarr;
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 -mx-6 px-6 bg-surface-container-low">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl mb-3">Stay Connected</h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            Get updates as we add new traditions, teachers, and resources.
          </p>
          <form action="https://formspree.io/f/xwvwvvzw" method="POST" className="flex gap-3">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Your email address" name="email"
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
