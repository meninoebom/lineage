import { bookshopAffiliateUrl, BOOKSHOP_AFFILIATE_ID } from "../affiliate";

describe("bookshopAffiliateUrl", () => {
  it("appends affiliate ID to a Bookshop.org URL", () => {
    const url = "https://bookshop.org/p/books/some-book/123456";
    const result = bookshopAffiliateUrl(url);
    expect(result).toBe(`${url}?aid=${BOOKSHOP_AFFILIATE_ID}`);
  });

  it("replaces an existing aid parameter", () => {
    const url = "https://bookshop.org/p/books/some-book/123456?aid=OLD";
    const result = bookshopAffiliateUrl(url);
    expect(result).toBe(
      `https://bookshop.org/p/books/some-book/123456?aid=${BOOKSHOP_AFFILIATE_ID}`
    );
  });

  it("preserves other query parameters", () => {
    const url = "https://bookshop.org/p/books/some-book/123456?ref=homepage";
    const result = bookshopAffiliateUrl(url);
    expect(result).toContain("ref=homepage");
    expect(result).toContain(`aid=${BOOKSHOP_AFFILIATE_ID}`);
  });

  it("returns non-Bookshop URLs unchanged", () => {
    const url = "https://amazon.com/some-book";
    expect(bookshopAffiliateUrl(url)).toBe(url);
  });

  it("returns non-Bookshop URLs unchanged (YouTube)", () => {
    const url = "https://www.youtube.com/watch?v=abc123";
    expect(bookshopAffiliateUrl(url)).toBe(url);
  });
});
