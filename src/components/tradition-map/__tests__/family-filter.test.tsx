import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FamilyFilter } from "../family-filter";
import type { TraditionFamily } from "@/lib/types";

const ALL_FAMILIES: TraditionFamily[] = [
  "Buddhist",
  "Vedic-Yogic",
  "Taoist",
  "Christian Contemplative",
  "Islamic Contemplative",
  "Modern Secular",
  "Other",
];

describe("FamilyFilter", () => {
  it("renders all 7 families as buttons", () => {
    render(
      <FamilyFilter
        families={ALL_FAMILIES}
        activeFamilies={new Set(ALL_FAMILIES)}
        onToggle={() => {}}
      />
    );
    for (const family of ALL_FAMILIES) {
      expect(screen.getByRole("button", { name: new RegExp(family) })).toBeInTheDocument();
    }
  });

  it("marks active families with aria-pressed=true", () => {
    const active = new Set<TraditionFamily>(["Buddhist", "Vedic-Yogic"]);
    render(
      <FamilyFilter families={ALL_FAMILIES} activeFamilies={active} onToggle={() => {}} />
    );
    expect(screen.getByRole("button", { name: /Buddhist/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Taoist/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onToggle when a family button is clicked", () => {
    const onToggle = vi.fn();
    render(
      <FamilyFilter
        families={ALL_FAMILIES}
        activeFamilies={new Set(ALL_FAMILIES)}
        onToggle={onToggle}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Taoist/ }));
    expect(onToggle).toHaveBeenCalledWith("Taoist");
  });

  it("renders a color dot for each family", () => {
    const { container } = render(
      <FamilyFilter
        families={ALL_FAMILIES}
        activeFamilies={new Set(ALL_FAMILIES)}
        onToggle={() => {}}
      />
    );
    // Each button should have a colored dot (span with rounded-full)
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots).toHaveLength(7);
  });

  it("has a group role with accessible label", () => {
    render(
      <FamilyFilter
        families={ALL_FAMILIES}
        activeFamilies={new Set(ALL_FAMILIES)}
        onToggle={() => {}}
      />
    );
    expect(screen.getByRole("group", { name: /filter by tradition family/i })).toBeInTheDocument();
  });
});
