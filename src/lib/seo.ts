import type { Metadata } from "next";
import type { Teacher, Center } from "./types";
import type { ParsedTradition } from "./data";

export const SITE_URL = "https://lineage-5ub.pages.dev";
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
