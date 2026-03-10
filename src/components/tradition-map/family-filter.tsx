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
    <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Filter by tradition family">
      {families.map((family) => {
        const active = activeFamilies.has(family);
        const colors = FAMILY_COLORS[family];
        return (
          <button
            key={family}
            onClick={() => onToggle(family)}
            className={`
              inline-flex items-center gap-2 px-3 py-1.5
              font-sans text-xs tracking-wide uppercase
              border rounded-sm transition-all duration-200
              ${
                active
                  ? "border-current opacity-100"
                  : "border-transparent opacity-40 hover:opacity-70"
              }
            `}
            style={{
              color: active ? colors.text : "#8a8279",
              backgroundColor: active ? colors.bg : "transparent",
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
