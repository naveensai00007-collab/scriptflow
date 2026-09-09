import { X, Lightbulb } from "lucide-react";
import { useSettingsStore } from "../../state/settingsStore";

export function HintBar() {
  const { showHints, setShowHints } = useSettingsStore();

  if (!showHints) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 text-text px-4 py-2 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>
          Press <strong>Enter</strong> for the next line. Lines starting with <strong>INT.</strong> or <strong>EXT.</strong> automatically become scene headings.
        </span>
      </div>
      <button
        onClick={() => setShowHints(false)}
        className="text-text-muted hover:text-text p-1 rounded-sm ml-2"
        aria-label="Dismiss hint"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}