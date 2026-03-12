"use client";

import { FAMILY_COLORS } from "@/lib/tradition-graph";
import type { TraditionFamily } from "@/lib/types";

interface FamilyFilterProps {
  families: TraditionFamily[];
  activeFamilies: Set<TraditionFamily>;
  onToggle: (family: TraditionFamily) => void;
}

/**
 * Family filter toggles for the tradition map.
 *
 * Styled as minimal, editorial pill buttons — not a toolbar.
 * Uses family colors as subtle indicators.
 */
export function FamilyFilter({
  families,
  activeFamilies,
  onToggle,
}: FamilyFilterProps) {
  return (
    <div
      className="flex gap-2 justify-center overflow-x-auto pb-2 sm:flex-wrap sm:overflow-x-visible sm:pb-0 scrollbar-thin"
      role="group"
      aria-label="Filter by tradition family"
    >
      {families.map((family) => {
        const active = activeFamilies.has(family);
        const colors = FAMILY_COLORS[family];
        return (
          <button
            key={family}
            onClick={() => onToggle(family)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1 shrink-0
              font-sans text-sm whitespace-nowrap
              border rounded-full transition-all duration-200
              ${
                active
                  ? "border-[#e8e4df] bg-white opacity-100"
                  : "border-transparent opacity-40 hover:opacity-70"
              }
            `}
            style={{
              color: active ? "#555" : "#8a8279",
            }}
            aria-pressed={active}
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.fill }}
            />
            {family}
          </button>
        );
      })}
    </div>
  );
}
