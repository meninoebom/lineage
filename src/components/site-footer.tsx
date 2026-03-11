import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-sans text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Lineage. An editorial directory of contemplative traditions.
        </p>
        <nav className="flex items-center gap-6">
          <Link
            href="/about"
            className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            About
          </Link>
          <a
            href="https://github.com/meninoebom/lineage/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Suggest an Edit
          </a>
        </nav>
      </div>
    </footer>
  );
}
