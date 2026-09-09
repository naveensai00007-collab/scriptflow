import { useState } from "react";
import type { ScriptRecord } from "../../engine/types";
import { formatRelativeDate } from "../../lib/dates";
import { Trash2, ChevronRight, FileText } from "lucide-react";
import { IconButton } from "../ui/IconButton";
import { DeleteScriptDialog } from "./DeleteScriptDialog";

interface ScriptRowProps {
  script: ScriptRecord;
  onOpen: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export function ScriptRow({ script, onOpen, onDelete }: ScriptRowProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Compute scene count & word count
  const sceneCount = script.blocks.filter((b) => b.type === "scene_heading").length;
  const wordCount = script.blocks.reduce((acc, b) => {
    const words = b.text.trim().split(/\s+/).filter(Boolean).length;
    return acc + words;
  }, 0);

  const displayTitle = script.title.trim() || "Untitled script";
  const relativeDate = formatRelativeDate(script.updatedAt);

  return (
    <>
      <div
        onClick={() => onOpen(script.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(script.id);
          }
        }}
        className="group flex items-center justify-between p-4 bg-surface hover:bg-surface-2/60 border border-border rounded-card transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-focus min-h-[56px]"
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-4">
          <div className="w-8 h-8 rounded-btn bg-surface-2 flex items-center justify-center text-text-muted group-hover:text-primary transition-colors shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-text truncate group-hover:text-primary transition-colors">
              {displayTitle}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {sceneCount} {sceneCount === 1 ? "scene" : "scenes"} · {wordCount} {wordCount === 1 ? "word" : "words"} · {relativeDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <IconButton
            label={`Delete ${displayTitle}`}
            variant="danger"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </IconButton>
          <div className="text-text-muted group-hover:text-text p-1">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <DeleteScriptDialog
        open={deleteOpen}
        scriptTitle={displayTitle}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          await onDelete(script.id);
        }}
      />
    </>
  );
}