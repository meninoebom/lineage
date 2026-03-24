# Lineage

Interactive map of contemplative traditions + teacher/center directory.

## Tech Stack

- Next.js with static export (`output: 'export'`)
- TypeScript
- Tailwind CSS + shadcn/ui
- MDX for tradition editorial content
- Data: JSON files in `data/` (no database for V1)
- Deploy: Render (static site)

## Design Direction

Editorial, magazine-like aesthetic inspired by Lapham's Quarterly — warm cream backgrounds, serif typography (Georgia), terracotta accents. Modern twist: clean component design via shadcn/ui, subtle animations, generous whitespace. Simple but elevated.

Use the `frontend-design` and `ui-ux-pro-max` skills when building UI components. Reference the Lapham's editorial palette in `~/.claude/projects/-Users-brandon-dev/memory/design-palette-laphams.md`.

## Auto-merge

PRs in this repo use auto-merge. After creating a PR, run `gh pr merge --auto --squash`.

## Development Workflow

Use judgment to plan appropriately for the task:
- Simple changes: just implement directly.
- Larger changes: think through the approach before coding.
- Always create a feature branch, commit with descriptive messages, and create a PR.

## Code Quality

- Write tests first when possible. Prefer test-driven development.
- Run quality checks before committing: tests, linting, type checking.
- Keep commits focused — one logical change per commit.

## Learning Context

Brandon is using this project partly to prepare for a React front-end interview (March 2026). When building components, emphasize:
- Component architecture and composability
- Design system patterns that scale across a team
- TypeScript best practices
- State management patterns
- Performance optimization (memoization, code splitting)

Explain these patterns as you build them — this is a learning project as much as a product.

## Project Structure

```
data/
  teachers/       # JSON files, one per teacher
  centers/        # JSON files, one per center
  traditions/     # MDX files, one per tradition
src/
  components/     # Reusable UI components
  lib/            # Data loading, tradition graph, geo search
  app/            # Next.js app router pages
```
