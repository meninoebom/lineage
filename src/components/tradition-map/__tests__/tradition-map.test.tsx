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

// Mock window.matchMedia (not available in jsdom)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

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
    family: "Vedic-Yogic",
    summary: "Non-dual Vedic-Yogic philosophy",
    origin_century: 8,
    connections: [],
  },
];

describe("TraditionMap", () => {
  it("renders all tradition nodes", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    // Traditions appear in both desktop SVG map and mobile accordion list
    expect(screen.getAllByText("Zen").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Theravada").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Advaita Vedanta").length).toBeGreaterThanOrEqual(1);
  });

  it("renders MapLegend inside the map container", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    const legendGroup = screen.getByRole("group", {
      name: /map legend and filter/i,
    });
    expect(legendGroup).toBeInTheDocument();
    // Legend should contain family buttons
    const buttons = legendGroup.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("renders connection legend inside MapLegend", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    expect(screen.getAllByText("Influenced by").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Branch of").length).toBeGreaterThanOrEqual(1);
  });

  it("filters traditions when family toggle is clicked", () => {
    const { container } = render(<TraditionMap traditions={sampleTraditions} />);
    // Find the desktop panel's Vedic-Yogic button
    const desktopPanel = container.querySelector(".hidden.md\\:block");
    const vedicBtn = desktopPanel!.querySelector("button[aria-label='Vedic-Yogic']")!;
    expect(vedicBtn).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(vedicBtn);
    expect(vedicBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("has accessible SVG label", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    const map = screen.getByRole("img", {
      name: /interactive map of contemplative traditions/i,
    });
    expect(map).toBeInTheDocument();
  });

  it("renders SVG map on all screen sizes", () => {
    const { container } = render(<TraditionMap traditions={sampleTraditions} />);
    const svgMap = container.querySelector("[role='img'][aria-label='Interactive map of contemplative traditions']");
    expect(svgMap).toBeInTheDocument();
  });

  it("renders nodes as keyboard-accessible links", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links[0]).toHaveAttribute("tabindex", "0");
  });
});
