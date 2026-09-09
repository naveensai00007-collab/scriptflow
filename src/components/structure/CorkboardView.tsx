import { useState } from "react";
import { useEditorStore } from "../../state/editorStore";
import type { BeatColor } from "../../engine/types";
import { ArrowUp, ArrowDown, Sun, Moon, Home, Trees } from "lucide-react";
import { cn } from "../../lib/utils";

interface CorkboardViewProps {
  onSelectScene: (blockId: string) => void;
}

const COLOR_BORDER_MAP: Record<BeatColor, string> = {
  none: "border-border",
  slate: "border-t-4 border-t-slate-400 border-border",
  amber: "border-t-4 border-t-amber-500 border-border",
  emerald: "border-t-4 border-t-emerald-500 border-border",
  rose: "border-t-4 border-t-rose-500 border-border",
  sky: "border-t-4 border-t-sky-500 border-border",
};

export function CorkboardView({ onSelectScene }: CorkboardViewProps) {
  const {
    currentScript,
    derivedScenes,
    pagination,
    reorderSceneDirection,
    updateBeatMetadata,
    setViewMode,
  } = useEditorStore();

  const [search, setSearch] = useState("");

  const beatMeta = currentScript?.beatMeta || {};

  // Story pacing metrics
  const intCount = derivedScenes.filter((s) => s.heading.startsWith("INT")).length;
  const extCount = derivedScenes.filter((s) => s.heading.startsWith("EXT")).length;
  const dayCount = derivedScenes.filter((s) => s.heading.includes("DAY")).length;
  const nightCount = derivedScenes.filter((s) => s.heading.includes("NIGHT")).length;

  const filtered = derivedScenes.filter((s) =>
    s.heading.toLowerCase().includes(search.toLowerCase().trim()) ||
    s.synopsis.toLowerCase().includes(search.toLowerCase().trim())
  );

  const colors: BeatColor[] = ["none", "amber", "emerald", "sky", "rose", "slate"];
  const movableScenes = derivedScenes.filter((s) => !s.isPrologue);

  return (
    <div className="flex-1 overflow-y-auto bg-bg p-6 flex flex-col space-y-6">
      {/* Pacing & Structure Metrics Bar */}
      <div className="bg-surface border border-border rounded-card p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-6 text-xs text-text-muted">
          <div>
            <span className="font-semibold text-text text-sm">{derivedScenes.length}</span> scenes
          </div>
          <div>
            <span className="font-semibold text-text text-sm">{pagination.totalPages}</span> estimated pages
          </div>
          <div className="flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>INT: <strong>{intCount}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Trees className="w-3.5 h-3.5" />
            <span>EXT: <strong>{extCount}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>DAY: <strong>{dayCount}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Moon className="w-3.5 h-3.5 text-sky-500" />
            <span>NIGHT: <strong>{nightCount}</strong></span>
          </div>
        </div>

        <div className="w-64">
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 px-3 text-xs bg-surface border border-border rounded-input outline-none focus:border-focus"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((scene) => {
          const meta = beatMeta[scene.id];
          const color = meta?.color || "none";
          const isFirst = movableScenes[0]?.id === scene.id;
          const isLast = movableScenes[movableScenes.length - 1]?.id === scene.id;

          return (
            <div
              key={scene.id}
              onClick={() => {
                onSelectScene(scene.startBlockId);
                setViewMode("script");
              }}
              className={cn(
                "group p-4 bg-surface hover:bg-surface-2/70 border rounded-card shadow-sm hover:shadow transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[170px] relative",
                COLOR_BORDER_MAP[color]
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span className="font-mono font-bold text-text">
                    {scene.isPrologue ? "PROLOGUE" : `SCENE ${scene.number}`}
                  </span>
                  <span className="font-mono text-[11px]">
                    p. {scene.pageNumber || 1}
                  </span>
                </div>

                <h4 className="font-semibold text-xs text-text line-clamp-2 uppercase font-mono group-hover:text-primary transition-colors">
                  {scene.heading}
                </h4>

                <p className="text-xs text-text-muted line-clamp-3">
                  {scene.synopsis || "No beat notes written."}
                </p>
              </div>

              {/* Bottom Actions */}
              <div
                className="pt-3 border-t border-border/40 flex items-center justify-between mt-3 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Color choices */}
                <div className="flex items-center gap-1">
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
                        onClick={() => updateBeatMetadata(scene.id, { color: c })}
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

                {/* Move buttons */}
                {!scene.isPrologue && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => reorderSceneDirection(scene.id, "up")}
                      className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-20"
                      title="Move scene earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => reorderSceneDirection(scene.id, "down")}
                      className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-20"
                      title="Move scene later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}