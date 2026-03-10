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

const mixedEdgeGraph: TraditionGraph = {
  nodes: [
    { slug: "zen", name: "Zen", family: "Buddhist", summary: "Zen Buddhism", originCentury: 6 },
    { slug: "theravada", name: "Theravada", family: "Buddhist", summary: "Way of the Elders", originCentury: -3 },
    { slug: "advaita", name: "Advaita", family: "Hindu", summary: "Non-dual", originCentury: 8 },
    { slug: "yoga", name: "Yoga", family: "Hindu", summary: "Yoga tradition", originCentury: -5 },
  ],
  edges: [
    { source: "zen", target: "theravada", connectionType: "branch_of", description: "Branch", strength: 2 },
    { source: "zen", target: "advaita", connectionType: "related_to", description: "Both meditate", strength: 1 },
    { source: "advaita", target: "yoga", connectionType: "influenced_by", description: "Yoga influenced", strength: 2 },
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

  describe("edge visibility", () => {
    it("hides related_to edges by default", () => {
      const { result } = renderHook(() => useMapInteraction(mixedEdgeGraph));
      // related_to edge: zen--advaita should be hidden
      expect(result.current.isEdgeHidden("zen", "advaita", "related_to")).toBe(true);
    });

    it("shows branch_of edges by default", () => {
      const { result } = renderHook(() => useMapInteraction(mixedEdgeGraph));
      expect(result.current.isEdgeHidden("zen", "theravada", "branch_of")).toBe(false);
    });

    it("shows influenced_by edges by default", () => {
      const { result } = renderHook(() => useMapInteraction(mixedEdgeGraph));
      expect(result.current.isEdgeHidden("advaita", "yoga", "influenced_by")).toBe(false);
    });

    it("reveals related_to edges when connected node is hovered", () => {
      const { result } = renderHook(() => useMapInteraction(mixedEdgeGraph));
      act(() => result.current.handleNodeHover("zen"));
      expect(result.current.isEdgeHidden("zen", "advaita", "related_to")).toBe(false);
    });

    it("hides related_to edges again when hover ends", () => {
      const { result } = renderHook(() => useMapInteraction(mixedEdgeGraph));
      act(() => result.current.handleNodeHover("zen"));
      act(() => result.current.handleNodeHover(null));
      expect(result.current.isEdgeHidden("zen", "advaita", "related_to")).toBe(true);
    });
  });

  describe("edge hover tooltip", () => {
    it("tracks hovered edge key", () => {
      const { result } = renderHook(() => useMapInteraction(mixedEdgeGraph));
      act(() => result.current.handleEdgeHover("zen", "theravada"));
      expect(result.current.hoveredEdgeKey).toBe("zen--theravada");
    });

    it("clears hovered edge", () => {
      const { result } = renderHook(() => useMapInteraction(mixedEdgeGraph));
      act(() => result.current.handleEdgeHover("zen", "theravada"));
      act(() => result.current.handleEdgeHover(null, null));
      expect(result.current.hoveredEdgeKey).toBeNull();
    });
  });

  describe("touch / tap behavior", () => {
    it("toggles selected slug on tap (select then deselect)", () => {
      const { result } = renderHook(() => useMapInteraction(testGraph));
      act(() => result.current.handleNodeSelect("zen"));
      expect(result.current.selectedSlug).toBe("zen");
      expect(result.current.activeSlug).toBe("zen");

      act(() => result.current.handleNodeSelect("zen"));
      expect(result.current.selectedSlug).toBeNull();
    });

    it("deselects on background tap", () => {
      const { result } = renderHook(() => useMapInteraction(testGraph));
      act(() => result.current.handleNodeSelect("zen"));
      expect(result.current.selectedSlug).toBe("zen");

      act(() => result.current.handleBackgroundTap());
      expect(result.current.selectedSlug).toBeNull();
    });

    it("reveals related_to edges for selected node", () => {
      const { result } = renderHook(() => useMapInteraction(mixedEdgeGraph));
      act(() => result.current.handleNodeSelect("zen"));
      expect(result.current.isEdgeHidden("zen", "advaita", "related_to")).toBe(false);
    });
  });
});
