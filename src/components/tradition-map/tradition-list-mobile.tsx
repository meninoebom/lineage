"use client";

import { useMemo, useCallback } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { FAMILY_COLORS, type TraditionGraph } from "@/lib/tradition-graph";
import type { TraditionFamily } from "@/lib/types";
import { TraditionConnectionBadge } from "./tradition-connection-badge";

interface TraditionListMobileProps {
  graph: TraditionGraph;
  activeFamilies: Set<TraditionFamily>;
  onNodeClick: (slug: string) => void;
}

/**
 * Family-grouped accordion list for mobile view of the tradition map.
 *
 * Groups traditions by family, shows connection badges, and supports
 * scroll-to-target when a badge is tapped. Replaces the SVG map on
 * small screens for better usability.
 *
 * Architecture note: This component consumes the same TraditionGraph
 * as the desktop SVG map, demonstrating how a shared data model can
 * drive multiple view representations — a common pattern in design
 * systems where the same data feeds different device-optimized UIs.
 */
export function TraditionListMobile({
  graph,
  activeFamilies,
  onNodeClick,
}: TraditionListMobileProps) {
  // Group nodes by family, filtered to active families
  const familyGroups = useMemo(() => {
    const groups = new Map<TraditionFamily, typeof graph.nodes>();
    for (const node of graph.nodes) {
      if (!activeFamilies.has(node.family)) continue;
      const existing = groups.get(node.family) ?? [];
      existing.push(node);
      groups.set(node.family, existing);
    }
    return groups;
  }, [graph, activeFamilies]);

  // Build a quick lookup: slug → connections from that node
  const connectionsBySlug = useMemo(() => {
    const map = new Map<string, { connectionType: string; targetSlug: string; targetName: string }[]>();
    const nameMap = new Map(graph.nodes.map((n) => [n.slug, n.name]));

    for (const edge of graph.edges) {
      // Add connection in both directions
      const addConnection = (from: string, to: string) => {
        const existing = map.get(from) ?? [];
        const targetName = nameMap.get(to);
        if (targetName) {
          existing.push({
            connectionType: edge.connectionType,
            targetSlug: to,
            targetName,
          });
          map.set(from, existing);
        }
      };
      addConnection(edge.source, edge.target);
      addConnection(edge.target, edge.source);
    }
    return map;
  }, [graph]);

  const handleBadgeClick = useCallback(
    (slug: string) => {
      const el = document.getElementById(`tradition-${slug}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("tradition-highlight");
        setTimeout(() => el.classList.remove("tradition-highlight"), 1500);
      }
    },
    []
  );

  if (familyGroups.size === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#999] font-sans">
          Select a family above to explore traditions
        </p>
      </div>
    );
  }

  const familyEntries = Array.from(familyGroups.entries());

  return (
    <div>
      {/* Highlight animation for scroll-to-target */}
      <style>{`
        @keyframes tradition-flash {
          0% { background-color: rgba(180, 140, 100, 0.15); }
          100% { background-color: transparent; }
        }
        .tradition-highlight {
          animation: tradition-flash 1.5s ease-out;
        }
      `}</style>

      <Accordion defaultValue={familyEntries.map(([f]) => f)}>
        {familyEntries.map(([family, nodes]) => {
          const colors = FAMILY_COLORS[family];
          return (
            <AccordionItem key={family} value={family}>
              <AccordionTrigger className="px-2">
                <span className="flex items-center gap-2 font-serif text-base">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colors.fill }}
                  />
                  {family}
                  <span className="text-sm font-sans text-[#999] font-normal">
                    ({nodes.length})
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 px-2">
                  {nodes.map((node) => {
                    const connections = connectionsBySlug.get(node.slug) ?? [];
                    return (
                      <div
                        key={node.slug}
                        id={`tradition-${node.slug}`}
                        className="rounded-lg border border-[#e8e4df] bg-white p-3 transition-colors"
                      >
                        <button
                          onClick={() => onNodeClick(node.slug)}
                          className="text-left font-serif text-[15px] font-medium hover:text-[#9e4a3a] transition-colors cursor-pointer"
                          style={{ color: "#1a1a1a" }}
                        >
                          {node.name}
                        </button>
                        <p className="text-xs text-[#777] mt-1 leading-relaxed">
                          {node.summary}
                        </p>
                        {connections.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {connections.map((conn) => (
                              <TraditionConnectionBadge
                                key={conn.targetSlug}
                                connectionType={conn.connectionType as "branch_of" | "influenced_by" | "related_to"}
                                targetName={conn.targetName}
                                targetSlug={conn.targetSlug}
                                onClick={handleBadgeClick}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
