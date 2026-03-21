# Tradition Data Schema

This document describes every field in a tradition's MDX frontmatter. Use it as a reference when reviewing, editing, or adding traditions.

Each tradition lives in its own `.mdx` file in `data/traditions/`. The file has two parts: YAML frontmatter (structured data) and Markdown body (editorial prose).

## Frontmatter Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name of the tradition |
| `slug` | string | URL-safe identifier (lowercase, hyphens). Must match filename. |
| `family` | string | Grouping for the map. One of: `Buddhist`, `Vedic-Yogic`, `Taoist`, `Christian Contemplative`, `Islamic Contemplative`, `Modern Secular`, `Other` |
| `origin_century` | number | Century the tradition emerged. Negative for BCE (e.g., `-5` = 5th century BCE) |
| `summary` | string | One-sentence description of the tradition |
| `connections` | array | Relationships to other traditions (see below) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `alternate_names` | string[] | Other names this tradition is known by. Include names in other languages, common abbreviations, or variant transliterations. |
| `geographic_origins` | string[] | Where the tradition emerged. Use broad region names (e.g., "India", "Kashmir", "China"). Use multiple entries when the tradition has genuine multi-region origins. |
| `key_texts` | string[] | Foundational or defining texts. Include the most widely recognized title (English or original language as commonly used). |
| `key_figures` | string[] | Historical founders and defining figures. Not living teachers — those belong in `data/teachers/`. Include approximate dates when helpful (e.g., "Adi Shankara (788–820 CE)"). |
| `related_practices` | string[] | Core contemplative methods associated with this tradition (e.g., "zazen", "self-inquiry", "dhikr"). |

### Connection Object

Each entry in the `connections` array describes a relationship to another tradition:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tradition_slug` | string | yes | Slug of the connected tradition |
| `connection_type` | string | yes | One of: `influenced_by`, `branch_of`, `related_to`, `diverged_from` |
| `strength` | number | yes | 1–3 scale. 1 = loose parallel, 2 = significant relationship, 3 = direct lineage |
| `description` | string | yes | Explanation of the connection — why it exists, not just that it exists |
| `sources` | string[] | no | Slugs of resources in `data/resources/` that support this connection |

### Connection Type Guide

- **`branch_of`** — Direct lineage. This tradition grew out of the other (e.g., Zen is a branch of Chan Buddhism)
- **`influenced_by`** — Significant historical influence, but not direct lineage (e.g., Zen was influenced by Taoism)
- **`related_to`** — Meaningful parallels or shared concerns, but no direct causal link (e.g., Dzogchen and Advaita Vedanta)
- **`diverged_from`** — Intentional departure from the other tradition (e.g., Mahayana diverged from Theravada)

## Markdown Body

The body contains editorial prose about the tradition. Common sections:

- **Origins and History** — How and where the tradition emerged
- **Core Teachings** — Central philosophy and insights
- **Practice** — What practitioners actually do
- **What Practice Looks Like Today** — Modern context (optional)

## Example

```yaml
---
name: Zen
slug: zen
family: Buddhist
origin_century: 6
summary: A school of Mahayana Buddhism emphasizing meditation (zazen) and direct insight into one's true nature.
alternate_names:
  - Chan (Chinese)
  - Seon (Korean)
  - Thien (Vietnamese)
geographic_origins:
  - China
  - Japan
key_texts:
  - Platform Sutra of the Sixth Patriarch
  - The Gateless Gate (Mumonkan)
  - Blue Cliff Record (Hekiganroku)
  - Shobogenzo (Dogen)
key_figures:
  - Bodhidharma (5th–6th c. CE)
  - Huineng (638–713 CE)
  - Dogen (1200–1253)
  - Hakuin (1686–1769)
related_practices:
  - zazen (seated meditation)
  - koan practice
  - kinhin (walking meditation)
  - sesshin (intensive retreat)
connections:
  - tradition_slug: chan-buddhism
    connection_type: branch_of
    strength: 3
    description: Zen is the direct Japanese transmission of Chinese Chan Buddhism.
---
```
