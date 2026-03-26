"use client";

import type { ConnectionType } from "@/lib/types";

const TYPE_LABELS: Record<ConnectionType, string> = {
  branch_of: "Branch of:",
  influenced_by: "Influenced by:",
  related_to: "Related to:",
  diverged_from: "Diverged from:",
};

const BORDER_STYLES: Record<ConnectionType, string> = {
  branch_of: "solid",
  influenced_by: "dashed",
  related_to: "dotted",
  diverged_from: "solid",
};

interface TraditionConnectionBadgeProps {
  connectionType: ConnectionType;
  targetName: string;
  targetSlug: string;
  onClick: (slug: string) => void;
}

/**
 * Pill-shaped badge showing a tradition connection.
 *
 * Border style encodes the connection type visually:
 * - solid → branch_of (direct lineage)
 * - dashed → influenced_by (indirect influence)
 * - dotted → related_to (thematic similarity)
 *
 * Min 44px touch target for mobile accessibility.
 */
export function TraditionConnectionBadge({
  connectionType,
  targetName,
  targetSlug,
  onClick,
}: TraditionConnectionBadgeProps) {
  return (
    <button
      onClick={() => onClick(targetSlug)}
      className="inline-flex items-center gap-1 px-2.5 min-h-[44px] rounded-full text-xs font-sans border border-[#d5d0c8] bg-[#faf8f5] text-[#6b6459] hover:bg-[#f0ece6] hover:text-[#9e4a3a] transition-colors cursor-pointer"
      style={{ borderStyle: BORDER_STYLES[connectionType] }}
    >
      <span className="text-[#999]">{TYPE_LABELS[connectionType]}</span>
      <span>{targetName}</span>
    </button>
  );
}
