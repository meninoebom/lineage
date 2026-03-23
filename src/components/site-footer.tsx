import Link from "next/link";
import { cn } from "@/lib/utils";

const footerColumns = [
  {
    heading: "Lineage.guide",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { label: "Map", href: "/map" },
      { label: "Library", href: "/library" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    heading: "Directory",
    links: [
      { label: "Teachers", href: "/teachers" },
      { label: "Masters", href: "/masters" },
      { label: "Centers", href: "/centers" },
    ],
  },
  {
    heading: "Connect",
    links: [
      {
        label: "Suggest an Edit",
        href: "https://github.com/meninoebom/lineage/issues",
        external: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/meninoebom/lineage",
        external: true,
      },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-surface-container-low mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h3 className={cn("text-sm font-medium text-foreground", column.heading === "Lineage.guide" ? "font-serif italic" : "font-serif")}>
                {column.heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 pb-6">
          <p className="font-sans text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-serif italic">Lineage.guide</span>. An editorial directory of
            contemplative traditions.
          </p>
        </div>
      </div>
    </footer>
  );
}
