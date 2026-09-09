import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { History, Plus, RotateCcw, Trash2, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { useEditorStore } from "../../state/editorStore";
import { useToast } from "../ui/Toast";

interface SnapshotManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SnapshotManagerDialog({ open, onOpenChange }: SnapshotManagerDialogProps) {
  const { currentScript, createSnapshot, restoreSnapshot, deleteSnapshot } = useEditorStore();
  const { showToast } = useToast();

  const [snapshotName, setSnapshotName] = useState("");
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  const snapshots = currentScript?.snapshots || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createSnapshot(snapshotName);
    setSnapshotName("");
    showToast("Created named snapshot", "success");
  };

  const handleRestore = (id: string) => {
    restoreSnapshot(id);
    setConfirmRestoreId(null);
    showToast("Restored snapshot state successfully", "success");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-6 bg-surface border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-sans">
                Named Revision Snapshots
              </DialogTitle>
              <DialogDescription className="text-xs text-text-muted">
                Create immutable drafts before notes or auditions. Restore anytime with zero data loss.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Create Snapshot Form */}
        <form onSubmit={handleCreate} className="mt-4 flex gap-2">
          <input
            type="text"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Name this draft (e.g. 'Pre-Director Meeting Polish')..."
            className="flex-1 text-xs px-3 py-2 bg-surface-2 border border-border rounded-input outline-none focus:border-primary text-text"
          />
          <Button type="submit" size="sm" variant="primary">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Create Snapshot</span>
          </Button>
        </form>

        {/* Snapshots List */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 min-h-[220px]">
          {snapshots.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-text-muted">
              <History className="w-6 h-6 mb-2 opacity-30 text-primary" />
              <p className="text-xs font-medium">No snapshots saved yet.</p>
              <p className="text-[11px] mt-1 opacity-70">
                Snapshots freeze your full screenplay state so you can experiment fearlessly.
              </p>
            </div>
          ) : (
            snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-3.5 rounded-card bg-surface-2/40 border border-border/70 hover:border-border transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text truncate">{snap.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-text-muted font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-text-muted" />
                      {new Date(snap.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-text-muted" />
                      {snap.sceneCount} scenes • {snap.wordCount} words
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {confirmRestoreId === snap.id ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleRestore(snap.id)}
                        className="text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>Confirm</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="tertiary"
                        onClick={() => setConfirmRestoreId(null)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setConfirmRestoreId(snap.id)}
                        className="text-xs"
                        title="Restore script to this snapshot"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        <span>Restore</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteSnapshot(snap.id);
                          showToast("Snapshot removed", "info");
                        }}
                        className="p-1.5 rounded text-text-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-surface-2 transition-colors"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
