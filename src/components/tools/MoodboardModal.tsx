import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Palette, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useEditorStore } from "../../state/editorStore";
import type { MoodboardItem } from "../../engine/types";
import { useToast } from "../ui/Toast";

interface MoodboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES: MoodboardItem["category"][] = ["character", "location", "tone", "prop"];

export function MoodboardModal({ open, onOpenChange }: MoodboardModalProps) {
  const { currentScript, addMoodboardItem, deleteMoodboardItem } = useEditorStore();
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [selectedCat, setSelectedCat] = useState<MoodboardItem["category"] | "all">("all");

  const [newTitle, setNewTitle] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newColorHex, setNewColorHex] = useState("#B45309");
  const [newCategory, setNewCategory] = useState<MoodboardItem["category"]>("tone");
  const [newNote, setNewNote] = useState("");

  const items = currentScript?.moodboardItems || [];
  const filteredItems = items.filter((item) =>
    selectedCat === "all" ? true : item.category === selectedCat
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addMoodboardItem({
      title: newTitle.trim(),
      imageUrl: newImageUrl.trim() || undefined,
      colorHex: newColorHex || undefined,
      category: newCategory,
      note: newNote.trim() || undefined,
    });

    setNewTitle("");
    setNewImageUrl("");
    setNewNote("");
    setIsAdding(false);
    showToast("Added visual card to moodboard", "success");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col p-6 bg-surface border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-sans">
                  Visual Screenplay Moodboard
                </DialogTitle>
                <DialogDescription className="text-xs text-text-muted">
                  Curate cinematic visual tones, locations, wardrobe textures & character palettes
                </DialogDescription>
              </div>
            </div>

            <Button
              size="sm"
              variant={isAdding ? "tertiary" : "primary"}
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>{isAdding ? "Cancel" : "Add Inspiration"}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 mt-4 border-b border-border pb-3">
          <button
            type="button"
            onClick={() => setSelectedCat("all")}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              selectedCat === "all"
                ? "bg-primary text-white"
                : "bg-surface-2 text-text-muted hover:text-text border border-border"
            }`}
          >
            All Elements ({items.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`capitalize px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                selectedCat === cat
                  ? "bg-primary text-white"
                  : "bg-surface-2 text-text-muted hover:text-text border border-border"
              }`}
            >
              {cat}s ({items.filter((i) => i.category === cat).length})
            </button>
          ))}
        </div>

        {/* Add Form */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="p-4 mt-3 bg-surface-2/60 border border-border rounded-card space-y-3 animate-in fade-in"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">
                  Card Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Neo-Noir Rain, Protagonist Leather..."
                  className="w-full text-xs px-2.5 py-1.5 bg-surface border border-border rounded outline-none text-text"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MoodboardItem["category"])}
                  className="w-full text-xs px-2.5 py-1.5 bg-surface border border-border rounded outline-none text-text capitalize"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">
                  Dominant Color Swatch
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-text-muted">{newColorHex}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs px-2.5 py-1.5 bg-surface border border-border rounded outline-none text-text"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">
                Cinematic Notes & Texture Description
              </label>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Lighting notes, costume texture, psychological feel..."
                className="w-full text-xs px-2.5 py-1.5 bg-surface border border-border rounded outline-none text-text"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="tertiary" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Card
              </Button>
            </div>
          </form>
        )}

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          {filteredItems.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-text-muted">
              <Palette className="w-8 h-8 mb-2 opacity-30 text-primary" />
              <p className="text-xs font-semibold">No moodboard cards yet.</p>
              <p className="text-[11px] mt-1 opacity-70">
                Collect visual references, color schemes, and lighting moods to ground your scenes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-2/40 border border-border/80 rounded-card overflow-hidden hover:border-primary/50 transition-all flex flex-col group"
                >
                  {item.imageUrl ? (
                    <div className="h-36 w-full bg-surface-2 overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      {item.colorHex && (
                        <div
                          className="absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white shadow"
                          style={{ backgroundColor: item.colorHex }}
                        />
                      )}
                    </div>
                  ) : (
                    <div
                      className="h-24 w-full flex items-center justify-center relative"
                      style={{ backgroundColor: item.colorHex || "#B45309" }}
                    >
                      <ImageIcon className="w-6 h-6 text-white/40" />
                    </div>
                  )}

                  <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text truncate">{item.title}</span>
                        <span className="text-[10px] capitalize px-1.5 py-0.2 rounded bg-surface border border-border text-primary font-medium">
                          {item.category}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                          {item.note}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-1 border-t border-border/40">
                      <button
                        type="button"
                        onClick={() => deleteMoodboardItem(item.id)}
                        className="p-1 rounded text-text-muted hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
