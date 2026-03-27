"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FAMILY_COLORS } from "@/lib/tradition-graph";
import type { TraditionFamily } from "@/lib/types";

interface MapLegendProps {
  families: TraditionFamily[];
  activeFamilies: Set<TraditionFamily>;
  onToggle: (family: TraditionFamily) => void;
}

/**
 * Floating map legend that doubles as a family filter.
 *
 * Desktop (≥768px): always expanded with colored dots, family names, and connection legend.
 * Mobile (<768px): collapsed by default showing only dots; expands on tap.
 */
export function MapLegend({
  families,
  activeFamilies,
  onToggle,
}: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Click-outside handler to collapse on mobile
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFamilyClick = useCallback(
    (family: TraditionFamily) => {
      onToggle(family);
      // In collapsed mobile mode, also expand
      setIsExpanded(true);
    },
    [onToggle]
  );

  return (
    <div
      ref={panelRef}
      role="group"
      aria-label="Map legend and filter"
      className="transition-all duration-200"
    >
      {/* Desktop: always expanded */}
      <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-3">
        <div className="space-y-0.5">
          {families.map((family) => {
            const active = activeFamilies.has(family);
            return (
              <button
                key={family}
                onClick={() => handleFamilyClick(family)}
                className={`flex items-center gap-2 cursor-pointer w-full min-h-[32px] transition-opacity duration-200 ${
                  active ? "opacity-100 hover:opacity-70" : "opacity-40 hover:opacity-70"
                }`}
                aria-pressed={active}
                aria-label={family}
              >
                <span
                  className="inline-block w-[10px] h-[10px] rounded-full shrink-0"
                  style={{ backgroundColor: FAMILY_COLORS[family].fill }}
                />
                <span
                  className="font-sans text-xs"
                  style={{ color: active ? "#555" : "#bbb" }}
                >
                  {family}
                </span>
              </button>
            );
          })}
        </div>
        <ConnectionLegend />
      </div>

      {/* Mobile: collapsed/expanded */}
      <div className="md:hidden bg-white/80 backdrop-blur-sm rounded-lg p-2">
        {isExpanded ? (
          <>
            <div className="space-y-0.5">
              {families.map((family) => {
                const active = activeFamilies.has(family);
                return (
                  <button
                    key={family}
                    onClick={() => handleFamilyClick(family)}
                    className={`flex items-center gap-2 cursor-pointer w-full min-h-[44px] transition-opacity duration-200 ${
                      active ? "opacity-100 hover:opacity-70" : "opacity-40 hover:opacity-70"
                    }`}
                    aria-pressed={active}
                    aria-label={family}
                  >
                    <span
                      className="inline-block w-[12px] h-[12px] rounded-full shrink-0"
                      style={{ backgroundColor: FAMILY_COLORS[family].fill }}
                    />
                    <span
                      className="font-sans text-xs"
                      style={{ color: active ? "#555" : "#bbb" }}
                    >
                      {family}
                    </span>
                  </button>
                );
              })}
            </div>
            <ConnectionLegend />
          </>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex flex-col items-center gap-1.5"
            aria-label="Expand map legend"
          >
            {families.map((family) => {
              const active = activeFamilies.has(family);
              return (
                <span
                  key={family}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFamilyClick(family);
                  }}
                  className={`inline-block w-[12px] h-[12px] rounded-full cursor-pointer transition-opacity duration-200 ${
                    active ? "opacity-100" : "opacity-30"
                  }`}
                  style={{ backgroundColor: FAMILY_COLORS[family].fill }}
                  role="button"
                  aria-label={`Toggle ${family}`}
                  aria-pressed={active}
                />
              );
            })}
            <span className="text-[10px] text-[#999] leading-none">···</span>
          </button>
        )}
      </div>
    </div>
  );
}

function ConnectionLegend() {
  return (
    <div className="border-t border-[#e8e4df] mt-2 pt-2 space-y-1">
      <span className="flex items-center gap-2">
        <svg width="24" height="2" aria-hidden="true">
          <line x1="0" y1="1" x2="24" y2="1" stroke="#b48c64" strokeWidth="2" />
        </svg>
        <span className="font-sans text-[10px] text-[#888]">Branch of</span>
      </span>
      <span className="flex items-center gap-2">
        <svg width="24" height="2" aria-hidden="true">
          <line
            x1="0"
            y1="1"
            x2="24"
            y2="1"
            stroke="#8c8ca0"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        </svg>
        <span className="font-sans text-[10px] text-[#888]">Influenced by</span>
      </span>
    </div>
  );
}
