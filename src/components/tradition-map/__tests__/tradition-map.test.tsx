import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TraditionMap } from "../tradition-map";
import type { TraditionInput } from "@/lib/tradition-graph";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the generated layout JSON
vi.mock("@/generated/map-layout.json", () => ({
  default: {
    zen: { x: 300, y: 750 },
    theravada: { x: 300, y: 0 },
    "advaita-vedanta": { x: 320, y: 900 },
  },
}));

// Mock d3-zoom and d3-selection to avoid DOM measurement issues in tests
vi.mock("d3-zoom", () => ({
  zoom: () => {
    const behavior = () => {};
    behavior.scaleExtent = () => behavior;
    behavior.on = () => behavior;
    behavior.transform = {};
    return behavior;
  },
  zoomIdentity: { x: 0, y: 0, k: 1 },
}));

vi.mock("d3-selection", () => ({
  select: () => ({
    call: () => {},
    on: () => {},
  }),
}));

const sampleTraditions: TraditionInput[] = [
  {
    name: "Zen",
    slug: "zen",
    family: "Buddhist",
    summary: "A school of Mahayana Buddhism",
    origin_century: 6,
    connections: [
      {
        tradition_slug: "theravada",
        connection_type: "related_to",
        description: "Both emphasize meditation",
      },
    ],
  },
  {
    name: "Theravada",
    slug: "theravada",
    family: "Buddhist",
    summary: "The Way of the Elders",
    origin_century: -3,
    connections: [
      {
        tradition_slug: "zen",
        connection_type: "related_to",
        description: "Both emphasize meditation",
      },
    ],
  },
  {
    name: "Advaita Vedanta",
    slug: "advaita-vedanta",
    family: "Hindu",
    summary: "Non-dual Hindu philosophy",
    origin_century: 8,
    connections: [],
  },
];

describe("TraditionMap", () => {
  it("renders all tradition nodes", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    // Single SVG now (no dual desktop/mobile)
    expect(screen.getByText("Zen")).toBeInTheDocument();
    expect(screen.getByText("Theravada")).toBeInTheDocument();
    expect(screen.getByText("Advaita Vedanta")).toBeInTheDocument();
  });

  it("renders family filter buttons", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    const filterGroup = screen.getByRole("group", {
      name: /filter by tradition family/i,
    });
    const buttons = filterGroup.querySelectorAll("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("Buddhist");
    expect(buttons[1]).toHaveTextContent("Hindu");
  });

  it("renders connection legend", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    expect(screen.getByText("Related")).toBeInTheDocument();
    expect(screen.getByText("Influenced by")).toBeInTheDocument();
    expect(screen.getByText("Branch of")).toBeInTheDocument();
  });

  it("filters traditions when family toggle is clicked", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    const filterGroup = screen.getByRole("group", {
      name: /filter by tradition family/i,
    });
    const hinduButton = filterGroup.querySelector("button:last-child")!;
    expect(hinduButton).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(hinduButton);
    expect(hinduButton).toHaveAttribute("aria-pressed", "false");
  });

  it("has accessible SVG label", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    const map = screen.getByRole("img", {
      name: /interactive map of contemplative traditions/i,
    });
    expect(map).toBeInTheDocument();
  });

  it("renders nodes as keyboard-accessible links", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links[0]).toHaveAttribute("tabindex", "0");
  });
});
