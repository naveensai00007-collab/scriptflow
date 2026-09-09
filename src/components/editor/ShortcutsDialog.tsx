import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/Dialog";
import { Kbd } from "../ui/Kbd";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const mod = isMac ? "⌘" : "Ctrl";

  const blockShortcuts = [
    { label: "Scene Heading", keys: ["Alt", "1"] },
    { label: "Action", keys: ["Alt", "2"] },
    { label: "Character", keys: ["Alt", "3"] },
    { label: "Dialogue", keys: ["Alt", "4"] },
    { label: "Parenthetical", keys: ["Alt", "5"] },
    { label: "Transition", keys: ["Alt", "6"] },
    { label: "Note", keys: ["Alt", "7"] },
  ];

  const appShortcuts = [
    { label: "Save script now", keys: [mod, "S"] },
    { label: "Export script", keys: [mod, "E"] },
    { label: "Print / Save as PDF", keys: [mod, "P"] },
    { label: "Undo", keys: [mod, "Z"] },
    { label: "Redo", keys: [mod, "Shift", "Z"] },
    { label: "Toggle Structure Panel", keys: [mod, "0"] },
    { label: "View Beats", keys: [mod, "2"] },
    { label: "View Characters", keys: [mod, "3"] },
    { label: "Keyboard shortcuts", keys: [mod, "/"] },
  ];

  const editorShortcuts = [
    { label: "Next line / New block", keys: ["Enter"] },
    { label: "Newline inside current block", keys: ["Shift", "Enter"] },
    { label: "Merge or delete block", keys: ["Backspace (at start)"] },
    { label: "Move to previous/next block", keys: ["↑", "↓"] },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Work at the speed of thought without touching your mouse.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">
              Change Block Type
            </h4>
            <div className="space-y-2">
              {blockShortcuts.map((sc) => (
                <div key={sc.label} className="flex items-center justify-between">
                  <span className="text-text">{sc.label}</span>
                  <div className="flex items-center gap-1">
                    {sc.keys.map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">
              Editor & Writing
            </h4>
            <div className="space-y-2">
              {editorShortcuts.map((sc) => (
                <div key={sc.label} className="flex items-center justify-between">
                  <span className="text-text">{sc.label}</span>
                  <div className="flex items-center gap-1">
                    {sc.keys.map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">
              Application & Structure
            </h4>
            <div className="space-y-2">
              {appShortcuts.map((sc) => (
                <div key={sc.label} className="flex items-center justify-between">
                  <span className="text-text">{sc.label}</span>
                  <div className="flex items-center gap-1">
                    {sc.keys.map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}