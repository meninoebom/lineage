interface SuggestEditLinkProps {
  traditionName: string;
}

function buildGitHubIssueUrl(traditionName: string): string {
  const title = `Suggestion for ${traditionName}`;
  const body = `## Tradition
${traditionName}

## What should be changed?


## What is the correct information?


## Source (if available):

`;

  const params = new URLSearchParams({
    title,
    body,
    labels: "community-suggestion",
  });

  // URLSearchParams encodes spaces as +, which is valid for query strings
  return `https://github.com/meninoebom/lineage/issues/new?${params.toString()}`;
}

export function SuggestEditLink({ traditionName }: SuggestEditLinkProps) {
  return (
    <p className="mt-12 text-sm font-sans text-muted-foreground">
      See something wrong?{" "}
      <a
        href={buildGitHubIssueUrl(traditionName)}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-muted-foreground/40 underline-offset-2 hover:decoration-muted-foreground transition-colors"
      >
        Suggest an edit
      </a>
    </p>
  );
}
