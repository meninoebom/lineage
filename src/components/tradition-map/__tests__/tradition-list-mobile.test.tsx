import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TraditionListMobile } from "../tradition-list-mobile";
import type { TraditionGraph } from "@/lib/tradition-graph";
import type { TraditionFamily } from "@/lib/types";

const testGraph: TraditionGraph = {
  nodes: [
    { slug: "zen", name: "Zen", family: "Buddhist", summary: "A school of Mahayana Buddhism", originCentury: 6 },
    { slug: "theravada", name: "Theravada", family: "Buddhist", summary: "The Way of the Elders", originCentury: -3 },
    { slug: "advaita-vedanta", name: "Advaita Vedanta", family: "Vedic-Yogic", summary: "Non-dual philosophy", originCentury: 8 },
  ],
  edges: [
    { source: "zen", target: "theravada", connectionType: "related_to", description: "Both emphasize meditation", strength: 1 },
  ],
};

describe("TraditionListMobile", () => {
  it("renders family sections for active families", () => {
    const activeFamilies = new Set<TraditionFamily>(["Buddhist", "Vedic-Yogic"]);
    render(
      <TraditionListMobile graph={testGraph} activeFamilies={activeFamilies} onNodeClick={vi.fn()} />
    );
    expect(screen.getByText(/Buddhist/)).toBeInTheDocument();
    expect(screen.getByText(/Vedic-Yogic/)).toBeInTheDocument();
  });

  it("hides inactive families", () => {
    const activeFamilies = new Set<TraditionFamily>(["Buddhist"]);
    render(
      <TraditionListMobile graph={testGraph} activeFamilies={activeFamilies} onNodeClick={vi.fn()} />
    );
    expect(screen.getByText(/Buddhist/)).toBeInTheDocument();
    expect(screen.queryByText(/Vedic-Yogic/)).not.toBeInTheDocument();
  });

  it("renders tradition names and summaries", () => {
    const activeFamilies = new Set<TraditionFamily>(["Buddhist"]);
    render(
      <TraditionListMobile graph={testGraph} activeFamilies={activeFamilies} onNodeClick={vi.fn()} />
    );
    expect(screen.getAllByText("Zen").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("A school of Mahayana Buddhism")).toBeInTheDocument();
    expect(screen.getAllByText("Theravada").length).toBeGreaterThanOrEqual(1);
  });

  it("renders connection badges", () => {
    const activeFamilies = new Set<TraditionFamily>(["Buddhist"]);
    render(
      <TraditionListMobile graph={testGraph} activeFamilies={activeFamilies} onNodeClick={vi.fn()} />
    );
    // Zen has a related_to connection to Theravada
    expect(screen.getAllByText(/Related to:/).length).toBeGreaterThanOrEqual(1);
  });

  it("calls onNodeClick when tradition name tapped", () => {
    const onNodeClick = vi.fn();
    const activeFamilies = new Set<TraditionFamily>(["Buddhist"]);
    render(
      <TraditionListMobile graph={testGraph} activeFamilies={activeFamilies} onNodeClick={onNodeClick} />
    );
    // Get the tradition name button (not the badge button which has border-style)
    const zenButtons = screen.getAllByText("Zen").filter((el) => el.tagName === "BUTTON");
    // The tradition name button doesn't have inline border-style
    const nameButton = zenButtons.find((el) => !el.style.borderStyle);
    fireEvent.click(nameButton!);
    expect(onNodeClick).toHaveBeenCalledWith("zen");
  });

  it("shows empty state when no families active", () => {
    const activeFamilies = new Set<TraditionFamily>();
    render(
      <TraditionListMobile graph={testGraph} activeFamilies={activeFamilies} onNodeClick={vi.fn()} />
    );
    expect(screen.getByText(/Select a family above to explore traditions/)).toBeInTheDocument();
  });
});
