/**
 * Affiliate link utilities for Bookshop.org.
 *
 * The affiliate ID is a placeholder until the real Bookshop.org
 * affiliate account is set up.
 */

export const BOOKSHOP_AFFILIATE_ID = "LINEAGE";

/**
 * Appends the affiliate query parameter to a Bookshop.org URL.
 * Non-Bookshop URLs are returned unchanged.
 */
export function bookshopAffiliateUrl(baseUrl: string): string {
  if (!baseUrl.includes("bookshop.org")) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  url.searchParams.set("aid", BOOKSHOP_AFFILIATE_ID);
  return url.toString();
}
