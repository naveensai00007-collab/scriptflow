import { useEffect } from "react";
import { useEditorStore } from "../../state/editorStore";
import { Minimize2 } from "lucide-react";
import { BlockEditor } from "./BlockEditor";

export function FocusModeOverlay() {
  const { currentScript, isZenMode, setZenMode } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZenMode) {
        setZenMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZenMode, setZenMode]);

  if (!isZenMode || !currentScript) return null;

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col animate-in fade-in duration-200">
      {/* Subtle hover control bar */}
      <div className="absolute top-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setZenMode(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-surface border border-border text-xs text-text-muted hover:text-text shadow-sm"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Zen Mode (Esc)</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <BlockEditor blocks={currentScript.blocks} />
      </div>
    </div>
  );
}