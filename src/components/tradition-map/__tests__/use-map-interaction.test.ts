import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMapInteraction } from "../use-map-interaction";
import type { TraditionGraph } from "@/lib/tradition-graph";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const testGraph: TraditionGraph = {
  nodes: [
    { slug: "zen", name: "Zen", family: "Buddhist", summary: "Zen Buddhism", originCentury: 6 },
    { slug: "theravada", name: "Theravada", family: "Buddhist", summary: "Way of the Elders", originCentury: -3 },
    { slug: "advaita", name: "Advaita", family: "Hindu", summary: "Non-dual", originCentury: 8 },
  ],
  edges: [
    { source: "zen", target: "theravada", connectionType: "related_to", description: "Both meditate", strength: 1 },
  ],
};

describe("useMapInteraction", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("starts with no hovered or selected slug", () => {
    const { result } = renderHook(() => useMapInteraction(testGraph));
    expect(result.current.hoveredSlug).toBeNull();
    expect(result.current.selectedSlug).toBeNull();
    expect(result.current.activeSlug).toBeNull();
  });

  it("sets hovered slug on hover", () => {
    const { result } = renderHook(() => useMapInteraction(testGraph));
    act(() => result.current.handleNodeHover("zen"));
    expect(result.current.hoveredSlug).toBe("zen");
    expect(result.current.activeSlug).toBe("zen");
  });

  it("highlights the hovered node", () => {
    const { result } = renderHook(() => useMapInteraction(testGraph));
    act(() => result.current.handleNodeHover("zen"));
    expect(result.current.isNodeHighlighted("zen")).toBe(true);
    expect(result.current.isNodeHighlighted("advaita")).toBe(false);
  });

  it("marks connected nodes as connected, unconnected as dimmed", () => {
    const { result } = renderHook(() => useMapInteraction(testGraph));
    act(() => result.current.handleNodeHover("zen"));

    // theravada is connected to zen
    expect(result.current.isNodeConnected("theravada")).toBe(true);
    expect(result.current.isNodeDimmed("theravada")).toBe(false);

    // advaita is not connected
    expect(result.current.isNodeConnected("advaita")).toBe(false);
    expect(result.current.isNodeDimmed("advaita")).toBe(true);
  });

  it("highlights edges connected to hovered node", () => {
    const { result } = renderHook(() => useMapInteraction(testGraph));
    act(() => result.current.handleNodeHover("zen"));

    expect(result.current.isEdgeHighlighted("zen", "theravada")).toBe(true);
    expect(result.current.isEdgeDimmed("zen", "theravada")).toBe(false);
  });

  it("navigates on click", () => {
    const { result } = renderHook(() => useMapInteraction(testGraph));
    act(() => result.current.handleNodeClick("zen"));
    expect(mockPush).toHaveBeenCalledWith("/traditions/zen");
  });

  it("clears dimming when hover ends", () => {
    const { result } = renderHook(() => useMapInteraction(testGraph));
    act(() => result.current.handleNodeHover("zen"));
    expect(result.current.isNodeDimmed("advaita")).toBe(true);

    act(() => result.current.handleNodeHover(null));
    expect(result.current.isNodeDimmed("advaita")).toBe(false);
  });
});
