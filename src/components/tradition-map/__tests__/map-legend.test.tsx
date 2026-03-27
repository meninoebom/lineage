import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MapLegend } from "../map-legend";
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

describe("MapLegend", () => {
  it("renders a dot for each family", () => {
    const { container } = render(
      <MapLegend
        families={ALL_FAMILIES}
        activeFamilies={new Set(ALL_FAMILIES)}
        onToggle={() => {}}
      />
    );
    // Each family has dots in both desktop and mobile views
    const dots = container.querySelectorAll("span.rounded-full");
    // Desktop (7) + Mobile collapsed (7) = 14
    expect(dots.length).toBeGreaterThanOrEqual(7);
  });

  it("active families render at full opacity, inactive at reduced", () => {
    const active = new Set<TraditionFamily>(["Buddhist"]);
    const { container } = render(
      <MapLegend families={ALL_FAMILIES} activeFamilies={active} onToggle={() => {}} />
    );
    // Check desktop buttons
    const desktopPanel = container.querySelector(".hidden.md\\:block");
    const buttons = desktopPanel!.querySelectorAll("button");
    const buddhistBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes("Buddhist")
    )!;
    const taoistBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes("Taoist")
    )!;
    expect(buddhistBtn.className).toContain("opacity-100");
    expect(taoistBtn.className).toContain("opacity-40");
  });

  it("clicking a family row calls onToggle with correct family", () => {
    const onToggle = vi.fn();
    const { container } = render(
      <MapLegend
        families={ALL_FAMILIES}
        activeFamilies={new Set(ALL_FAMILIES)}
        onToggle={onToggle}
      />
    );
    // Click the desktop Buddhist button
    const desktopPanel = container.querySelector(".hidden.md\\:block");
    const buttons = desktopPanel!.querySelectorAll("button");
    const buddhistBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes("Buddhist")
    )!;
    fireEvent.click(buddhistBtn);
    expect(onToggle).toHaveBeenCalledWith("Buddhist");
  });

  it("connection legend text is present", () => {
    render(
      <MapLegend
        families={ALL_FAMILIES}
        activeFamilies={new Set(ALL_FAMILIES)}
        onToggle={() => {}}
      />
    );
    expect(screen.getAllByText("Branch of").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Influenced by").length).toBeGreaterThanOrEqual(1);
  });

  it("has accessible group role and label", () => {
    render(
      <MapLegend
        families={ALL_FAMILIES}
        activeFamilies={new Set(ALL_FAMILIES)}
        onToggle={() => {}}
      />
    );
    expect(
      screen.getByRole("group", { name: /map legend and filter/i })
    ).toBeInTheDocument();
  });

  it("marks active families with aria-pressed=true", () => {
    const active = new Set<TraditionFamily>(["Buddhist", "Taoist"]);
    const { container } = render(
      <MapLegend families={ALL_FAMILIES} activeFamilies={active} onToggle={() => {}} />
    );
    const desktopPanel = container.querySelector(".hidden.md\\:block");
    const buddhistBtn = desktopPanel!.querySelector("button[aria-label='Buddhist']")!;
    const vedicBtn = desktopPanel!.querySelector("button[aria-label='Vedic-Yogic']")!;
    expect(buddhistBtn).toHaveAttribute("aria-pressed", "true");
    expect(vedicBtn).toHaveAttribute("aria-pressed", "false");
  });
});
