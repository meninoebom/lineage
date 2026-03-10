export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-8 flex items-center justify-between">
        <p className="font-sans text-sm text-muted-foreground">
          Lineage — A map of contemplative traditions
        </p>
        <p className="font-sans text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
