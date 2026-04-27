# Resource JSON Schema

Each resource in `data/resources/` is a JSON file with the following fields.

## Required fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Display title of the resource |
| `slug` | string | URL-safe identifier, must match the filename |
| `type` | enum | One of: `book`, `video`, `podcast`, `article`, `website`, `app` |
| `category` | enum | One of: `primary_text`, `academic`, `popular`, `encyclopedia`, `web_resource` |
| `url` | string | External URL (use Bookshop.org affiliate URL for books) |
| `description` | string | 1–3 sentence description |
| `traditions` | string[] | Tradition slugs from `data/traditions/` |
| `teachers` | string[] | Teacher slugs from `data/teachers/` |
| `centers` | string[] | Center slugs from `data/centers/` |

## Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `author` | string \| null | Author name |
| `year` | number \| null | Publication or release year |
| `experience_level` | enum | `beginner`, `intermediate`, or `advanced` |
| `topics` | string[] | Taxonomy topic slugs (see `data/taxonomy.json`) |
| `practice_context` | string[] | Practice context slugs (see `data/taxonomy.json`) |
| `related_resources` | string[] | Slugs of related resources for cross-linking (max 4) |

## `related_resources` field

Slugs of other resources the reader/listener/viewer should explore next. Guidelines:

- **Same author**: always link to other works by the same teacher
- **Same tradition path**: link to the canonical next step in the tradition
- **Thematic**: link to resources covering the same practice or concept differently
- **Max 4**: keep the list curated, not exhaustive
- **Reciprocal**: if A links to B, B should link to A

Example:
```json
{
  "related_resources": [
    "be-as-you-are",
    "adyashanti-true-meditation",
    "de-mello-awareness"
  ]
}
```
