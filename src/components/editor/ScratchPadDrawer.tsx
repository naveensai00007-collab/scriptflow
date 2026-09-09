import { useState } from "react";
import { X, Plus, Copy, Trash2, ArrowLeft, Bookmark } from "lucide-react";
import { useEditorStore } from "../../state/editorStore";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";

export function ScratchPadDrawer() {
  const {
    currentScript,
    isScratchDrawerOpen,
    setScratchDrawerOpen,
    addScratchItem,
    deleteScratchItem,
    updateBlock,
    activeBlockId,
  } = useEditorStore();

  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  if (!isScratchDrawerOpen) return null;

  const scratchItems = currentScript?.scratchItems || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addScratchItem(title, content);
    setTitle("");
    setContent("");
    setIsAdding(false);
    showToast("Added to scratch pad", "success");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard", "success");
  };

  const handleInsert = (text: string) => {
    if (activeBlockId && currentScript) {
      const block = currentScript.blocks.find((b) => b.id === activeBlockId);
      if (block) {
        const separator = block.text.trim() ? " " : "";
        updateBlock(activeBlockId, `${block.text}${separator}${text}`);
        showToast("Inserted into active block", "success");
        return;
      }
    }
    handleCopy(text);
  };

  return (
    <aside
      aria-label="Scratch Pad Bin"
      className="fixed right-0 top-13 bottom-0 w-80 sm:w-96 bg-surface border-l border-border shadow-2xl flex flex-col z-30 animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface-2/40 select-none">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-text font-sans">Scratch Pad & Bin</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted font-mono font-medium">
            {scratchItems.length}
          </span>
        </div>
        <button
          onClick={() => setScratchDrawerOpen(false)}
          className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
          title="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action / Add Trigger */}
      <div className="p-3 border-b border-border/80 bg-surface">
        {!isAdding ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-full text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-primary" />
            <span>Stash New Idea or Cut Line</span>
          </Button>
        ) : (
          <form onSubmit={handleAdd} className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title or context tag..."
              className="w-full text-xs px-2.5 py-1.5 bg-surface-2 border border-border rounded outline-none focus:border-primary text-text"
              autoFocus
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste dialogue snippet, alternative scene beat, or research note..."
              rows={3}
              className="w-full text-xs px-2.5 py-1.5 bg-surface-2 border border-border rounded outline-none focus:border-primary text-text font-mono resize-none"
              required
            />
            <div className="flex justify-end gap-1.5 pt-1">
              <Button
                type="button"
                variant="tertiary"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="text-xs">
                Save
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Snippet List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {scratchItems.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-text-muted">
            <Bookmark className="w-6 h-6 mb-2 opacity-40 text-primary" />
            <p className="text-xs font-medium">The writer&apos;s bin is empty.</p>
            <p className="text-[11px] mt-1 opacity-70">
              Never lose an excised line or sudden brainstorm. Save them here and drag back later.
            </p>
          </div>
        ) : (
          scratchItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-surface-2/40 border border-border/80 rounded-card space-y-2 hover:border-border transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text truncate max-w-[180px]">
                  {item.title}
                </span>
                <span className="text-[10px] text-text-muted font-mono">
                  {new Date(item.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <p className="text-xs font-mono text-text/90 whitespace-pre-wrap leading-relaxed bg-surface/60 p-2 rounded border border-border/40">
                {item.content}
              </p>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleInsert(item.content)}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  title="Insert into currently focused block"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Insert to Script</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.content)}
                    className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteScratchItem(item.id)}
                    className="p-1 rounded text-text-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-surface-2 transition-colors"
                    title="Delete snippet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
