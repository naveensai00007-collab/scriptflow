import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { useSettingsStore } from "../../state/settingsStore";
import { Moon, Sun, Monitor, HardDrive } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportClick?: () => void;
}

export function SettingsDialog({ open, onOpenChange, onExportClick }: SettingsDialogProps) {
  const {
    theme,
    fontSize,
    showHints,
    setTheme,
    setFontSize,
    setShowHints,
  } = useSettingsStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Personalize your screenplay writing environment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Theme */}
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2.5">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-btn border text-xs font-medium transition-colors ${
                  theme === "light"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-surface hover:bg-surface-2 text-text"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-btn border text-xs font-medium transition-colors ${
                  theme === "dark"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-surface hover:bg-surface-2 text-text"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-btn border text-xs font-medium transition-colors ${
                  theme === "system"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-surface hover:bg-surface-2 text-text"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                System
              </button>
            </div>
          </div>

          {/* Editor Font Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Editor Font Size
              </label>
              <span className="text-xs font-mono font-medium text-text">{fontSize}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={22}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Hint Bar Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Writing Hints</p>
              <p className="text-xs text-text-muted">
                Display shortcut and formatting hints at top of editor
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showHints}
              onClick={() => setShowHints(!showHints)}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                showHints ? "bg-primary" : "bg-surface-2 border border-border"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                  showHints ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Storage & Privacy Info */}
          <div className="p-3 bg-surface-2 border border-border rounded-card flex items-start gap-2.5">
            <HardDrive className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-text-muted space-y-1">
              <p className="font-semibold text-text">100% Offline & Private</p>
              <p>
                All scripts are stored exclusively in your browser's IndexedDB. No telemetry, no cloud servers, no accounts.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          {onExportClick && (
            <Button
              variant="secondary"
              onClick={() => {
                onOpenChange(false);
                onExportClick();
              }}
            >
              Export script
            </Button>
          )}
          <Button variant="primary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}