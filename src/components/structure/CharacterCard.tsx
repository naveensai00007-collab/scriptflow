import { useState } from "react";
import type { DerivedCharacter, BeatColor } from "../../engine/types";
import { Users, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface CharacterCardProps {
  character: DerivedCharacter;
  color?: BeatColor;
  onNavigateToBlock: (blockId: string) => void;
  onUpdateNote: (note: string) => void;
  onUpdateColor: (color: BeatColor) => void;
}

const COLOR_BORDER_MAP: Record<BeatColor, string> = {
  none: "border-border",
  slate: "border-l-4 border-l-slate-400 border-border",
  amber: "border-l-4 border-l-amber-500 border-border",
  emerald: "border-l-4 border-l-emerald-500 border-border",
  rose: "border-l-4 border-l-rose-500 border-border",
  sky: "border-l-4 border-l-sky-500 border-border",
};

export function CharacterCard({
  character,
  color = "none",
  onNavigateToBlock,
  onUpdateNote: _onUpdateNote,
  onUpdateColor,
}: CharacterCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors: BeatColor[] = ["none", "amber", "emerald", "sky", "rose", "slate"];

  return (
    <div className={cn("p-3 bg-surface border rounded-card transition-colors duration-150 space-y-2 shadow-sm", COLOR_BORDER_MAP[color])}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-btn bg-surface-2 flex items-center justify-center text-text-muted shrink-0 group-hover:text-primary transition-colors">
            <Users className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-semibold text-text uppercase truncate group-hover:text-primary transition-colors">
            {character.name}
          </h4>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-text-muted">
            {character.dialogueCount} {character.dialogueCount === 1 ? "line" : "lines"}
          </span>
          <div className="text-text-muted group-hover:text-text">
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </div>

      <div className="text-[11px] text-text-muted flex items-center gap-2">
        <span>
          Appears in {character.sceneNumbers.length}{" "}
          {character.sceneNumbers.length === 1 ? "scene" : "scenes"}
        </span>
        {character.sceneNumbers.length > 0 && (
          <span className="truncate">
            (Sc. {character.sceneNumbers.join(", ")})
          </span>
        )}
      </div>

      {/* Color tag options */}
      <div
        className="flex items-center gap-1.5 pt-1 opacity-40 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {colors.map((c) => {
          const bgMap: Record<BeatColor, string> = {
            none: "bg-border",
            amber: "bg-amber-400",
            emerald: "bg-emerald-400",
            sky: "bg-sky-400",
            rose: "bg-rose-400",
            slate: "bg-slate-400",
          };
          return (
            <button
              key={c}
              type="button"
              onClick={() => onUpdateColor(c)}
              className={cn(
                "w-2 h-2 rounded-full transition-transform",
                bgMap[c],
                color === c && "ring-2 ring-primary ring-offset-1 scale-110"
              )}
              title={`Color: ${c}`}
            />
          );
        })}
      </div>

      {expanded && (
        <div className="pt-2 border-t border-border/60 space-y-2">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Dialogue Occurrences
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {character.occurrences.map((occ, idx) => (
              <button
                key={occ.blockId}
                type="button"
                onClick={() => onNavigateToBlock(occ.blockId)}
                className="text-[11px] font-mono px-2 py-1 rounded bg-surface-2 hover:bg-primary/10 hover:text-primary border border-border transition-colors text-text"
              >
                Line {idx + 1} (Sc. {occ.sceneNumber})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}