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

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => {
  const actual = vi.importActual("framer-motion") as Record<string, unknown>;
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          // Return a simple component that renders the element
          return ({
            children,
            ...props
          }: {
            children?: React.ReactNode;
            [key: string]: unknown;
          }) => {
            // Filter out motion-specific props
            const htmlProps: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(props)) {
              if (
                ![
                  "initial",
                  "animate",
                  "exit",
                  "transition",
                  "whileHover",
                  "whileTap",
                  "variants",
                  "layoutId",
                  "onAnimationComplete",
                ].includes(key)
              ) {
                htmlProps[key] = value;
              }
            }
            const Element = prop as keyof JSX.IntrinsicElements;
            return <Element {...(htmlProps as Record<string, string>)}>{children}</Element>;
          };
        },
      }
    ),
  };
});

const sampleTraditions: TraditionInput[] = [
  {
    name: "Zen",
    slug: "zen",
    family: "Buddhist",
    summary: "A school of Mahayana Buddhism",
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
    connections: [],
  },
];

describe("TraditionMap", () => {
  it("renders all tradition nodes", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    expect(screen.getAllByText("Zen")).toHaveLength(2); // desktop + mobile
    expect(screen.getAllByText("Theravada")).toHaveLength(2);
    expect(screen.getAllByText("Advaita Vedanta")).toHaveLength(2);
  });

  it("renders family filter buttons", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    const filterGroup = screen.getByRole("group", { name: /filter by tradition family/i });
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
    const filterGroup = screen.getByRole("group", { name: /filter by tradition family/i });
    const hinduButton = filterGroup.querySelector("button:last-child")!;
    expect(hinduButton).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(hinduButton);
    expect(hinduButton).toHaveAttribute("aria-pressed", "false");
  });

  it("has accessible SVG labels", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    const maps = screen.getAllByRole("img", {
      name: /interactive map of contemplative traditions/i,
    });
    expect(maps.length).toBeGreaterThanOrEqual(1);
  });

  it("has accessible filter group", () => {
    render(<TraditionMap traditions={sampleTraditions} />);
    expect(
      screen.getByRole("group", { name: /filter by tradition family/i })
    ).toBeInTheDocument();
  });
});
