import { useState } from "react";
import { useEditorStore } from "../../state/editorStore";
import { BeatCard } from "./BeatCard";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";
import { Search, Plus } from "lucide-react";
import { Input } from "../ui/Input";

interface BeatBoardProps {
  onScrollToBlock: (blockId: string) => void;
}

export function BeatBoard({ onScrollToBlock }: BeatBoardProps) {
  const {
    currentScript,
    derivedScenes,
    reorderSceneDirection,
    updateBeatMetadata,
  } = useEditorStore();

  const [search, setSearch] = useState("");

  const beatMeta = currentScript?.beatMeta || {};

  const filtered = derivedScenes.filter((s) =>
    s.heading.toLowerCase().includes(search.toLowerCase().trim()) ||
    s.synopsis.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleInsertFirstScene = () => {
    if (!currentScript) return;
    const firstBlock = currentScript.blocks[0];
    if (firstBlock) {
      useEditorStore.getState().updateBlock(firstBlock.id, "INT. COFFEE SHOP - DAY");
      useEditorStore.getState().setBlockType(firstBlock.id, "scene_heading");
    }
  };

  if (derivedScenes.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title="No scenes yet"
          description="Type a scene heading such as INT. COFFEE SHOP - DAY in the script."
          action={
            <Button variant="secondary" size="sm" onClick={handleInsertFirstScene}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Insert first scene heading
            </Button>
          }
        />
      </div>
    );
  }

  const movableScenes = derivedScenes.filter((s) => !s.isPrologue);

  return (
    <div className="flex flex-col h-full">
      {derivedScenes.length > 2 && (
        <div className="p-3 border-b border-border bg-surface shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-muted" />
            <Input
              placeholder="Filter scenes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filtered.length === 0 ? (
          <EmptyState
            title="No matching scenes"
            description="No scenes match your search."
            action={
              <Button variant="secondary" size="sm" onClick={() => setSearch("")}>
                Clear
              </Button>
            }
          />
        ) : (
          filtered.map((scene) => {
            const meta = beatMeta[scene.id];
            const isFirst = movableScenes[0]?.id === scene.id;
            const isLast = movableScenes[movableScenes.length - 1]?.id === scene.id;

            return (
              <BeatCard
                key={scene.id}
                scene={scene}
                color={meta?.color || "none"}
                isFirst={isFirst}
                isLast={isLast}
                onNavigate={() => onScrollToBlock(scene.startBlockId)}
                onMoveUp={() => reorderSceneDirection(scene.id, "up")}
                onMoveDown={() => reorderSceneDirection(scene.id, "down")}
                onUpdateNote={(note) => updateBeatMetadata(scene.id, { note })}
                onUpdateColor={(color) => updateBeatMetadata(scene.id, { color })}
              />
            );
          })
        )}
      </div>
    </div>
  );
}