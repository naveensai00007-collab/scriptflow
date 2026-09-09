import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useEditorStore } from "../../state/editorStore";
import { Users, Edit3, Merge } from "lucide-react";
import { useToast } from "../ui/Toast";

interface CharacterBenchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CharacterBenchModal({ open, onOpenChange }: CharacterBenchModalProps) {
  const { derivedCharacters, renameCharacter, mergeCharacters } = useEditorStore();
  const { showToast } = useToast();

  const [renameFrom, setRenameFrom] = useState<string | null>(null);
  const [newNameInput, setNewNameInput] = useState("");

  const [mergeSource, setMergeSource] = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState<string | null>(null);

  const totalLines = derivedCharacters.reduce((acc, c) => acc + c.dialogueCount, 0);

  const handleExecuteRename = () => {
    if (!renameFrom || !newNameInput.trim()) return;
    const clean = newNameInput.trim().toUpperCase();
    renameCharacter(renameFrom, clean);
    showToast(`Renamed "${renameFrom}" to "${clean}" across the script.`, "success");
    setRenameFrom(null);
    setNewNameInput("");
  };

  const handleExecuteMerge = () => {
    if (!mergeSource || !mergeTarget || mergeSource === mergeTarget) return;
    mergeCharacters(mergeSource, mergeTarget);
    showToast(`Merged "${mergeSource}" into "${mergeTarget}".`, "success");
    setMergeSource(null);
    setMergeTarget(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-btn bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Character Name Bench</DialogTitle>
              <DialogDescription>
                Manage, rename, and merge characters across your entire script.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Rename or Merge Action Bar */}
        {renameFrom && (
          <div className="p-3 bg-surface-2 border border-border rounded-card space-y-2 mb-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-text">
              <Edit3 className="w-3.5 h-3.5 text-primary" />
              <span>Rename "{renameFrom}" across all scenes:</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={newNameInput}
                autoFocus
                placeholder="Enter new character name"
                onChange={(e) => setNewNameInput(e.target.value.toUpperCase())}
                className="h-8 text-xs font-mono uppercase"
              />
              <Button variant="primary" size="sm" onClick={handleExecuteRename}>
                Apply
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setRenameFrom(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {mergeSource && (
          <div className="p-3 bg-surface-2 border border-border rounded-card space-y-2 mb-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-text">
              <Merge className="w-3.5 h-3.5 text-primary" />
              <span>Merge "{mergeSource}" into:</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={mergeTarget || ""}
                onChange={(e) => setMergeTarget(e.target.value)}
                className="h-8 text-xs font-mono bg-surface border border-border rounded px-2 text-text outline-none"
              >
                <option value="">Select target character...</option>
                {derivedCharacters
                  .filter((c) => c.name !== mergeSource)
                  .map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <Button
                variant="primary"
                size="sm"
                disabled={!mergeTarget}
                onClick={handleExecuteMerge}
              >
                Merge
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setMergeSource(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Character List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {derivedCharacters.length === 0 ? (
            <div className="text-center py-12 text-xs text-text-muted">
              No dialogue written yet. Characters will appear here once you write dialogue.
            </div>
          ) : (
            derivedCharacters.map((char) => {
              const pct = totalLines > 0 ? Math.round((char.dialogueCount / totalLines) * 100) : 0;
              return (
                <div
                  key={char.id}
                  className="flex items-center justify-between p-3 bg-surface hover:bg-surface-2 border border-border rounded-card text-xs transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-text uppercase">
                        {char.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-muted font-mono">
                        {char.dialogueCount} {char.dialogueCount === 1 ? "line" : "lines"} ({pct}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Appears in {char.sceneNumbers.length} scenes (Sc. {char.sceneNumbers.join(", ")})
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setRenameFrom(char.name);
                        setNewNameInput(char.name);
                      }}
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Rename
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setMergeSource(char.name);
                      }}
                    >
                      <Merge className="w-3 h-3 mr-1" />
                      Merge
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}