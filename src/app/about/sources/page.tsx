import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SITE_URL } from "@/lib/seo";

const description =
  "How Lineage's content is created, what our sources mean, and how you can help improve accuracy.";

export const metadata: Metadata = {
  title: "About Our Sources",
  description,
  openGraph: {
    title: "About Our Sources",
    description,
    url: `${SITE_URL}/about/sources`,
  },
};

export default function AboutSourcesPage() {
  return (
    <PageLayout>
      <Breadcrumbs
        items={[
          { label: "About", href: "/about" },
          { label: "Sources" },
        ]}
      />

      <article className="max-w-2xl">
        <header className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
            About Our Sources
          </h1>
        </header>

        <div className="prose-editorial">
          <p>
            The editorial content on Lineage — tradition overviews, historical
            connections, teacher biographies — is generated with the help of
            artificial intelligence. We think honesty about that process serves
            you better than any pretense of traditional authorship.
          </p>

          <p>
            Each tradition page lists sources: primary texts, academic works,
            and practitioner writings that likely informed the model&apos;s
            understanding. These are references, not verified citations. We
            link them so you can read further and judge the material for
            yourself, not to imply that every claim traces neatly to a
            specific page and paragraph.
          </p>

          <h2>What the source categories mean</h2>

          <p>
            <strong>Primary texts</strong> are the foundational scriptures and
            writings of a tradition. <strong>Academic works</strong> are
            scholarly studies that contextualize history, doctrine, and
            practice. <strong>Practitioner and lineage sources</strong> come
            from teachers and communities within the traditions themselves,
            offering perspectives that scholarship alone cannot provide.
          </p>

          <h2>Help us get it right</h2>

          <p>
            If you are a practitioner, scholar, or simply a careful reader who
            notices something wrong — a mischaracterized teaching, a missing
            lineage, a broken connection — we genuinely want to hear from you.
            This project improves through the knowledge of its readers, not in
            spite of it.
          </p>

          <p>
            <Link
              href="https://github.com/meninoebom/lineage/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Suggest an edit on GitHub
            </Link>{" "}
            — every correction makes this resource more trustworthy for the
            next person who finds it.
          </p>
        </div>
      </article>
    </PageLayout>
  );
}
