import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TeacherMap } from "@/components/teacher-map";
import { getAllTeachers } from "@/lib/data";

export const metadata = {
  title: "Teacher Lineage Map",
  description:
    "An interactive map of teacher-to-teacher transmission across contemplative traditions — from ancient masters to living teachers.",
};

export default function TeacherMapPage() {
  const teachers = getAllTeachers();

  return (
    <PageLayout>
      <Breadcrumbs
        items={[
          { label: "Teachers", href: "/teachers" },
          { label: "Lineage Map" },
        ]}
      />

      <header className="mb-8">
        <h1 className="mb-3">Teacher Lineage Map</h1>
        <p className="text-muted-foreground font-sans max-w-2xl">
          Teacher-to-teacher transmission across traditions. Arrows point from
          student toward teacher. Click any node to see a profile. Pan and zoom
          to explore.
        </p>
      </header>

      <TeacherMap teachers={teachers} />
    </PageLayout>
  );
}
