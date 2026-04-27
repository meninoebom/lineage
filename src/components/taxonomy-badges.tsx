import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ExperienceLevel } from "@/lib/types";

interface TaxonomyBadgesProps {
  experienceLevel?: ExperienceLevel;
  topics?: string[];
  practiceContext?: string[];
  linked?: boolean;
}

const LEVEL_STYLES: Record<ExperienceLevel, string> = {
  beginner:
    "bg-[#eaf2ea] text-[#3d6b3d] border-[#3d6b3d]/20",
  intermediate:
    "bg-[#f3e8e5] text-[#9e4a3a] border-[#9e4a3a]/20",
  advanced:
    "bg-[#1a1a1a]/10 text-[#1a1a1a] border-[#1a1a1a]/20",
};

const LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function formatLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function TaxonomyBadges({
  experienceLevel,
  topics,
  practiceContext,
  linked = true,
}: TaxonomyBadgesProps) {
  const hasTopics = topics && topics.length > 0;
  const hasContext = practiceContext && practiceContext.length > 0;

  if (!experienceLevel && !hasTopics && !hasContext) return null;

  return (
    <div className="space-y-3">
      {experienceLevel && (
        <div>
          {linked ? (
            <Link href={`/discover?experience_level=${experienceLevel}`}>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-serif text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${LEVEL_STYLES[experienceLevel]}`}
              >
                {LEVEL_LABELS[experienceLevel]}
              </span>
            </Link>
          ) : (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-serif text-xs font-medium ${LEVEL_STYLES[experienceLevel]}`}
            >
              {LEVEL_LABELS[experienceLevel]}
            </span>
          )}
        </div>
      )}
      {(hasTopics || hasContext) && (
        <div className="flex flex-wrap gap-1.5">
          {topics?.map((topic) =>
            linked ? (
              <Link key={topic} href={`/discover?topics=${topic}`}>
                <Badge
                  variant="outline"
                  className="font-serif text-[11px] cursor-pointer hover:bg-accent transition-colors"
                >
                  {formatLabel(topic)}
                </Badge>
              </Link>
            ) : (
              <Badge
                key={topic}
                variant="outline"
                className="font-serif text-[11px]"
              >
                {formatLabel(topic)}
              </Badge>
            )
          )}
          {practiceContext?.map((ctx) =>
            linked ? (
              <Link key={ctx} href={`/discover?practice_context=${ctx}`}>
                <Badge
                  variant="outline"
                  className="font-serif text-[11px] border-dashed cursor-pointer hover:bg-accent transition-colors"
                >
                  {formatLabel(ctx)}
                </Badge>
              </Link>
            ) : (
              <Badge
                key={ctx}
                variant="outline"
                className="font-serif text-[11px] border-dashed"
              >
                {formatLabel(ctx)}
              </Badge>
            )
          )}
        </div>
      )}
    </div>
  );
}
