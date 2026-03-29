interface SuggestEditLinkProps {
  traditionName: string;
}

export function SuggestEditLink({ traditionName: _traditionName }: SuggestEditLinkProps) {
  return (
    <p className="mt-12 text-sm font-sans text-muted-foreground">
      See something wrong?{" "}
      <a
        href="https://formspree.io/f/mbdpjqyb"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-muted-foreground/40 underline-offset-2 hover:decoration-muted-foreground transition-colors"
      >
        Let us know
      </a>
    </p>
  );
}
