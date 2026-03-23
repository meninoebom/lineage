import Link from "next/link";

const footerLinks = [
  { label: "Archive", href: "/library" },
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Contact", href: "#" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-surface-container-low mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col items-center gap-4 lg:flex-row lg:justify-between lg:items-center">
        <span className="font-serif italic text-lg text-foreground">
          Lineage.guide
        </span>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="uppercase tracking-wider text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="uppercase tracking-wider text-xs text-muted-foreground text-center lg:text-right">
          &copy; 2024 Lineage.guide. Preserving the light of history.
        </p>
      </div>
    </footer>
  );
}
