/**
 * Renders a JSON-LD script tag for structured data.
 *
 * Usage:
 *   <JsonLd data={teacherJsonLd(teacher)} />
 *
 * Why a component? Encapsulates the serialization and dangerouslySetInnerHTML
 * pattern in one place, keeping page components clean.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
