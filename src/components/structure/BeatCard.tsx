import { useState } from "react";
import type { DerivedScene, BeatColor } from "../../engine/types";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface BeatCardProps {
  scene: DerivedScene;
  color?: BeatColor;
  isFirst: boolean;
  isLast: boolean;
  onNavigate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
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

export function BeatCard({
  scene,
  color = "none",
  isFirst,
  isLast,
  onNavigate,
  onMoveUp,
  onMoveDown,
  onUpdateNote,
  onUpdateColor,
}: BeatCardProps) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState(scene.synopsis);

  const colors: BeatColor[] = ["none", "amber", "emerald", "sky", "rose", "slate"];

  const handleSaveNote = () => {
    setIsEditingNote(false);
    onUpdateNote(noteInput);
  };

  return (
    <div
      onClick={onNavigate}
      className={cn(
        "p-3 bg-surface hover:bg-surface-2/70 border rounded-card transition-colors duration-150 cursor-pointer text-left space-y-2 group shadow-sm",
        COLOR_BORDER_MAP[color]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text shrink-0">
            {scene.isPrologue ? "P" : scene.number}
          </span>
          <h4 className="text-xs font-semibold text-text truncate group-hover:text-primary transition-colors">
            {scene.heading}
          </h4>
        </div>

        {!scene.isPrologue && (
          <div
            className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              title="Move scene up"
              className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-20 disabled:pointer-events-none"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
              title="Move scene down"
              className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-20 disabled:pointer-events-none"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Note / Synopsis */}
      <div onClick={(e) => e.stopPropagation()}>
        {isEditingNote ? (
          <div className="space-y-1.5">
            <textarea
              value={noteInput}
              maxLength={500}
              autoFocus
              rows={2}
              onChange={(e) => setNoteInput(e.target.value)}
              onBlur={handleSaveNote}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveNote();
                }
              }}
              placeholder="Add a beat note..."
              className="w-full text-xs p-1.5 bg-surface border border-border rounded text-text outline-none focus:border-focus resize-none"
            />
            <div className="flex items-center justify-between text-[10px] text-text-muted">
              <span>Enter to save</span>
              <span>{noteInput.length}/500</span>
            </div>
          </div>
        ) : (
          <p
            onClick={() => {
              setNoteInput(scene.synopsis === "No action yet." ? "" : scene.synopsis);
              setIsEditingNote(true);
            }}
            className="text-xs text-text-muted hover:text-text line-clamp-2 cursor-text transition-colors"
          >
            {scene.synopsis || "Click to add a beat note..."}
          </p>
        )}
      </div>

      {/* Color tag choices */}
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
                "w-2.5 h-2.5 rounded-full transition-transform",
                bgMap[c],
                color === c && "ring-2 ring-primary ring-offset-1 scale-110"
              )}
              title={`Tag: ${c}`}
            />
          );
        })}
      </div>
    </div>
  );
}