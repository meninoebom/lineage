import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Traditions",
    description:
      "Explore the landscape of contemplative paths — how they connect, diverge, and influence each other.",
    href: "/traditions",
    accent: "terracotta" as const,
  },
  {
    title: "Teachers",
    description:
      "Find teachers near you, filtered by tradition and location.",
    href: "/teachers",
    accent: "terracotta" as const,
  },
  {
    title: "Centers",
    description:
      "Discover meditation centers and practice communities in your area.",
    href: "/centers",
    accent: "terracotta" as const,
  },
];

const sampleTraditions = [
  "Advaita Vedanta",
  "Zen",
  "Dzogchen",
  "Theravada",
  "Kashmir Shaivism",
];

export default function Home() {
  return (
    <PageLayout>
      <section className="py-12 text-center">
        <h1 className="mb-4">
          A Map of Contemplative Traditions
        </h1>
        <p className="mx-auto max-w-lg text-lg text-muted-foreground leading-relaxed">
          Explore the connections between contemplative paths and find teachers
          and centers near you.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {sampleTraditions.map((name) => (
            <Badge key={name} variant="tradition">
              {name}
            </Badge>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} className="group">
            <Card accent={feature.accent} className="h-full group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardDescription>{feature.description}</CardDescription>
            </Card>
          </Link>
        ))}
      </section>
    </PageLayout>
  );
}
