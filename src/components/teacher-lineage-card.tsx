import Image from "next/image";
import Link from "next/link";
import type { Teacher } from "@/lib/types";

interface Props {
  teacher: Teacher;
}

export function TeacherLineageCard({ teacher }: Props) {
  const tradition = teacher.traditions[0] ?? null;
  return (
    <Link
      href={`/teachers/${teacher.slug}`}
      className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors"
    >
      {teacher.photo ? (
        <Image
          src={teacher.photo}
          alt={teacher.name}
          width={48}
          height={48}
          className="rounded-md object-cover w-12 h-12 shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-md bg-muted shrink-0 flex items-center justify-center text-muted-foreground font-serif text-lg">
          {teacher.name[0]}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-serif font-medium text-sm group-hover:text-primary transition-colors truncate">
          {teacher.name}
        </p>
        {tradition && (
          <p className="font-sans text-xs text-muted-foreground capitalize truncate">
            {tradition.replace(/-/g, " ")}
          </p>
        )}
      </div>
    </Link>
  );
}
