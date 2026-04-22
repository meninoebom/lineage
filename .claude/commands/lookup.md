Look up whether a person, tradition, practice, concept, or text exists on lineage.guide.

Read `data/manifest.json` and search across all entity types for "$ARGUMENTS".

Search these fields:
- **traditions**: name, alternate_names, key_figures, key_texts, related_practices
- **teachers**: name
- **centers**: name
- **resources**: title, author
- **paths**: title

Use case-insensitive substring matching. Report:
1. **Exact matches** — entities whose name/title matches the query
2. **Mentioned in** — entities that reference the query in related fields (key_figures, key_texts, etc.)
3. **Not found** — if nothing matches, say so and suggest whether to add it

For each match, show: entity type, slug, name, and the file path (`data/{type}/{slug}.json` or `.mdx`).

If manifest.json is missing or stale, run `npx tsx scripts/generate-manifest.ts` first.
