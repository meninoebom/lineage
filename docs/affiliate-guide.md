# Bookshop.org Affiliate Guide for Lineage

## Account Details

- **Affiliate ID:** 122188
- **Shop name:** lineage
- **Storefront URL:** https://bookshop.org/shop/lineage
- **Contact:** ellington.mckenzie@bookshop.org (affiliate support)

## How It Works

When someone clicks a link to bookshop.org from lineage.guide:
1. A **48-hour cookie** is set on their browser tied to our affiliate account
2. Any purchase they make within 48 hours earns **10% commission** for us
3. Another 10% goes to independent bookstores (Bookshop.org's model)
4. Sales appear in the dashboard under **Pending** for ~14 days (return window)
5. After 14 days, funds move to **Payable**
6. Minimum payout: **$20** via **Stripe Connect**

## Link Formats

| Type | Format | Use Case |
|------|--------|----------|
| **Direct book** (best) | `bookshop.org/a/122188/{ISBN13}` | When we have the ISBN — goes straight to product page |
| **Shop search** (current) | `bookshop.org/shop/lineage?keywords={query}` | Fallback when no ISBN — lands on our storefront with search |
| **Curated list** | `bookshop.org/lists/{list-slug}` | For themed collections (maps to our Library paths) |
| **Gift card** | `bookshop.org/a/122188/gift_cards` | If we ever add a "support" page |

**Current state:** All 70 book resources use the shop search format. This works and tracks correctly, but direct ISBN links are better because they reduce friction (user lands on the exact book page).

## Action Items (Priority Order)

### 1. Connect Stripe (NOW — blocks all revenue)
Go to bookshop.org/affiliates/dashboard → click "Connect to Stripe." Without this, commissions accrue but can't be paid out.

### 2. Upgrade to Direct ISBN Links (HIGH — improves conversion)
Add `isbn13` field to each book resource in `data/resources/`, then generate links as:
```
https://bookshop.org/a/122188/{isbn13}
```
This takes users directly to the product page instead of a search results page. Less friction = more purchases.

### 3. Create Curated Lists on Bookshop.org (MEDIUM — SEO + discovery)
Mirror the Library paths as Bookshop.org curated lists:
- "Exploring Zen" → Bookshop list with same 4 books
- "The Vipassana Path" → Bookshop list with same 5 books
- etc.

Benefits:
- Lists appear on our Bookshop.org storefront (another discovery surface)
- Lists can have custom header/footer copy and per-book annotations
- Lists can be embedded as scrollable widgets on lineage.guide

### 4. Embed Widgets on Library Pages (LOW — nice to have)
Bookshop.org offers 5 widget types. Most relevant:
- **Book Widget** — cover + price + buy button (per resource)
- **List Widget** — scrollable carousel for a whole path
- **Search Widget** — search box credited to our affiliate account

### 5. Add More Books (ONGOING)
Every book resource on the site is a potential commission. Currently 70 book resources. Adding ISBN-13s and expanding the library directly increases revenue surface area.

## Tracking & Reports

1. Go to bookshop.org/affiliates/dashboard
2. **Payable** tab — see current earnings ready for payout
3. **Sales Reports** tab → Create Report → filter by date range
4. Reports are emailed to your account email

## Things NOT to Do

- **Don't change the shop URL** (`lineage`) — it breaks all existing affiliate links
- **Don't change curated list titles** — it changes the slug and breaks links
- Ebook ISBNs are different from print ISBNs — use the right one for each format

## Revenue Math

At 10% commission on an average book price of ~$16:
- **$1.60 per book sold**
- 10 books/month = $16/month
- 50 books/month = $80/month
- 100 books/month = $160/month

The key driver is **traffic × click-through rate × conversion rate**. SEO indexing (Google Search Console submission) is the biggest unblocked lever for traffic.
