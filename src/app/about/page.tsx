import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SITE_URL } from "@/lib/seo";

const description =
  "What Lineage is, how it's built, and how you can contribute to this community-driven map of contemplative traditions.";

export const metadata: Metadata = {
  title: "About",
  description,
  openGraph: {
    title: "About",
    description,
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "About" }]} />

      <article className="max-w-2xl">
        <header className="mb-10">
          <h1 className="mb-4">About Lineage</h1>
        </header>

        <div className="prose-editorial">
          <p>
            <em>Lineage</em> is an editorial guide to the world&apos;s contemplative
            traditions — their historical connections, living teachers, and practice
            communities. Think of it as a curated map for anyone seeking to understand
            how these paths relate to one another.
          </p>

          <h2>Why this exists</h2>
          <p>
            Contemplative traditions have influenced one another for millennia, but
            that story is scattered across academic texts, lineage charts, and oral
            histories. Lineage tries to make those connections visible and
            navigable — so a practitioner curious about the roots of their tradition,
            or someone exploring for the first time, has a clear starting point.
          </p>

          <h2>How it&apos;s built</h2>
          <p>
            This is a first attempt, and we&apos;re transparent about that. The initial
            dataset was seeded with the help of AI and then reviewed by hand. Teacher
            and center listings were gathered from public directories and verified
            against primary sources where possible.
          </p>
          <p>
            We know there are gaps, and we know some things may be wrong. That&apos;s
            where you come in.
          </p>

          <h2>How to contribute</h2>
          <p>
            Lineage is a community project. If you see something missing, inaccurate,
            or that could be better represented, we&apos;d love to hear from you:
          </p>
          <ul>
            <li>
              <a
                href="https://formspree.io/f/mbdpjqyb"
                target="_blank"
                rel="noopener noreferrer"
              >
                Suggest an edit or report an issue
              </a>
            </li>
            <li>
              Add a teacher or center that&apos;s missing from the directory
            </li>
            <li>
              Help verify or source a connection between traditions
            </li>
          </ul>
          <p>
            Whether you&apos;re a longtime practitioner, a scholar, or just curious —
            your perspective makes this resource better for everyone.
          </p>

          <hr />

          <p>
            Lineage is built and maintained by{" "}
            <a
              href="https://github.com/meninoebom"
              target="_blank"
              rel="noopener noreferrer"
            >
              Brandon
            </a>
            . The source code is{" "}
            <a
              href="https://github.com/meninoebom/lineage"
              target="_blank"
              rel="noopener noreferrer"
            >
              open on GitHub
            </a>
            .
          </p>
        </div>
      </article>
    </PageLayout>
  );
}
