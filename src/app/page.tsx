import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-serif font-semibold tracking-tight">
          Lineage
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          An interactive map of contemplative traditions and a directory of
          teachers and centers.
        </p>
        <Button variant="outline">Explore Traditions</Button>
      </main>
    </div>
  );
}
