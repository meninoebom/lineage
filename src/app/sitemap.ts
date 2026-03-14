import type { MetadataRoute } from "next";
import { getAllTeachers, getAllCenters, getAllTraditions, getAllPaths } from "@/lib/data";
import { getTeacherLocationStates } from "@/lib/location";
import { SITE_URL } from "@/lib/seo";

// Required for Next.js static export (output: 'export')
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/map`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/traditions`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/teachers`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/centers`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/masters`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/library`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const traditionPages: MetadataRoute.Sitemap = getAllTraditions().map((t) => ({
    url: `${SITE_URL}/traditions/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const teacherPages: MetadataRoute.Sitemap = getAllTeachers().map((t) => ({
    url: `${SITE_URL}/teachers/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const centerPages: MetadataRoute.Sitemap = getAllCenters().map((c) => ({
    url: `${SITE_URL}/centers/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const locationPages: MetadataRoute.Sitemap = getTeacherLocationStates().map((state) => ({
    url: `${SITE_URL}/teachers/location/${state.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const pathPages: MetadataRoute.Sitemap = getAllPaths().map((p) => ({
    url: `${SITE_URL}/library/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...traditionPages,
    ...teacherPages,
    ...centerPages,
    ...locationPages,
    ...pathPages,
  ];
}
