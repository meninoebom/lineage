import type { Metadata } from "next";
import type { Teacher, Center } from "./types";
import type { ParsedTradition } from "./data";

export const SITE_URL = "https://lineage.guide";
export const SITE_NAME = "Lineage";
export const SITE_DESCRIPTION =
  "An interactive map of contemplative traditions and a directory of teachers and centers.";

// -- Default metadata for root layout --

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — A Map of Contemplative Traditions`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Lineage — A Map of Contemplative Traditions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — A Map of Contemplative Traditions`,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// -- JSON-LD helpers --

export function teacherJsonLd(teacher: Teacher): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: teacher.name,
    url: `${SITE_URL}/teachers/${teacher.slug}`,
    description: teacher.bio,
    ...(teacher.website && { sameAs: [teacher.website] }),
    ...(teacher.birth_year && { birthDate: `${teacher.birth_year}` }),
    ...(teacher.death_year && { deathDate: `${teacher.death_year}` }),
    address: {
      "@type": "PostalAddress",
      addressLocality: teacher.city,
      addressRegion: teacher.state,
      addressCountry: teacher.country,
    },
    ...(teacher.latitude != null &&
      teacher.longitude != null && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: teacher.latitude,
          longitude: teacher.longitude,
        },
      }),
  };
}

export function centerJsonLd(center: Center): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: center.name,
    url: `${SITE_URL}/centers/${center.slug}`,
    description: center.description,
    ...(center.website && { sameAs: [center.website] }),
    address: {
      "@type": "PostalAddress",
      addressLocality: center.city,
      addressRegion: center.state,
      addressCountry: center.country,
    },
    ...(center.latitude != null &&
      center.longitude != null && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: center.latitude,
          longitude: center.longitude,
        },
      }),
  };
}

export function traditionJsonLd(
  tradition: ParsedTradition
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: tradition.name,
    url: `${SITE_URL}/traditions/${tradition.slug}`,
    description: tradition.summary,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
