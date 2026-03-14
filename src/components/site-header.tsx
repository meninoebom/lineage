"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/map", label: "Map" },
  { href: "/library", label: "Library" },
  { href: "/teachers", label: "Teachers" },
  { href: "/masters", label: "Masters" },
  { href: "/centers", label: "Centers" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight text-foreground hover:text-primary transition-colors"
        >
          Lineage
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "font-sans text-sm tracking-wide transition-colors hover:text-primary",
                pathname?.startsWith(href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
