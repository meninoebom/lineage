/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MapNodePopover } from "../map-node-popover";
import type { GraphNode } from "@/lib/tradition-graph";

const mockNode: GraphNode = {
  slug: "zen",
  name: "Zen Buddhism",
  family: "buddhist",
  summary: "A school of Mahayana Buddhism emphasizing meditation.",
  birth_year: 500,
  death_year: null,
};

const defaultProps = {
  node: mockNode,
  position: { x: 200, y: 300 },
  onClose: vi.fn(),
};

describe("MapNodePopover", () => {
  it("renders the tradition name", () => {
    render(
      <svg>
        <MapNodePopover {...defaultProps} />
      </svg>
    );
    expect(screen.getByText("Zen Buddhism")).toBeTruthy();
  });

  it("renders the summary text", () => {
    render(
      <svg>
        <MapNodePopover {...defaultProps} />
      </svg>
    );
    expect(
      screen.getByText("A school of Mahayana Buddhism emphasizing meditation.")
    ).toBeTruthy();
  });

  it("renders a 'Read more' link to the tradition page", () => {
    render(
      <svg>
        <MapNodePopover {...defaultProps} />
      </svg>
    );
    const link = screen.getByText("Read more →");
    expect(link.getAttribute("href")).toBe("/traditions/zen");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <svg>
        <MapNodePopover {...defaultProps} onClose={onClose} />
      </svg>
    );
    fireEvent.click(screen.getByLabelText("Close popover"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
