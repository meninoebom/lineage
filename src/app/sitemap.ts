import type { MetadataRoute } from "next";
import { getAllTeachers, getAllCenters, getAllTraditions, getAllPaths } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

// Required for Next.js static export (output: 'export')
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/map`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/traditions`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/teachers`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/centers`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/masters`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/paths`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const traditionPages: MetadataRoute.Sitemap = getAllTraditions().map((t) => ({
    url: `${SITE_URL}/traditions/${t.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const teacherPages: MetadataRoute.Sitemap = getAllTeachers().map((t) => ({
    url: `${SITE_URL}/teachers/${t.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const centerPages: MetadataRoute.Sitemap = getAllCenters().map((c) => ({
    url: `${SITE_URL}/centers/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const pathPages: MetadataRoute.Sitemap = getAllPaths().map((p) => ({
    url: `${SITE_URL}/paths/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...traditionPages,
    ...teacherPages,
    ...centerPages,
    ...pathPages,
  ];
}
