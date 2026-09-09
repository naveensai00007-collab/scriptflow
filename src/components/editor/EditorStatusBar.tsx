import type { SaveStatus, BlockType } from "../../engine/types";
import { Check, Loader2, AlertTriangle } from "lucide-react";

interface EditorStatusBarProps {
  sceneCount: number;
  wordCount: number;
  currentBlockType: BlockType | null;
  saveStatus: SaveStatus;
  onRetrySave?: () => void;
}

const BLOCK_LABELS: Record<BlockType, string> = {
  scene_heading: "Scene Heading",
  action: "Action",
  character: "Character",
  dialogue: "Dialogue",
  parenthetical: "Parenthetical",
  transition: "Transition",
  note: "Note",
};

export function EditorStatusBar({
  sceneCount,
  wordCount,
  currentBlockType,
  saveStatus,
  onRetrySave,
}: EditorStatusBarProps) {
  return (
    <footer className="h-8 border-t border-border bg-surface/90 backdrop-blur px-4 flex items-center justify-between text-xs text-text-muted select-none">
      <div className="flex items-center gap-4">
        <span>
          {sceneCount} {sceneCount === 1 ? "scene" : "scenes"}
        </span>
        <span>
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
        {currentBlockType && (
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-2 text-text font-medium">
            {BLOCK_LABELS[currentBlockType]}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {saveStatus === "saving" && (
          <span className="flex items-center gap-1.5 text-text-muted">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving…
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="flex items-center gap-1.5 text-success">
            <Check className="w-3 h-3" />
            Saved
          </span>
        )}
        {saveStatus === "unsaved" && (
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Unsaved changes
          </span>
        )}
        {saveStatus === "error" && (
          <div className="flex items-center gap-2 text-error">
            <AlertTriangle className="w-3 h-3" />
            <span>Save failed</span>
            {onRetrySave && (
              <button
                onClick={onRetrySave}
                className="underline hover:text-error/80 font-medium"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}