import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMapZoom } from "../use-map-zoom";

// Mock d3-zoom and d3-selection
let zoomCallback: ((event: { transform: { x: number; y: number; k: number } }) => void) | null = null;

vi.mock("d3-zoom", () => ({
  zoom: () => {
    const behavior = (() => {}) as unknown as Record<string, unknown>;
    behavior.scaleExtent = () => behavior;
    behavior.on = (_event: string, cb: typeof zoomCallback) => {
      zoomCallback = cb;
      return behavior;
    };
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

describe("useMapZoom", () => {
  it("returns initial transform at identity", () => {
    const ref = { current: document.createElementNS("http://www.w3.org/2000/svg", "svg") };
    const { result } = renderHook(() => useMapZoom(ref));

    expect(result.current.transform).toEqual({ x: 0, y: 0, k: 1 });
  });

  it("updates transform when d3-zoom fires", () => {
    const ref = { current: document.createElementNS("http://www.w3.org/2000/svg", "svg") };
    const { result } = renderHook(() => useMapZoom(ref));

    // Simulate d3-zoom event
    if (zoomCallback) {
      act(() => {
        zoomCallback!({ transform: { x: 10, y: 20, k: 2 } });
      });
    }

    expect(result.current.transform).toEqual({ x: 10, y: 20, k: 2 });
  });

  it("provides a resetZoom function", () => {
    const ref = { current: document.createElementNS("http://www.w3.org/2000/svg", "svg") };
    const { result } = renderHook(() => useMapZoom(ref));

    expect(typeof result.current.resetZoom).toBe("function");
  });
});
